import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * API handler for subscription-related logs
 * Stores logs in a Supabase table for analysis and debugging
 */
export async function POST(request: NextRequest) {
  try {
    // Get the log data from the request
    const logData = await request.json();
    
    // Validate required fields
    if (!logData.level || !logData.message) {
      return NextResponse.json(
        { error: 'Missing required fields: level and message' },
        { status: 400 }
      );
    }
    
    // Add timestamp if not provided
    if (!logData.timestamp) {
      logData.timestamp = new Date().toISOString();
    }
    
    // Prepare the log entry
    const logEntry = {
      level: logData.level,
      message: logData.message,
      data: logData.data ? JSON.stringify(logData.data) : null,
      session_id: logData.sessionId || null,
      user_id: logData.userId || null,
      user_agent: request.headers.get('user-agent') || null,
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
      created_at: logData.timestamp
    };
    
    // Insert the log into the database
    const { error } = await supabase
      .from('subscription_logs')
      .insert(logEntry);
    
    if (error) {
      console.error('Error storing subscription log:', error);
      
      // Don't expose full error details in production
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Failed to store log' },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { error: `Failed to store log: ${error.message}` },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing subscription log:', error);
    
    return NextResponse.json(
      { 
        error: 'Error processing log',
        details: process.env.NODE_ENV !== 'production' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
 