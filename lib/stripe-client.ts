'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Load Stripe outside of component render to avoid recreating Stripe object on each render
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
  }
  return stripePromise;
}; 