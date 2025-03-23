'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, AppBar, Toolbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function TermsPage() {
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
              DON'T STEAL OUR STUFF
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
              Look, we get it—Luxora is sleek, smart, and kind of a game-changer. We're flattered you love it. But let's make one thing crystal clear:
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
              1. Our Content Belongs to Us
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
              Everything you see here—our branding, website copy, graphics, tech, and even our brilliant one-liners—are ours. That means:
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
              ✅ You can share, repost, or talk about Luxora (we love that for you).
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                pl: 3
              }}
            >
              ❌ You can't copy, modify, or claim our content, design, or platform as your own.
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
              If you want to use something for business purposes, ask first. We're reasonable people.
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
              2. Our Tech Is Protected
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
              Luxora isn't just another generic QR code generator—it's a thoughtfully designed platform. Our software, features, and functionality are protected under copyright, trademark, and intellectual property laws.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                pl: 3
              }}
            >
              🚫 No copying. No reverse engineering. No shady knockoffs.
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
              If you're thinking, "What if I just tweak it a little?"—the answer is still no.
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
              3. No Reselling, Repurposing, or Repackaging
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
              This isn't some free-for-all. You cannot:
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
              • Sell, distribute, or offer Luxora's services under a different name.
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
              • Use our branding or design to mislead people into thinking you're us.
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                pl: 3
              }}
            >
              • Create a competing product using our platform as a blueprint.
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
              If you're that impressed, let's talk about official partnerships instead of copyright infringement.
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
              4. If You Steal Our Stuff, We'll Notice
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
              We have eyes everywhere (okay, not literally, but we do monitor unauthorized use). If you:
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
              • Rip off our content
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
              • Clone our tech
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                pl: 3
              }}
            >
              • Try to pass our work off as your own
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
              …expect a polite but firm legal notice, followed by action if necessary. (Our lawyers drink a lot of coffee and are always ready.)
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
              5. Want to Share? Here's How to Do It Right
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
              We love when people spread the word about Luxora! If you want to:
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
              • Write about us
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
              • Feature us in your content
            </Typography>
            
            <Typography 
              variant="body1" 
              paragraph
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                pl: 3
              }}
            >
              • Show off your Luxora card
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
              📩 Just tag us or drop us a line. We might even reshare you!
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
              Be cool. Give credit where it's due. Play fair. And if you really want to use our stuff, just ask. Chances are, we'll say yes—legally.
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
              🚀 Now, go network the right way.
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