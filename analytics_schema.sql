-- Analytics Schema for Luxora
-- This should be added to your Supabase SQL editor

-- Table for tracking card views
CREATE TABLE IF NOT EXISTS public.card_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT, -- Anonymous identifier for visitors without accounts
  device TEXT, -- Mobile, Desktop, Tablet
  os TEXT, -- iOS, Android, Windows, Mac, etc.
  browser TEXT, -- Chrome, Safari, Firefox, etc.
  ip_address TEXT, -- Store masked or hashed for privacy
  country TEXT,
  city TEXT,
  referrer TEXT, -- Where the visitor came from
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for tracking contact saves (when someone saves the card to their contacts)
CREATE TABLE IF NOT EXISTS public.contact_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT, -- Anonymous identifier
  device TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for tracking interactions with links and buttons
CREATE TABLE IF NOT EXISTS public.card_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES public.cards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_id TEXT, -- Anonymous identifier
  interaction_type TEXT NOT NULL, -- email, phone, website, social, messaging, custom
  element_id TEXT, -- ID of the element that was interacted with
  element_value TEXT, -- Value of the element (e.g., the URL, the phone number)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for visitor sessions
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  session_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_end TIMESTAMPTZ,
  device TEXT,
  os TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  first_visit BOOLEAN DEFAULT true
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS card_views_card_id_idx ON public.card_views (card_id);
CREATE INDEX IF NOT EXISTS card_views_created_at_idx ON public.card_views (created_at);
CREATE INDEX IF NOT EXISTS card_views_user_id_idx ON public.card_views (user_id);
CREATE INDEX IF NOT EXISTS card_views_visitor_id_idx ON public.card_views (visitor_id);

CREATE INDEX IF NOT EXISTS contact_saves_card_id_idx ON public.contact_saves (card_id);
CREATE INDEX IF NOT EXISTS contact_saves_created_at_idx ON public.contact_saves (created_at);

CREATE INDEX IF NOT EXISTS card_interactions_card_id_idx ON public.card_interactions (card_id);
CREATE INDEX IF NOT EXISTS card_interactions_created_at_idx ON public.card_interactions (created_at);
CREATE INDEX IF NOT EXISTS card_interactions_type_idx ON public.card_interactions (interaction_type);

-- Set up Row Level Security (RLS)
ALTER TABLE public.card_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for card owners to view analytics data for their own cards
CREATE POLICY "Users can view analytics for their own cards" ON public.card_views
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.cards WHERE cards.id = card_views.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can view contact saves for their own cards" ON public.contact_saves
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.cards WHERE cards.id = contact_saves.card_id AND cards.user_id = auth.uid())
  );

CREATE POLICY "Users can view interactions for their own cards" ON public.card_interactions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.cards WHERE cards.id = card_interactions.card_id AND cards.user_id = auth.uid())
  );

-- Create insert policies to allow the tracking API to write data
CREATE POLICY "API can insert card views" ON public.card_views FOR INSERT WITH CHECK (true);
CREATE POLICY "API can insert contact saves" ON public.contact_saves FOR INSERT WITH CHECK (true);
CREATE POLICY "API can insert card interactions" ON public.card_interactions FOR INSERT WITH CHECK (true);
CREATE POLICY "API can insert visitor sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "API can update visitor sessions" ON public.visitor_sessions FOR UPDATE USING (true);

-- Grant permissions to authenticated users
GRANT SELECT ON public.card_views TO authenticated;
GRANT SELECT ON public.contact_saves TO authenticated;
GRANT SELECT ON public.card_interactions TO authenticated;
GRANT SELECT ON public.visitor_sessions TO authenticated;

-- Allow anon and authenticated users to insert analytics data
GRANT INSERT ON public.card_views TO anon, authenticated;
GRANT INSERT ON public.contact_saves TO anon, authenticated;
GRANT INSERT ON public.card_interactions TO anon, authenticated;
GRANT INSERT ON public.visitor_sessions TO anon, authenticated;
GRANT UPDATE ON public.visitor_sessions TO anon, authenticated;
