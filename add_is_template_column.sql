-- Add missing is_template column to cards table

-- Check if column already exists (safety check)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'cards' 
        AND column_name = 'is_template'
    ) THEN
        ALTER TABLE public.cards ADD COLUMN is_template BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_template column to cards table';
    ELSE
        RAISE NOTICE 'is_template column already exists, no changes made';
    END IF;
END $$;

-- Check if views_count column exists and add it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'cards' 
        AND column_name = 'views_count'
    ) THEN
        ALTER TABLE public.cards ADD COLUMN views_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Added views_count column to cards table';
    ELSE
        RAISE NOTICE 'views_count column already exists, no changes made';
    END IF;
END $$;

-- Ensure the test user policy exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'cards' 
        AND policyname = 'Allow test user operations'
    ) THEN
        CREATE POLICY "Allow test user operations" ON public.cards
          USING (user_id = '00000000-0000-0000-0000-000000000000');
        RAISE NOTICE 'Added test user policy to cards table';
    ELSE
        RAISE NOTICE 'Test user policy already exists, no changes made';
    END IF;
END $$;

COMMIT; 