// This is a helper file to make it easy to test different subscription levels
// You can import this in any page and use it to override the subscription level

// Set this to the plan you want to test: 'free', 'premium', or 'team'
export const TEST_SUBSCRIPTION_PLAN = 'premium';

// Set this to false to use the actual subscription from the database
export const USE_TEST_SUBSCRIPTION = false;

export const getTestSubscription = () => {
  return {
    plan_id: TEST_SUBSCRIPTION_PLAN,
    status: 'active'
  };
};

// Interface for subscription type
export interface Subscription {
  id?: string;
  user_id?: string;
  plan_id: string;
  status: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  current_period_end?: string | null;
  quantity?: number | null;
  created_at?: string;
  updated_at?: string;
  canceled_at?: string | null;
}

/**
 * Check if a user has active premium access
 * @param subscription The user's subscription object
 * @returns boolean indicating if user has premium features access
 */
export const hasPremiumAccess = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  // User must have a non-free plan AND status must be active or past_due (grace period)
  return (
    subscription.plan_id !== 'free' && 
    (subscription.status === 'active' || subscription.status === 'past_due')
  );
};

/**
 * Check if a user has team plan features
 * @param subscription The user's subscription object
 * @returns boolean indicating if user has team plan features
 */
export const hasTeamAccess = (subscription: Subscription | null): boolean => {
  if (!subscription) return false;
  
  // User must have team plan AND status must be active or past_due (grace period)
  return (
    subscription.plan_id === 'team' && 
    (subscription.status === 'active' || subscription.status === 'past_due')
  );
};

/**
 * Get the subscription status for display
 * @param subscription The user's subscription object
 * @returns Object with information about subscription status
 */
export const getSubscriptionStatus = (subscription: Subscription | null) => {
  if (!subscription) {
    return {
      plan: 'free',
      isActive: false,
      label: 'FREE',
      requiresAction: false,
      message: 'You are on the free plan'
    };
  }

  let status = {
    plan: subscription.plan_id,
    isActive: subscription.status === 'active',
    label: subscription.plan_id.toUpperCase(),
    requiresAction: false,
    message: ''
  };

  // Add specific details based on status
  switch (subscription.status) {
    case 'active':
      status.message = `Your ${subscription.plan_id.toUpperCase()} plan is active`;
      break;
    case 'past_due':
      status.requiresAction = true;
      status.message = 'Your payment is past due. Please update your payment method.';
      break;
    case 'canceled':
      status.isActive = false;
      status.message = 'Your subscription has been canceled';
      break;
    default:
      status.message = `Your subscription status is: ${subscription.status}`;
  }

  return status;
}; 