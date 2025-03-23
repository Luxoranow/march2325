import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '30d'; // Default to 30 days
    
    // Calculate the start date based on the time range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30); // Default to 30 days
    }
    
    // Get all cards for the user
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, views_count')
      .eq('user_id', user.id)
      .order('views_count', { ascending: false });
    
    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return NextResponse.json(
        { error: 'Failed to fetch cards' },
        { status: 500 }
      );
    }
    
    // Get total views
    const totalViews = cards.reduce((sum, card) => sum + (card.views_count || 0), 0);
    
    // Get view events in the specified time range
    const { data: viewEvents, error: viewsError } = await supabase
      .from('analytics_events')
      .select('card_id, timestamp')
      .eq('event_type', 'view')
      .gte('timestamp', startDate.toISOString())
      .in('card_id', cards.map(card => card.id));
    
    if (viewsError) {
      console.error('Error fetching view events:', viewsError);
      return NextResponse.json(
        { error: 'Failed to fetch view events' },
        { status: 500 }
      );
    }
    
    // Get interaction events in the specified time range
    const { data: interactionEvents, error: interactionsError } = await supabase
      .from('analytics_events')
      .select('card_id, interaction_type, element_id, timestamp')
      .eq('event_type', 'interaction')
      .gte('timestamp', startDate.toISOString())
      .in('card_id', cards.map(card => card.id));
    
    if (interactionsError) {
      console.error('Error fetching interaction events:', interactionsError);
      return NextResponse.json(
        { error: 'Failed to fetch interaction events' },
        { status: 500 }
      );
    }
    
    // Get save events in the specified time range
    const { data: saveEvents, error: savesError } = await supabase
      .from('analytics_events')
      .select('card_id, timestamp')
      .eq('event_type', 'save')
      .gte('timestamp', startDate.toISOString())
      .in('card_id', cards.map(card => card.id));
    
    if (savesError) {
      console.error('Error fetching save events:', savesError);
      return NextResponse.json(
        { error: 'Failed to fetch save events' },
        { status: 500 }
      );
    }
    
    // Group view events by day
    const viewsByDay: Record<string, number> = {};
    const daysInRange = getDateRange(startDate, now);
    
    // Initialize all days with 0 views
    daysInRange.forEach(date => {
      viewsByDay[date] = 0;
    });
    
    // Count views for each day
    viewEvents.forEach(event => {
      const day = new Date(event.timestamp).toISOString().split('T')[0];
      viewsByDay[day] = (viewsByDay[day] || 0) + 1;
    });
    
    // Count interactions by type
    const interactionsByType: Record<string, number> = {};
    interactionEvents.forEach(event => {
      const type = event.interaction_type || 'unknown';
      interactionsByType[type] = (interactionsByType[type] || 0) + 1;
    });
    
    // Count saves by card
    const savesByCard: Record<string, number> = {};
    saveEvents.forEach(event => {
      savesByCard[event.card_id] = (savesByCard[event.card_id] || 0) + 1;
    });
    
    // Prepare card data
    const cardData = cards.map(card => {
      const cardViews = viewEvents.filter(event => event.card_id === card.id).length;
      const cardInteractions = interactionEvents.filter(event => event.card_id === card.id).length;
      const cardSaves = savesByCard[card.id] || 0;
      
      return {
        id: card.id,
        name: card.name,
        views: cardViews,
        totalViews: card.views_count || 0,
        interactions: cardInteractions,
        saves: cardSaves,
        conversionRate: cardViews > 0 ? (cardSaves / cardViews) * 100 : 0
      };
    });
    
    // Calculate overall stats
    const periodViews = viewEvents.length;
    const periodInteractions = interactionEvents.length;
    const periodSaves = saveEvents.length;
    
    return NextResponse.json({
      success: true,
      timeRange,
      totalStats: {
        totalViews,
        periodViews,
        periodInteractions,
        periodSaves,
        conversionRate: periodViews > 0 ? (periodSaves / periodViews) * 100 : 0
      },
      viewsByDay,
      interactionsByType,
      cardData: cardData.sort((a, b) => b.views - a.views)
    });
  } catch (error) {
    console.error('Error processing analytics request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get an array of dates in YYYY-MM-DD format within a range
function getDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
} 