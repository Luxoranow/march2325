'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, AppBar, Toolbar, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function FinePrintPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkUser();
  }, []);

  return (
    <>
      {/* Navigation Header */}
      <AppBar position="sticky" sx={{ bgcolor: 'black', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/')}
          >
            <Box 
              component="img"
              src="/favicon.svg"
              alt="Luxora Logo"
              sx={{ 
                height: 28,
                width: 28,
                mr: 1
              }}
            />
            LUXORA
          </Typography>
          
          <Box>
            {isLoggedIn ? (
              <Button 
                variant="outlined" 
                color="inherit"
                onClick={() => router.push('/dashboard')}
                sx={{ 
                  borderColor: 'white',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  '&:hover': { 
                    borderColor: '#cccccc',
                    color: '#cccccc'
                  }
                }}
              >
                DASHBOARD
              </Button>
            ) : (
              <>
                <Button 
                  color="inherit" 
                  sx={{ mr: 2, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                  onClick={() => router.push('/login')}
                >
                  LOGIN
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit"
                  onClick={() => router.push('/signup')}
                  sx={{ 
                    borderColor: 'white',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    '&:hover': { 
                      borderColor: '#cccccc',
                      color: '#cccccc'
                    }
                  }}
                >
                  SIGN UP
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Main Content */}
        <Box 
          sx={{ 
            py: 8, 
            mt: 2,
            bgcolor: 'background.default',
            flexGrow: 1
          }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 4
              }}
            >
              THE FINE PRINT
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2
              }}
            >
              Alright, let's lay it out:
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2
              }}
            >
              By using Luxora, you agree to play nice—no spamming, scamming, or sketchy behavior.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2
              }}
            >
              Your Luxora profile is yours—keep it updated, professional, and, you know, not embarrassing.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2
              }}
            >
              We're not responsible for missed connections (but we will help make sharing your info as seamless as possible).
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2
              }}
            >
              We can update these terms anytime—because tech (and life) evolves.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 4
              }}
            >
              If you're still here, you're our kind of person. Now, go make some connections.
            </Typography>
            
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Button 
                variant="contained" 
                onClick={() => router.push('/')}
                sx={{ 
                  py: 1.25, 
                  px: 3.5,
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: '#333333'
                  },
                  fontFamily: 'monospace',
                  letterSpacing: '0.1em',
                  fontWeight: 'bold'
                }}
              >
                BACK TO HOME
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: '#000000', color: '#aaaaaa', py: 4 }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Box 
                  component="img"
                  src="/favicon.svg"
                  alt="Luxora Logo"
                  sx={{ 
                    height: 28,
                    width: 28,
                    mr: 1.5
                  }}
                />
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#888888',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                © {new Date().getFullYear()} LUXORA. ALL RIGHTS RESERVED.
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
} 