'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Toolbar,
  Grid,
  Tabs,
  Tab,
  Card,
  CardContent,
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
  Divider,
  Alert,
  Tooltip,
  IconButton,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import QrCodeIcon from '@mui/icons-material/QrCode';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import ShareIcon from '@mui/icons-material/Share';
import PersonIcon from '@mui/icons-material/Person';

// Types
interface BusinessCard {
  id: string;
  user_id: string;
  name?: string;
  data: any;
  created_at: string;
  updated_at: string;
  view_count: number;
}

interface AnalyticsEvent {
  id: string;
  event_type: string;
  card_id: string;
  owner_id: string;
  viewer_id: string;
  action_type: string | null;
  ip_address: string;
  user_agent: string;
  metadata: any;
  created_at: string;
}

interface CardViewData {
  cardId: string;
  cardName: string;
  viewCount: number;
  downloadCount: number;
  socialClickCount: number;
  uniqueVisitors: number;
  lastViewed: string;
}

interface GroupedData {
  date: string;
  views: number;
  downloads: number;
  interactions: number;
}

export default function CardAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEvent[]>([]);
  const [selectedCard, setSelectedCard] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('7days');
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch user and subscription status
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.error('Error fetching user:', error);
          router.push('/login');
          return;
        }
        
        setUser(user);
        
        // Fetch user's cards
        const { data: cardsData, error: cardsError } = await supabase
          .from('cards')
          .select('*')
          .eq('user_id', user.id);
          
        if (cardsError) {
          console.error('Error fetching cards:', cardsError);
          return;
        }
        
        if (cardsData) {
          setCards(cardsData);
        }
        
        // Fetch analytics data
        await fetchAnalyticsData(user.id, 'all', timeRange);
        
      } catch (err) {
        console.error('Error loading user data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  // Fetch analytics data when card or time range changes
  const fetchAnalyticsData = async (userId: string, cardId: string, timeRange: string) => {
    setLoading(true);
    
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
      
      // Filter by card if specific card is selected
      if (cardId !== 'all') {
        query = query.eq('card_id', cardId);
      }
      
      // Apply time range filter
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case '24hours':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      
      query = query.gte('created_at', startDate.toISOString());
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching analytics data:', error);
        return;
      }
      
      if (data) {
        setAnalytics(data);
      }
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle card selection change
  const handleCardChange = (event: SelectChangeEvent) => {
    const cardId = event.target.value;
    setSelectedCard(cardId);
    if (user) {
      fetchAnalyticsData(user.id, cardId, timeRange);
    }
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    const range = event.target.value;
    setTimeRange(range);
    if (user) {
      fetchAnalyticsData(user.id, selectedCard, range);
    }
  };
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Process data for cards summary
  const cardsSummary = useMemo(() => {
    const summary: CardViewData[] = [];
    
    cards.forEach(card => {
      const cardEvents = analytics.filter(event => event.card_id === card.id);
      const views = cardEvents.filter(event => event.event_type === 'card_view');
      const downloads = cardEvents.filter(event => 
        event.event_type === 'card_interaction' && 
        event.action_type === 'download_vcard'
      );
      const socialClicks = cardEvents.filter(event => 
        event.event_type === 'card_interaction' && 
        event.action_type === 'social_click'
      );
      
      // Count unique visitors
      const uniqueVisitorIds = new Set(views.map(view => view.viewer_id));
      
      summary.push({
        cardId: card.id,
        cardName: card.name || `Card ${card.id.substring(0, 8)}`,
        viewCount: views.length,
        downloadCount: downloads.length,
        socialClickCount: socialClicks.length,
        uniqueVisitors: uniqueVisitorIds.size,
        lastViewed: views.length > 0 ? views[0].created_at : 'Never'
      });
    });
    
    return summary;
  }, [cards, analytics]);
  
  // Process data for timeline chart
  const timelineData = useMemo(() => {
    const timeData: GroupedData[] = [];
    const dateMap = new Map<string, GroupedData>();
    
    // Determine date format based on time range
    let dateFormat: Intl.DateTimeFormatOptions;
    if (timeRange === '24hours') {
      dateFormat = { hour: '2-digit' };
    } else if (timeRange === '7days') {
      dateFormat = { weekday: 'short' };
    } else {
      dateFormat = { month: 'short', day: 'numeric' };
    }
    
    // Group by date
    analytics.forEach(event => {
      const date = new Date(event.created_at);
      const dateStr = date.toLocaleDateString('en-US', dateFormat);
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr, views: 0, downloads: 0, interactions: 0 });
      }
      
      const data = dateMap.get(dateStr)!;
      
      if (event.event_type === 'card_view') {
        data.views += 1;
      } else if (event.event_type === 'card_interaction') {
        if (event.action_type === 'download_vcard') {
          data.downloads += 1;
        } else {
          data.interactions += 1;
        }
      }
    });
    
    // Convert map to array and sort by date
    dateMap.forEach(data => {
      timeData.push(data);
    });
    
    return timeData.sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
  }, [analytics, timeRange]);
  
  // Process data for interaction breakdown
  const interactionData = useMemo(() => {
    const interactions = analytics.filter(event => 
      event.event_type === 'card_interaction'
    );
    
    const actionTypes = new Map<string, number>();
    
    interactions.forEach(event => {
      const type = event.action_type || 'unknown';
      const count = actionTypes.get(type) || 0;
      actionTypes.set(type, count + 1);
    });
    
    const result = Array.from(actionTypes.entries()).map(([name, value]) => ({
      name: formatActionType(name),
      value
    }));
    
    return result;
  }, [analytics]);
  
  // Format action type for display
  const formatActionType = (type: string): string => {
    switch (type) {
      case 'download_vcard':
        return 'Save Contact';
      case 'social_click':
        return 'Social Media';
      case 'contact_click':
        return 'Contact Info';
      case 'resource_click':
        return 'Resources';
      default:
        return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
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
          sx={{ 
            fontWeight: 'bold',
            letterSpacing: '0.1em',
            mb: 4
          }}
        >
          CARD ANALYTICS
        </Typography>
        
        {cards.length === 0 ? (
          <Alert 
            severity="info" 
            sx={{ mb: 4 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => router.push('/dashboard/cards/new')}
              >
                <QrCodeIcon />
              </IconButton>
            }
          >
            You don't have any cards yet. Create a card to start tracking analytics.
          </Alert>
        ) : (
          <>
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="card-select-label">Card</InputLabel>
                <Select
                  labelId="card-select-label"
                  value={selectedCard}
                  label="Card"
                  onChange={handleCardChange}
                  size="small"
                >
                  <MenuItem value="all">All Cards</MenuItem>
                  {cards.map(card => (
                    <MenuItem value={card.id} key={card.id}>
                      {card.name || `Card ${card.id.substring(0, 8)}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="time-range-select-label">Time Range</InputLabel>
                <Select
                  labelId="time-range-select-label"
                  value={timeRange}
                  label="Time Range"
                  onChange={handleTimeRangeChange}
                  size="small"
                >
                  <MenuItem value="24hours">Last 24 Hours</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </Box>
            
            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <VisibilityIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" component="div">
                        Views
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {analytics.filter(event => event.event_type === 'card_view').length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GetAppIcon sx={{ mr: 1, color: 'secondary.main' }} />
                      <Typography variant="h6" component="div">
                        Downloads
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {analytics.filter(event => 
                        event.event_type === 'card_interaction' && 
                        event.action_type === 'download_vcard'
                      ).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ShareIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="h6" component="div">
                        Interactions
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {analytics.filter(event => 
                        event.event_type === 'card_interaction' &&
                        event.action_type !== 'download_vcard'
                      ).length}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="h6" component="div">
                        Unique Visitors
                      </Typography>
                    </Box>
                    <Typography variant="h4">
                      {new Set(
                        analytics
                          .filter(event => event.event_type === 'card_view')
                          .map(event => event.viewer_id)
                      ).size}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Tabs for different analytics views */}
            <Paper sx={{ mb: 4 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
              >
                <Tab label="Timeline" />
                <Tab label="Cards" />
                <Tab label="Interactions" />
              </Tabs>
              
              <Divider />
              
              {/* Timeline Tab */}
              {tabValue === 0 && (
                <Box sx={{ p: 3, height: 400 }}>
                  {timelineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={timelineData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Bar dataKey="views" name="Views" fill="#8884d8" />
                        <Bar dataKey="downloads" name="Downloads" fill="#82ca9d" />
                        <Bar dataKey="interactions" name="Other Interactions" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No activity data available for the selected time period
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Cards Tab */}
              {tabValue === 1 && (
                <Box sx={{ p: 3 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Card Name</TableCell>
                          <TableCell align="right">Views</TableCell>
                          <TableCell align="right">Unique Visitors</TableCell>
                          <TableCell align="right">Downloads</TableCell>
                          <TableCell align="right">Social Clicks</TableCell>
                          <TableCell align="right">Last Viewed</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cardsSummary.map(card => (
                          <TableRow key={card.cardId}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <QrCodeIcon sx={{ mr: 1, fontSize: 16 }} />
                                {card.cardName}
                              </Box>
                            </TableCell>
                            <TableCell align="right">{card.viewCount}</TableCell>
                            <TableCell align="right">{card.uniqueVisitors}</TableCell>
                            <TableCell align="right">{card.downloadCount}</TableCell>
                            <TableCell align="right">{card.socialClickCount}</TableCell>
                            <TableCell align="right">
                              {card.lastViewed === 'Never' ? 'Never' : 
                                new Date(card.lastViewed).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              
              {/* Interactions Tab */}
              {tabValue === 2 && (
                <Box sx={{ p: 3, height: 400, display: 'flex' }}>
                  {interactionData.length > 0 ? (
                    <>
                      <Box sx={{ width: '60%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={interactionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {interactionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                      
                      <Box sx={{ width: '40%', pl: 3 }}>
                        <Typography variant="h6" gutterBottom>
                          Interaction Breakdown
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          This chart shows how users are interacting with your cards. 
                          Higher engagement with contact information and social links 
                          indicates effective networking.
                        </Typography>
                        
                        {interactionData.map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box 
                              sx={{ 
                                width: 14, 
                                height: 14, 
                                bgcolor: COLORS[index % COLORS.length],
                                mr: 1 
                              }} 
                            />
                            <Typography variant="body2">
                              {item.name}: {item.value} ({((item.value / interactionData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%)
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      <Typography variant="body1" color="text.secondary">
                        No interaction data available for the selected time period
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
            
            {/* Recent Activity */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Event</TableCell>
                      <TableCell>Card</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.slice(0, 10).map((event) => {
                      // Find card
                      const card = cards.find(c => c.id === event.card_id);
                      const cardName = card ? (card.name || `Card ${card.id.substring(0, 8)}`) : event.card_id;
                      
                      // Format event details
                      let eventType = 'Unknown';
                      let details = '';
                      let chipColor = 'default';
                      
                      if (event.event_type === 'card_view') {
                        eventType = 'View';
                        details = 'Card was viewed';
                        chipColor = 'primary';
                      } else if (event.event_type === 'card_interaction') {
                        if (event.action_type === 'download_vcard') {
                          eventType = 'Download';
                          details = 'Contact saved';
                          chipColor = 'secondary';
                        } else if (event.action_type === 'social_click') {
                          eventType = 'Social';
                          details = `Clicked: ${event.metadata?.platform || 'social link'}`;
                          chipColor = 'info';
                        } else if (event.action_type === 'contact_click') {
                          eventType = 'Contact';
                          details = `Clicked: ${event.metadata?.contactType || 'contact info'}`;
                          chipColor = 'success';
                        } else if (event.action_type === 'resource_click') {
                          eventType = 'Resource';
                          details = `Clicked: ${event.metadata?.resourceTitle || 'resource'}`;
                          chipColor = 'warning';
                        }
                      }
                      
                      return (
                        <TableRow key={event.id}>
                          <TableCell>
                            <Chip 
                              label={eventType} 
                              color={chipColor as any} 
                              size="small" 
                              variant="outlined" 
                            />
                          </TableCell>
                          <TableCell>{cardName}</TableCell>
                          <TableCell>{details}</TableCell>
                          <TableCell>
                            {new Date(event.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    
                    {analytics.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No activity data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Box>
    </>
  );
} 