'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Box, Container, Typography, Paper, Button, Alert, AlertTitle, CircularProgress, Divider } from '@mui/material';

export default function FixDatabasePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fixDatabase = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    setSuccess(false);

    try {
      // Check if the is_template column exists
      console.log('Checking if is_template column exists...');
      const { data: columnCheck, error: columnCheckError } = await supabase
        .rpc('column_exists', { 
          table_name: 'cards', 
          column_name: 'is_template' 
        });

      if (columnCheckError) {
        // If the RPC doesn't exist, we'll create a one-time function
        console.log('RPC not found, creating one-time function...');
        const { error: functionError } = await supabase
          .rpc('create_column_exists_function');
          
        if (functionError && !functionError.message.includes('already exists')) {
          throw new Error(`Could not create helper function: ${functionError.message}`);
        }
        
        // Try the check again
        const { data: retryCheck, error: retryError } = await supabase
          .rpc('column_exists', { 
            table_name: 'cards', 
            column_name: 'is_template' 
          });
          
        if (retryError) {
          throw new Error(`Could not check column: ${retryError.message}`);
        }
        
        if (retryCheck) {
          setResult('Column is_template already exists. No changes needed.');
          setSuccess(true);
          setLoading(false);
          return;
        }
      } else if (columnCheck) {
        setResult('Column is_template already exists. No changes needed.');
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Add the is_template column if it doesn't exist
      console.log('Adding is_template column...');
      const { error: addColumnError } = await supabase
        .rpc('add_is_template_column');

      if (addColumnError) {
        // If the RPC doesn't exist, use raw SQL (needs appropriate permissions)
        console.log('RPC not found, using raw SQL...');
        const { error: rawSqlError } = await supabase
          .from('_exec_sql')
          .insert({
            query: `
              ALTER TABLE public.cards 
              ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
              
              ALTER TABLE public.cards 
              ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
              
              -- Create policy if it doesn't exist
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
                  END IF;
              END $$;
            `
          });
          
        if (rawSqlError) {
          if (rawSqlError.message.includes('does not exist')) {
            setError('Database fixes require admin privileges. Please use the Supabase SQL Editor to run the fix script manually.');
            setResult(`
              -- Add these columns to your cards table
              ALTER TABLE public.cards 
              ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
              
              ALTER TABLE public.cards 
              ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
              
              -- Create policy if it doesn't exist
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
                  END IF;
              END $$;
            `);
          } else {
            throw new Error(`Could not add column with raw SQL: ${rawSqlError.message}`);
          }
        } else {
          setResult('Successfully added is_template and views_count columns to cards table.');
          setSuccess(true);
        }
      } else {
        setResult('Successfully added is_template and views_count columns to cards table.');
        setSuccess(true);
      }
    } catch (err) {
      console.error('Error fixing database:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Create the helper functions if they don't exist
    const createHelperFunctions = async () => {
      try {
        // Create a function to check if a column exists
        const { error: functionError } = await supabase.rpc('create_column_exists_function');
        // Create function to add is_template column
        const { error: addColumnFnError } = await supabase.rpc('create_add_column_function');
        
        // Errors are expected if functions already exist
        if (functionError && !functionError.message.includes('already exists')) {
          console.warn('Could not create column_exists function:', functionError.message);
        }
        
        if (addColumnFnError && !addColumnFnError.message.includes('already exists')) {
          console.warn('Could not create add_column function:', addColumnFnError.message);
        }
      } catch (err) {
        console.warn('Error setting up helper functions:', err);
        // Non-fatal error, we'll fall back to other methods
      }
    };
    
    createHelperFunctions();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Fix Database Schema
      </Typography>
      
      <Typography variant="body1" paragraph>
        This tool helps fix the missing <code>is_template</code> column in your cards table.
        If you're seeing an error like "<strong>Could not find the 'is_template' column of 'cards' in the schema cache</strong>",
        this tool can help fix that.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }} elevation={2}>
        <Typography variant="h6" gutterBottom>
          What will this do?
        </Typography>
        
        <Typography variant="body2" paragraph>
          This will:
        </Typography>
        
        <ul>
          <li><Typography variant="body2">Add the <code>is_template</code> column to your cards table if it doesn't exist</Typography></li>
          <li><Typography variant="body2">Add the <code>views_count</code> column if it doesn't exist</Typography></li>
          <li><Typography variant="body2">Ensure the test user policy exists for development mode</Typography></li>
        </ul>
        
        <Button 
          variant="contained" 
          onClick={fixDatabase}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Fixing Database...
            </>
          ) : 'Fix Database Schema'}
        </Button>
      </Paper>
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>Success!</AlertTitle>
          The database schema has been fixed. Try saving your card again.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {result && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9' }} elevation={1}>
          <Typography variant="h6" gutterBottom>
            Result:
          </Typography>
          <Box sx={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'monospace', 
            fontSize: '0.875rem',
            p: 2,
            bgcolor: '#f5f5f5',
            borderRadius: 1,
            overflowX: 'auto'
          }}>
            {result}
          </Box>
        </Paper>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Manual Fix
      </Typography>
      
      <Typography variant="body2" paragraph>
        If the automatic fix doesn't work, you can manually run this SQL in the Supabase SQL Editor:
      </Typography>
      
      <Box sx={{ 
        whiteSpace: 'pre-wrap', 
        fontFamily: 'monospace', 
        fontSize: '0.875rem',
        p: 2,
        bgcolor: '#f5f5f5',
        borderRadius: 1,
        overflowX: 'auto',
        mb: 3
      }}>
{`-- Add missing is_template column to cards table
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
END $$;`}
      </Box>
      
      <Typography variant="body2">
        After running the SQL, try saving your card again and it should work properly.
      </Typography>
    </Container>
  );
} 