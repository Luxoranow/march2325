'use client';

import { useEffect, useRef } from 'react';

interface CardTrackerProps {
  cardId: string;
  ownerId: string;
  viewerId: string | null;
  cardName?: string;
}

// Define the type for our custom event detail
interface CardInteractionEventDetail {
  cardId: string;
  actionType: string;
  metadata: Record<string, any>;
}

// Declare the custom event type for TypeScript
declare global {
  interface WindowEventMap {
    'track_card_interaction': CustomEvent<CardInteractionEventDetail>;
  }
}

/**
 * CardTracker component for tracking card views and interactions
 * 
 * This component handles:
 * 1. Tracking initial card views
 * 2. Listening for interaction events (clicks on contact info, social links, etc.)
 * 3. Sending tracking data to our analytics API
 */
export function CardTracker({ cardId, ownerId, viewerId, cardName }: CardTrackerProps) {
  const hasTrackedView = useRef(false);

  // Track the initial card view
  useEffect(() => {
    if (hasTrackedView.current) return;
    
    const trackView = async () => {
      try {
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'card_view',
            card_id: cardId,
            owner_id: ownerId,
            viewer_id: viewerId || 'anonymous',
            metadata: {
              cardName: cardName || 'Unnamed Card',
              referrer: document.referrer || 'direct',
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to track card view:', await response.text());
        }
        
        hasTrackedView.current = true;
      } catch (error) {
        console.error('Error tracking card view:', error);
      }
    };
    
    // Track the view
    trackView();
    
    // Return cleanup function
    return () => {
      // Cleanup code if needed
    };
  }, [cardId, ownerId, viewerId, cardName]);
  
  // Listen for interaction events
  useEffect(() => {
    const handleInteraction = async (event: CustomEvent<CardInteractionEventDetail>) => {
      try {
        const { cardId, actionType, metadata } = event.detail;
        
        // Send the interaction data to our analytics API
        const response = await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'card_interaction',
            card_id: cardId,
            owner_id: ownerId,
            viewer_id: viewerId || 'anonymous',
            action_type: actionType,
            metadata: {
              ...metadata,
              timestamp: new Date().toISOString()
            }
          }),
        });
        
        if (!response.ok) {
          console.error('Failed to track interaction:', await response.text());
        }
      } catch (error) {
        console.error('Error tracking interaction:', error);
      }
    };
    
    // Add event listener for custom interaction events
    window.addEventListener('track_card_interaction', handleInteraction);
    
    // Cleanup
    return () => {
      window.removeEventListener('track_card_interaction', handleInteraction);
    };
  }, [cardId, ownerId, viewerId]);
  
  // This component doesn't render anything
  return null;
}

export default CardTracker; 