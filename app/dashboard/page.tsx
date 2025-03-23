'use client';

import { useEffect, useState } from 'react';
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
  Button,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Avatar,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  LinearProgress
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import MoodIcon from '@mui/icons-material/Mood';
import ContactsIcon from '@mui/icons-material/Contacts';
import BarChartIcon from '@mui/icons-material/BarChart';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeviceUnknownIcon from '@mui/icons-material/DeviceUnknown';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import TabletIcon from '@mui/icons-material/Tablet';

// Define interfaces
interface BusinessCard {
  id: string;
  name: string;
  data: any;
  created_at: string;
  updated_at: string;
  view_count: number;
}

interface ActivityItem {
  id: string;
  type: 'view' | 'save' | 'interaction';
  card_id: string;
  card_name: string;
  location?: string;
  device?: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Use a separate useEffect for client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        
        // Fetch user's cards
        await fetchUserCards(user.id);
        
        // Fetch activity
        await fetchRecentActivity(user.id);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const fetchUserCards = async (userId: string) => {
    try {
      setLoadingCards(true);
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching cards:', error);
        return;
      }
      
      if (data) {
        // Type assertion with unknown first to satisfy TypeScript
        setCards(data as unknown as BusinessCard[]);
        
        // Calculate total views - ensure we're working with numbers
        const views = data.reduce((sum, card) => sum + (Number(card.view_count) || 0), 0);
        setTotalViews(views);
      }
    } catch (error) {
      console.error('Error in fetchUserCards:', error);
    } finally {
      setLoadingCards(false);
    }
  };

  const fetchRecentActivity = async (userId: string) => {
    try {
      setLoadingActivity(true);
      
      // This is a placeholder - in a real implementation, you would fetch
      // actual analytics data from your analytics_events table
      
      // For demo purposes, create some sample activity data
      const mockActivity: ActivityItem[] = [
        {
          id: '1',
          type: 'view',
          card_id: 'card1',
          card_name: 'Personal Card',
          location: 'New York, US',
          device: 'mobile',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 minutes ago
        },
        {
          id: '2',
          type: 'save',
          card_id: 'card1',
          card_name: 'Personal Card',
          location: 'San Francisco, US',
          device: 'desktop',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '3',
          type: 'interaction',
          card_id: 'card2',
          card_name: 'Work Card',
          location: 'London, UK',
          device: 'tablet',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
        },
        {
          id: '4',
          type: 'view',
          card_id: 'card2',
          card_name: 'Work Card',
          location: 'Berlin, Germany',
          device: 'mobile',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() // 12 hours ago
        },
        {
          id: '5',
          type: 'save',
          card_id: 'card1',
          card_name: 'Personal Card',
          location: 'Tokyo, Japan',
          device: 'desktop',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
        }
      ];
      
      setRecentActivity(mockActivity);
      setTotalContacts(mockActivity.filter(a => a.type === 'save').length);
      
      // In the real implementation, you would fetch from your database:
      // const { data, error } = await supabase
      //   .from('analytics_events')
      //   .select('*')
      //   .eq('owner_id', userId)
      //   .order('created_at', { ascending: false })
      //   .limit(10);
      
    } catch (error) {
      console.error('Error in fetchRecentActivity:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'mobile':
        return <SmartphoneIcon />;
      case 'desktop':
        return <LaptopIcon />;
      case 'tablet':
        return <TabletIcon />;
      default:
        return <DeviceUnknownIcon />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
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
          backgroundColor: '#f9f9f9'
        }}
      >
        <Toolbar />
        
        {/* Welcome Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
            WELCOME BACK{user?.email ? `, ${user.email.split('@')[0].toUpperCase()}` : ''}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Here's what's happening with your digital business cards
          </Typography>
        </Box>
        
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  TOTAL CARDS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'monospace' }}>
                  {loadingCards ? <LinearProgress /> : cards.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active digital business cards
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  TOTAL VIEWS
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'monospace' }}>
                  {loadingCards ? <LinearProgress /> : totalViews}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Times your cards have been viewed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  CONTACTS SAVED
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold', my: 1, fontFamily: 'monospace' }}>
                  {loadingActivity ? <LinearProgress /> : totalContacts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  People who saved your contact info
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%', 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <CardContent>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/dashboard/cards/new')}
                    sx={{
                      bgcolor: 'black',
                      color: 'white',
                      borderRadius: 0,
                      py: 1.5,
                      px: 3,
                      '&:hover': {
                        bgcolor: '#333'
                      },
                      fontFamily: 'monospace',
                      letterSpacing: '0.05em',
                      width: '100%'
                    }}
                  >
                    CREATE NEW CARD
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Card Previews */}
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '0.05em' }}>
          YOUR CARDS
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loadingCards ? (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          ) : cards.length > 0 ? (
            cards.slice(0, 3).map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card sx={{ 
                  height: '100%', 
                  borderRadius: 0, 
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'black', mr: 2 }}>
                        <QrCodeIcon />
                      </Avatar>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {card.name || `Card ${card.id.substring(0, 8)}`}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Views:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {card.view_count || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Last updated:
                      </Typography>
                      <Typography variant="body2">
                        {new Date(card.updated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => router.push(`/c/${card.id}`)}
                      sx={{ mr: 1, fontFamily: 'monospace' }}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => router.push(`/dashboard/cards/edit/${card.id}`)}
                      sx={{ mr: 1, fontFamily: 'monospace' }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ShareIcon />}
                      onClick={() => router.push(`/dashboard/cards/share/${card.id}`)}
                      sx={{ fontFamily: 'monospace' }}
                    >
                      Share
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 0, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  <QrCodeIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                </Box>
                <Typography variant="h6" gutterBottom>
                  No cards yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first digital business card to start networking
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/dashboard/cards/new')}
                  sx={{
                    bgcolor: 'black',
                    color: 'white',
                    borderRadius: 0,
                    '&:hover': {
                      bgcolor: '#333'
                    },
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  CREATE CARD
                </Button>
              </Paper>
            </Grid>
          )}
          
          {cards.length > 3 && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/dashboard/cards/all')}
                  sx={{
                    borderColor: 'black',
                    color: 'black',
                    borderRadius: 0,
                    '&:hover': {
                      borderColor: '#333',
                      bgcolor: 'rgba(0,0,0,0.05)'
                    },
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  VIEW ALL CARDS
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {/* Recent Activity */}
        <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold', letterSpacing: '0.05em' }}>
          RECENT ACTIVITY
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'monospace' }}>
                  ACTIVITY TIMELINE
                </Typography>
                
                {loadingActivity ? (
                  <LinearProgress />
                ) : recentActivity.length > 0 ? (
                  <List>
                    {recentActivity.map((activity) => (
                      <ListItem
                        key={activity.id}
                        secondaryAction={
                          <Typography variant="caption" color="text.secondary">
                            {formatTimeAgo(activity.timestamp)}
                          </Typography>
                        }
                        sx={{ 
                          borderLeft: '3px solid', 
                          borderColor: 
                            activity.type === 'view' ? 'primary.main' : 
                            activity.type === 'save' ? 'success.main' : 'info.main',
                          mb: 1,
                          pl: 2,
                          backgroundColor: 'rgba(0,0,0,0.02)'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: 
                              activity.type === 'view' ? 'primary.main' : 
                              activity.type === 'save' ? 'success.main' : 'info.main'
                          }}>
                            {activity.type === 'view' ? <VisibilityIcon /> : 
                             activity.type === 'save' ? <PersonAddIcon /> : <ShareIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            activity.type === 'view' 
                              ? `Someone viewed your card "${activity.card_name}"` 
                              : activity.type === 'save' 
                                ? `Someone saved your card "${activity.card_name}" to contacts` 
                                : `Someone interacted with your card "${activity.card_name}"`
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              {activity.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                                  <LocationOnIcon fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                  <Typography variant="caption">{activity.location}</Typography>
                                </Box>
                              )}
                              {activity.device && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {getDeviceIcon(activity.device)}
                                  <Typography variant="caption" sx={{ ml: 0.5 }}>
                                    {activity.device.charAt(0).toUpperCase() + activity.device.slice(1)}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No recent activity to display
                  </Typography>
                )}
                
                {recentActivity.length > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={() => router.push('/dashboard/analytics')}
                      sx={{
                        borderColor: 'black',
                        color: 'black',
                        borderRadius: 0,
                        '&:hover': {
                          borderColor: '#333',
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      VIEW ALL ANALYTICS
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: 0, 
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              height: '100%'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontFamily: 'monospace' }}>
                  QUICK LINKS
                </Typography>
                
                <List>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      startIcon={<QrCodeIcon />}
                      onClick={() => router.push('/dashboard/cards/all')}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        border: '1px solid rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Manage Your Cards
                    </Button>
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      startIcon={<BarChartIcon />}
                      onClick={() => router.push('/dashboard/analytics')}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        border: '1px solid rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      View Analytics
                    </Button>
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      startIcon={<PeopleIcon />}
                      onClick={() => router.push('/dashboard/team')}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        border: '1px solid rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Team Management
                    </Button>
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button
                      fullWidth
                      startIcon={<MoodIcon />}
                      onClick={() => router.push('/dashboard/vibes')}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        border: '1px solid rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Virtual Vibes
                    </Button>
                  </ListItem>
                  
                  <ListItem disablePadding>
                    <Button
                      fullWidth
                      startIcon={<UpgradeIcon />}
                      onClick={() => router.push('/dashboard/subscription')}
                      sx={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        py: 1.5,
                        px: 2,
                        borderRadius: 0,
                        border: '1px solid rgba(0,0,0,0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        },
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em'
                      }}
                    >
                      Subscription
                    </Button>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </>
  );
} 