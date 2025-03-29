import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for better permissions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
// Fallback to anon key if service role key is not available (for deployment)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Log configuration for debugging (redacted for security)
console.log('API: Supabase URL available:', !!supabaseUrl);
console.log('API: Supabase Service Key available:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('API: Missing Supabase environment variables!');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// For development/testing - recognize this as a test user ID
const DEFAULT_TEST_USER_ID = '00000000-0000-0000-0000-000000000000';

// Define the card record type
interface CardRecord {
  user_id: string;
  name: string;
  data: any;
  updated_at: string;
  is_template?: boolean;
  id?: string;
  created_at?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const cardData = await request.json();
    
    console.log('API received card data:', {
      ...cardData,
      data: '[REDACTED]' // Don't log the entire data object for privacy/security
    });
    
    // Validate the required fields
    if (!cardData.user_id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (!cardData.data) {
      return NextResponse.json({ error: 'Card data is required' }, { status: 400 });
    }
    
    // Get authentication status
    let authenticated = false;
    let authenticatedUserId = null;

    try {
      // Get the session from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && sessionData?.session?.user) {
        authenticated = true;
        authenticatedUserId = sessionData.session.user.id;
      } else {
        console.log('API: User not authenticated via session');
      }
    } catch (authError) {
      console.error('API: Error checking authentication:', authError);
      // Continue anyway, as we'll validate permissions later
    }
    
    // Make sure the user has permission to save this card
    // Only allow saving if:
    // 1. The user is authenticated and the user_id matches their ID, OR
    // 2. We're in development and using the test user ID
    if (
      !(authenticated && authenticatedUserId === cardData.user_id) && 
      !(process.env.NODE_ENV === 'development' && cardData.user_id === DEFAULT_TEST_USER_ID)
    ) {
      // In development, be more permissive for testing
      if (process.env.NODE_ENV === 'development') {
        console.warn('API: Development mode - allowing save with mismatched user ID');
      } else {
        console.error('API: Permission denied - user ID mismatch');
        return NextResponse.json({ 
          error: 'Permission denied. You can only save cards for your own user ID.'
        }, { status: 403 });
      }
    }
    
    // Prepare the data for insertion/update
    const cardRecord: CardRecord = {
      user_id: cardData.user_id,
      name: cardData.name || 'Untitled Card',
      data: cardData.data,
      updated_at: new Date().toISOString(),
      is_template: cardData.is_template || false
    };
    
    // Add ID if it exists (for updates)
    if (cardData.id) {
      cardRecord.id = cardData.id;
    } else {
      // Only set created_at for new cards
      cardRecord.created_at = new Date().toISOString();
    }
    
    console.log('API: Saving card record (excluding data):', {
      ...cardRecord,
      data: '[REDACTED]'
    });
    
    // Test the Supabase connection before attempting to save
    try {
      const { data: testData, error: testError } = await supabase
        .from('cards')
        .select('count')
        .limit(1);
        
      if (testError) {
        console.error('API: Supabase connection test failed:', testError);
        return NextResponse.json({ 
          error: `Database connection error: ${testError.message}`,
          details: testError
        }, { status: 500 });
      }
      
      console.log('API: Supabase connection test successful');
    } catch (testErr) {
      console.error('API: Error testing Supabase connection:', testErr);
      return NextResponse.json({ 
        error: 'Failed to connect to database',
        details: testErr instanceof Error ? testErr.message : String(testErr)
      }, { status: 500 });
    }
    
    // Insert or update the card
    let result;
    if (cardData.id) {
      // Update existing card
      result = await supabase
        .from('cards')
        .update(cardRecord)
        .eq('id', cardData.id)
        .select();
    } else {
      // Insert new card
      result = await supabase
        .from('cards')
        .insert(cardRecord)
        .select();
    }
    
    const { data, error } = result;
    
    if (error) {
      console.error('API: Error saving card:', error);
      
      // Provide more detailed error information
      let errorMessage = error.message;
      let statusCode = 500;
      
      if (error.code === '23505') {
        errorMessage = 'A card with this ID already exists';
        statusCode = 409;
      } else if (error.code === '42P01') {
        errorMessage = 'Database table not found. Please check your database setup.';
        statusCode = 500;
      } else if (error.code === '42501') {
        errorMessage = 'Permission denied. The service account may not have proper access.';
        statusCode = 403;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: error
      }, { status: statusCode });
    }
    
    console.log('API: Card saved successfully');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API: Error in cards/save route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 