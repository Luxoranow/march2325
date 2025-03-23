-- This script will set up the necessary tables and permissions for the Luxora app
-- Run this in the Supabase SQL Editor

-- Create the cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Card',
  data JSONB NOT NULL,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  views_count INTEGER DEFAULT 0
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own cards
CREATE POLICY "Users can view their own cards" ON public.cards
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own cards
CREATE POLICY "Users can insert their own cards" ON public.cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own cards
CREATE POLICY "Users can update their own cards" ON public.cards
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own cards
CREATE POLICY "Users can delete their own cards" ON public.cards
  FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards (user_id);

-- Create a function to handle test users (for development)
CREATE OR REPLACE FUNCTION public.handle_test_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow operations for the test user ID
  IF NEW.user_id = '00000000-0000-0000-0000-000000000000' THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, check if they match the authenticated user
  IF auth.uid() = NEW.user_id THEN
    RETURN NEW;
  ELSE
    RAISE EXCEPTION 'You can only manage your own cards';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a policy for test users
CREATE POLICY "Allow test user operations" ON public.cards
  USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Create a view to help with debugging
CREATE OR REPLACE VIEW public.cards_debug AS
SELECT 
  id,
  user_id,
  name,
  data,
  created_at,
  updated_at,
  views_count
FROM public.cards;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT SELECT ON public.cards_debug TO authenticated;

-- ======== ANALYTICS TABLES ========

-- Create the analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  interaction_type TEXT,
  element_id TEXT,
  element_value TEXT,
  ip_address TEXT,
  user_agent TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view analytics for their own cards
CREATE POLICY "Users can view analytics for their own cards" ON public.analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cards
      WHERE cards.id = analytics_events.card_id
      AND cards.user_id = auth.uid()
    )
  );

-- Create policy to allow the service to insert analytics events
CREATE POLICY "Service can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS analytics_events_card_id_idx ON public.analytics_events (card_id);
CREATE INDEX IF NOT EXISTS analytics_events_visitor_id_idx ON public.analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON public.analytics_events (timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events (event_type);

-- Create a function to increment card views
CREATE OR REPLACE FUNCTION public.increment_card_views(card_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.cards
  SET views_count = views_count + 1
  WHERE id = card_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users and anon
GRANT SELECT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.increment_card_views TO anon, authenticated, service_role; 