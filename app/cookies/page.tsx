'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, AppBar, Toolbar, Divider } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function CookiesPage() {
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
              KEEP IT CONFIDENTIAL
            </Typography>
            
            <Typography 
              variant="h4" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                mb: 3,
                fontFamily: 'monospace',
              }}
            >
              COOKIE POLICY
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
              Cookies aren't just delicious treats—they're also tiny bits of data that help make your Luxora experience smoother. Here's what you need to know about how we use them:
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
              1. What Are Cookies?
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
              Cookies are small text files stored on your device when you visit websites. They help remember your preferences and make your online experience more personalized and efficient.
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
              Think of them as the digital equivalent of a server remembering your usual coffee order—they help us serve you better.
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
              2. How We Use Cookies
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
              At Luxora, we use cookies to:
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
              • Remember your login status so you don't have to sign in every time
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
              • Understand how you use our site so we can make it better
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
              • Ensure our platform runs smoothly and securely
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
              • Provide features like saving your card designs and preferences
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
              3. Types of Cookies We Use
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
              <strong>Essential Cookies:</strong> These are the non-negotiables. Without them, Luxora wouldn't work properly. They enable core functionality like security, network management, and account access.
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
              <strong>Preference Cookies:</strong> These remember your settings and choices to enhance your experience and make it more personalized.
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
              <strong>Analytics Cookies:</strong> These help us understand how visitors interact with Luxora, which features are popular, and how we can improve.
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
              <strong>Marketing Cookies:</strong> These track your activity to deliver more relevant ads and content. Don't worry—we keep this minimal and respectful.
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
              4. Your Cookie Choices
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
              You have control over cookies. You can:
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
              • Accept all cookies (recommended for the best Luxora experience)
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
              • Modify your browser settings to reject or delete cookies
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
              • Use private browsing modes to limit cookie storage
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
              Just note that if you block essential cookies, some parts of Luxora might not work as expected. It's like trying to drive a car without wheels—technically possible, but not recommended.
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
              5. Third-Party Cookies
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
              Some cookies come from our trusted partners who help us analyze site performance, process payments, or provide additional functionality. We're picky about who we work with and ensure they respect your privacy too.
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
              6. Updates to This Policy
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
              As technology evolves, so might our cookie practices. We'll keep this page updated with any changes, so feel free to check back occasionally.
            </Typography>
            
            <Divider sx={{ my: 6 }} />
            
            <Typography 
              variant="h4" 
              component="h2"
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                mb: 3,
                fontFamily: 'monospace',
              }}
            >
              DISCLAIMER
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
              Let's be real—Luxora makes networking easy, smart, and paperless. But before you start scanning and sharing your way to success, let's clear up a few things:
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
              1. We're Not Responsible for What You Share
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
              Luxora helps you share your professional info instantly, but what you choose to put on your digital business card? That's on you.
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
              • If you list your phone number, email, or social handles, understand that anyone with access to your QR code or profile link can see it.
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
              • If you share sensitive information (which we strongly advise against), you're doing so at your own discretion.
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
              • If your info gets into the wrong hands because you sent it to the wrong person, that's a you problem—not a Luxora problem.
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
              2. We're Not Magicians (or Security Guards)
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
              We do everything possible to keep your data secure, including encryption and best-in-class security measures. But let's be honest—no system is 100% hack-proof (and if someone tells you otherwise, they're lying).
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
              • If you suspect any unauthorized access, let us know ASAP.
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
              • Use strong passwords and be mindful of who you share your card with.
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
              • Don't blame us if you accidentally hand your info over to a scammer (again, be smart).
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
              3. We're Not Your Lawyer, Accountant, or Business Consultant
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
              Luxora is a digital business card platform, not a legal, financial, or business consulting service. That means:
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
              • We don't give legal advice.
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
              • We don't guarantee you'll land deals, close clients, or become a networking god overnight.
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
              • We don't accept liability for any business decisions you make after using our platform.
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
              If you need actual legal or financial advice, talk to a licensed professional—not a digital business card.
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
              4. If You Get Ghosted, It's Not Our Fault
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
              Let's be honest, even with the best networking tools, some people just won't text back. Luxora ensures your details get into their phone, but we can't force them to reply. If someone ghosts you, it's not a system error—it's just life.
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
              5. We Can Update This Disclaimer Anytime
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
              Because tech evolves, laws change, and we like to stay ahead of the game, we reserve the right to update this disclaimer whenever necessary. If anything major shifts, we'll give you a heads-up (no sneaky changes here).
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
              Bottom Line:
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
              Use Luxora wisely, professionally, and responsibly. We're here to make your life easier—but how you use it is ultimately up to you.
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold',
                mb: 4,
                fontSize: '1.2rem'
              }}
            >
              Now go forth and network like a pro. 🚀
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