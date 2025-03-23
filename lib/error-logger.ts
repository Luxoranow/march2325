// Simple error logging utility for client-side errors
// Can be expanded later to send errors to a monitoring service

/**
 * Logs errors to console and can be configured to send to error monitoring services
 * @param error The error object
 * @param errorInfo Additional information about the error context
 */
export function logError(error: Error, errorInfo: any): void {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Error Info:', errorInfo);
  }
  
  // In production, you might want to send this to an error monitoring service
  // like Sentry, LogRocket, etc.
  // Example with Sentry (would require @sentry/browser to be installed):
  // if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
  //   import('@sentry/browser').then(Sentry => {
  //     Sentry.captureException(error, { extra: errorInfo });
  //   });
  // }
} 