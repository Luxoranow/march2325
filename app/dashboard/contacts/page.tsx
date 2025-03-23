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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Avatar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import CsvIcon from '@mui/icons-material/Description';
import ExcelIcon from '@mui/icons-material/TableChart';
import PdfIcon from '@mui/icons-material/PictureAsPdf';

// Define interfaces
interface Contact {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone?: string;
  dateAdded: string;
  source: 'Exchanged' | 'Imported' | 'Manual';
  avatar?: string;
  initials?: string;
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

// Mock data for contacts
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Mark Scout',
    jobTitle: 'Department Head',
    company: 'Lumon Industries',
    email: 'mark.s@lumon.com',
    dateAdded: '2025-01-29',
    source: 'Exchanged',
    initials: 'MS'
  },
  {
    id: '2',
    name: 'Helly Riggs',
    jobTitle: 'Macrodata Refinement',
    company: 'Lumon Industries',
    email: 'helly.r@lumon.com',
    dateAdded: '2025-01-26',
    source: 'Exchanged',
    initials: 'HR'
  },
  {
    id: '3',
    name: 'Dylan George',
    jobTitle: 'Macrodata Refinement',
    company: 'Lumon Industries',
    email: 'dylan.g@lumon.com',
    dateAdded: '2025-01-18',
    source: 'Exchanged',
    initials: 'DG'
  },
  {
    id: '4',
    name: 'Irving Bailiff',
    jobTitle: 'Macrodata Refinement',
    company: 'Lumon Industries',
    email: 'irving.b@lumon.com',
    dateAdded: '2025-01-18',
    source: 'Exchanged',
    initials: 'IB'
  },
  {
    id: '5',
    name: 'Harmony Cobel',
    jobTitle: 'Department Manager',
    company: 'Lumon Industries',
    email: 'harmony.c@lumon.com',
    dateAdded: '2025-01-15',
    source: 'Imported',
    initials: 'HC'
  },
  {
    id: '6',
    name: 'Seth Milchick',
    jobTitle: 'Floor Manager',
    company: 'Lumon Industries',
    email: 'seth.m@lumon.com',
    dateAdded: '2025-01-14',
    source: 'Imported',
    initials: 'SM'
  },
  {
    id: '7',
    name: 'Burt Goodman',
    jobTitle: 'Head of Optics & Design',
    company: 'Lumon Industries',
    email: 'burt.g@lumon.com',
    dateAdded: '2025-01-10',
    source: 'Manual',
    initials: 'BG'
  },
  {
    id: '8',
    name: 'Petey Kilmer',
    jobTitle: 'Former Department Head',
    company: 'Lumon Industries',
    email: 'petey.k@lumon.com',
    dateAdded: '2024-12-28',
    source: 'Manual',
    initials: 'PK'
  }
];

export default function ContactsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Contact | null;
    direction: 'asc' | 'desc';
  }>({ key: 'dateAdded', direction: 'desc' });
  
  // Export menu state
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportMenuAnchor);

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
        
        // In a real app, we would fetch contacts from the database
        // For now, we'll use mock data
        setContacts(mockContacts);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, [router]);

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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (key: keyof Contact) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    // In a real app, this would trigger an actual export
    console.log(`Exporting contacts as ${format}`);
    handleExportClose();
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => {
    const searchFields = [
      contact.name,
      contact.jobTitle,
      contact.company,
      contact.email
    ].join(' ').toLowerCase();
    
    return searchFields.includes(searchTerm.toLowerCase());
  });

  // Sort contacts based on sort config
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === bValue) return 0;
    
    // Handle undefined or null values
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;
    
    // For dates, convert to timestamps
    if (sortConfig.key === 'dateAdded') {
      const aDate = new Date(aValue as string).getTime();
      const bDate = new Date(bValue as string).getTime();
      return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
    }
    
    // For strings, use localeCompare
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });

  // Format date to display as shown in the screenshot
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    
    // Add suffix to day (e.g., 1st, 2nd, 3rd, 4th)
    const suffix = (day: number) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    return `${day}${suffix(day)} ${month} ${year}`;
  };

  // Check if user has premium features
  const hasPremiumFeatures = subscription && 
    (subscription.plan_id === 'premium' || subscription.plan_id === 'team') && 
    subscription.status === 'active';

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', letterSpacing: '0.1em', mb: 0 }}>
            CONTACTS
          </Typography>
          
          {hasPremiumFeatures ? (
            <>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                endIcon={<ArrowDropDownIcon />}
                onClick={handleExportClick}
                sx={{
                  backgroundColor: '#000',
                  color: '#fff',
                  borderRadius: 0,
                  fontFamily: 'monospace',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    backgroundColor: '#333',
                  }
                }}
              >
                Export contacts
              </Button>
              <Menu
                anchorEl={exportMenuAnchor}
                open={exportMenuOpen}
                onClose={handleExportClose}
                PaperProps={{
                  sx: {
                    borderRadius: 0,
                    border: '1px solid #000',
                    boxShadow: 'none',
                  }
                }}
              >
                <MenuItem onClick={() => handleExport('csv')}>
                  <ListItemIcon>
                    <CsvIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('excel')}>
                  <ListItemIcon>
                    <ExcelIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as Excel</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>
                  <ListItemIcon>
                    <PdfIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Export as PDF</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<UpgradeIcon />}
              onClick={handleUpgrade}
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: 0,
                fontFamily: 'monospace',
                letterSpacing: '0.05em',
                '&:hover': {
                  backgroundColor: '#333',
                }
              }}
            >
              Upgrade to Export
            </Button>
          )}
        </Box>
        
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 3, 
            fontFamily: 'monospace', 
            letterSpacing: '0.05em',
            maxWidth: '800px'
          }}
        >
          No more "who dis?" moments. Keep all your connections in one place, organized and easy to find. Tap, save, and slide into those follow-ups like a pro.
        </Typography>
        
        {/* Search box */}
        <Box sx={{ mb: 3, maxWidth: 400 }}>
          <TextField
            fullWidth
            placeholder="Search contacts"
            variant="outlined"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              sx: {
                borderRadius: 0,
                backgroundColor: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000',
                }
              }
            }}
          />
        </Box>
        
        {/* Contacts table */}
        <TableContainer component={Paper} sx={{ borderRadius: 0, border: '1px solid #000', boxShadow: 'none' }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell 
                  onClick={() => handleSort('name')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('jobTitle')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Job Title
                    {sortConfig.key === 'jobTitle' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('company')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Company
                    {sortConfig.key === 'company' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('email')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Email
                    {sortConfig.key === 'email' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('dateAdded')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Added
                    {sortConfig.key === 'dateAdded' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
                <TableCell 
                  onClick={() => handleSort('source')}
                  sx={{ 
                    cursor: 'pointer',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid #000'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Source
                    {sortConfig.key === 'source' && (
                      sortConfig.direction === 'asc' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedContacts.length > 0 ? (
                sortedContacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {contact.avatar ? (
                          <Avatar src={contact.avatar} alt={contact.name} sx={{ mr: 2, borderRadius: 0 }} />
                        ) : (
                          <Avatar sx={{ mr: 2, borderRadius: 0, bgcolor: '#000', color: '#fff' }}>
                            {contact.initials || ''}
                          </Avatar>
                        )}
                        {contact.name || '-'}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>{contact.jobTitle}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>{contact.company}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>{contact.email}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>{formatDate(contact.dateAdded)}</TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #eee' }}>
                      <Chip 
                        icon={<CompareArrowsIcon />} 
                        label={contact.source} 
                        sx={{ 
                          borderRadius: 0,
                          backgroundColor: '#f0f0f0',
                          border: '1px solid #ddd',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1" color="text.secondary">
                      No contacts found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {!hasPremiumFeatures && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3, 
              borderRadius: 0,
              border: '1px solid #000',
              '& .MuiAlert-message': {
                fontFamily: 'monospace',
              }
            }}
          >
            Upgrade to our premium plan to export contacts and access advanced contact management features.
          </Alert>
        )}
      </Box>
    </>
  );
} 