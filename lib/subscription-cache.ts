'use client';

import { Subscription } from './subscription-helper';

// Cache keys
const SUBSCRIPTION_CACHE_KEY = 'luxora_subscription_cache';
const CACHE_EXPIRY_KEY = 'luxora_subscription_cache_expiry';

// Cache expiry time in milliseconds (15 minutes)
const CACHE_EXPIRY_TIME = 15 * 60 * 1000;

/**
 * Store subscription data in cache
 * @param subscription The subscription data to cache
 */
export const cacheSubscription = (subscription: Subscription | null): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Store the subscription data
    localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subscription));
    
    // Set the expiry timestamp
    const expiryTime = Date.now() + CACHE_EXPIRY_TIME;
    localStorage.setItem(CACHE_EXPIRY_KEY, expiryTime.toString());
    
    console.log('Subscription data cached successfully');
  } catch (error) {
    console.error('Error caching subscription data:', error);
  }
};

/**
 * Get cached subscription data if valid
 * @returns The cached subscription data or null if cache is invalid
 */
export const getCachedSubscription = (): Subscription | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    // Check if cache is expired
    const expiryTimeStr = localStorage.getItem(CACHE_EXPIRY_KEY);
    if (!expiryTimeStr) return null;
    
    const expiryTime = parseInt(expiryTimeStr, 10);
    if (Date.now() > expiryTime) {
      // Cache expired, clear it
      clearSubscriptionCache();
      return null;
    }
    
    // Get the cached subscription data
    const cachedData = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (!cachedData) return null;
    
    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error retrieving cached subscription data:', error);
    return null;
  }
};

/**
 * Clear the subscription cache
 */
export const clearSubscriptionCache = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(SUBSCRIPTION_CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    console.log('Subscription cache cleared');
  } catch (error) {
    console.error('Error clearing subscription cache:', error);
  }
};

/**
 * Fetch subscription data with caching
 * @param fetchFunction The function to fetch subscription data from the server
 * @returns The subscription data (either from cache or freshly fetched)
 */
export const fetchSubscriptionWithCache = async (
  fetchFunction: () => Promise<Subscription | null>
): Promise<Subscription | null> => {
  // Try to get from cache first
  const cachedSubscription = getCachedSubscription();
  if (cachedSubscription) {
    console.log('Using cached subscription data');
    return cachedSubscription;
  }
  
  // Fetch fresh data
  try {
    const subscription = await fetchFunction();
    // Cache the result
    cacheSubscription(subscription);
    return subscription;
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    return null;
  }
}; 