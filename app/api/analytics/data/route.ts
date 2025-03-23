import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Initialize Supabase admin client for more privileged operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Get the user's session to check if they're authenticated
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ 
        success: false, 
        message: 'Not authenticated' 
      }, { status: 401 });
    }
    
    // Get the user ID from the session
    const userId = session.user.id;
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '14d'; // Default to 14 days
    const cardId = searchParams.get('cardId'); // Optional specific card ID
    
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '14d':
        startDate.setDate(endDate.getDate() - 14);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 14); // Default to 14 days
    }
    
    // Format dates as ISO strings
    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();
    
    // Build query to get all cards owned by the user
    let cardsQuery = adminSupabase
      .from('cards')
      .select('id, name')
      .eq('user_id', userId);
      
    if (cardId) {
      cardsQuery = cardsQuery.eq('id', cardId);
    }
    
    const { data: cards, error: cardsError } = await cardsQuery;
    
    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching cards' 
      }, { status: 500 });
    }
    
    // If no cards found or specified card not found
    if (!cards || cards.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No cards found' 
      }, { status: 404 });
    }
    
    // Extract card IDs for query
    const cardIds = cards.map(card => card.id);
    
    // Query total views within the time range
    const { data: viewsData, error: viewsError } = await adminSupabase
      .from('card_views')
      .select('card_id, created_at')
      .in('card_id', cardIds)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    if (viewsError) {
      console.error('Error fetching views:', viewsError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching views' 
      }, { status: 500 });
    }
    
    // Query contact saves within the time range
    const { data: savesData, error: savesError } = await adminSupabase
      .from('contact_saves')
      .select('card_id, created_at')
      .in('card_id', cardIds)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    if (savesError) {
      console.error('Error fetching saves:', savesError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching saves' 
      }, { status: 500 });
    }
    
    // Query interactions within the time range
    const { data: interactionsData, error: interactionsError } = await adminSupabase
      .from('card_interactions')
      .select('card_id, interaction_type, created_at')
      .in('card_id', cardIds)
      .gte('created_at', startDateStr)
      .lte('created_at', endDateStr);
      
    if (interactionsError) {
      console.error('Error fetching interactions:', interactionsError);
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching interactions' 
      }, { status: 500 });
    }
    
    // Calculate total views
    const totalViews = viewsData.length;
    
    // Calculate total contact saves
    const contactsSaved = savesData.length;
    
    // Calculate total interactions
    const interactions = interactionsData.length;
    
    // Calculate daily views
    const dailyViews = calculateDailyViews(viewsData, startDate, endDate);
    
    // Calculate device breakdown
    const deviceBreakdown = calculateDeviceBreakdown(viewsData);
    
    // Calculate top locations
    const topLocations = calculateTopLocations(viewsData);
    
    // Get recent scans
    const recentScans = getRecentScans(viewsData, cards);
    
    // Calculate popular cards and their performance
    const popularCards = calculatePopularCards(cards, viewsData, savesData);
    
    // Return the analytics data
    return NextResponse.json({
      success: true,
      data: {
        totalViews,
        contactsSaved,
        interactions,
        dailyViews,
        deviceBreakdown,
        topLocations,
        recentScans,
        popularCards
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to calculate daily views
function calculateDailyViews(viewsData: any[], startDate: Date, endDate: Date) {
  // Create a map to store views by date
  const viewsByDate = new Map();
  
  // Initialize the map with all dates in the range having 0 views
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    viewsByDate.set(dateStr, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count views for each date
  viewsData.forEach(view => {
    const dateStr = new Date(view.created_at).toISOString().split('T')[0];
    if (viewsByDate.has(dateStr)) {
      viewsByDate.set(dateStr, viewsByDate.get(dateStr) + 1);
    }
  });
  
  // Convert map to array of objects
  return Array.from(viewsByDate.entries()).map(([date, views]) => ({
    date,
    views
  }));
}

// Helper function to calculate device breakdown
function calculateDeviceBreakdown(viewsData: any[]) {
  // Count views by device type
  const deviceCounts = {
    Mobile: 0,
    Desktop: 0,
    Tablet: 0
  };
  
  viewsData.forEach(view => {
    const device = view.device || 'Desktop';
    if (device in deviceCounts) {
      deviceCounts[device as keyof typeof deviceCounts]++;
    } else {
      deviceCounts.Desktop++;
    }
  });
  
  const total = viewsData.length || 1; // Avoid division by zero
  
  // Calculate percentages and format result
  return [
    { device: 'Mobile', percentage: Math.round((deviceCounts.Mobile / total) * 100) },
    { device: 'Desktop', percentage: Math.round((deviceCounts.Desktop / total) * 100) },
    { device: 'Tablet', percentage: Math.round((deviceCounts.Tablet / total) * 100) }
  ];
}

// Helper function to calculate top locations
function calculateTopLocations(viewsData: any[]) {
  // Count views by location
  const locationCounts = new Map();
  
  viewsData.forEach(view => {
    const location = view.country && view.city 
      ? `${view.city}, ${view.country}`
      : view.country 
        ? `${view.country}`
        : 'Unknown';
    
    locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
  });
  
  // Convert to array and sort by count
  const sortedLocations = Array.from(locationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Get top 5
  
  return sortedLocations;
}

// Helper function to get recent scans
function getRecentScans(viewsData: any[], cards: any[]) {
  // Create a map of card IDs to names
  const cardMap = new Map(cards.map(card => [card.id, card.name]));
  
  // Sort views by date (newest first) and take the 5 most recent
  return viewsData
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(view => ({
      id: view.id,
      cardName: cardMap.get(view.card_id) || 'Unknown Card',
      location: view.country && view.city 
        ? `${view.city}, ${view.country}`
        : view.country 
          ? `${view.country}`
          : 'Unknown',
      device: view.device || 'Unknown',
      timestamp: view.created_at
    }));
}

// Helper function to calculate popular cards
function calculatePopularCards(cards: any[], viewsData: any[], savesData: any[]) {
  // Count views and saves by card
  const cardStats = new Map();
  
  // Initialize stats for all cards
  cards.forEach(card => {
    cardStats.set(card.id, {
      name: card.name,
      views: 0,
      saves: 0
    });
  });
  
  // Count views
  viewsData.forEach(view => {
    if (cardStats.has(view.card_id)) {
      const stats = cardStats.get(view.card_id);
      stats.views++;
      cardStats.set(view.card_id, stats);
    }
  });
  
  // Count saves
  savesData.forEach(save => {
    if (cardStats.has(save.card_id)) {
      const stats = cardStats.get(save.card_id);
      stats.saves++;
      cardStats.set(save.card_id, stats);
    }
  });
  
  // Convert to array and sort by views
  return Array.from(cardStats.values())
    .filter(card => card.views > 0) // Only include cards with views
    .sort((a, b) => b.views - a.views)
    .map(stats => ({
      id: cards.find(c => c.name === stats.name)?.id || '',
      name: stats.name,
      views: stats.views,
      saves: stats.saves
    }));
} 