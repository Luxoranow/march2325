'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import CardTracker from '@/components/tracking/CardTracker';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Container,
  Paper,
  Link,
  useMediaQuery,
  useTheme,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Grid
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WebIcon from '@mui/icons-material/Web';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import GetAppIcon from '@mui/icons-material/GetApp';
import HomeIcon from '@mui/icons-material/Home';

// Types
interface CardData {
  personal: {
    name: string;
    title?: string;
    phone?: string;
    email?: string;
    location?: string;
    bio?: string;
  };
  company?: {
    name?: string;
    website?: string;
    logo?: string;
  };
  social?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
    facebook?: string;
  };
  resources?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  customFields?: Record<string, string>;
  theme: string;
}

interface BusinessCard {
  id: string;
  user_id: string;
  name?: string;
  data: CardData;
  created_at: string;
  updated_at: string;
}

export default function CardView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState<BusinessCard | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackerReady, setTrackerReady] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Get the card ID from the URL
  const cardId = params.id;
  
  // Fetch card data
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
        
        // Fetch card data
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', cardId)
          .single();
          
        if (error) {
          console.error('Error fetching card:', error);
          setError('Card not found');
          setLoading(false);
          return;
        }
        
        if (!data) {
          setError('Card not found');
          setLoading(false);
          return;
        }
        
        // Ensure data has the correct structure
        if (!data.data || typeof data.data !== 'object') {
          console.error('Card data has invalid structure');
          setError('Invalid card data');
          setLoading(false);
          return;
        }
        
        // Set dark mode based on card theme
        if ('theme' in data.data) {
          setDarkMode((data.data as CardData).theme === 'dark');
        }
        
        // Convert to BusinessCard with proper type validation
        const cardData: BusinessCard = {
          id: data.id as string,
          user_id: data.user_id as string,
          name: data.name as string | undefined,
          data: data.data as CardData,
          created_at: data.created_at as string,
          updated_at: data.updated_at as string
        };
        
        // Set card data
        setCardData(cardData);
        setTrackerReady(true);
        
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading the card');
      } finally {
        setLoading(false);
      }
    };
    
    if (cardId) {
      fetchCardData();
    }
  }, [cardId]);
  
  // Function to save contact as vCard
  const saveContact = () => {
    if (!cardData) return;
    
    // Track download event
    if (trackerReady && cardId) {
      // Use optional chaining and fallbacks to safely access properties
      const cardName = cardData.name || 
        (cardData && typeof cardData === 'object' && 'data' in cardData && 
         cardData.data && typeof cardData.data === 'object' && 'personal' in cardData.data && 
         cardData.data.personal && 'name' in cardData.data.personal ? 
         cardData.data.personal.name : 'Unknown Card');
      
      window.dispatchEvent(new CustomEvent('track_card_interaction', {
        detail: {
          cardId,
          actionType: 'download_vcard',
          metadata: { cardName }
        }
      }));
    }
    
    // Ensure we have the correct card data structure before proceeding
    if (!cardData || 
        typeof cardData !== 'object' || 
        !('data' in cardData) || 
        !cardData.data || 
        typeof cardData.data !== 'object' || 
        !('personal' in cardData.data)) {
      console.error('Card data is not in the expected format');
      return;
    }
    
    // Access the data with the correct structure guaranteed
    const personal = cardData.data.personal;
    const company = cardData.data.company;
    const social = cardData.data.social;
    const resources = cardData.data.resources || [];
    const customFields = cardData.data.customFields || {};
    
    // Start vCard with proper line breaks for different OS compatibility
    let vCardData = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
    
    // Add personal information
    if (personal.name) {
      // Add full name
      vCardData += `FN:${escapeVCardValue(personal.name)}\r\n`;
      
      // Add structured name - try to split into components
      // Format: Last;First;Middle;Prefix;Suffix
      const nameParts = personal.name.split(' ');
      let firstName = '';
      let lastName = '';
      
      if (nameParts.length === 1) {
        // Only one name provided
        firstName = nameParts[0];
      } else if (nameParts.length === 2) {
        // Likely first and last name
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length > 2) {
        // Multiple parts - assume first name is first part, last name is last part
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
      }
      
      vCardData += `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;\r\n`;
    }
    
    if (personal.title) {
      vCardData += `TITLE:${escapeVCardValue(personal.title)}\r\n`;
    }
    
    if (personal.email) {
      vCardData += `EMAIL:${escapeVCardValue(personal.email)}\r\n`;
    }
    
    if (personal.phone) {
      vCardData += `TEL;TYPE=CELL:${escapeVCardValue(personal.phone)}\r\n`;
    }
    
    if (personal.location) {
      vCardData += `ADR;TYPE=HOME:;;${escapeVCardValue(personal.location)};;;;\r\n`;
    }
    
    // Add company information
    if (company?.name) {
      vCardData += `ORG:${escapeVCardValue(company.name)}\r\n`;
    }
    
    if (company?.website) {
      // Ensure website URL has a protocol
      let websiteUrl = company.website;
      if (websiteUrl && !websiteUrl.startsWith('http://') && !websiteUrl.startsWith('https://')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      vCardData += `URL:${escapeVCardValue(websiteUrl)}\r\n`;
    }
    
    // Add social media as URLs
    if (social) {
      if (social.linkedin) vCardData += `URL;TYPE=LINKEDIN:${escapeVCardValue(social.linkedin)}\r\n`;
      if (social.twitter) vCardData += `URL;TYPE=TWITTER:${escapeVCardValue(social.twitter)}\r\n`;
      if (social.instagram) vCardData += `URL;TYPE=INSTAGRAM:${escapeVCardValue(social.instagram)}\r\n`;
      if (social.github) vCardData += `URL;TYPE=GITHUB:${escapeVCardValue(social.github)}\r\n`;
      if (social.facebook) vCardData += `URL;TYPE=FACEBOOK:${escapeVCardValue(social.facebook)}\r\n`;
    }
    
    // Add resources as a note
    if (resources && resources.length > 0) {
      let resourcesNote = 'Resources:\\n';
      resources.forEach(resource => {
        resourcesNote += `${resource.title}: ${resource.url}\\n`;
        if (resource.description) {
          resourcesNote += `Description: ${resource.description}\\n`;
        }
      });
      vCardData += `NOTE:${escapeVCardValue(resourcesNote)}\r\n`;
    }
    
    // Add custom fields
    if (customFields && Object.keys(customFields).length > 0) {
      let customNote = 'Additional Information:\\n';
      Object.entries(customFields).forEach(([key, value]) => {
        customNote += `${key}: ${value}\\n`;
      });
      if (personal.bio) {
        customNote += `\\nBio: ${personal.bio}\\n`;
      }
      vCardData += `NOTE:${escapeVCardValue(customNote)}\r\n`;
    } else if (personal.bio) {
      vCardData += `NOTE:${escapeVCardValue(personal.bio)}\r\n`;
    }
    
    // End vCard
    vCardData += 'END:VCARD';
    
    // Create a blob and download it
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${personal.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Helper function to escape special characters in vCard values
  const escapeVCardValue = (value: string): string => {
    if (!value) return '';
    // Escape backslashes, commas, semicolons, and newlines as per vCard spec
    return value
      .replace(/\\/g, '\\\\')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
      .replace(/\r\n/g, '\\n')
      .replace(/\n/g, '\\n');
  };
  
  // Track social link clicks
  const handleSocialClick = (platform: string, url: string) => {
    if (trackerReady && cardId) {
      window.dispatchEvent(new CustomEvent('track_card_interaction', { 
        detail: {
          cardId,
          actionType: 'social_click',
          metadata: {
            platform,
            url
          }
        }
      }));
    }
    window.open(url, '_blank');
  };
  
  // Track resource clicks
  const handleResourceClick = (title: string, url: string) => {
    if (trackerReady && cardId) {
      window.dispatchEvent(new CustomEvent('track_card_interaction', {
        detail: {
          cardId,
          actionType: 'resource_click',
          metadata: {
            resourceTitle: title,
            url
          }
        }
      }));
    }
    window.open(url, '_blank');
  };
  
  // Track contact detail clicks
  const handleContactClick = (type: string, value: string) => {
    if (trackerReady && cardId) {
      window.dispatchEvent(new CustomEvent('track_card_interaction', {
        detail: {
          cardId,
          actionType: 'contact_click',
          metadata: {
            contactType: type,
            value
          }
        }
      }));
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error || !cardData) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 0,
            bgcolor: '#f9f9f9'
          }}
        >
          <Typography variant="h5" component="h1" gutterBottom>
            Card Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Sorry, we couldn't find the business card you're looking for. It may have been deleted or the link is incorrect.
          </Typography>
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={() => router.push('/')}
            sx={{
              backgroundColor: '#000000',
              color: '#ffffff',
              borderRadius: 0,
              '&:hover': {
                backgroundColor: '#333333'
              },
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            BACK TO HOME
          </Button>
        </Paper>
      </Container>
    );
  }
  
  const { personal, company, social, resources, customFields, theme: cardTheme } = cardData.data;
  
  return (
    <>
      {/* Analytics Tracking Component */}
      {trackerReady && cardId && (
        <CardTracker 
          cardId={cardId}
          ownerId={cardData.user_id}
          viewerId={userId}
          cardName={cardData.name || personal.name}
        />
      )}
      
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: darkMode ? '#121212' : '#f5f5f5',
          color: darkMode ? '#ffffff' : '#000000',
          pb: 8
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              pt: 4,
              pb: 2,
              px: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Paper
              elevation={darkMode ? 4 : 2}
              sx={{
                width: '100%',
                borderRadius: 0,
                overflow: 'hidden',
                bgcolor: darkMode ? '#1e1e1e' : '#ffffff',
                color: darkMode ? '#ffffff' : '#000000',
                border: darkMode ? '1px solid #333' : '1px solid #e0e0e0'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 3,
                  borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
                  textAlign: 'center'
                }}
              >
                {company?.logo && (
                  <Box
                    component="img"
                    src={company.logo}
                    alt={`${company.name} logo`}
                    sx={{
                      maxHeight: 60,
                      maxWidth: '100%',
                      mb: 2
                    }}
                  />
                )}
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    letterSpacing: '0.05em'
                  }}
                >
                  {personal.name.toUpperCase()}
                </Typography>
                {personal.title && (
                  <Typography
                    variant="subtitle1"
                    color={darkMode ? 'text.secondary' : 'text.primary'}
                    sx={{ mb: 1 }}
                  >
                    {personal.title}
                  </Typography>
                )}
                {company?.name && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {company.name}
                  </Typography>
                )}
              </Box>
              
              {/* Personal Info */}
              <Box sx={{ p: 3 }}>
                {personal.bio && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1">{personal.bio}</Typography>
                  </Box>
                )}
                
                <Grid container spacing={2}>
                  {/* Contact Information */}
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        fontSize: '0.9rem'
                      }}
                    >
                      CONTACT INFORMATION
                    </Typography>
                    <List dense disablePadding>
                      {personal.email && (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <EmailIcon fontSize="small" color={darkMode ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link
                                href={`mailto:${personal.email}`}
                                underline="hover"
                                color={darkMode ? '#90caf9' : 'inherit'}
                                onClick={() => handleContactClick('email', personal.email!)}
                              >
                                {personal.email}
                              </Link>
                            }
                          />
                        </ListItem>
                      )}
                      
                      {personal.phone && (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <PhoneIcon fontSize="small" color={darkMode ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link
                                href={`tel:${personal.phone}`}
                                underline="hover"
                                color={darkMode ? '#90caf9' : 'inherit'}
                                onClick={() => handleContactClick('phone', personal.phone!)}
                              >
                                {personal.phone}
                              </Link>
                            }
                          />
                        </ListItem>
                      )}
                      
                      {personal.location && (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LocationOnIcon fontSize="small" color={darkMode ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link
                                href={`https://maps.google.com/?q=${encodeURIComponent(personal.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color={darkMode ? '#90caf9' : 'inherit'}
                                onClick={() => handleContactClick('location', personal.location!)}
                              >
                                {personal.location}
                              </Link>
                            }
                          />
                        </ListItem>
                      )}
                      
                      {company?.website && (
                        <ListItem disablePadding sx={{ mb: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <WebIcon fontSize="small" color={darkMode ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Link
                                href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="hover"
                                color={darkMode ? '#90caf9' : 'inherit'}
                                onClick={() => handleContactClick('website', company.website!)}
                              >
                                {company.website}
                              </Link>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>
                  
                  {/* Social Links */}
                  {social && Object.values(social).some(v => v) && (
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 2,
                          fontWeight: 'bold',
                          letterSpacing: '0.05em',
                          fontSize: '0.9rem'
                        }}
                      >
                        CONNECT WITH ME
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {social.linkedin && (
                          <Tooltip title="LinkedIn">
                            <IconButton
                              onClick={() => handleSocialClick('linkedin', social.linkedin!)}
                              sx={{
                                color: darkMode ? '#0a66c2' : '#0a66c2',
                                bgcolor: darkMode ? 'rgba(10, 102, 194, 0.1)' : 'rgba(10, 102, 194, 0.1)'
                              }}
                            >
                              <LinkedInIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {social.twitter && (
                          <Tooltip title="Twitter">
                            <IconButton
                              onClick={() => handleSocialClick('twitter', social.twitter!)}
                              sx={{
                                color: darkMode ? '#1da1f2' : '#1da1f2',
                                bgcolor: darkMode ? 'rgba(29, 161, 242, 0.1)' : 'rgba(29, 161, 242, 0.1)'
                              }}
                            >
                              <TwitterIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {social.instagram && (
                          <Tooltip title="Instagram">
                            <IconButton
                              onClick={() => handleSocialClick('instagram', social.instagram!)}
                              sx={{
                                color: darkMode ? '#e1306c' : '#e1306c',
                                bgcolor: darkMode ? 'rgba(225, 48, 108, 0.1)' : 'rgba(225, 48, 108, 0.1)'
                              }}
                            >
                              <InstagramIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {social.github && (
                          <Tooltip title="GitHub">
                            <IconButton
                              onClick={() => handleSocialClick('github', social.github!)}
                              sx={{
                                color: darkMode ? '#f5f5f5' : '#333333',
                                bgcolor: darkMode ? 'rgba(245, 245, 245, 0.1)' : 'rgba(51, 51, 51, 0.1)'
                              }}
                            >
                              <GitHubIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {social.facebook && (
                          <Tooltip title="Facebook">
                            <IconButton
                              onClick={() => handleSocialClick('facebook', social.facebook!)}
                              sx={{
                                color: darkMode ? '#1877f2' : '#1877f2',
                                bgcolor: darkMode ? 'rgba(24, 119, 242, 0.1)' : 'rgba(24, 119, 242, 0.1)'
                              }}
                            >
                              <FacebookIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Grid>
                  )}
                </Grid>
                
                {/* Custom Resources */}
                {resources && resources.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        fontSize: '0.9rem'
                      }}
                    >
                      RESOURCES
                    </Typography>
                    <Grid container spacing={2}>
                      {resources.map((resource, idx) => (
                        <Grid item xs={12} sm={6} md={4} key={idx}>
                          <Paper
                            elevation={darkMode ? 2 : 1}
                            sx={{
                              p: 2,
                              bgcolor: darkMode ? '#252525' : '#ffffff',
                              borderRadius: 0,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: darkMode ? '#333333' : '#f9f9f9'
                              },
                              border: darkMode ? '1px solid #444' : '1px solid #e0e0e0'
                            }}
                            onClick={() => handleResourceClick(resource.title, resource.url)}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {resource.title}
                            </Typography>
                            {resource.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, flex: 1 }}
                              >
                                {resource.description}
                              </Typography>
                            )}
                            <Link
                              href={resource.url}
                              target="_blank"
                              rel="noopener"
                              color={darkMode ? '#90caf9' : 'primary.main'}
                              onClick={(e) => {
                                e.preventDefault(); // Prevent default to handle with our tracking function
                                handleResourceClick(resource.title, resource.url);
                              }}
                              sx={{
                                mt: 1,
                                fontSize: '0.875rem',
                                '&:hover': {
                                  textDecoration: 'none'
                                }
                              }}
                            >
                              View Resource
                            </Link>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
                
                {/* Custom Fields */}
                {customFields && Object.keys(customFields).length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Divider sx={{ mb: 3 }} />
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        fontSize: '0.9rem'
                      }}
                    >
                      ADDITIONAL INFORMATION
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(customFields).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {key}
                          </Typography>
                          <Typography variant="body2">{value}</Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
              
              {/* Footer */}
              <Box
                sx={{
                  p: 3,
                  borderTop: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <Button
                  variant={darkMode ? 'outlined' : 'contained'}
                  startIcon={<GetAppIcon />}
                  onClick={saveContact}
                  sx={{
                    backgroundColor: darkMode ? 'transparent' : '#000000',
                    color: darkMode ? '#ffffff' : '#ffffff',
                    borderColor: darkMode ? '#ffffff' : '#000000',
                    borderRadius: 0,
                    '&:hover': {
                      backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#333333',
                      borderColor: darkMode ? '#ffffff' : '#000000'
                    },
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em'
                  }}
                >
                  SAVE CONTACT
                </Button>
              </Box>
            </Paper>
            
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 3, textAlign: 'center', px: 2 }}
            >
              Created with{' '}
              <Link 
                href="/" 
                underline="hover" 
                color="inherit"
              >
                Luxora
              </Link>{' '}
              | Digital Business Cards
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
} 