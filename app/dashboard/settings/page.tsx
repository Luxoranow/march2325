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
  Divider,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    title: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en'
  });
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    lastPasswordChange: '',
    activeDevices: []
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        setProfileData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field: keyof typeof profileData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfileData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handlePreferenceChange = (field: keyof typeof preferences) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPreferences(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Update user profile in Supabase
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          company: profileData.company,
          title: profileData.title
        }
      });
      
      if (error) throw error;
      
      setSuccess('Profile updated successfully');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Delete user account in Supabase
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) throw error;
      
      // Sign out and redirect to home page
      await supabase.auth.signOut();
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
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
          SETTINGS
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
          Your card, your rules. Customize the vibes, tweak your info, and control what the world sees. It's giving main character energy.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 0 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 0 }}>
            {success}
          </Alert>
        )}
        
        <Paper 
          elevation={0} 
          sx={{ 
            mt: 4,
            border: '1px solid #000'
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': {
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  textTransform: 'none',
                  fontWeight: 'bold'
                }
              }}
            >
              <Tab 
                icon={<PersonIcon />} 
                label="Profile" 
                iconPosition="start"
              />
              <Tab 
                icon={<SecurityIcon />} 
                label="Security" 
                iconPosition="start"
              />
              <Tab 
                icon={<NotificationsIcon />} 
                label="Notifications" 
                iconPosition="start"
              />
              <Tab 
                icon={<LanguageIcon />} 
                label="Preferences" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  mb: 3
                }}
              >
                PROFILE SETTINGS
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profileData.fullName}
                    onChange={handleProfileChange('fullName')}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#000',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profileData.email}
                    disabled
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#000',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={profileData.phone}
                    onChange={handleProfileChange('phone')}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#000',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={profileData.company}
                    onChange={handleProfileChange('company')}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#000',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={profileData.title}
                    onChange={handleProfileChange('title')}
                    disabled={!editMode}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        '& fieldset': {
                          borderColor: '#000',
                        },
                        '&:hover fieldset': {
                          borderColor: '#000',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#000',
                        },
                      },
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    {editMode ? (
                      <>
                        <Button
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => setEditMode(false)}
                          sx={{
                            borderRadius: 0,
                            borderColor: '#000',
                            color: '#000',
                            '&:hover': {
                              borderColor: '#000',
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSaveProfile}
                          disabled={loading}
                          sx={{
                            borderRadius: 0,
                            backgroundColor: '#000',
                            '&:hover': {
                              backgroundColor: '#333',
                            },
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => setEditMode(true)}
                        sx={{
                          borderRadius: 0,
                          backgroundColor: '#000',
                          '&:hover': {
                            backgroundColor: '#333',
                          },
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  mb: 3
                }}
              >
                SECURITY SETTINGS
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={security.twoFactorEnabled}
                      onChange={(e) => setSecurity(prev => ({
                        ...prev,
                        twoFactorEnabled: e.target.checked
                      }))}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Password"
                    secondary="Last changed: Never"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 0,
                        borderColor: '#000',
                        color: '#000',
                        '&:hover': {
                          borderColor: '#000',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      Change
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <SecurityIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Active Devices"
                    secondary="Manage devices that have access to your account"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 0,
                        borderColor: '#000',
                        color: '#000',
                        '&:hover': {
                          borderColor: '#000',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      View
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
              
              <Divider sx={{ my: 3 }} />
              
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  mb: 3,
                  color: 'error.main'
                }}
              >
                DANGER ZONE
              </Typography>
              
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{
                  borderRadius: 0,
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    borderColor: 'error.main',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  },
                }}
              >
                Delete Account
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  mb: 3
                }}
              >
                NOTIFICATION SETTINGS
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Email Notifications"
                    secondary="Receive notifications about your account activity"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.emailNotifications}
                      onChange={handlePreferenceChange('emailNotifications')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Marketing Emails"
                    secondary="Receive updates about new features and promotions"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.marketingEmails}
                      onChange={handlePreferenceChange('marketingEmails')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  letterSpacing: '0.05em',
                  mb: 3
                }}
              >
                PREFERENCES
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dark Mode"
                    secondary="Toggle dark mode theme"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={preferences.darkMode}
                      onChange={handlePreferenceChange('darkMode')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <LanguageIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Language"
                    secondary="Select your preferred language"
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderRadius: 0,
                        borderColor: '#000',
                        color: '#000',
                        '&:hover': {
                          borderColor: '#000',
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      English
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          </TabPanel>
        </Paper>
      </Box>
      
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 0,
            border: '1px solid #000'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #000' }}>
          Delete Account
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography>
            Are you sure you want to delete your account? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #000', p: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              borderRadius: 0,
              borderColor: '#000',
              color: '#000',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={loading}
            sx={{
              borderRadius: 0,
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': {
                borderColor: 'error.main',
                backgroundColor: 'rgba(211, 47, 47, 0.04)',
              },
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 