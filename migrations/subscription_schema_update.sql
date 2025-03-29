-- Migration to enhance subscription schema and add logging table
-- This script adds new columns to the subscriptions table and creates a subscription_logs table

-- Update the subscriptions table with additional fields
ALTER TABLE IF EXISTS subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_item_id TEXT,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Create a subscription logs table for diagnostics and auditing
CREATE TABLE IF NOT EXISTS subscription_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for the logs table for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscription_logs_level ON subscription_logs(level);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_created_at ON subscription_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_user_id ON subscription_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_logs_session_id ON subscription_logs(session_id);

-- Enable row level security for subscription logs
ALTER TABLE subscription_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins (only admins can view logs)
CREATE POLICY admin_subscription_logs_policy ON subscription_logs
  USING (auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  ));

-- Grant permissions to authenticated users
GRANT SELECT, INSERT ON subscription_logs TO authenticated;

-- Create a trigger to update the updated_at timestamp when a subscription is updated
CREATE OR REPLACE FUNCTION update_subscription_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on the subscriptions table
CREATE TRIGGER update_subscription_timestamp
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscription_timestamp();

-- Add comments to tables and columns for better documentation
COMMENT ON TABLE subscriptions IS 'Stores user subscription information';
COMMENT ON COLUMN subscriptions.user_id IS 'Foreign key to auth.users';
COMMENT ON COLUMN subscriptions.plan_id IS 'Plan identifier (free, premium, team)';
COMMENT ON COLUMN subscriptions.status IS 'Subscription status (active, past_due, canceled, etc.)';
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for reference';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for reference';
COMMENT ON COLUMN subscriptions.current_period_end IS 'When the current billing period ends';

COMMENT ON TABLE subscription_logs IS 'Logs for subscription-related events and errors';
COMMENT ON COLUMN subscription_logs.level IS 'Log level (debug, info, warn, error)';
COMMENT ON COLUMN subscription_logs.message IS 'Log message';
COMMENT ON COLUMN subscription_logs.data IS 'Additional JSON data for the log entry';
COMMENT ON COLUMN subscription_logs.user_id IS 'Associated user ID if applicable';
COMMENT ON COLUMN subscription_logs.session_id IS 'Browser session ID for correlation'; 