'use client';

import { Component, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { logError } from '@/lib/error-logger';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '70vh',
            textAlign: 'center',
            py: 8
          }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '600px' }}>
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.href = '/'}
              sx={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#333333'
                },
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                fontWeight: 'bold'
              }}
            >
              RETURN TO HOME
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
} 