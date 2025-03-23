import Stripe from 'stripe';

// Initialize Stripe with the secret key
// In a real application, you would store this in an environment variable
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Use the latest API version
});

export default stripe; 