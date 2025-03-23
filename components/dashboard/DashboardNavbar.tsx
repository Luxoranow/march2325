'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Button,
  Tooltip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PeopleIcon from '@mui/icons-material/People';
import MoodIcon from '@mui/icons-material/Mood';
import ContactsIcon from '@mui/icons-material/Contacts';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import BarChartIcon from '@mui/icons-material/BarChart';

// Dashboard sections
const sections = [
  { 
    name: 'DIGITAL CARDS', 
    icon: <QrCodeIcon />, 
    path: '/dashboard/cards/all',
    subsections: [
      { name: 'All Cards', path: '/dashboard/cards/all' },
      { name: 'New Card', path: '/dashboard/cards/new' }
    ]
  },
  { name: 'TEAM', icon: <PeopleIcon />, path: '/dashboard/team' },
  { name: 'VIRTUAL VIBES', icon: <MoodIcon />, path: '/dashboard/vibes' },
  { name: 'CONTACTS', icon: <ContactsIcon />, path: '/dashboard/contacts' },
  { name: 'ANALYTICS', icon: <BarChartIcon />, path: '/dashboard/analytics' },
  { name: 'SUBSCRIPTION', icon: <UpgradeIcon />, path: '/dashboard/subscription' },
  { name: 'SETTINGS', icon: <SettingsIcon />, path: '/dashboard/settings' },
];

// User menu options
const userMenuOptions = ['PROFILE', 'ACCOUNT'];

const drawerWidth = 240;

export default function DashboardNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleUserMenuAction = async (option: string) => {
    handleCloseUserMenu();
    
    switch (option) {
      case 'PROFILE':
        router.push('/profile');
        break;
      case 'ACCOUNT':
        router.push('/account');
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const drawer = (
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #333333'
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold', 
            letterSpacing: '0.2em',
            mb: 1,
            cursor: 'pointer'
          }}
          onClick={() => router.push('/')}
        >
          LUXORA
        </Typography>
        <Box sx={{ 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center',
          p: 1,
          border: '1px solid #333333',
          backgroundColor: '#111111'
        }}>
          <Typography variant="body2" sx={{ 
            fontFamily: 'monospace',
            letterSpacing: '0.1em'
          }}>
            {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Typography>
        </Box>
      </Box>
      
      <List sx={{ flexGrow: 1, pt: 0 }}>
        {sections.map((section) => (
          <Box key={section.name}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => handleNavigation(section.path)}
                selected={pathname === section.path || pathname.startsWith(section.path.split('/').slice(0, 3).join('/'))}
                sx={{ 
                  py: 2,
                  borderBottom: '1px solid #333333',
                  '&:hover': {
                    backgroundColor: '#111111'
                  }
                }}
              >
                <ListItemIcon>
                  {section.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={section.name} 
                  primaryTypographyProps={{ 
                    fontSize: '0.85rem',
                    letterSpacing: '0.1em'
                  }}
                />
              </ListItemButton>
            </ListItem>
            
            {/* Subsections */}
            {section.subsections && pathname.startsWith(section.path.split('/').slice(0, 3).join('/')) && (
              <Box sx={{ pl: 2, borderBottom: '1px solid #333333' }}>
                {section.subsections.map((subsection) => (
                  <ListItem key={subsection.name} disablePadding>
                    <ListItemButton 
                      onClick={() => handleNavigation(subsection.path)}
                      selected={pathname === subsection.path}
                      sx={{ 
                        py: 1.5,
                        pl: 4,
                        '&:hover': {
                          backgroundColor: '#111111'
                        }
                      }}
                    >
                      <ListItemText 
                        primary={subsection.name} 
                        primaryTypographyProps={{ 
                          fontSize: '0.8rem',
                          letterSpacing: '0.05em'
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </List>
      
      <Box sx={{ mt: 'auto', borderTop: '1px solid #333333' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleLogout}
              sx={{ 
                py: 2,
                '&:hover': {
                  backgroundColor: '#111111'
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary="LOGOUT" 
                primaryTypographyProps={{ 
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#000000',
          color: '#ffffff'
        }}
      >
        <Container maxWidth={false}>
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ 
                flexGrow: 1, 
                display: { xs: 'flex', md: 'none' },
                letterSpacing: '0.2em',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
              onClick={() => router.push('/')}
            >
              LUXORA
            </Typography>
            
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Typography variant="body2" sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.1em'
              }}>
                {currentTime.toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt="User" 
                    sx={{ 
                      width: 36, 
                      height: 36,
                      backgroundColor: '#ffffff',
                      color: '#000000',
                      fontFamily: 'monospace',
                      fontWeight: 'bold'
                    }}
                  >
                    U
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ 
                  mt: '45px',
                  '& .MuiPaper-root': {
                    borderRadius: 0,
                    border: '1px solid #000000',
                    backgroundColor: '#ffffff',
                  }
                }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {userMenuOptions.map((option) => (
                  <MenuItem 
                    key={option} 
                    onClick={() => handleUserMenuAction(option)}
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f0f0f0'
                      }
                    }}
                  >
                    <Typography 
                      textAlign="center"
                      sx={{
                        fontSize: '0.85rem',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {option}
                    </Typography>
                  </MenuItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <MenuItem 
                  onClick={handleLogout}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  <Typography 
                    textAlign="center"
                    sx={{
                      fontSize: '0.85rem',
                      letterSpacing: '0.1em'
                    }}
                  >
                    LOGOUT
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#000000',
            color: '#ffffff',
            borderRight: '1px solid #333333'
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: '#000000',
            color: '#ffffff',
            borderRight: '1px solid #333333'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
} 