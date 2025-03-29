import { NextRequest, NextResponse } from 'next/server';
import { detectWalletType } from '@/lib/wallet-pass-utils';

export async function POST(request: NextRequest) {
  try {
    // Get the user agent to determine device type
    const userAgent = request.headers.get('user-agent') || '';
    const walletType = detectWalletType(userAgent);
    
    // Redirect to the appropriate wallet API based on device
    if (walletType === 'apple') {
      // Forward to Apple Wallet API
      const response = await fetch(new URL('/api/passes/apple', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: request.body
      });
      
      return response;
    } else if (walletType === 'google') {
      // Forward to Google Wallet API
      const response = await fetch(new URL('/api/passes/google', request.url), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: request.body
      });
      
      return response;
    } else {
      // Device not supported
      return NextResponse.json(
        { 
          error: 'Wallet pass not supported on this device',
          supportedDevices: 'iOS devices (Apple Wallet) and Android devices (Google Wallet)'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error processing wallet pass request:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate wallet pass', details: error.message },
      { status: 500 }
    );
  }
}

// Support OPTIONS for CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  );
} 