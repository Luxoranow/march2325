# Luxora Card Saving Guide

This guide provides detailed instructions to ensure that card saving functionality works properly in your Luxora application. If you've been experiencing issues saving cards, follow these steps to diagnose and fix the problem.

## Prerequisites

- A Supabase account with a project set up
- Proper environment variables configured
- Basic understanding of SQL (for database setup)

## Step 1: Verify Environment Variables

Make sure your `.env.local` file has the following variables set correctly:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # For local development
```

- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-anon-key` with your actual Supabase anon key
- For production, set `NEXT_PUBLIC_SITE_URL` to your deployed URL

## Step 2: Set Up Database Tables

Make sure your Supabase database has the required tables and permissions. Run the following SQL in the Supabase SQL Editor:

```sql
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

-- For development mode: Add a policy for test user
CREATE POLICY "Allow test user operations" ON public.cards
  USING (user_id = '00000000-0000-0000-0000-000000000000');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS cards_user_id_idx ON public.cards (user_id);
```

## Step 3: Verify Authentication

For card saving to work, you need to be properly authenticated. The application uses Supabase Authentication.

1. Make sure you're signed in to the application
2. If you keep getting logged out, try:
   - Clearing your browser cookies
   - Using an incognito/private window
   - Checking for any CORS issues in your browser console

## Step 4: Troubleshooting

If you're still experiencing issues, use the built-in diagnostic tool:

1. Navigate to `/debug/card-save` in your application
2. Follow the step-by-step guide on the page
3. The tool will test:
   - Authentication status
   - Database connection
   - Card saving functionality

### Common Issues and Solutions

#### "No user ID available" Error

This means the application couldn't authenticate you properly:
- Sign out and sign back in
- Check your Supabase authentication settings
- Verify that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct

#### "Database connection error" or "Permission denied" Error

This is usually due to misconfigured Row Level Security (RLS) policies:
- Make sure you've run the SQL setup script above
- Check that your Supabase anon key has the correct permissions
- Verify that your user ID matches the one in the database

#### "Error saving card" with No Specific Message

This could be due to:
- Invalid card data format
- Large images or data exceeding limits
- Network connectivity issues

Try saving a card with minimal data first, then gradually add more information.

#### "Could not find the 'is_template' column of 'cards' in the schema cache" Error

This error indicates that your database schema is missing the required `is_template` column. This can happen if you're using an older version of the schema. To fix this:

1. Run the following SQL in the Supabase SQL Editor:

```sql
-- Add missing is_template column to cards table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'cards' 
        AND column_name = 'is_template'
    ) THEN
        ALTER TABLE public.cards ADD COLUMN is_template BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add missing views_count column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'cards' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.cards ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;
```

2. After running this SQL, try saving your card again. The error should be resolved.

## Step 5: Advanced Solutions

### Using the API Fallback

The application now includes a fallback API route for saving cards when direct database access fails:

```javascript
// If direct save fails, try using the API endpoint
try {
  const response = await fetch('/api/cards/save', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(cardData),
  });
  
  if (!response.ok) {
    throw new Error(`API save failed: ${await response.text()}`);
  }
  
  const result = await response.json();
  // Handle result...
} catch (apiError) {
  console.error('API save failed:', apiError);
}
```

### Session Management

For persistent sessions:

1. Add this to your `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_SESSION_LENGTH=2592000  # 30 days in seconds
```

2. Configure session in your Supabase client:
```javascript
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'luxora_auth'
  }
});
```

## Need More Help?

If you've tried all these steps and are still having issues:

1. Check the browser console for specific error messages
2. Export the logs from the `/debug/card-save` page
3. Contact support with the error logs and details about your environment 