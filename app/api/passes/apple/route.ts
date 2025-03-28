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
    
    // Return the pass file
    return new NextResponse(passBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(passData.name.replace(/\s+/g, '-').toLowerCase())}-business-card.pkpass"`,
        'Content-Length': passBuffer.length.toString()
      }
    });
  } catch (error: any) {
    console.error('Error generating Apple Wallet pass:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate Apple Wallet pass', details: error.message },
      { status: 500 }
    );
  }
} 