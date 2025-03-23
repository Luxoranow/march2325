import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Fallback to anon key if service role key is not available (for deployment)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define the pricing plans with actual Stripe price IDs
interface PlanInfo {
  name: string;
  price: number;
  features: string[];
  priceId: string;
}

const PLANS: Record<string, PlanInfo> = {
  'free': {
    name: 'Zero Bucks Given',
    price: 0,
    features: ['Basic digital business card', 'QR code generation', 'Basic support'],
    priceId: 'price_1R0uRUGvrQbQlRXY1YAUVtWM'
  },
  'premium': {
    name: 'Glow Up',
    price: 1999, // $19.99
    priceId: 'price_1R0uUZGvrQbQlRXYz13KlV6x',
    features: ['Custom branding', 'Advanced analytics', 'Multiple card designs', 'Priority support']
  },
  'team': {
    name: 'Squad Goals',
    price: 599, // $5.99 per user
    priceId: 'price_1R3UEDGvrQbQlRXYdSbJTGY7',
    features: ['Team management', 'Shared analytics', 'Brand consistency', 'Admin controls']
  }
};

export async function POST(request: NextRequest) {
  try {
    const { planId, userId, quantity = 1, userEmail } = await request.json();
    
    // Validate the plan
    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }
    
    // Validate the user
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Free plan doesn't need checkout
    if (planId === 'free') {
      // Update user subscription in database
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          quantity: 1
        });
        
      if (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }
      
      return NextResponse.json({ success: true, message: 'Free plan activated' });
    }
    
    // For paid plans, create a Stripe checkout session
    const plan = PLANS[planId];
    
    try {
      // Create session with appropriate parameters
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: quantity
          }
        ],
        mode: 'subscription',
        success_url: `${request.headers.get('origin')}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get('origin')}/pricing?canceled=true`,
        client_reference_id: userId,
        metadata: {
          userId,
          planId,
        },
        customer_email: userEmail,
      });
      
      return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (stripeError: any) {
      console.error('Stripe error:', stripeError);
      return NextResponse.json({ 
        error: `Stripe error: ${stripeError.message}`,
        details: stripeError
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 