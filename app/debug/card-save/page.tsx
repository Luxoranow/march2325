'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Container, Typography, Paper, Button, Alert, AlertTitle, CircularProgress, Divider, List, ListItem, ListItemText, Accordion, AccordionSummary, AccordionDetails, Stepper, Step, StepLabel, StepContent } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

export default function CardSaveDebugPage() {
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dbError, setDbError] = useState<string | null>(null);
  const [saveTestStatus, setSaveTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveTestError, setSaveTestError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [expandedPanel, setExpandedPanel] = useState<string | false>('authentication');

  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toISOString().substring(11, 19)}: ${message}`]);
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        addLog('Checking authentication status...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          addLog(`Authentication error: ${error.message}`);
          setAuthStatus('unauthenticated');
          return;
        }
        
        if (data.session) {
          addLog(`User authenticated: ${data.session.user.id}`);
          setUserId(data.session.user.id);
          setAuthStatus('authenticated');
        } else {
          addLog('No active session found');
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        addLog(`Error checking auth: ${err instanceof Error ? err.message : String(err)}`);
        setAuthStatus('unauthenticated');
      }
    };
    
    const checkDatabase = async () => {
      try {
        addLog('Testing database access...');
        const { data, error } = await supabase.from('cards').select('count');
        
        if (error) {
          addLog(`Database access error: ${error.message}`);
          setDbStatus('error');
          setDbError(error.message);
          return;
        }
        
        addLog('Database access successful: Connection test passed');
        setDbStatus('success');
      } catch (err) {
        addLog(`Error testing database: ${err instanceof Error ? err.message : String(err)}`);
        setDbStatus('error');
        setDbError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    checkDatabase();
  }, []);
  
  const testCardSave = async () => {
    try {
      setSaveTestStatus('loading');
      setSaveTestError(null);
      addLog('Testing card save operation...');
      
      // Make sure we have a user ID
      const effectiveUserId = userId || '00000000-0000-0000-0000-000000000000'; // fallback to test ID
      addLog(`Using user ID: ${effectiveUserId}`);
      
      // Create a minimal test card record
      const testCard = {
        user_id: effectiveUserId,
        name: 'Test Card',
        data: {
          personal: {
            name: 'Test User',
            title: 'Tester',
            email: 'test@example.com',
            phone: '',
            photo: null
          },
          company: {
            name: 'Test Company',
            address: '',
            phone: '',
            fax: '',
            website: '',
            logo: null
          },
          socials: [],
          messaging: [],
          custom: [],
          theme: 'Classic'
        },
        updated_at: new Date().toISOString()
      };
      
      // Try direct database save first
      addLog('Attempting direct database save...');
      try {
        const { data, error } = await supabase
          .from('cards')
          .insert(testCard)
          .select();
        
        if (error) {
          addLog(`Direct save failed: ${error.message}`);
          throw error;
        }
        
        addLog(`Test card saved successfully: ${data[0]?.id}`);
        setSaveTestStatus('success');
        
        // Clean up the test card
        if (data && data.length > 0) {
          addLog('Cleaning up test card...');
          await supabase
            .from('cards')
            .delete()
            .eq('id', data[0].id);
          addLog('Test card deleted');
        }
        return;
      } catch (directError) {
        // If direct save fails, try using the API endpoint
        addLog('Direct save failed, trying API endpoint...');
        
        const response = await fetch('/api/cards/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testCard),
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          addLog(`API save failed: ${errorData}`);
          throw new Error(`API save failed: ${errorData}`);
        }
        
        const result = await response.json();
        addLog(`Test card saved via API successfully: ${result.data?.[0]?.id}`);
        setSaveTestStatus('success');
        
        // Clean up the test card
        if (result.data && result.data.length > 0) {
          addLog('Cleaning up test card...');
          await supabase
            .from('cards')
            .delete()
            .eq('id', result.data[0].id);
          addLog('Test card deleted');
        }
      }
    } catch (err) {
      addLog(`Error in save test: ${err instanceof Error ? err.message : String(err)}`);
      setSaveTestStatus('error');
      setSaveTestError(err instanceof Error ? err.message : String(err));
    }
  };
  
  const handleSignIn = async () => {
    try {
      addLog('Redirecting to sign-in page...');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/debug/card-save`
        }
      });
      
      if (error) {
        addLog(`Sign-in error: ${error.message}`);
      }
    } catch (err) {
      addLog(`Error initiating sign-in: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  const handlePanelChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPanel(isExpanded ? panel : false);
  };
  
  const renderTroubleshooting = () => {
    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Common Issues & Solutions
        </Typography>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Authentication Problems</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              If you're having trouble with authentication, try these solutions:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Sign out and sign back in" 
                  secondary="Your authentication token might have expired. Try signing out and signing back in to refresh it."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Clear browser cache & cookies" 
                  secondary="Old or corrupted session data might be causing problems. Clearing your browser cache can help."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Use an incognito/private window" 
                  secondary="This can help identify if a browser extension or cached data is causing issues."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Database Access Problems</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              If the database connection test fails, it could be due to:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Network issues" 
                  secondary="Check your internet connection and try again. Network firewalls might be blocking access."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Missing tables" 
                  secondary="The database might be missing the required tables. Contact support if this persists."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Permission issues" 
                  secondary="Row Level Security (RLS) policies might be preventing access. Make sure your account has the right permissions."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Card Saving Problems</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              If saving cards fails even when authentication and database access are working:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Check required fields" 
                  secondary="Make sure all required fields are filled out. The name field is particularly important."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Issues with card data" 
                  secondary="Very large images or invalid data might cause problems. Try with minimal data first."
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Try the fallback API" 
                  secondary="If direct saving doesn't work, the application should automatically try using the API route."
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>
      </Box>
    );
  };
  
  const renderFixSteps = () => {
    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Step-by-Step Fix Guide
        </Typography>
        
        <Stepper orientation="vertical">
          <Step active={true} completed={authStatus === 'authenticated'}>
            <StepLabel 
              StepIconComponent={() => 
                authStatus === 'authenticated' 
                  ? <CheckCircleIcon color="success" /> 
                  : authStatus === 'unauthenticated' 
                    ? <ErrorIcon color="error" /> 
                    : <CircularProgress size={20} />
              }
            >
              Fix Authentication
            </StepLabel>
            <StepContent>
              <Typography variant="body2">
                {authStatus === 'authenticated' 
                  ? 'Great! You are properly authenticated.' 
                  : 'You need to sign in to save cards.'}
              </Typography>
              {authStatus !== 'authenticated' && (
                <Button 
                  variant="contained" 
                  onClick={handleSignIn} 
                  size="small" 
                  sx={{ mt: 1 }}
                >
                  Sign In Now
                </Button>
              )}
            </StepContent>
          </Step>
          
          <Step active={authStatus === 'authenticated'} completed={dbStatus === 'success'}>
            <StepLabel
              StepIconComponent={() => 
                dbStatus === 'success' 
                  ? <CheckCircleIcon color="success" /> 
                  : dbStatus === 'error' 
                    ? <ErrorIcon color="error" /> 
                    : dbStatus === 'loading' 
                      ? <CircularProgress size={20} />
                      : <InfoIcon color="disabled" />
              }
            >
              Verify Database Access
            </StepLabel>
            <StepContent>
              <Typography variant="body2">
                {dbStatus === 'success' 
                  ? 'Database connection is working properly.'
                  : dbStatus === 'error'
                    ? `Database connection failed: ${dbError}`
                    : 'Checking database connection...'}
              </Typography>
              {dbStatus === 'error' && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  <AlertTitle>Database Access Error</AlertTitle>
                  This often indicates a permission issue. Make sure you've set up the database tables correctly.
                </Alert>
              )}
            </StepContent>
          </Step>
          
          <Step active={authStatus === 'authenticated' && dbStatus === 'success'}>
            <StepLabel
              StepIconComponent={() => 
                saveTestStatus === 'success' 
                  ? <CheckCircleIcon color="success" /> 
                  : saveTestStatus === 'error' 
                    ? <ErrorIcon color="error" /> 
                    : saveTestStatus === 'loading' 
                      ? <CircularProgress size={20} />
                      : <InfoIcon color="disabled" />
              }
            >
              Test Card Saving
            </StepLabel>
            <StepContent>
              <Typography variant="body2" paragraph>
                {saveTestStatus === 'idle' 
                  ? 'Run a test to see if card saving works.'
                  : saveTestStatus === 'loading'
                    ? 'Testing card saving...'
                    : saveTestStatus === 'success'
                      ? 'Card saving is working properly!'
                      : `Card saving failed: ${saveTestError}`}
              </Typography>
              
              {saveTestStatus !== 'loading' && (
                <Button 
                  variant="contained" 
                  onClick={testCardSave}
                  disabled={authStatus !== 'authenticated' || dbStatus !== 'success'}
                  size="small"
                >
                  Run Save Test
                </Button>
              )}
            </StepContent>
          </Step>
        </Stepper>
      </Box>
    );
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Card Save Diagnostic Tool
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool helps diagnose and fix issues with saving cards in Luxora. 
        Follow the steps below to identify and resolve any problems.
      </Typography>
      
      <Accordion 
        expanded={expandedPanel === 'authentication'} 
        onChange={handlePanelChange('authentication')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Authentication Status
            {authStatus === 'authenticated' && <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />}
            {authStatus === 'unauthenticated' && <ErrorIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {authStatus === 'loading' ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography>Checking authentication...</Typography>
            </Box>
          ) : authStatus === 'authenticated' ? (
            <Alert severity="success">
              <AlertTitle>Authenticated</AlertTitle>
              You are signed in with user ID: {userId}
            </Alert>
          ) : (
            <Alert severity="warning">
              <AlertTitle>Not Authenticated</AlertTitle>
              You are not signed in. Card saving requires authentication.
              <Box mt={2}>
                <Button variant="contained" onClick={handleSignIn}>
                  Sign In with Google
                </Button>
              </Box>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedPanel === 'database'} 
        onChange={handlePanelChange('database')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Database Connection
            {dbStatus === 'success' && <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />}
            {dbStatus === 'error' && <ErrorIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {dbStatus === 'loading' ? (
            <Box display="flex" alignItems="center">
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography>Testing database connection...</Typography>
            </Box>
          ) : dbStatus === 'success' ? (
            <Alert severity="success">
              <AlertTitle>Connected</AlertTitle>
              Successfully connected to the database and accessed the cards table.
            </Alert>
          ) : (
            <Alert severity="error">
              <AlertTitle>Connection Error</AlertTitle>
              {dbError}
              <Typography variant="body2" sx={{ mt: 1 }}>
                This often indicates a problem with your database configuration or permissions.
                Try refreshing the page or signing in again.
              </Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedPanel === 'cardSave'} 
        onChange={handlePanelChange('cardSave')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Card Save Test
            {saveTestStatus === 'success' && <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />}
            {saveTestStatus === 'error' && <ErrorIcon color="error" sx={{ ml: 1, verticalAlign: 'middle' }} />}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            This will attempt to save a test card to the database and then delete it.
            It's a good way to verify that card saving is working properly.
          </Typography>
          
          <Button 
            variant="contained" 
            onClick={testCardSave}
            disabled={saveTestStatus === 'loading' || loading || authStatus !== 'authenticated'}
            sx={{ mb: 2 }}
          >
            {saveTestStatus === 'loading' ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Testing...
              </>
            ) : 'Test Card Save'}
          </Button>
          
          {saveTestStatus === 'success' && (
            <Alert severity="success">
              <AlertTitle>Success</AlertTitle>
              Test card was successfully saved and deleted. Card saving is working properly!
            </Alert>
          )}
          
          {saveTestStatus === 'error' && (
            <Alert severity="error">
              <AlertTitle>Error</AlertTitle>
              {saveTestError}
              <Typography variant="body2" sx={{ mt: 1 }}>
                This error indicates a problem with the card saving process. 
                Check the logs below for more details.
              </Typography>
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
      
      <Accordion 
        expanded={expandedPanel === 'logs'} 
        onChange={handlePanelChange('logs')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Debug Logs</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ maxHeight: 200, overflow: 'auto', bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
            {logs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No logs yet</Typography>
            ) : (
              <List dense>
                {logs.map((log, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemText primary={log} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
      
      {renderFixSteps()}
      {renderTroubleshooting()}
      
      <Box mt={4} p={2} bgcolor="#f9f9f9" borderRadius={1}>
        <Typography variant="h6" gutterBottom>
          Need More Help?
        </Typography>
        <Typography variant="body2">
          If you've tried all the suggestions and are still having problems saving cards, 
          please contact our support team with the logs from this page.
        </Typography>
      </Box>
    </Container>
  );
} 