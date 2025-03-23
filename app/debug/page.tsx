'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Alert, Button } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [envInfo, setEnvInfo] = useState<string>('Loading...');
  const [supabaseStatus, setSupabaseStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  
  useEffect(() => {
    // Gather information about environment variables
    const envDetails = [
      `Environment: ${process.env.NODE_ENV || 'not set'}`,
      `NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set'}`,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY available: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}`,
      `SITE_URL: ${process.env.SITE_URL || 'not set'}`,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY available: ${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Yes' : 'No'}`,
      `Server-side vars visible client-side: ${process.env.STRIPE_SECRET_KEY ? 'Yes (SECURITY ISSUE)' : 'No (expected)'}`,
      `Browser: ${window.navigator.userAgent}`,
      `Timestamp: ${new Date().toISOString()}`
    ].join('\n');
    
    setEnvInfo(envDetails);
    
    // Test Supabase connection
    testSupabaseConnection();
  }, []);
  
  const testSupabaseConnection = async () => {
    try {
      // Simple test to check if Supabase is working
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection error:', error);
        setSupabaseStatus('error');
        setSupabaseError(error.message);
        return;
      }
      
      setSupabaseStatus('success');
    } catch (err) {
      console.error('Supabase test error:', err);
      setSupabaseStatus('error');
      setSupabaseError(err instanceof Error ? err.message : String(err));
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Environment Debug
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 4 }}>
        This page displays sensitive configuration information. Use it only for debugging and remove it before production deployment.
      </Alert>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Environment Variables
        </Typography>
        <Box component="pre" sx={{ 
          p: 2, 
          bgcolor: '#f5f5f5', 
          borderRadius: 1,
          overflowX: 'auto',
          fontSize: '0.8rem'
        }}>
          {envInfo}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Supabase Connection Test
        </Typography>
        
        {supabaseStatus === 'loading' && (
          <Alert severity="info">Testing Supabase connection...</Alert>
        )}
        
        {supabaseStatus === 'success' && (
          <Alert severity="success">
            Supabase connection successful! Your API key and URL are working correctly.
          </Alert>
        )}
        
        {supabaseStatus === 'error' && (
          <Alert severity="error">
            <Typography variant="subtitle2" gutterBottom>
              Supabase connection failed
            </Typography>
            <Typography variant="body2">
              Error: {supabaseError}
            </Typography>
          </Alert>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Button 
            variant="outlined" 
            onClick={testSupabaseConnection}
            sx={{ mr: 1 }}
          >
            Test Again
          </Button>
          <Button 
            variant="contained"
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 