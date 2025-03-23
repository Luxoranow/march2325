import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { userId, quantity } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!quantity || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be at least 1' }, { status: 400 });
    }
    
    // Get the user's subscription from your database
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();
    
    if (error || !subscription) {
      return NextResponse.json({ 
        error: 'No active subscription found',
        details: error?.message
      }, { status: 404 });
    }
    
    if (!subscription.stripe_subscription_id) {
      return NextResponse.json({ error: 'No Stripe subscription ID found' }, { status: 400 });
    }
    
    // If the quantity is the same, no need to update
    if (subscription.quantity === quantity) {
      return NextResponse.json({ 
        success: true, 
        message: 'Quantity unchanged',
        subscription
      });
    }
    
    try {
      // Get the subscription from Stripe to find the subscription item ID
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      
      if (!stripeSubscription.items.data.length) {
        return NextResponse.json({ error: 'No subscription items found' }, { status: 400 });
      }
      
      const subscriptionItemId = subscription.stripe_subscription_item_id || stripeSubscription.items.data[0].id;
      
      // Update the subscription quantity in Stripe
      const updatedSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          items: [{
            id: subscriptionItemId,
            quantity: quantity,
          }],
        }
      );
      
      // Update your database
      const { data: updatedData, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating subscription in database:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update subscription in database',
          details: updateError.message
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Subscription updated from ${subscription.quantity} to ${quantity} seats`,
        subscription: updatedData
      });
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({ 
        error: `Stripe error: ${stripeError.message}`,
        details: stripeError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 