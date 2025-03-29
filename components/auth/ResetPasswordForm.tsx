'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper, 
  Alert,
  CircularProgress,
  Link,
  Container
} from '@mui/material';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // Check if we're in the reset process (with a token) or in the request process
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  useEffect(() => {
    // Check if there's a token in the URL
    const token = searchParams.get('token');
    if (token) {
      setIsResettingPassword(true);
    }
  }, [searchParams]);
  
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      
      // Use Supabase to send a password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: process.env.NEXT_PUBLIC_SITE_URL 
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
          : `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      // Show success message
      setSuccess('Check your email for a password reset link');
      setEmail(''); // Clear the form
      
    } catch (error: any) {
      setError(error.message || 'An error occurred while requesting password reset');
    } finally {
      setLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset messages
    setError(null);
    setSuccess(null);
    
    // Validate passwords
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      // Show success message
      setSuccess('Your password has been reset successfully');
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error: any) {
      setError(error.message || 'An error occurred while resetting your password');
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
            {isResettingPassword ? 'Create a new password' : 'Reset your password'}
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
            {isResettingPassword 
              ? 'Enter a new secure password for your account.' 
              : 'Enter your email and we\'ll send you a link to reset your password.'}
          </Typography>
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
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              backgroundColor: '#0f3b29', 
              color: '#81c784',
              '.MuiAlert-icon': {
                color: '#81c784'
              }
            }}
          >
            {success}
          </Alert>
        )}
        
        {isResettingPassword ? (
          // Form for setting a new password
          <Box component="form" onSubmit={handleResetPassword} noValidate>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold', fontFamily: 'monospace' }}>
              New Password
            </Typography>
            <TextField
              required
              fullWidth
              name="password"
              type="password"
              id="password"
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
                }
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
                }
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
              {loading ? <CircularProgress size={20} /> : 'RESET PASSWORD'}
            </Button>
          </Box>
        ) : (
          // Form for requesting a password reset
          <Box component="form" onSubmit={handleRequestReset} noValidate>
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
                }
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
              {loading ? <CircularProgress size={20} /> : 'SEND RESET LINK'}
            </Button>
          </Box>
        )}
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
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
            <Link
              component="button"
              variant="caption"
              onClick={() => router.push('/login')}
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
              Back to login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 