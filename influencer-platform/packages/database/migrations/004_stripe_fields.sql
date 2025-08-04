-- Add Stripe fields to influencer_profiles
ALTER TABLE influencer_profiles
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_account_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE;

-- Add Stripe fields to brand_profiles
ALTER TABLE brand_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add payment tracking to deal_proposals
ALTER TABLE deal_proposals
ADD COLUMN IF NOT EXISTS payment_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_account_id TEXT NOT NULL,
  stripe_payout_id TEXT,
  error_message TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payouts table for tracking Stripe payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_payout_id TEXT UNIQUE NOT NULL,
  influencer_id UUID REFERENCES influencer_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  status TEXT NOT NULL,
  arrival_date BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add deal_proposal_id to transactions
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS deal_proposal_id UUID REFERENCES deal_proposals(id) ON DELETE SET NULL;

-- Update transaction type to include platform_fee
ALTER TABLE transactions
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN ('payment', 'refund', 'platform_fee', 'payout'));

-- Function to increment influencer earnings
CREATE OR REPLACE FUNCTION increment_influencer_earnings(
  p_influencer_id UUID,
  p_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE influencer_profiles
  SET total_earned = total_earned + p_amount
  WHERE id = p_influencer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_influencer_stripe_account ON influencer_profiles(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_brand_stripe_customer ON brand_profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_influencer ON payout_requests(influencer_id);
CREATE INDEX IF NOT EXISTS idx_payouts_influencer ON payouts(influencer_id);

-- RLS Policies
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Payout requests policies
CREATE POLICY "Users can view their own payout requests"
  ON payout_requests FOR SELECT
  USING (
    influencer_id IN (
      SELECT id FROM influencer_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own payout requests"
  ON payout_requests FOR INSERT
  WITH CHECK (
    influencer_id IN (
      SELECT id FROM influencer_profiles WHERE user_id = auth.uid()
    )
  );

-- Payouts policies
CREATE POLICY "Users can view their own payouts"
  ON payouts FOR SELECT
  USING (
    influencer_id IN (
      SELECT id FROM influencer_profiles WHERE user_id = auth.uid()
    )
  );