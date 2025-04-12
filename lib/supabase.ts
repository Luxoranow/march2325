import { createClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks and validation
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing');
    // Return a placeholder URL in development to prevent crashes
    return process.env.NODE_ENV === 'development' 
      ? 'https://placeholder-supabase-url.supabase.co' 
      : '';
  }
  return url;
};

const getSupabaseAnonKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    console.error('CRITICAL: NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    // Return a placeholder key in development to prevent crashes
    return process.env.NODE_ENV === 'development' 
      ? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs' 
      : '';
  }
  return key;
};

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

// Remove detailed logging in production
// Removed logSupabaseDetails function and its call

// Create the Supabase client with error handling
let supabaseInstance: ReturnType<typeof createClient>;

try {
  // Initialize with more options for better error handling
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      debug: process.env.NODE_ENV === 'development', // Enable auth debugging in development
      storageKey: 'luxora-auth-token', // Use a custom storage key to avoid conflicts
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null;
          return window.localStorage.getItem(key);
        },
        setItem: (key, value) => {
          if (typeof window === 'undefined') return;
          window.localStorage.setItem(key, value);
        },
        removeItem: (key) => {
          if (typeof window === 'undefined') return;
          window.localStorage.removeItem(key);
        },
      },
    },
    global: {
      headers: {
        'X-Client-Info': 'luxora-web-app',
      },
      fetch: (...args) => {
        // Only log fetch requests in development when explicitly enabled
        if (process.env.DEBUG_SUPABASE === 'true') {
          console.log('Supabase fetch:', args[0]);
        }
        return fetch(...args);
      }
    }
  });
  
  // Test the client to make sure it's working
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Only run this in development browser context
    supabaseInstance.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Supabase client test failed:', error.message);
        // Try to provide more context
        if (error.message.includes('invalid API key')) {
          console.error('This may be caused by an incorrect API key format or a key that has been revoked.');
        }
      } else {
        console.log('Supabase client initialized successfully');
      }
    });
  }
} catch (err) {
  console.error('Failed to initialize Supabase client:', err);
  // Create a dummy client that will throw clear errors when used
  supabaseInstance = createClient('https://placeholder-url.supabase.co', 'placeholder-key');
}

export const supabase = supabaseInstance; 