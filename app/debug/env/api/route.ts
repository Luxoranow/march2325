import { NextRequest, NextResponse } from 'next/server';

// This is a secure API route that will only be accessible in development mode
// It will return the full Supabase key for debugging purposes
export async function GET(request: NextRequest) {
  // Only allow this in development mode
  if (process.env.NODE_ENV !== 'development' && process.env.ALLOW_ENV_DEBUG !== 'true') {
    return NextResponse.json({ 
      error: 'This endpoint is only available in development mode' 
    }, { status: 403 });
  }

  try {
    // Return environment variables for debugging
    const envData = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set (hidden)' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      RENDER_INTERNAL_URL: process.env.RENDER_INTERNAL_URL,
    };
    
    return NextResponse.json({ env: envData });
  } catch (error) {
    console.error('Error in debug API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 