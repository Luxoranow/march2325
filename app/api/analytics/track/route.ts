import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Extract the required fields
    const { 
      event_type, 
      card_id, 
      owner_id, 
      viewer_id,
      action_type = null,
      metadata = {}
    } = data;
    
    // Validate required fields
    if (!event_type || !card_id || !owner_id) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // Get the IP address from headers
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Prepare the analytics event data
    const analyticsEvent = {
      event_type,
      card_id,
      owner_id,
      viewer_id: viewer_id || 'anonymous',
      action_type,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    };
    
    // Insert the event into Supabase
    const { error } = await supabase
      .from('analytics_events')
      .insert([analyticsEvent]);
      
    if (error) {
      console.error('Error inserting analytics event:', error);
      return NextResponse.json(
        { error: 'Failed to save analytics event' }, 
        { status: 500 }
      );
    }
    
    // If this is a card view event, also update the view count on the card
    if (event_type === 'card_view') {
      try {
        // Get the current card
        const { data: card, error: cardError } = await supabase
          .from('cards')
          .select('view_count')
          .eq('id', card_id)
          .single();
          
        if (cardError) {
          console.error('Error fetching card for view count update:', cardError);
        } else {
          // Update the view count
          const newViewCount = ((card?.view_count as number) || 0) + 1;
          
          const { error: updateError } = await supabase
            .from('cards')
            .update({ view_count: newViewCount })
            .eq('id', card_id);
            
          if (updateError) {
            console.error('Error updating card view count:', updateError);
          }
        }
      } catch (countError) {
        console.error('Error processing view count update:', countError);
        // Don't fail the entire operation if just the view count update fails
      }
    }
    
    // Return success response
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
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