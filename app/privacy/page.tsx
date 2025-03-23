'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PrivacyPolicyPage() {
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
              STUFF LAWYERS LOVE
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3
              }}
            >
              We know—privacy policies are usually a snooze-fest. But because we value your trust (and because lawyers insisted), here's what you need to know about how we handle your data at Luxora:
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              1. What We Collect & Why
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
              We keep it simple. When you use Luxora, we may collect:
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              Basic info: Name, email, business details—so you can create and share your digital business card.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              Contact details: If you choose to include phone numbers, social links, or websites, they'll be available to whoever you share your Luxora profile with.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3,
                pl: 3
              }}
            >
              Usage data: We track interactions (like profile views and scans) to help improve the experience, but we don't spy on your networking moves.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              2. What We Don't Do
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              ❌ We don't sell your data. Ever. That's just shady.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              ❌ We don't spam you. If you sign up for updates, we keep it relevant and useful. Unsubscribe anytime.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3,
                pl: 3
              }}
            >
              ❌ We don't read your mind (yet). The only data we have is what you give us.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              3. Cookies & Tracking (The Digital Kind, Not the Yummy Kind)
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              We use cookies to improve our site's functionality. No, not the ones you eat—these little bits of data help us remember your preferences and keep things running smoothly.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3
              }}
            >
              You can disable cookies in your browser settings, but Luxora might not work as seamlessly.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              4. Data Sharing (Aka, Who Sees What)
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              Your Luxora profile is meant to be shared—that's the whole point! However, only the info you choose to include is public.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              We may use third-party services (like analytics tools) to see how Luxora is performing, but they won't access your personal details.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3
              }}
            >
              If legally required (like a court order—we're not rebels), we'll comply, but we'll always protect your privacy as much as possible.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              5. Your Rights (Because You're in Control)
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              Update anytime: If your details change, you can update your profile on Luxora in seconds.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1,
                pl: 3
              }}
            >
              Delete your account: If you ever want to part ways (sad face), you can request deletion, and we'll remove your data.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3,
                pl: 3
              }}
            >
              Access your data: If you want to see what info we have on you, just ask—we believe in transparency.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              6. Security Measures (Aka, Keeping Your Info Safe)
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              We take data security seriously and use encryption and secure storage methods to protect your information.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 3
              }}
            >
              While we do our best, no digital system is 100% hacker-proof (if you find one, let us know). So always use strong passwords and share responsibly.
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 2,
                mt: 4
              }}
            >
              7. Updates to This Policy
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 4
              }}
            >
              We might tweak this privacy policy from time to time (because technology evolves). If we make big changes, we'll let you know—no sneaky fine print updates here.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 4,
                fontStyle: 'italic'
              }}
            >
              Still awake? Congrats, you made it through the legal stuff. Now, go enjoy smart, effortless networking with Luxora.
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