'use client';

import { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Alert, Button, CircularProgress } from '@mui/material';
import { supabase } from '@/lib/supabase';

export default function DebugEnvPage() {
  const [loading, setLoading] = useState(true);
  const [supabaseInfo, setSupabaseInfo] = useState<string>('Loading...');
  const [testResult, setTestResult] = useState<'loading' | 'success' | 'error' | null>(null);
  const [testMessage, setTestMessage] = useState<string>('');
  const [apiData, setApiData] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    // Safely gather information about environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set';
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    const info = `
      Supabase URL: ${supabaseUrl}
      Supabase Key available: ${hasKey ? 'Yes' : 'No'}
      Environment: ${process.env.NODE_ENV || 'not set'}
    `;
    
    setSupabaseInfo(info);
    setLoading(false);
  }, []);

  const testSupabaseConnection = async () => {
    try {
      setTestResult('loading');
      setTestMessage('Testing Supabase connection...');
      
      // Simple test of Supabase connection
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        setTestResult('error');
        setTestMessage(`Error: ${error.message}`);
        return;
      }
      
      setTestResult('success');
      setTestMessage('Supabase connection successful!');
    } catch (err) {
      console.error('Error testing Supabase:', err);
      setTestResult('error');
      setTestMessage(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const checkApiEnvironment = async () => {
    try {
      setApiData(null);
      setApiError(null);
      
      const response = await fetch('/debug/env/api');
      const data = await response.json();
      
      if (response.ok) {
        setApiData(data);
      } else {
        setApiError(data.error || 'Failed to fetch environment data');
      }
    } catch (err) {
      console.error('Error fetching API environment:', err);
      setApiError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Environment Debug
      </Typography>
      
      <Alert severity="info" sx={{ mb: 4 }}>
        This page helps debug environment variables and Supabase connection.
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
          {supabaseInfo}
        </Box>
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Supabase Connection Test
        </Typography>
        
        {testResult === null && (
          <Button 
            variant="contained" 
            onClick={testSupabaseConnection}
            sx={{ mb: 2 }}
          >
            Test Connection
          </Button>
        )}
        
        {testResult === 'loading' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 2 }}>
            <CircularProgress size={24} />
            <Typography>{testMessage}</Typography>
          </Box>
        )}
        
        {testResult === 'success' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {testMessage}
          </Alert>
        )}
        
        {testResult === 'error' && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {testMessage}
          </Alert>
        )}
        
        {testResult !== null && (
          <Button 
            variant="outlined" 
            onClick={() => {
              setTestResult(null);
              setTestMessage('');
            }}
          >
            Reset Test
          </Button>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          API Environment Check
        </Typography>
        
        {apiData === null && (
          <Button 
            variant="contained" 
            onClick={checkApiEnvironment}
            sx={{ mb: 2 }}
          >
            Check API Environment
          </Button>
        )}
        
        {apiData !== null && (
          <Alert severity="success" sx={{ mb: 2 }}>
            API data: {JSON.stringify(apiData)}
          </Alert>
        )}
        
        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            API error: {apiError}
          </Alert>
        )}
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button 
          variant="contained"
          onClick={() => window.location.href = '/'}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
} 