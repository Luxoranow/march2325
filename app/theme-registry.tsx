'use client';

import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ReactNode } from 'react';
import { Roboto_Mono } from 'next/font/google';

// Load Roboto Mono font
const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

// Create a theme instance with Severance-inspired retro-futuristic aesthetic
let theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1a1a1a',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    error: {
      main: '#cc0000',
    },
    background: {
      default: '#f0f0f0',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
      secondary: '#333333',
    },
    divider: '#cccccc',
  },
  typography: {
    fontFamily: robotoMono.style.fontFamily,
    h1: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
    button: {
      fontWeight: 500,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    body1: {
      letterSpacing: '0.01em',
    },
    body2: {
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 0, // Sharp corners for retro look
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Add subtle scan lines effect
          backgroundImage: 
            'linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
          backgroundSize: '100% 2px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid #000000',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          backgroundColor: '#000000',
          color: '#ffffff',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #000000',
        },
        elevation1: {
          boxShadow: 'none',
          border: '1px solid #000000',
        },
        elevation2: {
          boxShadow: 'none',
          border: '1px solid #000000',
        },
        elevation3: {
          boxShadow: 'none',
          border: '1px solid #000000',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderWidth: '1px',
              borderColor: '#000000',
            },
            '&:hover fieldset': {
              borderWidth: '1px',
              borderColor: '#000000',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
              borderColor: '#000000',
            },
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #000000',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #000000',
          minHeight: 56,
          '&.Mui-expanded': {
            minHeight: 56,
            backgroundColor: '#000000',
            color: '#ffffff',
          },
        },
        content: {
          '&.Mui-expanded': {
            margin: '12px 0',
          },
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: '16px',
          borderTop: '1px solid rgba(0, 0, 0, .125)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            backgroundColor: '#ffffff',
            color: '#000000',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '& .MuiListItemIcon-root': {
              color: '#000000',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#333333',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #000000',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          '&:last-child': {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 0,
          backgroundColor: '#000000',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          height: 10,
        },
      },
    },
  },
});

// Make typography responsive
theme = responsiveFontSizes(theme);

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
} 