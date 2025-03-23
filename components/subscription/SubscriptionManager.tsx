'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Divider, 
  Chip, 
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { supabase } from '@/lib/supabase';

// Define the pricing plans with proper typing
interface PlanInfo {
  name: string;
  price: number;
  features: string[];
  perUser?: boolean;
}

type Plans = {
  [key: string]: PlanInfo;
};

const PLANS: Plans = {
  'free': {
    name: 'ZERO BUCKS GIVEN',
    price: 0,
    features: [
      'Single digital business card',
      'QR code generation',
      'Basic analytics',
      'Standard support'
    ]
  },
  'premium': {
    name: 'GLOW UP',
    price: 19.99,
    features: [
      'Everything in Free plan',
      'Custom branding',
      'Advanced analytics',
      'Multiple card designs',
      'Priority support'
    ]
  },
  'team': {
    name: 'SQUAD GOALS',
    price: 5.99,
    features: [
      'Everything in Premium plan',
      'Team management',
      'Shared analytics',
      'Brand consistency',
      'Admin controls',
      'Dedicated support'
    ],
    perUser: true
  }
};

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_end: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export default function SubscriptionManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formattedEndDate, setFormattedEndDate] = useState<string>('');

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Get the user's subscription
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
          throw error;
        }
        
        // Ensure we're setting a properly typed subscription object
        if (data) {
          const subscription: Subscription = {
            id: data.id as string,
            user_id: data.user_id as string,
            plan_id: (data.plan_id as string) || 'free',
            status: (data.status as string) || 'active',
            stripe_subscription_id: data.stripe_subscription_id as string | null,
            stripe_customer_id: data.stripe_customer_id as string | null,
            current_period_end: data.current_period_end as string,
            quantity: data.quantity as number,
            created_at: data.created_at as string,
            updated_at: data.updated_at as string
          };
          setSubscription(subscription);
        } else {
          // Default subscription if none found
          setSubscription({ plan_id: 'free', status: 'active' } as Subscription);
        }
      } catch (err: any) {
        console.error('Error fetching subscription:', err);
        setError(err.message || 'Failed to fetch subscription');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [router]);

  // Format the end date on the client side only
  useEffect(() => {
    if (subscription?.current_period_end) {
      const endDate = new Date(subscription.current_period_end);
      setFormattedEndDate(endDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    }
  }, [subscription]);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Create a portal session
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: subscription?.stripe_customer_id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portal session');
      }
      
      // Redirect to the portal
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Error creating portal session:', err);
      setError(err.message || 'Failed to manage subscription');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: string) => {
    let color = 'default';
    
    switch (status) {
      case 'active':
        color = 'success';
        break;
      case 'past_due':
        color = 'warning';
        break;
      case 'canceled':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip 
        label={status.toUpperCase()} 
        color={color as any} 
        size="small" 
        sx={{ 
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          borderRadius: 0
        }} 
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography 
          variant="body1" 
          color="error"
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}
        >
          {error}
        </Typography>
      </Box>
    );
  }

  if (!subscription) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4,
          border: '1px solid #000'
        }}
      >
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}
        >
          NO ACTIVE SUBSCRIPTION
        </Typography>
        
        <Typography 
          variant="body2" 
          paragraph
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            mb: 3
          }}
        >
          You are currently on the free plan. Upgrade to access premium features.
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleUpgrade}
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.1em'
          }}
        >
          UPGRADE NOW
        </Button>
      </Paper>
    );
  }

  const plan = PLANS[subscription.plan_id];

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        border: '1px solid #000'
      }}
    >
      <Box 
        sx={{ 
          p: 3,
          borderBottom: '1px solid #000'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.05em'
            }}
          >
            CURRENT PLAN: {plan?.name || subscription.plan_id.toUpperCase()}
          </Typography>
          
          {getStatusChip(subscription.status)}
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="body2"
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              PRICE: ${plan?.price || 0}{plan?.perUser ? ' / USER / MONTH' : ' / MONTH'}
            </Typography>
            
            <Typography 
              variant="body2"
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                mb: 1
              }}
            >
              QUANTITY: {subscription.quantity}
            </Typography>
            
            <Typography 
              variant="body2"
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              RENEWAL DATE: {formattedEndDate}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <List dense disablePadding>
              {plan?.features.map((feature, index) => (
                <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
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
          </Grid>
        </Grid>
      </Box>
      
      <Box 
        sx={{ 
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Button 
          variant="outlined" 
          onClick={handleUpgrade}
          sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.1em'
          }}
        >
          CHANGE PLAN
        </Button>
        
        {subscription.stripe_subscription_id && (
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleManageSubscription}
            sx={{ 
              fontFamily: 'monospace',
              letterSpacing: '0.1em'
            }}
          >
            MANAGE SUBSCRIPTION
          </Button>
        )}
      </Box>
    </Paper>
  );
} 