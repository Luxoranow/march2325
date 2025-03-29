'use client';

import { supabase } from '@/lib/supabase';
import { toast } from 'react-toastify';
import { clearSubscriptionCache } from './subscription-cache';
import { Subscription } from './subscription-helper';

/**
 * Custom error class for subscription-related errors
 */
export class SubscriptionError extends Error {
  public code: string;
  
  constructor(message: string, code: string = 'SUBSCRIPTION_ERROR') {
    super(message);
    this.name = 'SubscriptionError';
    this.code = code;
  }
}

/**
 * Service for managing subscription-related operations
 */
export class SubscriptionService {
  /**
   * Get the current user's subscription
   * @returns The user's subscription or null if not found
   */
  async getUserSubscription(): Promise<Subscription | null> {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new SubscriptionError(
          'Failed to authenticate user', 
          'AUTH_ERROR'
        );
      }
      
      if (!user || !user.user) {
        console.log('No authenticated user found');
        return null;
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found
          console.log('No subscription found for user');
          return {
            plan_id: 'free',
            status: 'active'
          };
        }
        
        throw new SubscriptionError(
          `Error fetching subscription: ${error.message}`,
          `DB_ERROR_${error.code}`
        );
      }
      
      return data as unknown as Subscription;
    } catch (error) {
      if (error instanceof SubscriptionError) {
        // Re-throw custom errors
        throw error;
      }
      
      // Log unexpected errors
      console.error('Unexpected error in getUserSubscription:', error);
      throw new SubscriptionError(
        'Failed to retrieve subscription information',
        'UNKNOWN_ERROR'
      );
    }
  }
  
  /**
   * Create a checkout session for upgrading to a premium plan
   * @param planId The plan ID to upgrade to
   * @returns URL to the checkout page
   */
  async createCheckoutSession(planId: string): Promise<string> {
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new SubscriptionError(
          'Failed to authenticate user for checkout', 
          'AUTH_ERROR'
        );
      }
      
      if (!user || !user.user) {
        throw new SubscriptionError(
          'You must be logged in to upgrade',
          'NOT_AUTHENTICATED'
        );
      }
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SubscriptionError(
          errorData.message || `Checkout failed with status ${response.status}`,
          errorData.code || 'CHECKOUT_ERROR'
        );
      }
      
      const { url } = await response.json();
      if (!url) {
        throw new SubscriptionError(
          'No checkout URL returned from server',
          'INVALID_RESPONSE'
        );
      }
      
      return url;
    } catch (error) {
      if (error instanceof SubscriptionError) {
        // Re-throw custom errors
        throw error;
      }
      
      console.error('Unexpected error in createCheckoutSession:', error);
      throw new SubscriptionError(
        'Failed to create checkout session',
        'CHECKOUT_ERROR'
      );
    }
  }
  
  /**
   * Cancel the current subscription
   */
  async cancelSubscription(): Promise<void> {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SubscriptionError(
          errorData.message || `Cancellation failed with status ${response.status}`,
          errorData.code || 'CANCEL_ERROR'
        );
      }
      
      // Clear the subscription cache after cancellation
      clearSubscriptionCache();
      
      toast.success('Your subscription has been canceled successfully');
    } catch (error) {
      if (error instanceof SubscriptionError) {
        toast.error(error.message);
        throw error;
      }
      
      console.error('Unexpected error in cancelSubscription:', error);
      toast.error('Failed to cancel subscription. Please try again later.');
      throw new SubscriptionError(
        'Failed to cancel subscription',
        'CANCEL_ERROR'
      );
    }
  }
  
  /**
   * Update the payment method for the current subscription
   */
  async updatePaymentMethod(): Promise<string> {
    try {
      const response = await fetch('/api/subscription/update-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new SubscriptionError(
          errorData.message || `Failed to update payment method with status ${response.status}`,
          errorData.code || 'PAYMENT_UPDATE_ERROR'
        );
      }
      
      const { url } = await response.json();
      if (!url) {
        throw new SubscriptionError(
          'No update URL returned from server',
          'INVALID_RESPONSE'
        );
      }
      
      return url;
    } catch (error) {
      if (error instanceof SubscriptionError) {
        toast.error(error.message);
        throw error;
      }
      
      console.error('Unexpected error in updatePaymentMethod:', error);
      toast.error('Failed to update payment method. Please try again later.');
      throw new SubscriptionError(
        'Failed to update payment method',
        'PAYMENT_UPDATE_ERROR'
      );
    }
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService(); 