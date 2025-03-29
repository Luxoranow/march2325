import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';
import { subscriptionLogger } from '@/lib/subscription-logger';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Fallback to anon key if service role key is not available (for deployment)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Log and handle errors from database operations
 */
async function safeDbOperation(
  operation: () => Promise<any>,
  eventType: string,
  errorContext: string
): Promise<any> {
  try {
    return await operation();
  } catch (error) {
    // Log the error with subscription logger
    subscriptionLogger.logWebhookEvent(
      eventType,
      'error',
      { errorContext, error: error instanceof Error ? error.message : String(error) }
    );
    console.error(`Error in ${errorContext}:`, error);
    // Re-throw for caller to handle if needed
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret is not set');
    }
    
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    
    // Log the webhook event
    subscriptionLogger.logWebhookEvent(event.type, 'success', { id: event.id });
  } catch (err: any) {
    const errorMessage = `Webhook Error: ${err.message}`;
    console.error(errorMessage);
    
    // Log the error
    subscriptionLogger.logWebhookEvent(
      'webhook_verification_failed',
      'error',
      { 
        error: err.message,
        signaturePresent: !!signature
      }
    );
    
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        
        // Extract metadata
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        
        if (!userId || !planId) {
          subscriptionLogger.logWebhookEvent(
            event.type,
            'error',
            { 
              error: 'Missing userId or planId in metadata',
              session: session.id
            }
          );
          break;
        }
        
        try {
          // Get subscription details to capture the quantity
          let quantity = 1;
          let subscriptionItemId = null;
          
          if (session.subscription) {
            const subscriptionId = session.subscription as string;
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            if (subscription.items.data.length > 0) {
              quantity = subscription.items.data[0].quantity || 1;
              subscriptionItemId = subscription.items.data[0].id;
            }
          }
          
          // Update user subscription in database
          await safeDbOperation(
            async () => {
              const { data, error } = await supabase
                .from('subscriptions')
                .upsert({
                  user_id: userId,
                  plan_id: planId,
                  status: 'active',
                  stripe_subscription_id: session.subscription,
                  stripe_customer_id: session.customer,
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
                  quantity: quantity,
                  stripe_subscription_item_id: subscriptionItemId,
                  updated_at: new Date().toISOString()
                });
                
              if (error) throw error;
              return data;
            },
            event.type,
            'updating subscription after checkout completion'
          );
            
          subscriptionLogger.logWebhookEvent(
            event.type,
            'success',
            { 
              userId,
              planId,
              quantity,
              subscriptionId: session.subscription
            }
          );
        } catch (error) {
          // Already logged in safeDbOperation
          console.error('Error processing checkout.session.completed:', error);
        }
        break;
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (!subscriptionId) {
          subscriptionLogger.logWebhookEvent(
            event.type,
            'error',
            { 
              error: 'Missing subscriptionId in invoice',
              invoice: invoice.id
            }
          );
          break;
        }
        
        try {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          
          // Find the subscription in our database
          const { data: subscriptionData, error: selectError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId)
            .single();
          
          if (selectError) {
            if (selectError.code !== 'PGRST116') { // Not a "row not found" error
              throw selectError;
            }
            
            // Subscription not found - log but don't throw error
            subscriptionLogger.logWebhookEvent(
              event.type,
              'error',
              { 
                error: 'Subscription not found in database',
                subscriptionId
              }
            );
            break;
          }
            
          // Get the current quantity
          const quantity = subscription.items.data[0]?.quantity || 1;
          
          // Update subscription end date and quantity
          await safeDbOperation(
            async () => {
              const { data, error } = await supabase
                .from('subscriptions')
                .update({
                  status: 'active',
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  quantity: quantity,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscriptionId);
                
              if (error) throw error;
              return data;
            },
            event.type,
            'updating subscription after invoice payment'
          );
              
          subscriptionLogger.logWebhookEvent(
            event.type,
            'success',
            { 
              subscriptionId,
              userId: subscriptionData.user_id,
              planId: subscriptionData.plan_id,
              quantity
            }
          );
        } catch (error) {
          // Already logged in safeDbOperation
          console.error('Error processing invoice.paid:', error);
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (!subscriptionId) {
          subscriptionLogger.logWebhookEvent(
            event.type,
            'error',
            { 
              error: 'Missing subscriptionId in invoice',
              invoice: invoice.id
            }
          );
          break;
        }
        
        try {
          // Update subscription status
          await safeDbOperation(
            async () => {
              const { data, error } = await supabase
                .from('subscriptions')
                .update({
                  status: 'past_due',
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscriptionId);
                
              if (error) throw error;
              return data;
            },
            event.type,
            'updating subscription after payment failure'
          );
            
          // Find the user ID for logging
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();
            
          subscriptionLogger.logWebhookEvent(
            event.type,
            'success',
            { 
              subscriptionId,
              userId: subscriptionData?.user_id,
              status: 'past_due'
            }
          );
        } catch (error) {
          // Already logged in safeDbOperation
          console.error('Error processing invoice.payment_failed:', error);
        }
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        
        try {
          // Get the current quantity
          const quantity = subscription.items.data[0]?.quantity || 1;
          
          // Update subscription in database
          await safeDbOperation(
            async () => {
              const { data, error } = await supabase
                .from('subscriptions')
                .update({
                  status: subscription.status,
                  current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                  quantity: quantity,
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscription.id);
                
              if (error) throw error;
              return data;
            },
            event.type,
            'updating subscription after status change'
          );
          
          // Find the user ID for logging
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          subscriptionLogger.logWebhookEvent(
            event.type,
            'success',
            { 
              subscriptionId: subscription.id,
              userId: subscriptionData?.user_id,
              planId: subscriptionData?.plan_id,
              status: subscription.status,
              quantity
            }
          );
        } catch (error) {
          // Already logged in safeDbOperation
          console.error('Error processing customer.subscription.updated:', error);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        try {
          // Update subscription in database
          await safeDbOperation(
            async () => {
              const { data, error } = await supabase
                .from('subscriptions')
                .update({
                  status: 'canceled',
                  canceled_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                })
                .eq('stripe_subscription_id', subscription.id);
                
              if (error) throw error;
              return data;
            },
            event.type,
            'updating subscription after cancellation'
          );
          
          // Find the user ID for logging
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('user_id, plan_id')
            .eq('stripe_subscription_id', subscription.id)
            .single();
          
          subscriptionLogger.logWebhookEvent(
            event.type,
            'success',
            { 
              subscriptionId: subscription.id,
              userId: subscriptionData?.user_id,
              planId: subscriptionData?.plan_id
            }
          );
        } catch (error) {
          // Already logged in safeDbOperation
          console.error('Error processing customer.subscription.deleted:', error);
        }
        break;
      }
      
      default:
        // Log unhandled event types but don't consider them errors
        subscriptionLogger.logWebhookEvent(
          event.type,
          'success',
          { note: 'Unhandled event type' }
        );
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing webhook event ${event.type}:`, error);
    subscriptionLogger.logWebhookEvent(
      event.type,
      'error',
      { 
        error: error instanceof Error ? error.message : String(error),
        phase: 'event processing',
        eventId: event.id
      }
    );
    
    // Still return success to Stripe so they don't retry
    return NextResponse.json({ 
      received: true,
      processingError: true,
      message: 'Event received but failed processing'
    });
  }

  // Return a 200 response to acknowledge receipt of the event
  return NextResponse.json({ received: true });
} 