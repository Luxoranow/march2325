'use client';

import { useEffect, useState } from 'react';
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
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  IconButton,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SendIcon from '@mui/icons-material/Send';
import BarChartIcon from '@mui/icons-material/BarChart';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';

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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  cards_created: number;
  last_active: string;
}

export default function TeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'editor' | 'viewer'>('editor');
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [currentEditMember, setCurrentEditMember] = useState<TeamMember | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [addMethod, setAddMethod] = useState<'invite' | 'direct'>('invite');
  const [newMemberName, setNewMemberName] = useState('');

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
        // Load mock team data for testing
        loadMockTeamData();
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
        
        // If user has team subscription, fetch team members
        if (data.plan_id === 'team') {
          // In a real app, you would fetch team members from the database
          // For now, we'll use mock data
          loadMockTeamData();
        }
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

  const loadMockTeamData = () => {
    // Mock team data for demonstration
    const mockTeamMembers: TeamMember[] = [
      {
        id: '1',
        name: 'You (Account Owner)',
        email: user?.email || 'you@example.com',
        role: 'admin',
        status: 'active',
        avatar: '',
        cards_created: 5,
        last_active: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        role: 'editor',
        status: 'active',
        avatar: '',
        cards_created: 3,
        last_active: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '3',
        name: 'Michael Chen',
        email: 'michael@example.com',
        role: 'viewer',
        status: 'active',
        avatar: '',
        cards_created: 0,
        last_active: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        id: '4',
        name: 'Pending Invitation',
        email: 'pending@example.com',
        role: 'editor',
        status: 'pending',
        cards_created: 0,
        last_active: ''
      }
    ];
    
    setTeamMembers(mockTeamMembers);
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleInviteMember = () => {
    // Validate email
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarOpen(true);
      return;
    }
    
    if (addMethod === 'direct' && !newMemberName) {
      setSnackbarMessage('Please enter a name for the team member');
      setSnackbarOpen(true);
      return;
    }
    
    // In a real app, you would send an invitation email and store the invitation in the database
    // For now, we'll just add a new pending member to our mock data
    const newMember: TeamMember = {
      id: `temp-${Date.now()}`,
      name: addMethod === 'direct' ? newMemberName : 'Pending Invitation',
      email: inviteEmail,
      role: inviteRole,
      status: addMethod === 'direct' ? 'active' : 'pending',
      cards_created: 0,
      last_active: addMethod === 'direct' ? new Date().toISOString() : ''
    };
    
    setTeamMembers([...teamMembers, newMember]);
    setInviteDialogOpen(false);
    setInviteEmail('');
    setNewMemberName('');
    setInviteRole('editor');
    setAddMethod('invite');
    
    const message = addMethod === 'direct' 
      ? `${newMemberName} has been added to your team` 
      : `Invitation sent to ${inviteEmail}`;
    
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setCurrentEditMember(member);
    setEditMemberDialogOpen(true);
  };

  const handleSaveEditMember = () => {
    if (!currentEditMember) return;
    
    // Update the member in our mock data
    const updatedMembers = teamMembers.map(member => 
      member.id === currentEditMember.id ? currentEditMember : member
    );
    
    setTeamMembers(updatedMembers);
    setEditMemberDialogOpen(false);
    setCurrentEditMember(null);
    
    setSnackbarMessage('Team member updated successfully');
    setSnackbarOpen(true);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setMemberToDelete(member);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;
    
    // Remove the member from our mock data
    const updatedMembers = teamMembers.filter(member => member.id !== memberToDelete.id);
    setTeamMembers(updatedMembers);
    
    setDeleteConfirmOpen(false);
    setMemberToDelete(null);
    
    setSnackbarMessage('Team member removed successfully');
    setSnackbarOpen(true);
  };

  const handleViewMasterTemplate = () => {
    router.push('/dashboard/team/master-template');
  };
  
  const handleEditMasterTemplate = () => {
    router.push('/dashboard/team/master-template');
  };

  const handleCreateTemplate = () => {
    router.push('/dashboard/team/master-template');
  };

  const handleCreateCardForMember = (memberId: string) => {
    // Navigate to card creation page with member ID as parameter
    router.push(`/dashboard/cards/new?for=${memberId}`);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettingsIcon />;
      case 'editor':
        return <EditIcon />;
      case 'viewer':
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'editor':
        return 'primary';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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

  // Show upgrade message for free and premium users
  const needsUpgrade = subscription?.plan_id !== 'team';

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', letterSpacing: '0.1em' }}>
            TEAM MANAGEMENT
          </Typography>
        </Box>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 4, 
            fontFamily: 'monospace', 
            letterSpacing: '0.05em',
            maxWidth: '800px'
          }}
        >
          Be the boss of the vibe. Add, edit, or remove team members with a tap. Keep everyone&apos;s card fresh, branded, and not giving chaos. You&apos;re in control, captain.
        </Typography>
        
        {/* Team Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                border: '1px solid #000',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  mb: 2
                }}
              >
                <PeopleIcon sx={{ mr: 1 }} /> TEAM MEMBERS
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                {teamMembers.length}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  mb: 2
                }}
              >
                {teamMembers.filter(m => m.status === 'active').length} active, {teamMembers.filter(m => m.status === 'pending').length} pending
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
                sx={{ 
                  mt: 'auto',
                  borderColor: '#000',
                  color: '#000',
                  borderRadius: 0,
                  '&:hover': {
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                Add Member
              </Button>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                border: '1px solid #000'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  mb: 2
                }}
              >
                <BarChartIcon sx={{ mr: 1 }} /> TOTAL CARDS
              </Typography>
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1
                }}
              >
                {teamMembers.reduce((total, member) => total + member.cards_created, 0)}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                Created by all team members
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                height: '100%',
                border: '1px solid #000'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  mb: 2
                }}
              >
                <UpgradeIcon sx={{ mr: 1 }} /> SUBSCRIPTION
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 1,
                  textTransform: 'uppercase'
                }}
              >
                {subscription?.plan_id === 'team' ? 'SQUAD GOALS PLAN' : 'UPGRADE NEEDED'}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                {subscription?.plan_id === 'team' ? 'Up to 10 team members included' : 'Upgrade to add more team members'}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Master Card Template Section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4,
            border: '1px solid #000'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.05em'
              }}
            >
              MASTER CARD TEMPLATE
            </Typography>
            <Box>
              <Button
                variant="outlined"
                onClick={handleViewMasterTemplate}
                sx={{ 
                  mr: 2,
                  borderRadius: 0,
                  borderColor: '#000',
                  color: '#000',
                  '&:hover': {
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                VIEW ALL CARDS
              </Button>
              <Button
                variant="contained"
                onClick={handleEditMasterTemplate}
                sx={{ 
                  borderRadius: 0,
                  backgroundColor: '#000',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
              >
                EDIT MASTER TEMPLATE
              </Button>
            </Box>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                Template Preview
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Set the vibe for your team's digital business cards! Lock in the key deets to keep branding on point.
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  p: 3, 
                  border: '1px dashed #ccc', 
                  height: 250,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <BusinessIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
                  No master template yet? Time to fix that.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    mt: 2, 
                    bgcolor: 'black', 
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.8)',
                    },
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    py: 1.5,
                    px: 3,
                    borderRadius: 0
                  }}
                  onClick={handleCreateTemplate}
                >
                  CREATE TEMPLATE
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                Template Settings
              </Typography>
              <Typography variant="body2" paragraph>
                Control what elements team members can customize in their cards.
              </Typography>
              
              <List>
                <ListItem sx={{ px: 0, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText 
                    primary="Company Logo" 
                    secondary="Team members cannot change the company logo"
                  />
                  <Chip label="LOCKED" size="small" sx={{ borderRadius: 0, backgroundColor: '#f0f0f0' }} />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText 
                    primary="Company Information" 
                    secondary="Company name, address, and contact info are locked"
                  />
                  <Chip label="LOCKED" size="small" sx={{ borderRadius: 0, backgroundColor: '#f0f0f0' }} />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText 
                    primary="Personal Information" 
                    secondary="Team members can edit their personal details"
                  />
                  <Chip label="EDITABLE" size="small" sx={{ borderRadius: 0, backgroundColor: '#e8f5e9', color: '#2e7d32' }} />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1, borderBottom: '1px solid #e0e0e0' }}>
                  <ListItemText 
                    primary="Card Theme" 
                    secondary="Visual theme is consistent across all team cards"
                  />
                  <Chip label="LOCKED" size="small" sx={{ borderRadius: 0, backgroundColor: '#f0f0f0' }} />
                </ListItem>
                
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText 
                    primary="Social Media" 
                    secondary="Team members can add personal accounts but not remove company accounts"
                  />
                  <Chip label="PARTIALLY EDITABLE" size="small" sx={{ borderRadius: 0, backgroundColor: '#fff8e1', color: '#f57f17' }} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Team Members Section - Completely separate from the Master Card Template section */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3,
            border: '1px solid #000'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                TEAM MEMBERS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your team members and their permissions
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => setInviteDialogOpen(true)}
              sx={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: 0,
                py: 1.5,
                px: 3,
                '&:hover': {
                  backgroundColor: '#333333'
                },
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              INVITE MEMBER
            </Button>
          </Box>
          
          {teamMembers.length === 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              py: 6,
              textAlign: 'center'
            }}>
              <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No team members yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
                Start building your team by inviting your colleagues to join
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
                sx={{ 
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: 0,
                  '&:hover': {
                    backgroundColor: '#333333'
                  }
                }}
              >
                INVITE YOUR FIRST TEAM MEMBER
              </Button>
            </Box>
          ) : (
            <List sx={{ width: '100%' }}>
              {teamMembers.map((member) => (
                <Box key={member.id}>
                  <ListItem 
                    sx={{ 
                      py: 2,
                      backgroundColor: member.status === 'pending' ? 'rgba(0,0,0,0.03)' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: member.status === 'pending' ? 'grey.400' : 'primary.main' }}>
                        {member.name.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={
                        <Typography component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                            {member.name}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={member.role.toUpperCase()} 
                            color={getRoleColor(member.role) as any}
                            icon={getRoleIcon(member.role)}
                            sx={{ mr: 1 }}
                          />
                          {member.status === 'pending' && (
                            <Chip size="small" label="PENDING" color="warning" />
                          )}
                        </Typography>
                      }
                      secondary={
                        <Typography component="div" variant="body2" sx={{ mt: 0.5 }}>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {member.email}
                          </Typography>
                          {member.status === 'active' && (
                            <Typography component="div" sx={{ display: 'flex', mt: 0.5 }}>
                              <Typography component="span" variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                                Cards created: {member.cards_created}
                              </Typography>
                              <Typography component="span" variant="caption" color="text.secondary">
                                Last active: {formatDate(member.last_active)}
                              </Typography>
                            </Typography>
                          )}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex' }}>
                        {member.status === 'active' && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleCreateCardForMember(member.id)}
                            sx={{ 
                              mr: 1,
                              borderRadius: 0,
                              borderColor: '#000',
                              color: '#000',
                              '&:hover': {
                                borderColor: '#000',
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                              },
                            }}
                          >
                            Create Card
                          </Button>
                        )}
                        {member.id !== '1' && ( // Don't allow editing/deleting the admin (yourself)
                          <>
                            <IconButton 
                              edge="end" 
                              aria-label="edit"
                              onClick={() => handleEditMember(member)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleDeleteMember(member)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </Box>
              ))}
            </List>
          )}
          
          {teamMembers.length > 0 && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button 
                variant="outlined" 
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteDialogOpen(true)}
                sx={{ 
                  borderColor: '#000',
                  color: '#000',
                  borderRadius: 0,
                  '&:hover': {
                    borderColor: '#000',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                INVITE ANOTHER TEAM MEMBER
              </Button>
            </Box>
          )}
        </Paper>
        
        {/* Invite Member Dialog */}
        <Dialog 
          open={inviteDialogOpen} 
          onClose={() => setInviteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 0,
              border: '1px solid #000'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #e0e0e0', 
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            fontWeight: 'bold',
            py: 2
          }}>
            {addMethod === 'direct' ? 'ADD TEAM MEMBER' : 'INVITE TEAM MEMBER'}
          </DialogTitle>
          <DialogContent sx={{ py: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonAddIcon sx={{ fontSize: 40, mr: 2, color: 'text.secondary' }} />
              <Typography variant="body1">
                {addMethod === 'direct' 
                  ? 'Manually add a team member and create their card' 
                  : 'Send an invitation email to a team member'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Add Method
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant={addMethod === 'invite' ? 'contained' : 'outlined'}
                  onClick={() => setAddMethod('invite')}
                  sx={{ 
                    flex: 1,
                    borderRadius: 0,
                    borderColor: '#000',
                    bgcolor: addMethod === 'invite' ? 'black' : 'transparent',
                    color: addMethod === 'invite' ? 'white' : 'black',
                    '&:hover': {
                      bgcolor: addMethod === 'invite' ? '#333' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: '#000',
                    }
                  }}
                >
                  Send Invitation
                </Button>
                <Button 
                  variant={addMethod === 'direct' ? 'contained' : 'outlined'}
                  onClick={() => setAddMethod('direct')}
                  sx={{ 
                    flex: 1,
                    borderRadius: 0,
                    borderColor: '#000',
                    bgcolor: addMethod === 'direct' ? 'black' : 'transparent',
                    color: addMethod === 'direct' ? 'white' : 'black',
                    '&:hover': {
                      bgcolor: addMethod === 'direct' ? '#333' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: '#000',
                    }
                  }}
                >
                  Add Directly
                </Button>
              </Box>
            </Box>
            
            {addMethod === 'direct' && (
              <>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Name
                </Typography>
                <TextField
                  margin="dense"
                  id="name"
                  placeholder="Full Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  sx={{ 
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                    }
                  }}
                />
              </>
            )}
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Email Address
            </Typography>
            <TextField
              autoFocus={addMethod === 'invite'}
              margin="dense"
              id="email"
              placeholder="colleague@company.com"
              type="email"
              fullWidth
              variant="outlined"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{ 
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                }
              }}
            />
            
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Role & Permissions
            </Typography>
            <FormControl fullWidth sx={{ mb: 1 }}>
              <Select
                id="role-select"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'editor' | 'viewer')}
                sx={{ borderRadius: 0 }}
              >
                <MenuItem value="editor">Editor</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f5f5f5', 
              mb: 3,
              border: '1px solid #e0e0e0'
            }}>
              {inviteRole === 'editor' ? (
                <Typography variant="body2">
                  <strong>Editor:</strong> Can create and edit their own digital business cards using the master template. They can customize their personal information while maintaining company branding.
                </Typography>
              ) : (
                <Typography variant="body2">
                  <strong>Viewer:</strong> Can only view digital business cards. Ideal for team members who need access to view cards but shouldn't create or edit them.
                </Typography>
              )}
            </Box>
            
            {addMethod === 'invite' ? (
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                An invitation email will be sent to this address. The recipient will need to accept the invitation to join your team.
              </Alert>
            ) : (
              <Alert severity="info" sx={{ borderRadius: 0 }}>
                The team member will be added immediately. You can create their card after adding them.
              </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0' }}>
            <Button 
              onClick={() => setInviteDialogOpen(false)}
              sx={{ 
                color: 'text.secondary',
                borderRadius: 0
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleInviteMember} 
              variant="contained"
              startIcon={addMethod === 'invite' ? <SendIcon /> : <PersonAddIcon />}
              disabled={(addMethod === 'direct' && !newMemberName) || !inviteEmail || !inviteEmail.includes('@')}
              sx={{ 
                bgcolor: 'black', 
                color: 'white',
                borderRadius: 0,
                '&:hover': {
                  bgcolor: '#333',
                },
                '&.Mui-disabled': {
                  bgcolor: '#ccc',
                  color: '#666'
                }
              }}
            >
              {addMethod === 'invite' ? 'Send Invitation' : 'Add Member'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Member Dialog */}
        <Dialog open={editMemberDialogOpen} onClose={() => setEditMemberDialogOpen(false)}>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={currentEditMember?.name || ''}
              onChange={(e) => setCurrentEditMember(prev => prev ? {...prev, name: e.target.value} : null)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={currentEditMember?.email || ''}
              onChange={(e) => setCurrentEditMember(prev => prev ? {...prev, email: e.target.value} : null)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="edit-role-select-label">Role</InputLabel>
              <Select
                labelId="edit-role-select-label"
                id="edit-role-select"
                value={currentEditMember?.role || 'viewer'}
                label="Role"
                onChange={(e) => setCurrentEditMember(prev => prev ? {...prev, role: e.target.value as 'admin' | 'editor' | 'viewer'} : null)}
              >
                <MenuItem value="admin">Admin (Full access)</MenuItem>
                <MenuItem value="editor">Editor (Can create and edit cards)</MenuItem>
                <MenuItem value="viewer">Viewer (Can only view cards)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="edit-status-select-label">Status</InputLabel>
              <Select
                labelId="edit-status-select-label"
                id="edit-status-select"
                value={currentEditMember?.status || 'active'}
                label="Status"
                onChange={(e) => setCurrentEditMember(prev => prev ? {...prev, status: e.target.value as 'active' | 'pending' | 'inactive'} : null)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMemberDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEditMember} 
              variant="contained"
            >
              Save Changes
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Removal</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to remove {memberToDelete?.name} from your team? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteMember} color="error">
              Remove
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </>
  );
} 