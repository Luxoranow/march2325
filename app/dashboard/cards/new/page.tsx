'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Toolbar, Typography, Button } from '@mui/material';
import CardEditor from '../../../../components/editor/CardEditor';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function NewCardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Use effect for client-side only code
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackToAllCards = () => {
    router.push('/dashboard/cards/all');
  };

  if (!mounted) {
    return null; // Return nothing during server-side rendering
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
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 'bold',
                letterSpacing: '0.1em'
              }}
            >
              CREATE YOUR DIGITAL CARD
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, maxWidth: '600px', lineHeight: 1.6 }}>
              Ditch the paper. Tap into the future. Build your digital card in seconds and flex your info like a pro—QR code and all. It's giving modern.
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToAllCards}
            sx={{ 
              borderRadius: 0,
              fontFamily: 'monospace',
              letterSpacing: '0.05em'
            }}
          >
            Back to All Cards
          </Button>
        </Box>
        
        {mounted && <CardEditor />}
      </Box>
    </>
  );
} 