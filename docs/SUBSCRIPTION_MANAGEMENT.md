# Subscription Management System

This document outlines the enhanced subscription management system in Luxora, providing a reliable, efficient, and maintainable way to handle user subscriptions and premium feature access.

## Key Components

### 1. Subscription Helper (`lib/subscription-helper.ts`)
- Provides utility functions for checking subscription status
- Implements `hasPremiumAccess()` to verify both plan type AND status
- Contains test subscription override for development

### 2. Subscription Cache (`lib/subscription-cache.ts`)
- Client-side caching to reduce database queries
- 15-minute cache expiry to balance freshness and performance
- Safe local storage implementation with error handling

### 3. Subscription Service (`lib/subscription-service.ts`)
- Service layer for all subscription operations
- Custom error handling with error codes and descriptive messages
- Methods for:
  - Getting current subscription
  - Creating checkout sessions
  - Canceling subscriptions
  - Updating payment methods

### 4. Subscription Logger (`lib/subscription-logger.ts`)
- Comprehensive logging system for subscriptions
- Configurable log levels (debug, info, warn, error)
- Client-side and server-side logging support
- Session tracking for correlating related events

### 5. Subscription React Hook (`lib/hooks/useSubscription.ts`)
- React hook for accessing subscription data
- Provides functions for subscription management
- Integrates with caching system
- Handles authentication state changes

### 6. Webhook Handler (`app/api/webhooks/stripe/route.ts`)
- Enhanced error handling for webhook events
- Safe database operations with retry logic
- Detailed logging for all webhook events
- Support for all major subscription lifecycle events

### 7. Logging API (`app/api/logs/subscription/route.ts`)
- Securely stores subscription logs in Supabase
- Sanitizes sensitive information
- Includes metadata like user agent and IP address

### 8. Database Structure (`migrations/subscription_schema_update.sql`)
- Enhanced subscription table schema
- New subscription logs table
- Optimized with proper indexes
- Trigger for automatic timestamp updates

## Usage Examples

### Checking if a User Has Premium Access

```typescript
import { hasPremiumAccess } from '@/lib/subscription-helper';

// Check if the user has premium access
const canAccessPremiumFeature = hasPremiumAccess(subscription);

if (canAccessPremiumFeature) {
  // Allow premium feature access
} else {
  // Show upgrade prompt
}
```

### Using the Subscription Hook in a Component

```typescript
import { useSubscription } from '@/lib/hooks/useSubscription';

function SubscriptionInfo() {
  const { 
    subscription, 
    loading, 
    error, 
    upgradeToPremium,
    isPremium
  } = useSubscription();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <p>Current plan: {subscription?.plan_id}</p>
      <p>Status: {subscription?.status}</p>
      
      {!isPremium() && (
        <button onClick={upgradeToPremium}>
          Upgrade to Premium
        </button>
      )}
    </div>
  );
}
```

### Logging Subscription Events

```typescript
import { subscriptionLogger } from '@/lib/subscription-logger';

// Log a feature access attempt
subscriptionLogger.logFeatureAccess(
  userId,
  'analytics_export',
  hasAccess,
  subscription
);

// Log an error
try {
  // Some subscription operation
} catch (error) {
  subscriptionLogger.logError(
    'Failed to process subscription update',
    error,
    userId
  );
}
```

## Benefits

1. **Reliability**: Robust error handling and fallbacks ensure the system gracefully handles failures.
2. **Performance**: Client-side caching reduces database load and improves user experience.
3. **Security**: Proper verification of subscription status prevents unauthorized access.
4. **Diagnostics**: Comprehensive logging makes it easy to identify and fix issues.
5. **Maintainability**: Clear separation of concerns and well-documented code.

## Implementation Notes

- The system accounts for edge cases like network failures and cache misses.
- All subscription changes trigger cache invalidation to ensure fresh data.
- Webhook handlers include idempotency checks to prevent duplicate processing.
- Graceful degradation ensures users retain core functionality during service disruptions.

## Future Improvements

- Real-time subscription updates via WebSockets
- Subscription analytics dashboard for admins
- Offline support for subscription verification
- Enhanced fraud detection measures

## Testing

To test the subscription system:

1. Run unit tests: `npm run test:subscription`
2. Verify webhook handling with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Test checkout flow with test cards: `4242 4242 4242 4242` (success) and `4000 0000 0000 0341` (payment failure) 