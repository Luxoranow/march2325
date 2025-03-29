import { NextRequest, NextResponse } from 'next/server';
import { generateGoogleWalletPass, PassData } from '@/lib/wallet-pass-utils';

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
    
    // Generate the Google Wallet JWT
    console.log('Generating Google Wallet pass for:', passData.name);
    const jwt = await generateGoogleWalletPass(passData);
    
    // Return the JWT for the client to use with Google Pay API
    return NextResponse.json({
      jwt,
      saveUrl: `https://pay.google.com/gp/v/save/${jwt}`
    });
  } catch (error: any) {
    console.error('Error generating Google Wallet pass:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate Google Wallet pass', details: error.message },
      { status: 500 }
    );
  }
} 