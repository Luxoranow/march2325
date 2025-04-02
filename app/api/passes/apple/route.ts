import { NextRequest, NextResponse } from 'next/server';
import { generateAppleWalletPass, PassData } from '@/lib/wallet-pass-utils';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.id || !data.name) {
      return NextResponse.json(
        { error: 'Missing required fields (id, name)' },
        { status: 400 }
      );
    }
    
    // Prepare pass data from request
    const passData: PassData = {
      id: data.id,
      name: data.personal?.name || data.name,
      title: data.personal?.title || data.title || '',
      companyName: data.company?.name || data.companyName || '',
      email: data.personal?.email || data.email || '',
      phone: data.personal?.phone || data.phone || '',
      website: data.company?.website || data.website || '',
      logoUrl: data.company?.logo || data.logoUrl || '',
      photoUrl: data.personal?.photo || data.photoUrl || '',
      themeColor: data.theme || data.themeColor || '#000000'
    };
    
    // Generate the pass
    console.log('Generating Apple Wallet pass for:', passData.name);
    const passBuffer = await generateAppleWalletPass(passData);
    
    // Check if this is a mock pass by looking at its content (since it's JSON)
    let isMockPass = false;
    try {
      const mockCheck = JSON.parse(passBuffer.toString());
      isMockPass = mockCheck.format === 'mock';
    } catch (e) {
      // Not JSON, so it's a real pass
      isMockPass = false;
    }
    
    if (isMockPass) {
      // If it's a mock pass, return a JSON response
      return NextResponse.json(
        JSON.parse(passBuffer.toString()),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    } else {
      // Return the real pass file
      return new NextResponse(passBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.pkpass',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(passData.name.replace(/\s+/g, '-').toLowerCase())}-business-card.pkpass"`,
          'Content-Length': passBuffer.length.toString()
        }
      });
    }
  } catch (error: any) {
    console.error('Error generating Apple Wallet pass:', error);
    
    // Provide a more specific error message for certificate issues
    if (error.message && error.message.includes('Certificates directory not found')) {
      return NextResponse.json(
        { 
          error: 'Apple Wallet pass generation not configured', 
          details: 'The server is not yet configured to generate Apple Wallet passes. Please contact support for more information.'
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate Apple Wallet pass', details: error.message },
      { status: 500 }
    );
  }
} 