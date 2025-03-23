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

export default function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(1);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Redirect to dashboard or confirmation page
      router.push(redirectPath);
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          maxWidth: 500, 
          mx: 'auto',
          backgroundColor: '#121212', 
          color: 'white',
          border: 'none',
          borderRadius: 0,
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 4, pb: 6 }}>
          {/* Logo */}
          <Box sx={{ 
            textAlign: 'center', 
            mb: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%'
          }}>
            <Box 
              component="img"
              src="/images/luxora-logo.png"
              alt="Luxora Logo"
              sx={{ 
                width: 100, 
                height: 'auto', 
                mb: 1
              }}
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
            Join the digital revolution!
          </Typography>
          
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              mb: 3,
              maxWidth: 600,
              mx: 'auto',
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}
          >
            Ditch the paper cards and level up your networking game. Create your digital business card in minutes.
          </Typography>
          
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
                onClick={() => router.push('/login')}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': { color: 'white' },
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }} 
              />
              <Tab 
                label="SIGN UP" 
                sx={{ 
                  color: 'white',
                  '&.Mui-selected': { color: 'white' },
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  fontFamily: 'monospace'
                }} 
              />
            </Tabs>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSignUp} noValidate>
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
              autoComplete="new-password"
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
            
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'monospace' }}>
              Confirm Password
            </Typography>
            <TextField
              required
              fullWidth
              name="confirmPassword"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? <CircularProgress size={20} /> : 'CREATE ACCOUNT'}
            </Button>
            
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
                <span style={{ marginRight: '8px' }}>👋</span> Already have an account?{' '}
                <Link
                  component="button"
                  variant="caption"
                  onClick={() => router.push('/login')}
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
                  Sign In
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
              Join thousands of professionals who've ditched paper cards for good.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 