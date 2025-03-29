'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { USE_TEST_SUBSCRIPTION, getTestSubscription } from '@/lib/subscription-helper';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Toolbar,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import PublicIcon from '@mui/icons-material/Public';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InfoIcon from '@mui/icons-material/Info';
import LockIcon from '@mui/icons-material/Lock';

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

// Mock data for analytics
interface AnalyticsData {
  totalViews: number;
  contactsSaved: number;
  interactions: number;
  topLocations: {
    name: string;
    count: number;
  }[];
  dailyViews: {
    date: string;
    views: number;
  }[];
  deviceBreakdown: {
    device: string;
    percentage: number;
  }[];
  recentScans: {
    id: string;
    cardName: string;
    location: string;
    device: string;
    timestamp: string;
  }[];
  popularCards: {
    id: string;
    name: string;
    views: number;
    saves: number;
  }[];
}

// Generate mock analytics data
const generateMockAnalytics = (): AnalyticsData => {
  // Generate dates for the past 14 days
  const dailyViews = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 10) + 1
    };
  });

  // Calculate total views from daily data
  const totalViews = dailyViews.reduce((sum, day) => sum + day.views, 0);
  
  return {
    totalViews,
    contactsSaved: Math.floor(totalViews * 0.6), // 60% conversion rate
    interactions: Math.floor(totalViews * 1.5), // 1.5 interactions per view
    topLocations: [
      { name: 'New York, USA', count: Math.floor(totalViews * 0.3) },
      { name: 'San Francisco, USA', count: Math.floor(totalViews * 0.2) },
      { name: 'London, UK', count: Math.floor(totalViews * 0.15) },
      { name: 'Toronto, Canada', count: Math.floor(totalViews * 0.1) },
      { name: 'Sydney, Australia', count: Math.floor(totalViews * 0.05) }
    ],
    dailyViews,
    deviceBreakdown: [
      { device: 'Mobile', percentage: 68 },
      { device: 'Desktop', percentage: 24 },
      { device: 'Tablet', percentage: 8 }
    ],
    recentScans: [
      { id: '1', cardName: 'Professional Card', location: 'New York, USA', device: 'iPhone', timestamp: '2025-01-29T14:32:00Z' },
      { id: '2', cardName: 'Creative Card', location: 'San Francisco, USA', device: 'Android', timestamp: '2025-01-29T12:15:00Z' },
      { id: '3', cardName: 'Professional Card', location: 'London, UK', device: 'Chrome/Windows', timestamp: '2025-01-28T18:45:00Z' },
      { id: '4', cardName: 'Minimal Card', location: 'Toronto, Canada', device: 'Safari/Mac', timestamp: '2025-01-28T10:22:00Z' },
      { id: '5', cardName: 'Creative Card', location: 'Sydney, Australia', device: 'iPad', timestamp: '2025-01-27T22:10:00Z' }
    ],
    popularCards: [
      { id: '1', name: 'Professional Card', views: Math.floor(totalViews * 0.4), saves: Math.floor(totalViews * 0.4 * 0.7) },
      { id: '2', name: 'Creative Card', views: Math.floor(totalViews * 0.3), saves: Math.floor(totalViews * 0.3 * 0.6) },
      { id: '3', name: 'Minimal Card', views: Math.floor(totalViews * 0.2), saves: Math.floor(totalViews * 0.2 * 0.5) },
      { id: '4', name: 'Corporate Card', views: Math.floor(totalViews * 0.1), saves: Math.floor(totalViews * 0.1 * 0.4) }
    ]
  };
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('14d');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState<string>('');

  // Use a separate useEffect for client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch analytics data based on subscription and time range
  const fetchAnalyticsData = useCallback(async () => {
    if (!user || !subscription) return;
    
    try {
      // If you have a premium subscription, fetch real analytics data
      if (!USE_TEST_SUBSCRIPTION && subscription.plan_id !== 'free') {
        const response = await fetch(`/api/analytics/data?timeRange=${timeRange}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setAnalytics(result.data);
            return;
          }
        }
        
        console.error('Error fetching analytics data, falling back to mock data');
      }
      
      // Fall back to mock data if we're on a free plan or if API call fails
      setAnalytics(generateMockAnalytics());
    } catch (apiError) {
      console.error('Error fetching analytics:', apiError);
      // Fall back to mock data if there's an error
      setAnalytics(generateMockAnalytics());
    }
  }, [user, subscription, timeRange]);

  // Effect to fetch analytics data when subscription or time range changes
  useEffect(() => {
    if (subscription) {
      fetchAnalyticsData();
    }
  }, [fetchAnalyticsData, subscription]);

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
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    if (mounted) {
      checkUser();
    }
  }, [router, mounted]);

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

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleFeatureClick = (feature: string) => {
    if (subscription?.plan_id === 'free') {
      setUpgradeFeature(feature);
      setShowUpgradeModal(true);
    }
  };

  const handleExportClick = () => {
    handleFeatureClick('data export');
  };
  
  const handleDateRangeChange = (event: SelectChangeEvent) => {
    if (subscription?.plan_id === 'free' && event.target.value !== '7d' && event.target.value !== '14d') {
      setUpgradeFeature('extended date ranges');
      setShowUpgradeModal(true);
      return;
    }
    setTimeRange(event.target.value);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    // If user is on free plan and trying to access detailed reports, show upgrade modal
    if (subscription?.plan_id === 'free' && newValue === 2) {
      setUpgradeFeature('detailed card performance metrics');
      setShowUpgradeModal(true);
      return;
    }
    setTabValue(newValue);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Format time for display
  const formatTime = (timestampString: string) => {
    const date = new Date(timestampString);
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  // Get device icon
  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) {
      return <PhoneIphoneIcon fontSize="small" />;
    } else if (device.includes('iPad') || device.includes('Tablet')) {
      return <TabletMacIcon fontSize="small" />;
    } else {
      return <DesktopWindowsIcon fontSize="small" />;
    }
  };

  if (!mounted) {
    return null; // Return nothing during server-side rendering
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show upgrade message for free users
  const needsUpgrade = subscription?.plan_id === 'free';

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
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
          ANALYTICS
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
          Get the tea on your taps. See who's checking out your card, when, and how often. It's like stalking... but make it data.
        </Typography>
        
        {/* Free plan info banner instead of completely blocking access */}
        {subscription?.plan_id === 'free' && (
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
            icon={<InfoIcon fontSize="inherit" />}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleUpgrade}
                startIcon={<UpgradeIcon />}
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                UPGRADE
              </Button>
            }
          >
            You're viewing analytics in demo mode. Free plan users can see basic metrics for the last 14 days. Upgrade to GLOW UP for full analytics access.
          </Alert>
        )}

        {/* Analytics content - now visible to all users */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            Track performance metrics for your digital business cards.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Data export button - premium feature */}
            {subscription?.plan_id !== 'free' ? (
              <Button 
                variant="outlined" 
                size="small"
                sx={{ 
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  border: '1px solid #000',
                  color: '#000'
                }}
              >
                Export Data
              </Button>
            ) : (
              <Button 
                variant="outlined" 
                size="small"
                onClick={handleExportClick}
                startIcon={<LockIcon sx={{ fontSize: '0.8rem' }} />}
                sx={{ 
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  border: '1px solid #ccc',
                  color: '#888'
                }}
              >
                Export Data
              </Button>
            )}
            
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="time-range-label" sx={{ fontFamily: 'monospace' }}>Time Range</InputLabel>
              <Select
                labelId="time-range-label"
                value={timeRange}
                label="Time Range"
                onChange={handleDateRangeChange}
                sx={{ 
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000',
                  }
                }}
              >
                <MenuItem value="7d" sx={{ fontFamily: 'monospace' }}>Last 7 days</MenuItem>
                <MenuItem value="14d" sx={{ fontFamily: 'monospace' }}>Last 14 days</MenuItem>
                <MenuItem value="30d" sx={{ fontFamily: 'monospace', color: subscription?.plan_id === 'free' ? '#888' : 'inherit' }}>
                  {subscription?.plan_id === 'free' && <LockIcon sx={{ fontSize: '0.8rem', mr: 1 }} />}
                  Last 30 days
                </MenuItem>
                <MenuItem value="90d" sx={{ fontFamily: 'monospace', color: subscription?.plan_id === 'free' ? '#888' : 'inherit' }}>
                  {subscription?.plan_id === 'free' && <LockIcon sx={{ fontSize: '0.8rem', mr: 1 }} />}
                  Last 90 days
                </MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    TOTAL VIEWS
                  </Typography>
                  <TrendingUpIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analytics?.totalViews || 0}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  QR code scans in the last {timeRange === '7d' ? '7' : timeRange === '14d' ? '14' : timeRange === '30d' ? '30' : '90'} days
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    CONTACTS SAVED
                  </Typography>
                  <PeopleAltIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analytics?.contactsSaved || 0}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  People who saved your contact info
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    INTERACTIONS
                  </Typography>
                  <TouchAppIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analytics?.interactions || 0}
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  Clicks on links and contact methods
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6} lg={3}>
            <Card sx={{ borderRadius: 0, border: '1px solid #000' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    CONVERSION RATE
                  </Typography>
                  <QrCodeIcon />
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {analytics ? Math.round((analytics.contactsSaved / analytics.totalViews) * 100) : 0}%
                </Typography>
                <Typography variant="body2" component="div" color="text.secondary">
                  Percentage of views that saved your contact
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Tabs for different analytics views */}
        <Box sx={{ mb: 4 }}>
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
            <Tab label="OVERVIEW" />
            <Tab label="SCAN ACTIVITY" />
            <Tab label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {subscription?.plan_id === 'free' && <LockIcon sx={{ fontSize: '0.8rem', mr: 0.5 }} />}
                <span>CARD PERFORMANCE</span>
              </Box>
            } sx={{ color: subscription?.plan_id === 'free' ? '#888' : 'inherit' }} />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        {tabValue === 0 && (
          <>
            {/* Daily Views Chart */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, border: '1px solid #000', borderRadius: 0 }}>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', mb: 2 }}>
                DAILY SCAN ACTIVITY
              </Typography>
              <Box sx={{ height: 250, display: 'flex', alignItems: 'flex-end' }}>
                {analytics?.dailyViews.map((day, index) => (
                  <Box 
                    key={day.date} 
                    sx={{ 
                      flex: 1,
                      mx: 0.5,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: '100%', 
                        bgcolor: '#000',
                        height: `${(day.views / 10) * 100}%`,
                        minHeight: 5,
                        transition: 'height 0.3s ease'
                      }} 
                    />
                    <Typography variant="caption" sx={{ mt: 1, fontSize: '0.7rem' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
            
            {/* Device Breakdown and Top Locations */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #000', borderRadius: 0 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', mb: 3 }}>
                    DEVICE BREAKDOWN
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics?.deviceBreakdown.map(device => (
                      <Box key={device.device} sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {device.device === 'Mobile' ? (
                              <PhoneIphoneIcon sx={{ mr: 1, fontSize: 20 }} />
                            ) : device.device === 'Desktop' ? (
                              <DesktopWindowsIcon sx={{ mr: 1, fontSize: 20 }} />
                            ) : (
                              <TabletMacIcon sx={{ mr: 1, fontSize: 20 }} />
                            )}
                            <Typography variant="body2" component="div">{device.device}</Typography>
                          </Box>
                          <Typography variant="body2" component="div" fontWeight="bold">{device.percentage}%</Typography>
                        </Box>
                        <Box sx={{ width: '100%', bgcolor: '#f0f0f0', height: 8 }}>
                          <Box sx={{ width: `${device.percentage}%`, bgcolor: '#000', height: '100%' }} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, height: '100%', border: '1px solid #000', borderRadius: 0 }}>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', mb: 3 }}>
                    TOP LOCATIONS
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {analytics?.topLocations.map(location => (
                      <Box key={location.name} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PublicIcon sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2" component="div">{location.name}</Typography>
                        </Box>
                        <Typography variant="body2" component="div" fontWeight="bold">{location.count} scans</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
        
        {tabValue === 1 && (
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #000', borderRadius: 0 }}>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', mb: 3 }}>
              RECENT SCAN ACTIVITY
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>CARD</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>LOCATION</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>DEVICE</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>DATE</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>TIME</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics?.recentScans.map((scan) => (
                    <TableRow key={scan.id} hover>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <QrCodeIcon sx={{ mr: 1, fontSize: 20 }} />
                          {scan.cardName}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>{scan.location}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getDeviceIcon(scan.device)}
                          <Typography component="div" sx={{ ml: 1 }}>{scan.device}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>{formatDate(scan.timestamp)}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>{formatTime(scan.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {tabValue === 2 && (
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #000', borderRadius: 0 }}>
            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em', mb: 3 }}>
              CARD PERFORMANCE
            </Typography>
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>CARD NAME</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>VIEWS</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>SAVES</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold', borderBottom: '1px solid #000' }}>CONVERSION RATE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analytics?.popularCards.map((card) => (
                    <TableRow key={card.id} hover>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <QrCodeIcon sx={{ mr: 1, fontSize: 20 }} />
                          {card.name}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>{card.views}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>{card.saves}</TableCell>
                      <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                        <Chip 
                          label={`${Math.round((card.saves / card.views) * 100)}%`} 
                          sx={{ 
                            borderRadius: 0,
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ddd',
                            fontFamily: 'monospace',
                            letterSpacing: '0.05em',
                          }} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        
        {/* Upgrade Modal */}
        <Dialog
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            UNLOCK PREMIUM ANALYTICS
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <BarChartIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Premium Feature
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {upgradeFeature === 'extended date ranges' 
                  ? 'Access to 30-day and 90-day historical data is available exclusively with our premium plans.'
                  : upgradeFeature === 'data export'
                  ? 'Exporting analytics data is available exclusively with our premium plans.'
                  : upgradeFeature === 'detailed card performance metrics'
                  ? 'Detailed card performance metrics and conversion tracking is available exclusively with our premium plans.'
                  : 'This premium feature is available exclusively with our paid plans.'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
                Upgrade to GLOW UP to unlock all analytics features, plus multiple cards, virtual backgrounds, and more!
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setShowUpgradeModal(false)}
              sx={{ fontFamily: 'monospace' }}
            >
              MAYBE LATER
            </Button>
            <Button 
              variant="contained"
              onClick={handleUpgrade}
              startIcon={<UpgradeIcon />}
              sx={{ 
                fontFamily: 'monospace',
                borderRadius: 0,
                backgroundColor: '#000000',
                '&:hover': {
                  backgroundColor: '#333333'
                }
              }}
            >
              UPGRADE NOW
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
} 