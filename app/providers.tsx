'use client';

import { ReactNode, useEffect, useState } from 'react';
import { CircularProgress, Box, Typography, Alert } from '@mui/material';

export function EnvironmentProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check environment variables at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is missing');
      setError('Supabase URL is missing. Please check your environment variables.');
    } else if (!supabaseKey) {
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
      setError('Supabase API key is missing. Please check your environment variables.');
    } else {
      // Only log in development mode
      if (process.env.NODE_ENV === 'development') {
        // Just for debugging - log the first few characters of the key
        const keyPreview = `${supabaseKey.substring(0, 8)}...`;
        console.log(`[Runtime] Supabase URL: ${supabaseUrl}`);
        console.log(`[Runtime] Supabase Key preview: ${keyPreview}`);
      }
    }
    
    // Continue after a short delay to allow logging to appear in console
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress />
        <Typography variant="body2">
          Checking environment configuration...
        </Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        p: 3
      }}>
        <Alert severity="error" sx={{ mb: 2, maxWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Error
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
        </Alert>
        
        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', maxWidth: 500 }}>
          This is likely due to missing environment variables. If you're deploying to Vercel, make sure 
          to add all required environment variables in the Vercel dashboard.
        </Typography>
      </Box>
    );
  }
  
  return <>{children}</>;
} 