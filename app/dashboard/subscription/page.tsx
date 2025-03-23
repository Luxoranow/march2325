'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { USE_TEST_SUBSCRIPTION, getTestSubscription } from '@/lib/subscription-helper';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Toolbar, 
  Paper, 
  Alert,
  Grid,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PaymentIcon from '@mui/icons-material/Payment';
import SettingsIcon from '@mui/icons-material/Settings';

// Define interfaces
interface Subscription {
  id?: string;
  user_id?: string;
  plan_id: string;
  status: string;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  current_period_end?: string;
  quantity?: number;
  created_at?: string;
  updated_at?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  pdfUrl: string;
}

// Define the pricing plans
const PLANS = {
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

// Mock data for payment methods
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    brand: 'Visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true
  }
];

// Mock data for invoices
const mockInvoices: Invoice[] = [
  {
    id: 'in_1',
    amount: 19.99,
    status: 'paid',
    date: '2025-01-15',
    pdfUrl: '#'
  },
  {
    id: 'in_2',
    amount: 19.99,
    status: 'paid',
    date: '2024-12-15',
    pdfUrl: '#'
  },
  {
    id: 'in_3',
    amount: 19.99,
    status: 'paid',
    date: '2024-11-15',
    pdfUrl: '#'
  }
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [formattedEndDate, setFormattedEndDate] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<number>(0);
  const [cardsCreated, setCardsCreated] = useState<number>(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        await fetchSubscription(user.id);
        
        // In a real app, we would fetch payment methods and invoices from Stripe
        // For now, we'll use mock data
        setPaymentMethods(mockPaymentMethods);
        setInvoices(mockInvoices);
        
        // Mock team members and cards created
        setTeamMembers(subscription?.plan_id === 'team' ? 5 : 1);
        setCardsCreated(subscription?.plan_id === 'free' ? 1 : 3);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  // Separate useEffect for URL parameters to avoid hydration issues
  useEffect(() => {
    // Only run on the client side
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      setSuccess(url.searchParams.get('success') === 'true');
      setCanceled(url.searchParams.get('canceled') === 'true');
    }
  }, []);

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

  const fetchSubscription = async (userId: string) => {
    try {
      // If test subscription is enabled, use that instead of fetching from the database
      if (USE_TEST_SUBSCRIPTION) {
        setSubscription(getTestSubscription());
        return;
      }
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error fetching subscription:', error);
        return;
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
        
        // Set mock payment methods and invoices for the demo
        setPaymentMethods(mockPaymentMethods);
        setInvoices(mockInvoices);
      } else {
        // Default subscription if none found
        setSubscription({ plan_id: 'free', status: 'active' });
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
      // Set a default subscription in case of error
      setSubscription({ plan_id: 'free', status: 'active' });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // In a real app, this would redirect to Stripe Customer Portal
      // For now, we'll just redirect to the pricing page
      router.push('/pricing');
    } catch (err: any) {
      console.error('Error managing subscription:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // In a real app, this would open a Stripe Elements form
    alert('This would open a payment method form in a real app');
  };

  const getStatusChip = (status: string) => {
    let color = 'default';
    let bgcolor = '#f0f0f0';
    let textColor = '#000';
    
    switch (status) {
      case 'active':
        bgcolor = '#e6f7e6';
        textColor = '#2e7d32';
        break;
      case 'past_due':
        bgcolor = '#fff3e0';
        textColor = '#e65100';
        break;
      case 'canceled':
        bgcolor = '#ffebee';
        textColor = '#c62828';
        break;
      default:
        bgcolor = '#f0f0f0';
        textColor = '#000';
    }
    
    return (
      <Chip 
        label={status.toUpperCase()} 
        size="small" 
        sx={{ 
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          borderRadius: 0,
          bgcolor,
          color: textColor,
          border: '1px solid',
          borderColor: textColor
        }} 
      />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DashboardNavbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 240px)` },
          ml: { md: '240px' },
        }}
      >
        <Toolbar />
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            letterSpacing: '0.1em'
          }}
        >
          SUBSCRIPTION
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 4, 
            fontFamily: 'monospace', 
            letterSpacing: '0.05em',
            maxWidth: '800px'
          }}
        >
          Level up your card game. Unlock premium vibes, extra features, and boss-mode controls. Cancel anytime—no awkward breakups.
        </Typography>
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 4, 
              borderRadius: 0,
              '& .MuiAlert-message': {
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }
            }}
          >
            Your subscription has been updated successfully.
          </Alert>
        )}
        
        {canceled && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 4, 
              borderRadius: 0,
              '& .MuiAlert-message': {
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }
            }}
          >
            Your subscription update was canceled.
          </Alert>
        )}
        
        {/* Current Plan Summary */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            border: '1px solid #000',
            borderRadius: 0
          }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CardMembershipIcon sx={{ mr: 2 }} />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontWeight: 'bold'
                  }}
                >
                  {PLANS[subscription?.plan_id as keyof typeof PLANS]?.name || 'NO PLAN'}
                </Typography>
                {subscription && (
                  <Box sx={{ ml: 2 }}>
                    {getStatusChip(subscription.status)}
                  </Box>
                )}
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 2,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                {subscription?.plan_id === 'free' ? (
                  'You are currently on the free plan. Upgrade to access premium features.'
                ) : (
                  <>
                    Your subscription renews on <strong>{formattedEndDate}</strong>.
                    {subscription?.quantity && subscription.quantity > 1 && (
                      <> You have <strong>{subscription.quantity}</strong> team members.</>
                    )}
                  </>
                )}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {PLANS[subscription?.plan_id as keyof typeof PLANS]?.features.map((feature, index) => (
                  <Chip 
                    key={index}
                    label={feature}
                    icon={<CheckIcon />}
                    sx={{ 
                      borderRadius: 0,
                      bgcolor: '#f0f0f0',
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      border: '1px solid #ddd'
                    }}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  mb: 1
                }}
              >
                {subscription?.plan_id === 'free' ? (
                  'FREE'
                ) : (
                  <>
                    ${PLANS[subscription?.plan_id as keyof typeof PLANS]?.price}
                    {PLANS[subscription?.plan_id as keyof typeof PLANS] && 
                     'perUser' in PLANS[subscription?.plan_id as keyof typeof PLANS] && 
                     '/user'}
                    <Typography 
                      component="span" 
                      variant="body1"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      /month
                    </Typography>
                  </>
                )}
              </Typography>
              
              {subscription?.plan_id === 'free' ? (
                <Button
                  variant="contained"
                  onClick={handleUpgrade}
                  startIcon={<UpgradeIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 0,
                    bgcolor: '#000',
                    color: '#fff',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    '&:hover': {
                      bgcolor: '#333'
                    }
                  }}
                >
                  UPGRADE PLAN
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleManageSubscription}
                  startIcon={<SettingsIcon />}
                  sx={{ 
                    mt: 2,
                    borderRadius: 0,
                    borderColor: '#000',
                    color: '#000',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    '&:hover': {
                      borderColor: '#333',
                      bgcolor: 'rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  MANAGE SUBSCRIPTION
                </Button>
              )}
            </Grid>
          </Grid>
        </Paper>
        
        {/* Usage Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    CARDS CREATED
                  </Typography>
                  <CardMembershipIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {cardsCreated}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscription?.plan_id === 'free' ? (
                    'Upgrade to create unlimited cards'
                  ) : (
                    'You can create unlimited cards'
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    TEAM MEMBERS
                  </Typography>
                  <PeopleIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {teamMembers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscription?.plan_id === 'team' ? (
                    'Team plan includes team management'
                  ) : (
                    'Upgrade to Team plan for team management'
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for Billing and Payment */}
        {subscription?.plan_id !== 'free' && (
          <>
            <Box sx={{ mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{
                  borderBottom: '1px solid #000',
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#000',
                  },
                  '& .MuiTab-root': {
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    fontWeight: 'bold',
                  }
                }}
              >
                <Tab label="PAYMENT METHODS" icon={<CreditCardIcon />} iconPosition="start" />
                <Tab label="BILLING HISTORY" icon={<ReceiptIcon />} iconPosition="start" />
              </Tabs>
            </Box>
            
            {/* Payment Methods Tab */}
            {tabValue === 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid #000',
                  borderRadius: 0
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    mb: 3
                  }}
                >
                  PAYMENT METHODS
                </Typography>
                
                {paymentMethods.length > 0 ? (
                  <>
                    <List disablePadding>
                      {paymentMethods.map((method) => (
                        <ListItem 
                          key={method.id}
                          sx={{ 
                            py: 2,
                            px: 0,
                            borderBottom: '1px solid #eee'
                          }}
                        >
                          <ListItemIcon>
                            <PaymentIcon />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography 
                                variant="body1"
                                sx={{ 
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                {method.brand} •••• {method.last4}
                              </Typography>
                            }
                            secondary={
                              <Typography 
                                variant="body2"
                                color="text.secondary"
                                sx={{ 
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.05em'
                                }}
                              >
                                Expires {method.expMonth}/{method.expYear}
                              </Typography>
                            }
                          />
                          {method.isDefault && (
                            <Chip 
                              label="DEFAULT" 
                              size="small"
                              sx={{ 
                                borderRadius: 0,
                                bgcolor: '#f0f0f0',
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                                border: '1px solid #ddd'
                              }}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                    
                    <Button
                      variant="outlined"
                      onClick={handleAddPaymentMethod}
                      startIcon={<CreditCardIcon />}
                      sx={{ 
                        mt: 3,
                        borderRadius: 0,
                        borderColor: '#000',
                        color: '#000',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        '&:hover': {
                          borderColor: '#333',
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      ADD PAYMENT METHOD
                    </Button>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        mb: 2
                      }}
                    >
                      No payment methods found.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      onClick={handleAddPaymentMethod}
                      startIcon={<CreditCardIcon />}
                      sx={{ 
                        borderRadius: 0,
                        bgcolor: '#000',
                        color: '#fff',
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        '&:hover': {
                          bgcolor: '#333'
                        }
                      }}
                    >
                      ADD PAYMENT METHOD
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
            
            {/* Billing History Tab */}
            {tabValue === 1 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  border: '1px solid #000',
                  borderRadius: 0
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    mb: 3
                  }}
                >
                  BILLING HISTORY
                </Typography>
                
                {invoices.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #000'
                            }}
                          >
                            DATE
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #000'
                            }}
                          >
                            AMOUNT
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #000'
                            }}
                          >
                            STATUS
                          </TableCell>
                          <TableCell 
                            sx={{ 
                              fontFamily: 'monospace',
                              fontWeight: 'bold',
                              letterSpacing: '0.05em',
                              borderBottom: '1px solid #000'
                            }}
                          >
                            INVOICE
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invoices.map((invoice) => (
                          <TableRow key={invoice.id} hover>
                            <TableCell 
                              sx={{ 
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              {formatDate(invoice.date)}
                            </TableCell>
                            <TableCell 
                              sx={{ 
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              {formatCurrency(invoice.amount)}
                            </TableCell>
                            <TableCell 
                              sx={{ 
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              {getStatusChip(invoice.status)}
                            </TableCell>
                            <TableCell 
                              sx={{ 
                                fontFamily: 'monospace',
                                letterSpacing: '0.05em',
                                borderBottom: '1px solid #eee'
                              }}
                            >
                              <Button
                                variant="text"
                                href={invoice.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<ReceiptIcon />}
                                sx={{ 
                                  color: '#000',
                                  fontFamily: 'monospace',
                                  letterSpacing: '0.05em',
                                  '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.05)'
                                  }
                                }}
                              >
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      No billing history found.
                    </Typography>
                  </Box>
                )}
              </Paper>
            )}
          </>
        )}
      </Box>
    </>
  );
} 