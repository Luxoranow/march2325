'use client';

import { useState, useEffect, useCallback } from 'react';
import { Subscription, hasPremiumAccess } from '../subscription-helper';
import { fetchSubscriptionWithCache } from '../subscription-cache';
import { subscriptionService } from '../subscription-service';
import { subscriptionLogger } from '../subscription-logger';
import { supabase } from '@/lib/supabase';

/**
 * Hook for accessing and managing subscription data
 * @returns Subscription data and utility functions
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Function to fetch the subscription data
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First get the user ID for logging
      const { data: userData } = await supabase.auth.getUser();
      const currentUserId = userData?.user?.id || null;
      setUserId(currentUserId);
      
      if (!currentUserId) {
        setSubscription(null);
        return;
      }
      
      if (currentUserId) {
        subscriptionLogger.logSubscriptionFetch(currentUserId);
      }
      
      // Fetch subscription data with caching
      const data = await fetchSubscriptionWithCache(
        () => subscriptionService.getUserSubscription()
      );
      
      setSubscription(data);
      
      if (data && currentUserId) {
        subscriptionLogger.logFeatureAccess(
          currentUserId,
          'subscription_check',
          hasPremiumAccess(data),
          data
        );
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (userId) {
        subscriptionLogger.logError('Failed to fetch subscription', err, userId);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Function to handle subscription updates (e.g. after checkout)
  const refreshSubscription = useCallback(async () => {
    const oldSubscription = subscription;
    await fetchSubscription();
    
    if (userId && subscription) {
      subscriptionLogger.logSubscriptionUpdate(userId, oldSubscription, subscription);
    }
  }, [fetchSubscription, subscription, userId]);
  
  // Upgrade to a premium plan
  const upgradeToPremium = useCallback(async () => {
    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession('premium');
      
      // Redirect to checkout page
      window.location.href = checkoutUrl;
      return checkoutUrl;
    } catch (err) {
      console.error('Error upgrading to premium:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (userId) {
        subscriptionLogger.logError('Failed to upgrade to premium', err, userId);
      }
      throw err;
    }
  }, [userId]);
  
  // Upgrade to a team plan
  const upgradeToTeam = useCallback(async () => {
    try {
      const checkoutUrl = await subscriptionService.createCheckoutSession('team');
      
      // Redirect to checkout page
      window.location.href = checkoutUrl;
      return checkoutUrl;
    } catch (err) {
      console.error('Error upgrading to team plan:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (userId) {
        subscriptionLogger.logError('Failed to upgrade to team plan', err, userId);
      }
      throw err;
    }
  }, [userId]);
  
  // Cancel the current subscription
  const cancelSubscription = useCallback(async () => {
    try {
      await subscriptionService.cancelSubscription();
      await refreshSubscription();
    } catch (err) {
      console.error('Error canceling subscription:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (userId) {
        subscriptionLogger.logError('Failed to cancel subscription', err, userId);
      }
      throw err;
    }
  }, [refreshSubscription, userId]);
  
  // Update payment method
  const updatePaymentMethod = useCallback(async () => {
    try {
      const updateUrl = await subscriptionService.updatePaymentMethod();
      
      // Redirect to update page
      window.location.href = updateUrl;
      return updateUrl;
    } catch (err) {
      console.error('Error updating payment method:', err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (userId) {
        subscriptionLogger.logError('Failed to update payment method', err, userId);
      }
      throw err;
    }
  }, [userId]);
  
  // Check if the user has premium access
  const isPremium = useCallback(() => {
    return hasPremiumAccess(subscription);
  }, [subscription]);
  
  // Fetch subscription on mount and when auth state changes
  useEffect(() => {
    fetchSubscription();
    
    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      fetchSubscription();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchSubscription]);
  
  return {
    subscription,
    loading,
    error,
    refreshSubscription,
    upgradeToPremium,
    upgradeToTeam,
    cancelSubscription,
    updatePaymentMethod,
    isPremium,
  };
} 