'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { USE_TEST_SUBSCRIPTION, getTestSubscription } from '@/lib/subscription-helper';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Toolbar,
  Button,
  Grid,
  TextField,
  Tab,
  Tabs,
  Card,
  CardMedia,
  CardActionArea,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  SelectChangeEvent,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import MoodIcon from '@mui/icons-material/Mood';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { QRCodeSVG } from 'qrcode.react';
import { createRoot } from 'react-dom/client';
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

interface BackgroundImage {
  id: number;
  url: string;
}

interface Card {
  id: string;
  name: string;
  qrUrl: string;
  data?: any;
}

export default function VibesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [userCards, setUserCards] = useState<Card[]>([]);
  const [imageError, setImageError] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(false);
  const backgroundRef = useRef<HTMLImageElement>(null);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeAction, setUpgradeAction] = useState<string>('');

  // Background images - in production, these would be stored in a database or CDN
  const backgroundImages: BackgroundImage[] = Array.from({ length: 21 }, (_, i) => ({
    id: i + 1,
    url: `/backgrounds/${i + 1}.jpg`
  }));

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
        await fetchUserCards(user.id);
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

  const fetchUserCards = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('cards')
        .select('id, name, data')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user cards:', error);
        return;
      }
      
      // Transform the data to include QR URLs and card data
      const cardsWithQrUrls = data?.map(card => ({
        id: card.id as string,
        name: card.name as string,
        qrUrl: `https://luxora.app/card/${card.id}`,
        data: card.data as any
      })) || [];
      
      // Add a fallback card if none exist
      if (cardsWithQrUrls.length === 0) {
        cardsWithQrUrls.push({
          id: 'demo',
          name: 'Demo Card',
          qrUrl: 'https://luxora.app/card/demo',
          data: {
            personal: {
              name: 'Demo User',
              title: 'Demo Title',
              email: 'demo@example.com',
              phone: '123-456-7890',
              photo: null
            },
            company: {
              name: 'Demo Company',
              address: '123 Demo St',
              phone: '123-456-7890',
              fax: '',
              website: 'https://example.com',
              logo: null
            },
            socials: [],
            messaging: [],
            custom: [],
            theme: 'Classic'
          }
        });
      }
      
      setUserCards(cardsWithQrUrls);
      
      // Set the selected card ID to the first card's ID
      if (cardsWithQrUrls.length > 0) {
        setSelectedCard(cardsWithQrUrls[0].id);
      }
    } catch (err) {
      console.error('Error fetching user cards:', err);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleBackgroundSelect = (id: number) => {
    // Allow viewing backgrounds for all users, but show upgrade modal for free users
    // when they try to select more than the first 3 backgrounds
    if (subscription?.plan_id === 'free' && id > 3) {
      setUpgradeAction('select background');
      setShowUpgradeModal(true);
      return;
    }
    
    setSelectedBackground(id);
    setImageError(false); // Reset error state when selecting a new background
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleCardSelect = (event: SelectChangeEvent) => {
    setSelectedCard(event.target.value);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleDownload = () => {
    // First check if both a background and card are selected
    if (!selectedBackground || !selectedCard) {
      alert('Please select both a background and a card before downloading.');
      return;
    }

    // Check if user is on free plan
    if (subscription?.plan_id === 'free') {
      // Show upgrade modal instead of downloading
      setUpgradeAction('download');
      setShowUpgradeModal(true);
      return;
    }
    
    // Continue with normal download logic for premium users
    setDownloadDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDownloadDialogOpen(false);
  };

  const getSelectedCardQrUrl = () => {
    if (!selectedCard) return generateVCardData(null);
    
    const card = userCards.find(c => c.id === selectedCard);
    return card ? generateVCardData(card.data) : generateVCardData(null);
  };

  const generateVCardData = (cardData: any) => {
    if (!cardData) {
      // Return a basic vCard for demo purposes with simpler format
      return 'BEGIN:VCARD\r\nVERSION:3.0\r\nFN:Demo User\r\nTEL:123-456-7890\r\nEMAIL:demo@example.com\r\nORG:Demo Company\r\nEND:VCARD';
    }
    
    // Start vCard - use \r\n for better compatibility
    let vCard = 'BEGIN:VCARD\r\nVERSION:3.0\r\n';
    
    // Add personal information with proper escaping
    // Name is the most important field for contact recognition
    if (cardData.personal.name) vCard += `FN:${escapeVCardValue(cardData.personal.name)}\r\n`;
    
    // Add structured name if available - this helps with contact recognition
    if (cardData.personal.name) {
      const nameParts = cardData.personal.name.split(' ');
      let lastName = '';
      let firstName = '';
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length >= 2) {
        firstName = nameParts[0];
        lastName = nameParts[nameParts.length - 1];
      }
      
      vCard += `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;\r\n`;
    }
    
    // Add phone number - this is critical for contact recognition
    if (cardData.personal.phone) vCard += `TEL;TYPE=CELL:${escapeVCardValue(cardData.personal.phone)}\r\n`;
    
    // Add email - also important for recognition
    if (cardData.personal.email) vCard += `EMAIL:${escapeVCardValue(cardData.personal.email)}\r\n`;
    
    // Add title
    if (cardData.personal.title) vCard += `TITLE:${escapeVCardValue(cardData.personal.title)}\r\n`;
    
    // Add company information
    if (cardData.company.name) vCard += `ORG:${escapeVCardValue(cardData.company.name)}\r\n`;
    
    // Add address - simplified format
    if (cardData.company.address) vCard += `ADR:;;${escapeVCardValue(cardData.company.address)};;;;\r\n`;
    
    // Add company phone
    if (cardData.company.phone) vCard += `TEL;TYPE=WORK:${escapeVCardValue(cardData.company.phone)}\r\n`;
    
    // Add website - simplified
    if (cardData.company.website) {
      let website = cardData.company.website;
      if (website && !website.startsWith('http://') && !website.startsWith('https://')) {
        website = 'https://' + website;
      }
      vCard += `URL:${escapeVCardValue(website)}\r\n`;
    }
    
    // End vCard
    vCard += 'END:VCARD';
    
    return vCard;
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

  const getBackgroundUrl = () => {
    if (!selectedBackground) return '/backgrounds/placeholder.jpg';
    
    // Use the actual file naming convention in the backgrounds folder
    return `/backgrounds/${selectedBackground}.jpg`;
  };

  // Add the handlePerformDownload function for actually performing the download
  const handlePerformDownload = () => {
    if (!selectedBackground || !selectedCard) {
      alert('Please select both a background and a card before downloading.');
      return;
    }
    
    setDownloadProgress(true);
    
    // Create a canvas to combine the background and QR code
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      alert('Your browser does not support canvas operations. Please try a different browser.');
      setDownloadProgress(false);
      return;
    }
    
    // Get the vCard data for the selected card
    const vCardData = getSelectedCardQrUrl();
    
    // First, create a QR code SVG using the library we already have
    const qrCodeDiv = document.createElement('div');
    qrCodeDiv.style.position = 'absolute';
    qrCodeDiv.style.left = '-9999px';
    document.body.appendChild(qrCodeDiv);
    
    // Render the QR code to the hidden div using React 18's createRoot
    const qrSize = 200;
    const root = createRoot(qrCodeDiv);
    root.render(
      <QRCodeSVG
        value={vCardData}
        size={qrSize}
        bgColor={'#ffffff'}
        fgColor={'#000000'}
        level={'H'}
        includeMargin={true}
      />
    );
    
    // Wait a moment for the QR code to render
    setTimeout(() => {
      // Create a data URL from the SVG
      const svgElement = qrCodeDiv.querySelector('svg');
      if (!svgElement) {
        root.unmount();
        document.body.removeChild(qrCodeDiv);
        alert('Failed to generate QR code. Please try again.');
        setDownloadProgress(false);
        return;
      }
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const qrDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
      
      // Load the background image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Set canvas dimensions to match the image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw the background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create QR code image
        const qrImage = new Image();
        qrImage.onload = () => {
          // Create a temporary canvas for the QR code with label
          const qrCanvas = document.createElement('canvas');
          const qrCtx = qrCanvas.getContext('2d');
          if (!qrCtx) {
            root.unmount();
            document.body.removeChild(qrCodeDiv);
            alert('Failed to create QR code canvas');
            setDownloadProgress(false);
            return;
          }
          
          // Set QR code canvas size
          qrCanvas.width = 240;
          qrCanvas.height = 280;
          
          // Fill with white background
          qrCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          qrCtx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
          
          // Draw border
          qrCtx.strokeStyle = '#000000';
          qrCtx.lineWidth = 2;
          qrCtx.strokeRect(0, 0, qrCanvas.width, qrCanvas.height);
          
          // Add "SCAN TO SAVE" text
          qrCtx.fillStyle = '#000000';
          qrCtx.font = 'bold 12px monospace';
          qrCtx.textAlign = 'center';
          qrCtx.fillText('SCAN TO SAVE', qrCanvas.width / 2, 20);
          
          // Draw QR code centered in the white box
          qrCtx.drawImage(qrImage, (qrCanvas.width - qrSize) / 2, 30, qrSize, qrSize);
          
          // Draw QR code canvas on main canvas (top right corner)
          const padding = 40;
          ctx.drawImage(qrCanvas, canvas.width - qrCanvas.width - padding, padding);
          
          // Clean up the temporary div
          root.unmount();
          document.body.removeChild(qrCodeDiv);
          
          // Convert canvas to data URL and trigger download
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            
            // Create download link
            const downloadLink = document.createElement('a');
            const fileName = `luxora-background-${selectedBackground}-${title || 'untitled'}.jpg`;
            
            downloadLink.href = dataUrl;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            setDownloadProgress(false);
            setDownloadDialogOpen(false);
          } catch (error) {
            console.error('Error creating download:', error);
            alert('Failed to generate the download. Please try a different browser or background image.');
            setDownloadProgress(false);
          }
        };
        
        // Set source for QR code image using the data URL we created
        qrImage.src = qrDataUrl;
        
        qrImage.onerror = () => {
          root.unmount();
          document.body.removeChild(qrCodeDiv);
          console.error('Failed to load QR code image');
          alert('Failed to generate QR code. Please try again.');
          setDownloadProgress(false);
        };
      };
      
      img.onerror = () => {
        root.unmount();
        document.body.removeChild(qrCodeDiv);
        alert('Failed to load the background image. Please try a different background.');
        setDownloadProgress(false);
      };
      
      // Use a local path to avoid CORS issues
      img.src = getBackgroundUrl();
    }, 100); // Small delay to ensure the QR code is rendered
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

  // For production, we'll still check the subscription status
  // But instead of completely blocking access, we'll show the interface with upgrade prompts
  const isFreeUser = subscription?.plan_id === 'free';

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
          VIRTUAL VIBES
        </Typography>
        
        {/* Show feature description and upgrade banner for free users */}
        {isFreeUser && (
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
            You're previewing Virtual Vibes in demo mode. Upgrade to GLOW UP to unlock all backgrounds and download functionality.
          </Alert>
        )}
        
        {/* Main content area - shown to all users */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="subtitle1" sx={{ mb: 3 }}>
            Create custom backgrounds with your QR code for virtual meetings. Select a background, add your digital card QR code, and download for use in Zoom, Teams, or other video conferencing platforms.
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              {/* Left column - Editor */}
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  1. CUSTOMIZE YOUR BACKGROUND
                </Typography>
                
                <TextField
                  fullWidth
                  label="Title"
                  variant="outlined"
                  value={title}
                  onChange={handleTitleChange}
                  margin="normal"
                  sx={{ mb: 3 }}
                />
                
                <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                  <InputLabel id="card-select-label">Assign to Card</InputLabel>
                  <Select
                    labelId="card-select-label"
                    value={selectedCard || ''}
                    onChange={handleCardSelect}
                    label="Assign to Card"
                  >
                    {userCards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {card.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ mb: 3 }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    sx={{
                      borderBottom: 1,
                      borderColor: 'divider',
                      '& .MuiTab-root': {
                        fontFamily: 'monospace',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      },
                    }}
                  >
                    <Tab label="Background Images" />
                    <Tab label="Details" />
                  </Tabs>
                </Box>
                
                <Button
                  variant="contained"
                  onClick={handleDownload}
                  startIcon={<DownloadIcon />}
                  fullWidth
                  disabled={!selectedBackground || !selectedCard}
                  sx={{ 
                    mt: 3, 
                    borderRadius: 0,
                    py: 1.5,
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    letterSpacing: '0.05em',
                    '&:hover': {
                      backgroundColor: '#333333',
                    }
                  }}
                >
                  DOWNLOAD BACKGROUND
                </Button>
              </Grid>
              
              {/* Right column - Preview */}
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  2. PREVIEW
                </Typography>
                
                <Box 
                  ref={backgroundRef}
                  sx={{ 
                    position: 'relative',
                    width: '100%',
                    height: 0,
                    paddingBottom: '56.25%', // 16:9 aspect ratio
                    backgroundColor: '#f5f5f5',
                    border: '1px solid #000000'
                  }}
                >
                  {/* Background Image */}
                  <Box
                    component="img"
                    src={getBackgroundUrl()}
                    alt="Virtual Meeting Background"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={() => setImageError(true)}
                  />
                  
                  {/* Title overlay at the bottom */}
                  {title && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        padding: 1.5,
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}
                    >
                      {title}
                    </Box>
                  )}
                  
                  {/* QR Code */}
                  <Box
                    ref={qrCodeRef}
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      padding: 1.5,
                      border: '1px solid #000',
                      maxWidth: '100px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontFamily: 'monospace', fontSize: '0.6rem', textAlign: 'center', fontWeight: 'bold' }}>
                      SCAN TO SAVE
                    </Typography>
                    <QRCodeSVG
                      value={getSelectedCardQrUrl()}
                      size={80}
                      bgColor={'#ffffff'}
                      fgColor={'#000000'}
                      level={'H'}
                      includeMargin={true}
                      className="qrcode"
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
          
          {/* Background Image Gallery */}
          <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
            <Typography variant="subtitle1" gutterBottom>
              Select a background image:
            </Typography>
            
            <Grid container spacing={2}>
              {backgroundImages.map((bg, index) => (
                <Grid item xs={6} sm={4} md={3} key={bg.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      height: 140, 
                      cursor: 'pointer',
                      position: 'relative',
                      border: selectedBackground === bg.id ? '3px solid #000000' : '1px solid #e0e0e0',
                      opacity: isFreeUser && index > 2 ? 0.7 : 1,
                    }}
                    onClick={() => handleBackgroundSelect(bg.id)}
                  >
                    {/* Lock overlay for premium backgrounds for free users */}
                    {isFreeUser && index > 2 && (
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'column'
                        }}
                      >
                        <LockIcon sx={{ color: 'white', fontSize: '1.5rem', mb: 0.5 }} />
                        <Typography variant="caption" sx={{ color: 'white', fontFamily: 'monospace' }}>
                          PREMIUM
                        </Typography>
                      </Box>
                    )}
                    
                    <CardActionArea sx={{ height: '100%' }}>
                      <Box
                        component="img"
                        src={bg.url}
                        alt={`Background ${bg.id}`}
                        onError={(e) => {
                          // Fallback to a placeholder on error
                          (e.target as HTMLImageElement).src = '/backgrounds/placeholder.jpg';
                        }}
                        sx={{ 
                          height: '100%', 
                          width: '100%', 
                          objectFit: 'cover',
                          backgroundColor: '#f5f5f5'
                        }}
                      />
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          <Box sx={{ mt: 3, display: activeTab === 1 ? 'block' : 'none' }}>
            <Typography variant="body2" paragraph>
              Additional settings for your virtual background will appear here.
            </Typography>
          </Box>
        </Box>
        
        {/* Download Dialog */}
        <Dialog
          open={downloadDialogOpen}
          onClose={() => setDownloadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            DOWNLOAD BACKGROUND
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" paragraph>
              Your custom background is ready to download. Click the button below to get your image file.
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: 2 }}>
              How to use this background:
            </Typography>
            <ol>
              <li>Download the image</li>
              <li>Open your video conference app (Zoom, Teams, etc.)</li>
              <li>Go to settings and select "Virtual Background"</li>
              <li>Upload or select your custom background</li>
            </ol>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDownloadDialogOpen(false)}
              sx={{ fontFamily: 'monospace' }}
            >
              CANCEL
            </Button>
            <Button 
              variant="contained"
              onClick={handlePerformDownload}
              startIcon={<DownloadIcon />}
              disabled={downloadProgress}
              sx={{ 
                fontFamily: 'monospace',
                borderRadius: 0,
                backgroundColor: '#000000',
                '&:hover': {
                  backgroundColor: '#333333'
                }
              }}
            >
              {downloadProgress ? 'PROCESSING...' : 'DOWNLOAD NOW'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Upgrade Modal */}
        <Dialog
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
            UNLOCK PREMIUM FEATURE
          </DialogTitle>
          <DialogContent dividers>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <LockIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Premium Feature
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {upgradeAction === 'download' 
                  ? 'Downloading custom backgrounds is available exclusively with our premium plans.' 
                  : 'Access to our full library of professional backgrounds is available with our premium plans.'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, fontStyle: 'italic' }}>
                Upgrade to GLOW UP to unlock all Virtual Vibes features, plus multiple cards, advanced analytics, and more!
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