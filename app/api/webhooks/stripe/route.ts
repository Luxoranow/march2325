import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Fallback to anon key if service role key is not available (for deployment)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event;

  try {
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret is not set');
    }
    
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      
      // Extract metadata
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      
      if (userId && planId) {
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
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: userId,
              plan_id: planId,
              status: 'active',
              stripe_subscription_id: session.subscription,
              stripe_customer_id: session.customer,
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
              quantity: quantity,
              stripe_subscription_item_id: subscriptionItemId
            });
            
          console.log(`Subscription created/updated for user ${userId}, plan ${planId}, quantity ${quantity}`);
        } catch (error) {
          console.error('Error processing checkout.session.completed:', error);
        }
      }
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        try {
          // Get subscription details from Stripe
          const subscription = await stripe.subscriptions.retrieve(subscriptionId as string);
          
          // Find the subscription in our database
          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('stripe_subscription_id', subscriptionId)
            .single();
            
          if (subscriptionData) {
            // Get the current quantity
            const quantity = subscription.items.data[0]?.quantity || 1;
            
            // Update subscription end date and quantity
            await supabase
              .from('subscriptions')
              .update({
                status: 'active',
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                quantity: quantity
              })
              .eq('stripe_subscription_id', subscriptionId);
              
            console.log(`Subscription renewed for subscription ${subscriptionId}, quantity ${quantity}`);
          }
        } catch (error) {
          console.error('Error processing invoice.paid:', error);
        }
      }
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        try {
          // Update subscription status
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due'
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          console.log(`Subscription payment failed for subscription ${subscriptionId}`);
        } catch (error) {
          console.error('Error processing invoice.payment_failed:', error);
        }
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      
      try {
        // Get the current quantity
        const quantity = subscription.items.data[0]?.quantity || 1;
        
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            quantity: quantity,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        console.log(`Subscription updated for subscription ${subscription.id}, quantity ${quantity}`);
      } catch (error) {
        console.error('Error processing customer.subscription.updated:', error);
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      
      try {
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
          
        console.log(`Subscription canceled for subscription ${subscription.id}`);
      } catch (error) {
        console.error('Error processing customer.subscription.deleted:', error);
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 