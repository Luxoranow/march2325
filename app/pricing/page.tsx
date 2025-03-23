'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Button,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Define the pricing plans with correct Stripe price IDs
const PLANS = [
  {
    id: 'free',
    priceId: 'price_1R0uRUGvrQbQlRXY1YAUVtWM',
    name: 'ZERO BUCKS GIVEN',
    price: 0,
    description: 'Basic digital business card for individuals',
    features: [
      'Single digital business card',
      'QR code generation',
      'Basic support'
    ],
    buttonText: 'GET STARTED'
  },
  {
    id: 'premium',
    priceId: 'price_1R0uUZGvrQbQlRXYz13KlV6x',
    name: 'GLOW UP',
    price: 19.99,
    description: 'Advanced features for professionals',
    features: [
      'Multiple digital business cards',
      'Custom branding',
      'Advanced analytics',
      'Virtual Vibes feature',
      'Export contacts as CSV',
      'Priority support'
    ],
    buttonText: 'SUBSCRIBE NOW'
  },
  {
    id: 'team',
    priceId: 'price_1R3UEDGvrQbQlRXYdSbJTGY7',
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
    buttonText: 'SUBSCRIBE NOW',
    perUser: true
  }
];

export default function PricingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [teamQuantity, setTeamQuantity] = useState(1);
  
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    
    checkUser();
  }, []);

  const handlePlanSelection = async (plan: typeof PLANS[0]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // If not logged in, redirect to login
      if (!isLoggedIn) {
        router.push('/login?redirect=pricing');
        return;
      }
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=pricing');
        return;
      }
      
      // For free plan, directly update the subscription
      if (plan.id === 'free') {
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
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to activate free plan');
        }
        
        // Redirect to dashboard
        router.push('/dashboard?success=true');
        return;
      }
      
      // For paid plans, create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          userId: user.id,
          userEmail: user.email,
          quantity: plan.id === 'team' ? teamQuantity : 1,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout URL
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
      
    } catch (err: any) {
      console.error('Error during checkout:', err);
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'black', boxShadow: 'none' }}>
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.2em',
              cursor: 'pointer'
            }}
            onClick={() => router.push('/')}
          >
            LUXORA
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box 
        sx={{ 
          py: 8, 
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.1em'
              }}
            >
              PRICING
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                mb: 2,
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              You wouldn't send a fax instead of a text, so why are you still using paper business cards? Upgrade your networking game before you get left on read.
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 700, 
                mx: 'auto',
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              CHOOSE THE PLAN THAT FITS YOUR NEEDS
            </Typography>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4, 
                borderRadius: 0,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              {error}
            </Alert>
          )}
          
          {isLoggedIn === false && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 4, 
                borderRadius: 0,
                maxWidth: 700,
                mx: 'auto',
                '& .MuiAlert-message': {
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }
              }}
            >
              You need to be logged in to subscribe to a plan. Clicking on a plan will redirect you to the login page.
            </Alert>
          )}
          
          <Grid container spacing={4} justifyContent="center">
            {PLANS.map((plan) => (
              <Grid item xs={12} md={4} key={plan.id}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #000',
                    ...(plan.id === 'premium' && {
                      border: '2px solid #000',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '5px',
                        bgcolor: 'black'
                      }
                    })
                  }}
                >
                  <Box 
                    sx={{ 
                      p: 3, 
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
                        mb: 2
                      }}
                    >
                      {plan.name}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
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
                    
                    {plan.id === 'team' && (
                      <Box sx={{ mt: 3, mb: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mb: 1,
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em'
                          }}
                        >
                          TEAM SIZE
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid #000',
                          width: 'fit-content',
                          mx: 'auto'
                        }}>
                          <Button 
                            onClick={() => setTeamQuantity(Math.max(1, teamQuantity - 1))}
                            sx={{ 
                              minWidth: '40px', 
                              borderRadius: 0,
                              borderRight: '1px solid #000',
                              color: 'black'
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </Button>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              px: 3,
                              py: 1,
                              minWidth: '40px',
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}
                          >
                            {teamQuantity}
                          </Box>
                          <Button 
                            onClick={() => setTeamQuantity(teamQuantity + 1)}
                            sx={{ 
                              minWidth: '40px', 
                              borderRadius: 0,
                              borderLeft: '1px solid #000',
                              color: 'black'
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </Button>
                        </Box>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            mt: 1,
                            fontFamily: 'monospace',
                            fontWeight: 'bold'
                          }}
                        >
                          TOTAL: ${(plan.price * teamQuantity).toFixed(2)}/month
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <Box sx={{ p: 3, flexGrow: 1 }}>
                    <List disablePadding>
                      {plan.features.map((feature, index) => (
                        <ListItem 
                          key={index} 
                          disablePadding 
                          sx={{ 
                            py: 1,
                            borderBottom: index < plan.features.length - 1 ? '1px solid #eee' : 'none'
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckIcon fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature} 
                            primaryTypographyProps={{
                              variant: 'body2',
                              fontFamily: 'monospace',
                              letterSpacing: '0.05em'
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                  
                  <Box 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderTop: '1px solid #000'
                    }}
                  >
                    <Button
                      variant="contained"
                      onClick={() => handlePlanSelection(plan)}
                      disabled={isLoading}
                      sx={{ 
                        minWidth: 200,
                        fontFamily: 'monospace',
                        letterSpacing: '0.1em',
                        py: 1.5,
                        bgcolor: 'black',
                        color: 'white',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: '#333'
                        }
                      }}
                    >
                      {isLoading ? 'LOADING...' : plan.buttonText}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'black', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            align="center"
            sx={{ 
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            © {new Date().getFullYear()} LUXORA. ALL RIGHTS RESERVED.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
} 