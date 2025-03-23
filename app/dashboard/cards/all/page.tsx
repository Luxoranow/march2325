'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import { generateQRCodeURL, downloadQRCode, getCardShareableURL } from '@/lib/qrcode-utils';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Toolbar, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip
} from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface BusinessCard {
  id: string;
  user_id: string;
  name: string;
  data: {
    personal: {
      name: string;
      title: string;
      email: string;
      phone: string;
      photo: string | null;
    };
    company: {
      name: string;
      address: string;
      phone: string;
      fax: string;
      website: string;
      logo: string | null;
    };
    socials: Array<{ id: string; platform: string; url: string }>;
    messaging: Array<{ id: string; platform: string; contact: string }>;
    custom: Array<{ id: string; label: string; url: string }>;
    theme: string;
  };
  created_at: string;
  updated_at: string;
}

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

export default function AllCardsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cards, setCards] = useState<BusinessCard[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [showUpgradeAlert, setShowUpgradeAlert] = useState(false);
  const [cardLimitReached, setCardLimitReached] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<BusinessCard | null>(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        await fetchCards(user.id);
        await fetchSubscription(user.id);
      } catch (err) {
        console.error('Error checking authentication:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

  const fetchSubscription = async (userId: string) => {
    try {
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

  const fetchCards = async (userId: string) => {
    try {
      setCardsLoading(true);
      
      // Define sample cards that can be used as fallback
      const sampleCards: BusinessCard[] = [
        {
          id: '1',
          user_id: userId,
          name: 'Sample Card',
          data: {
            personal: {
              name: 'John Doe',
              title: 'Marketing Director',
              email: 'john@example.com',
              phone: '555-123-4567',
              photo: null,
            },
            company: {
              name: 'Acme Inc',
              address: '123 Main St',
              phone: '555-987-6543',
              fax: '555-987-6544',
              website: 'www.acme.com',
              logo: null,
            },
            socials: [],
            messaging: [],
            custom: [],
            theme: 'Classic'
          },
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      // Fetch actual cards from Supabase
      const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching cards:', error);
        // If there's an error, use sample cards for demo purposes
        setCards(sampleCards);
        setCardsLoading(false);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert the data to match our BusinessCard type
        const typedCards: BusinessCard[] = data.map(card => ({
          id: card.id as string,
          user_id: card.user_id as string,
          name: card.name as string,
          data: card.data as any,
          created_at: card.created_at as string,
          updated_at: card.updated_at as string
        }));
        
        setCards(typedCards);
      } else {
        // If the user has no cards, provide a sample card
        setCards(sampleCards);
      }
      
      // Check if user has reached the card limit based on subscription
      if (subscription?.plan_id === 'free' && cards.length >= 1) {
        setCardLimitReached(true);
      }
      
      setCardsLoading(false);
    } catch (err) {
      console.error('Error fetching cards:', err);
      // Define sample cards again in case of error
      const sampleCards: BusinessCard[] = [
        {
          id: '1',
          user_id: userId,
          name: 'Sample Card',
          data: {
            personal: {
              name: 'John Doe',
              title: 'Marketing Director',
              email: 'john@example.com',
              phone: '555-123-4567',
              photo: null,
            },
            company: {
              name: 'Acme Inc',
              address: '123 Main St',
              phone: '555-987-6543',
              fax: '555-987-6544',
              website: 'www.acme.com',
              logo: null,
            },
            socials: [],
            messaging: [],
            custom: [],
            theme: 'Classic'
          },
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      setCards(sampleCards);
      setCardsLoading(false);
    }
  };

  const handleCreateCard = () => {
    // Check if user is on free plan and has reached the limit
    if (subscription?.plan_id === 'free' && cardLimitReached) {
      setShowUpgradeAlert(true);
    } else {
      router.push('/dashboard/cards/new');
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleEditCard = (cardId: string) => {
    router.push(`/dashboard/cards/edit/${cardId}`);
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);
      
      if (error) {
        console.error('Error deleting card:', error);
        return;
      }
      
      // Remove card from state
      setCards(cards.filter(card => card.id !== cardId));
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  const handleViewCard = (cardId: string) => {
    // Open the card in a new tab
    window.open(`/c/${cardId}`, '_blank');
  };

  const handleShowQRCode = (card: BusinessCard) => {
    setSelectedCard(card);
    setQrDialogOpen(true);
  };

  const handleCloseQRDialog = () => {
    setQrDialogOpen(false);
    setSelectedCard(null);
  };

  const handleDownloadQRCode = async () => {
    if (!selectedCard) return;
    
    try {
      await downloadQRCode(selectedCard.id, selectedCard.name || selectedCard.data.personal.name || 'card');
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleCopyLink = () => {
    if (!selectedCard) return;
    
    const url = getCardShareableURL(selectedCard.id);
    navigator.clipboard.writeText(url)
      .then(() => {
        setShowCopyAlert(true);
        setTimeout(() => setShowCopyAlert(false), 3000);
      })
      .catch(err => {
        console.error('Error copying link:', err);
      });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.1em'
            }}
          >
            YOUR DIGITAL CARDS
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateCard}
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
            NEW CARD
          </Button>
        </Box>
        
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
            You are currently on the FREE plan (1 card only). Upgrade to unlock premium features: multiple cards, virtual vibes, analytics, contact exports, and team management.
          </Alert>
        )}
        
        <Snackbar 
          open={showUpgradeAlert} 
          autoHideDuration={6000} 
          onClose={() => setShowUpgradeAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowUpgradeAlert(false)} 
            severity="warning"
            sx={{ 
              width: '100%',
              borderRadius: 0,
              '& .MuiAlert-message': {
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }
            }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleUpgrade}
                sx={{ 
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em'
                }}
              >
                UPGRADE NOW
              </Button>
            }
          >
            You've reached the limit of 1 card on the free plan. Upgrade to create multiple cards and access premium features.
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={showCopyAlert} 
          autoHideDuration={3000} 
          onClose={() => setShowCopyAlert(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={() => setShowCopyAlert(false)} 
            severity="success"
            sx={{ 
              width: '100%',
              borderRadius: 0
            }}
          >
            Link copied to clipboard!
          </Alert>
        </Snackbar>
        
        {cardsLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : cards.length > 0 ? (
          <Grid container spacing={3}>
            {cards.map((card) => (
              <Grid item xs={12} sm={6} md={4} key={card.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: 0,
                    border: '1px solid #000000'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {card.name || card.data.personal.name || 'Untitled Card'}
                      </Typography>
                      <Tooltip title="Show QR Code">
                        <IconButton 
                          size="small" 
                          onClick={() => handleShowQRCode(card)}
                          sx={{ color: '#000000' }}
                        >
                          <QrCodeIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.data.personal.title || 'No Title'}
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(card.created_at)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Theme: {card.data.theme}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', p: 1, borderTop: '1px solid #f0f0f0' }}>
                    <Tooltip title="View Card">
                      <IconButton 
                        size="small"
                        onClick={() => handleViewCard(card.id)}
                        sx={{ color: '#000000' }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Share Card">
                      <IconButton 
                        size="small"
                        onClick={() => handleShowQRCode(card)}
                        sx={{ color: '#000000' }}
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Card">
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditCard(card.id)}
                        sx={{ color: '#000000' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Card">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteCard(card.id)}
                        sx={{ color: '#ff0000' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <QrCodeIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No Cards Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Create your first digital business card to get started.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateCard}
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
                CREATE CARD
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* QR Code Dialog */}
        <Dialog 
          open={qrDialogOpen} 
          onClose={handleCloseQRDialog}
          PaperProps={{ 
            sx: { 
              borderRadius: 0,
              maxWidth: 400
            } 
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid #eee',
            fontFamily: 'monospace',
            letterSpacing: '0.05em',
            fontWeight: 'bold'
          }}>
            SHARE YOUR CARD
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 1 }}>
            {selectedCard && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                  <Box 
                    component="img"
                    src={generateQRCodeURL(selectedCard.id)}
                    alt={`QR Code for ${selectedCard.name || selectedCard.data.personal.name}`}
                    sx={{ 
                      width: 200,
                      height: 200,
                      border: '1px solid #eee',
                      p: 1
                    }}
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
                  {selectedCard.name || selectedCard.data.personal.name || 'Your Card'}
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={getCardShareableURL(selectedCard.id)}
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton 
                          edge="end" 
                          onClick={handleCopyLink}
                          size="small"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 0
                      }
                    }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Share this link or scan the QR code to view your digital business card.
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ borderTop: '1px solid #eee', p: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon />}
              onClick={handleDownloadQRCode}
              sx={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#333333'
                },
                mr: 1,
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              DOWNLOAD QR
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleCloseQRDialog}
              sx={{ 
                borderColor: '#000000',
                color: '#000000',
                borderRadius: 0,
                '&:hover': {
                  borderColor: '#333333',
                  backgroundColor: '#f5f5f5'
                },
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              CLOSE
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
} 