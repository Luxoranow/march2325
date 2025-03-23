import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on every request
export function middleware(request: NextRequest) {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  // Log environment variable status on startup (only once)
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Environment Variables Check ===');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Available' : 'MISSING');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Available' : 'MISSING');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Available' : 'MISSING');
    console.log('================================');
  }
  
  // Block access to debug routes in production
  if (process.env.NODE_ENV === 'production' && request.nextUrl.pathname.startsWith('/debug')) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Debug routes are not available in production' }),
      { status: 404, headers: { 'content-type': 'application/json' } }
    );
  }
  
  // Clone the response
  const response = NextResponse.next();
  
  // Add security headers
  const securityHeaders = {
    'X-DNS-Prefetch-Control': 'on',
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.supabase.co; font-src 'self'; connect-src 'self' https://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com;",
  };
  
  // Add the headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}; 