import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe-server';

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();
    
    // Validate the customer ID
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }
    
    // Create a Stripe customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${request.headers.get('origin')}/dashboard`,
    });
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 