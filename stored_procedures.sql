-- Create functions to help with schema management
-- Run these in your Supabase SQL Editor

-- Function to check if a column exists
CREATE OR REPLACE FUNCTION public.create_column_exists_function()
RETURNS void AS $$
BEGIN
  CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
  RETURNS boolean AS $fn$
  BEGIN
    RETURN EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      AND column_name = $2
    );
  END;
  $fn$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- Grant permissions to use this function
  GRANT EXECUTE ON FUNCTION public.column_exists TO authenticated;
  GRANT EXECUTE ON FUNCTION public.column_exists TO anon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function creator
GRANT EXECUTE ON FUNCTION public.create_column_exists_function TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_column_exists_function TO anon;

-- Function to add is_template column
CREATE OR REPLACE FUNCTION public.create_add_column_function()
RETURNS void AS $$
BEGIN
  CREATE OR REPLACE FUNCTION public.add_is_template_column()
  RETURNS void AS $fn$
  BEGIN
    -- Add is_template column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'cards' 
      AND column_name = 'is_template'
    ) THEN
      ALTER TABLE public.cards ADD COLUMN is_template BOOLEAN DEFAULT false;
      RAISE NOTICE 'Added is_template column to cards table';
    END IF;
    
    -- Add views_count column if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'cards' 
      AND column_name = 'views_count'
    ) THEN
      ALTER TABLE public.cards ADD COLUMN views_count INTEGER DEFAULT 0;
      RAISE NOTICE 'Added views_count column to cards table';
    END IF;
    
    -- Add test user policy if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'cards' 
      AND policyname = 'Allow test user operations'
    ) THEN
      CREATE POLICY "Allow test user operations" ON public.cards
        USING (user_id = '00000000-0000-0000-0000-000000000000');
      RAISE NOTICE 'Added test user policy to cards table';
    END IF;
  END;
  $fn$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- Grant permissions to use this function
  GRANT EXECUTE ON FUNCTION public.add_is_template_column TO authenticated;
  GRANT EXECUTE ON FUNCTION public.add_is_template_column TO anon;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function creator
GRANT EXECUTE ON FUNCTION public.create_add_column_function TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_add_column_function TO anon; 