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