'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import DashboardNavbar from '@/components/dashboard/DashboardNavbar';
import CardEditor from '@/components/editor/CardEditor';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Toolbar,
  Button,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function MasterTemplatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [isTeamOwner, setIsTeamOwner] = useState(true); // Default to true for now
  
  useEffect(() => {
    setMounted(true);
    
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
        
        // Here you would check if the user is a team owner
        // For now, we'll assume they are for simplicity
        setIsTeamOwner(true);
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      }
    };
    
    checkUser();
  }, [router]);

  const handleBackToTeam = () => {
    router.push('/dashboard/team');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isTeamOwner) {
    return (
      <Box sx={{ display: 'flex' }}>
        <DashboardNavbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - 240px)` },
            ml: { sm: '240px' },
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
          }}
        >
          <Toolbar />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={handleBackToTeam}
              sx={{ 
                mr: 2,
                color: '#000000',
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
              }}
            >
              BACK TO TEAM
            </Button>
            <Typography 
              variant="h6" 
              component="h1" 
              sx={{ 
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                fontWeight: 'bold'
              }}
            >
              MASTER TEMPLATE
            </Typography>
          </Box>
          
          <Alert severity="warning" sx={{ mb: 4 }}>
            Only team owners can create and edit master templates.
          </Alert>
        </Box>
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
        
        <Box sx={{ mb: 5, mt: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackToTeam}
            sx={{ 
              mb: 3,
              color: '#000000',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              borderRadius: 0,
              textTransform: 'uppercase',
              padding: '4px 0'
            }}
          >
            Back to Team
          </Button>
          
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              mb: 2.5,
              fontFamily: 'monospace',
            }}
          >
            Master Template
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              maxWidth: '800px', 
              lineHeight: 1.6,
              fontFamily: 'system-ui',
              color: '#333',
              mb: 4
            }}
          >
            Keep it cute and consistent. Set the vibe for your whole team—lock in your logo, colors, links, and deets so everyone's card stays on-brand and on-point.
          </Typography>
        </Box>
        
        {mounted && <CardEditor isMasterTemplate={true} />}
      </Box>
    </>
  );
} 