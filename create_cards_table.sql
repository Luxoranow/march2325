-- Create the cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Card',
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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