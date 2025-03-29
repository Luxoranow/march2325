'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Link,
  Tabs,
  Tab,
  Container
} from '@mui/material';

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/dashboard');

  // Check for redirect parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const redirect = urlParams.get('redirect');
      if (redirect) {
        setRedirectPath(`/${redirect}`);
      }
    }
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError(null);
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect to the appropriate page
      router.push(redirectPath);
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, sm: 8 } }}>
      <Paper 
        elevation={0} 
        sx={{ 
          maxWidth: 500, 
          mx: 'auto',
          p: { xs: 2, sm: 4 },
          backgroundColor: '#121212',
          color: '#ffffff',
          border: '1px solid #333333'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Box 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%'
            }}
          >
            <Box 
              component="img"
              src="/images/luxora-logo.png"
              alt="Luxora Logo"
              sx={{ 
                width: 100, 
                height: 'auto', 
                mb: 1
              }}
              onLoad={() => setLogoLoaded(true)}
            />
          </Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              letterSpacing: '0.3em',
              textAlign: 'center',
              fontSize: { xs: '1.75rem', sm: '2.125rem' }
            }}
          >
            LUXORA
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              mt: 1, 
              mb: 3, 
              color: '#cccccc',
              textAlign: 'center',
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Oh hey, look who's back!
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center', 
              mb: 3,
              fontStyle: 'italic',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Sign in to manage your digital business cards and access all features.
          </Typography>
          
          {redirectPath !== '/dashboard' && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                width: '100%',
                borderRadius: 0,
                backgroundColor: 'rgba(0, 127, 255, 0.1)',
                '& .MuiAlert-message': {
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }
              }}
            >
              You'll be redirected to {redirectPath.replace('/', '')} after signing in.
            </Alert>
          )}
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            textColor="inherit"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'white',
              },
            }}
          >
            <Tab 
              label="SIGN IN" 
              sx={{ 
                color: 'white',
                '&.Mui-selected': { color: 'white' },
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }} 
            />
            <Tab 
              label="SIGN UP" 
              onClick={() => router.push('/signup')}
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-selected': { color: 'white' },
                fontSize: '0.85rem',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }} 
            />
          </Tabs>
        </Box>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#2c1215', 
              color: '#f88e86',
              '.MuiAlert-icon': {
                color: '#f88e86'
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSignIn} noValidate>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'monospace' }}>
            Email
          </Typography>
          <TextField
            required
            fullWidth
            id="email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            placeholder="your@email.com"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 0,
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              style: { fontSize: '0.85rem' }
            }}
          />
          
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'monospace' }}>
            Password
          </Typography>
          <TextField
            required
            fullWidth
            name="password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            placeholder="••••••••"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 0,
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              style: { fontSize: '0.85rem' }
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ 
              mt: 2, 
              mb: 3, 
              py: 1.2, 
              backgroundColor: 'white', 
              color: 'black',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'SIGN IN'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.75rem'
              }}
            >
              Forgot your password? 🤔{' '}
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push('/reset-password')}
                sx={{ 
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              >
                Reset it
              </Link>
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: 'monospace',
                fontSize: '0.75rem'
              }}
            >
              <span style={{ marginRight: '8px' }}>��</span> New here?{' '}
              <Link
                component="button"
                variant="caption"
                onClick={() => router.push('/signup')}
                sx={{ 
                  ml: 1, 
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  fontFamily: 'monospace',
                  fontSize: '0.75rem'
                }}
              >
                Create an account
              </Link>
            </Typography>
          </Box>
          
          <Typography 
            variant="caption" 
            align="center" 
            sx={{ 
              display: 'block', 
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.5)',
              fontFamily: 'monospace',
              fontSize: '0.7rem'
            }}
          >
            (Unless you prefer handing out paper cards and hoping for the best. No judgment...kinda.)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 