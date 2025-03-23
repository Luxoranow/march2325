'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Container, Typography, Paper, Grid, Stack, Divider, AppBar, Toolbar, Link, 
  IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuIcon from '@mui/icons-material/Menu';
import { supabase } from '@/lib/supabase';
import PeopleIcon from '@mui/icons-material/People';
import MoodIcon from '@mui/icons-material/Mood';
import ContactsIcon from '@mui/icons-material/Contacts';
import BarChartIcon from '@mui/icons-material/BarChart';
import UpgradeIcon from '@mui/icons-material/Upgrade';

// Define the pricing plans
const PLANS = [
  {
    id: 'free',
    name: 'ZERO BUCKS GIVEN',
    price: 0,
    description: 'Basic digital business card for individuals',
    features: [
      'Single digital business card',
      'QR code generation',
      'Basic analytics',
      'Standard support'
    ],
    buttonText: 'GET STARTED'
  },
  {
    id: 'premium',
    name: 'GLOW UP',
    price: 19.99,
    description: 'Advanced features for professionals',
    features: [
      'Everything in Free plan',
      'Custom branding',
      'Advanced analytics',
      'Multiple card designs',
      'Priority support'
    ],
    buttonText: 'SUBSCRIBE NOW',
    highlighted: true
  },
  {
    id: 'team',
    name: 'SQUAD GOALS',
    price: 5.99,
    description: 'Team management for organizations',
    features: [
      'Everything in Premium plan',
      'Team management',
      'Shared analytics',
      'Brand consistency',
      'Admin controls',
      'Dedicated support'
    ],
    buttonText: 'CONTACT SALES',
    perUser: true
  }
];

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | false>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkUser();
  }, []);
  
  const handleCreateCard = () => {
    if (isLoggedIn) {
      router.push('/dashboard/cards/new');
    } else {
      router.push('/login?redirect=dashboard/cards/new');
    }
  };

  // Function to scroll to a section when nav link is clicked
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleToggle = (item: number) => {
    setExpandedFaq(expandedFaq === item ? false : item);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setMobileMenuOpen(false);
  };

  // Menu items for both desktop and mobile
  const navItems = [
    { label: 'FEATURES', action: () => scrollToSection('features') },
    { label: 'PRICING', action: () => scrollToSection('pricing') },
    { label: 'ABOUT', action: () => scrollToSection('about') },
    { label: 'FAQ', action: () => scrollToSection('faq') },
    { label: 'CONTACT', action: () => scrollToSection('contact') }
  ];

  // Mobile drawer content
  const mobileDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
    >
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => {
              item.action();
              setMobileMenuOpen(false);
            }}>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        {isLoggedIn ? (
          <ListItem disablePadding>
            <ListItemButton onClick={() => {
              router.push('/dashboard');
              setMobileMenuOpen(false);
            }}>
              <ListItemText 
                primary="DASHBOARD" 
                primaryTypographyProps={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  fontWeight: 'bold'
                }}
              />
            </ListItemButton>
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                router.push('/login');
                setMobileMenuOpen(false);
              }}>
                <ListItemText 
                  primary="LOGIN" 
                  primaryTypographyProps={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                router.push('/signup');
                setMobileMenuOpen(false);
              }}>
                <ListItemText 
                  primary="SIGN UP" 
                  primaryTypographyProps={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontWeight: 'bold'
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

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
              alignItems: 'center'
            }}
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
          
          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            {navItems.map((item) => (
              <Button 
                key={item.label}
                color="inherit" 
                onClick={item.action}
                sx={{ 
                  mx: 1, 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  '&:hover': { color: '#cccccc' }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
          
          {/* Mobile Menu Button */}
          <IconButton
            color="inherit"
            aria-label="open menu"
            edge="start"
            onClick={handleMobileMenuToggle}
            sx={{ display: { md: 'none' }, ml: 1 }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Desktop Auth Buttons */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
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

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuToggle}
      >
        {mobileDrawer}
      </Drawer>

      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Hero Section */}
        <Box 
          sx={{ 
            py: { xs: 6, md: 10 }, 
            mt: 2,
            bgcolor: 'background.default',
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={5} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h1" 
                  component="h2" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' }
                  }}
                >
                  DIGITAL BUSINESS CARDS
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  paragraph
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    mb: 3
                  }}
                >
                  Paper Business Cards? Be so fr. It's 2025. We've got AI girlfriends, self-driving Ubers, and people making six figures posting memes—but you're still handing out paper business cards?
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  paragraph
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    mb: 3
                  }}
                >
                  Welcome to LUXORA, the only digital business card that doesn't make you look like a corporate NPC.
                </Typography>
                <Button 
                  variant="contained" 
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleCreateCard}
                  sx={{ 
                    bgcolor: 'black',
                    color: 'white',
                    borderRadius: 0,
                    px: { xs: 2, sm: 4 },
                    py: 1.5,
                    '&:hover': {
                      bgcolor: '#333333'
                    },
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontWeight: 'bold'
                  }}
                >
                  CREATE YOUR CARD
                </Button>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* Placeholder removed - will be replaced with video later */}
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box id="features" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3
              }}
            >
              FEATURES
            </Typography>
            
            <Grid container spacing={4}>
              {/* Feature 1 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    INSTANT SHARING
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Share your digital business card instantly via QR code, text, or email. No more fumbling for paper cards.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Feature 2 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <PeopleIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    TEAM BRANDING
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Create and maintain consistent branding across your entire team with customizable templates and permissions.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Feature 3 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <MoodIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    VIRTUAL VIBES
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Make your virtual meetings stand out with custom backgrounds that include your contact information.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Feature 4 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <ContactsIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    CONTACT MANAGEMENT
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Never lose a lead again. Automatically save and organize contacts when someone scans your card.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Feature 5 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <BarChartIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    ANALYTICS
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Track who's viewing your card, how often, and from where. Optimize your networking strategy with real data.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Feature 6 */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #000',
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <UpgradeIcon sx={{ fontSize: 40, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    component="h4" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      fontFamily: 'monospace',
                    }}
                  >
                    FLEXIBLE PLANS
                  </Typography>
                  <Typography 
                    variant="body2"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Choose the perfect plan for your needs, from free individual cards to premium team management features.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Pricing Section */}
        <Box id="pricing" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3
              }}
            >
              PRICING
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="text.secondary" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 2,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              You wouldn't send a fax instead of a text, so why are you still using paper business cards? Upgrade your networking game before you get left on read.
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
              CHOOSE THE PLAN THAT FITS YOUR NEEDS
            </Typography>
            
            <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }}>
              {PLANS.map((plan) => (
                <Grid item xs={12} md={4} key={plan.id}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid #000',
                      ...(plan.highlighted && {
                        border: '2px solid #000',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: '5px',
                          bgcolor: 'primary.main'
                        }
                      })
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2.5, 
                        textAlign: 'center',
                        borderBottom: '1px solid #000'
                      }}
                    >
                      <Typography 
                        variant="h5" 
                        component="h3"
                        sx={{ 
                          fontWeight: 'bold',
                          letterSpacing: '0.1em',
                          mb: 1.5
                        }}
                      >
                        {plan.name}
                      </Typography>
                      
                      <Box sx={{ mb: 1.5 }}>
                        <Typography 
                          variant="h4" 
                          component="span"
                          sx={{ 
                            fontWeight: 'bold',
                            fontFamily: 'monospace'
                          }}
                        >
                          ${plan.price}
                        </Typography>
                        {plan.perUser && (
                          <Typography 
                            variant="subtitle1" 
                            component="span"
                            sx={{ 
                              fontFamily: 'monospace',
                              ml: 1
                            }}
                          >
                            / USER / MONTH
                          </Typography>
                        )}
                        {!plan.perUser && plan.price > 0 && (
                          <Typography 
                            variant="subtitle1" 
                            component="span"
                            sx={{ 
                              fontFamily: 'monospace',
                              ml: 1
                            }}
                          >
                            / MONTH
                          </Typography>
                        )}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {plan.description}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ p: 2.5, flexGrow: 1 }}>
                      <Stack spacing={1.5}>
                        {plan.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CheckIcon fontSize="small" sx={{ mt: 0.3, mr: 1 }} />
                            <Typography 
                              variant="body2"
                              sx={{ 
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em'
                              }}
                            >
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    
                    <Box 
                      sx={{ 
                        p: 2.5, 
                        textAlign: 'center',
                        borderTop: '1px solid #000'
                      }}
                    >
                      <Button 
                        variant={plan.highlighted ? "contained" : "outlined"}
                        color="primary"
                        onClick={async () => {
                          // Check if user is logged in
                          const { data: { user } } = await supabase.auth.getUser();
                          
                          if (user) {
                            // User is logged in, redirect directly to checkout
                            if (plan.id === 'free') {
                              // For free plan, directly update the subscription
                              const response = await fetch('/api/create-checkout-session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  planId: plan.id,
                                  userId: user.id,
                                  userEmail: user.email,
                                }),
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok) {
                                // Redirect to dashboard
                                router.push('/dashboard?success=true');
                              } else {
                                console.error('Error activating free plan:', data.error);
                                alert('Error activating free plan. Please try again.');
                              }
                            } else {
                              // For paid plans, create a checkout session with quantity 1
                              const response = await fetch('/api/create-checkout-session', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  planId: plan.id,
                                  userId: user.id,
                                  userEmail: user.email,
                                  quantity: 1, // Default to 1 on homepage
                                }),
                              });
                              
                              const data = await response.json();
                              
                              if (response.ok && data.url) {
                                // Redirect to Stripe checkout URL
                                window.location.href = data.url;
                              } else {
                                console.error('Error creating checkout session:', data.error);
                                alert('Error creating checkout session. Please try again.');
                              }
                            }
                          } else {
                            // User is not logged in, redirect to pricing page
                            router.push('/pricing');
                          }
                        }}
                        sx={{ 
                          minWidth: 180,
                          fontFamily: 'monospace',
                          letterSpacing: '0.1em',
                          py: 1
                        }}
                      >
                        {plan.buttonText}
                      </Button>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* About Section */}
        <Box id="about" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3
              }}
            >
              ABOUT
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                mt: 3,
                border: '1px solid #000',
                maxWidth: '900px',
                mx: 'auto'
              }}
            >
              <Typography 
                variant="h5" 
                align="center" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  mb: 2,
                  fontFamily: 'monospace',
                }}
              >
                Networking, but without the cringe.
              </Typography>
              
              <Typography 
                variant="body1" 
                paragraph
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                LUXORA ditches outdated paper business cards for smart, digital ones that actually keep up with your life. Whether you're grinding solo or running a team, we make staying connected effortless.
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              >
                We're here to modernize networking—because no one wants a dusty pile of business cards sitting in their junk drawer.
              </Typography>
            </Paper>
          </Container>
        </Box>

        {/* FAQ Section */}
        <Box id="faq" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3
              }}
            >
              FAQ
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              color="text.secondary" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 4,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Questions? We've got answers. And if you don't see what you're looking for, just reach out.
            </Typography>
            
            {/* FAQ Accordion */}
            <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
              {/* FAQ Items */}
              {[
                {
                  question: "What is Luxora?",
                  answer: "Luxora is your ultimate digital business card generator—think of it as the modern, no-cringe way to share your info instantly. It's a sleek QR-powered virtual business card so people can save your contact details in a tap."
                },
                {
                  question: "How does it work?",
                  answer: "Create your digital card in minutes, customize it with your info and branding, then share it via QR code, link, or email. When someone scans your QR code or clicks your link, they instantly see your digital business card and can save your contact info with one tap."
                },
                {
                  question: "Why do I need a digital business card?",
                  answer: "Because it's 2025 and paper cards get lost, forgotten, or tossed. Digital cards are always accessible, never run out, can be updated anytime, and provide analytics on who's viewing your info. Plus, they're better for the environment."
                },
                {
                  question: "Can I link my social media?",
                  answer: "Absolutely! You can connect all your social profiles, messaging apps, and even custom links. Make it easy for people to find you everywhere you exist online."
                },
                {
                  question: "What's included in the free plan?",
                  answer: "Our free plan includes one digital business card with basic customization, QR code generation, and standard analytics. It's perfect for individuals just getting started with digital networking."
                },
                {
                  question: "Do I need an app to use Luxora?",
                  answer: "Nope! Luxora is 100% web-based. No downloads or installations required. Your recipients don't need an app either—they just scan your QR code or click your link to view your card in any browser."
                },
                {
                  question: "How much does Luxora cost?",
                  answer: "We offer flexible plans for everyone: a free basic plan, our premium 'Glow Up' plan at $19.99/month for professionals, and 'Squad Goals' team plans starting at $5.99 per user/month. Check our pricing section for full details."
                },
                {
                  question: "What makes Luxora different from other digital business cards?",
                  answer: "Unlike other solutions that focus just on contact sharing, Luxora is built for networking. We offer team management, analytics, virtual backgrounds for video calls, and a personality that doesn't make you sound like a corporate robot."
                },
                {
                  question: "Can my team use Luxora?",
                  answer: "Absolutely! Our team plans let you manage multiple digital business cards under one account. Create a master template with locked branding elements, then let team members customize their personal details."
                },
                {
                  question: "How do I set up my digital business card?",
                  answer: "Just click 'Get Started,' create an account, and follow our simple setup process. Add your contact details, social links, photo, and branding. Your digital card will be ready to share in minutes!"
                }
              ].map((item, index) => (
                <Paper 
                  key={index}
                  elevation={0}
                  sx={{ 
                    mb: 1.5, 
                    overflow: 'hidden',
                    border: '1px solid #000'
                  }}
                >
                  {/* Question */}
                  <Box 
                    onClick={() => handleToggle(index)}
                    sx={{ 
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      bgcolor: expandedFaq === index ? '#000' : 'background.paper',
                      color: expandedFaq === index ? '#fff' : 'text.primary',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: expandedFaq === index ? '#000' : '#f5f5f5'
                      }
                    }}
                  >
                    <Typography 
                      variant="subtitle1"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        fontWeight: 'bold',
                        fontSize: '1rem'
                      }}
                    >
                      {item.question}
                    </Typography>
                    <Box 
                      sx={{ 
                        width: 22,
                        height: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                        transform: expandedFaq === index ? 'rotate(45deg)' : 'rotate(0deg)'
                      }}
                    >
                      {expandedFaq === index ? '✕' : '+'}
                    </Box>
                  </Box>
                  
                  {/* Answer */}
                  {expandedFaq === index && (
                    <Box 
                      sx={{ 
                        p: 2,
                        borderTop: '1px solid #000'
                      }}
                    >
                      <Typography 
                        variant="body2"
                        sx={{ 
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {item.answer}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Contact Us Section */}
        <Box id="contact" sx={{ py: { xs: 6, md: 10 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography 
              variant="h1" 
              component="h3" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em',
                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                mb: 3
              }}
            >
              CONTACT US
            </Typography>
            
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                gap: { xs: 3, md: 0 },
                mb: 4,
                fontFamily: 'monospace',
                width: '100%',
                mx: 'auto',
                py: 3
              }}>
                {/* Column 1: Intro Text */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minWidth: { xs: '100%', md: 0 },
                  px: 3,
                  borderRight: { xs: 'none', md: '1px solid #000' }
                }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontWeight: 'bold',
                      fontSize: '1.05rem',
                      lineHeight: 1.5
                    }}
                  >
                    Got questions? Need help? Just wanna tell us we're awesome? We're here for all of it.
                  </Typography>
                </Box>
                
                {/* Column 2: Contact Details */}
                <Box sx={{ 
                  flex: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                  minWidth: { xs: '100%', md: 0 },
                  borderRight: { xs: 'none', md: '1px solid #000' },
                  borderLeft: { xs: 'none', md: '1px solid #000' },
                  position: 'relative'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem', mt: 0.5 }}>📩</Box> 
                    <Box>
                      <Typography component="span" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontFamily: 'monospace', letterSpacing: '0.05em' }}>Email:</Typography> 
                      <Typography component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>aylen@luxoranow.com</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem', mt: 0.5 }}>📞</Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontFamily: 'monospace', letterSpacing: '0.05em' }}>Old-school? Call us:</Typography> 
                      <Typography component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>(305) 980-9722</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem', mt: 0.5 }}>📍</Box>
                    <Box>
                      <Typography component="span" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5, fontFamily: 'monospace', letterSpacing: '0.05em' }}>HQ:</Typography> 
                      <Typography component="span" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>Somewhere between WiFi and world domination</Typography>
                    </Box>
                  </Box>
                </Box>
                
                {/* Column 3: FAQ and Closing */}
                <Box sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 2.5,
                  minWidth: { xs: '100%', md: 0 },
                  px: 3,
                  borderLeft: { xs: 'none', md: '1px solid #000' }
                }}>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '1.05rem'
                    }}
                  >
                    FAQ? Check out our Help Center for instant answers.
                  </Typography>
                  
                  <Typography 
                    variant="body1"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
                    }}
                  >
                    Let's keep in touch. (Literally, that's what we do.) 😎
                  </Typography>
                </Box>
              </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box 
          component="footer" 
          sx={{ 
            py: { xs: 3, md: 4 }, 
            bgcolor: '#121212', 
            color: 'white',
            mt: 'auto'
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                  }}
                >
                  LUXORA
                </Typography>
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  Modern digital business cards for modern professionals.
                </Typography>
              </Grid>
              
              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  COMPANY
                </Typography>
                <Stack spacing={1}>
                  <Link 
                    href="#about" 
                    color="inherit" 
                    underline="hover"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '0.875rem'
                    }}
                  >
                    About
                  </Link>
                  <Link 
                    href="/features" 
                    color="inherit" 
                    underline="hover"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '0.875rem'
                    }}
                  >
                    Features
                  </Link>
                  <Link 
                    href="#pricing" 
                    color="inherit" 
                    underline="hover"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '0.875rem'
                    }}
                  >
                    Pricing
                  </Link>
                </Stack>
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  SUPPORT
                </Typography>
                <Stack spacing={1}>
                  <Link 
                    href="/contact/digital-pigeon" 
                    color="inherit" 
                    underline="hover"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '0.875rem'
                    }}
                  >
                    Contact Us
                  </Link>
                  <Link 
                    href="#faq" 
                    color="inherit" 
                    underline="hover"
                    sx={{ 
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      fontSize: '0.875rem'
                    }}
                  >
                    FAQ
                  </Link>
                </Stack>
              </Grid>
              
              <Grid item xs={12} sm={6} md={5}>
                <Typography 
                  variant="subtitle1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  SUBSCRIBE TO OUR NEWSLETTER
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 2,
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  Get the latest updates, news and product offerings sent straight to your inbox.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                  <Box 
                    component="input" 
                    placeholder="Your email"
                    sx={{ 
                      p: 1.5, 
                      flex: 1, 
                      border: '1px solid white', 
                      background: 'transparent',
                      color: 'white',
                      fontFamily: 'monospace',
                      '&::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: 'monospace'
                      }
                    }}
                  />
                  <Button 
                    variant="contained" 
                    sx={{ 
                      borderRadius: 0, 
                      bgcolor: 'white', 
                      color: 'black',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      '&:hover': {
                        bgcolor: '#cccccc'
                      }
                    }}
                  >
                    SUBSCRIBE
                  </Button>
                </Box>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.2)' }} />
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'flex-start' },
              gap: 2
            }}>
              <Typography 
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                © {new Date().getFullYear()} LUXORA. All rights reserved.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link 
                  href="/privacy" 
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem'
                  }}
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/terms" 
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem'
                  }}
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/cookies" 
                  color="inherit" 
                  underline="hover"
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem'
                  }}
                >
                  Cookie Policy
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}
