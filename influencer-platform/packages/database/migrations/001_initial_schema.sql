-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- User roles enum
CREATE TYPE user_role AS ENUM ('influencer', 'brand', 'admin');

-- User account status
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'deleted');

-- Campaign status
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');

-- Application status
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  username TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'influencer',
  status account_status NOT NULL DEFAULT 'pending',
  avatar_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Influencer profiles
CREATE TABLE public.influencer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  location TEXT,
  languages TEXT[],
  categories TEXT[],
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  instagram_engagement_rate DECIMAL(5,2),
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  tiktok_engagement_rate DECIMAL(5,2),
  youtube_handle TEXT,
  youtube_subscribers INTEGER DEFAULT 0,
  youtube_engagement_rate DECIMAL(5,2),
  twitter_handle TEXT,
  twitter_followers INTEGER DEFAULT 0,
  min_campaign_budget DECIMAL(10,2),
  stripe_account_id TEXT,
  stripe_account_status TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  completed_campaigns INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brand profiles
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  website TEXT,
  industry TEXT,
  description TEXT,
  logo_url TEXT,
  location TEXT,
  company_size TEXT,
  verified BOOLEAN DEFAULT FALSE,
  total_spent DECIMAL(10,2) DEFAULT 0,
  completed_campaigns INTEGER DEFAULT 0,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  objectives TEXT[],
  requirements TEXT[],
  deliverables JSONB,
  budget_min DECIMAL(10,2) NOT NULL,
  budget_max DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  categories TEXT[],
  platforms TEXT[],
  location_requirements TEXT[],
  language_requirements TEXT[],
  min_followers INTEGER,
  start_date DATE,
  end_date DATE,
  application_deadline DATE,
  status campaign_status NOT NULL DEFAULT 'draft',
  visibility TEXT DEFAULT 'public',
  total_applications INTEGER DEFAULT 0,
  selected_influencers INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign applications
CREATE TABLE public.campaign_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  proposal_text TEXT,
  proposed_budget DECIMAL(10,2),
  proposed_deliverables JSONB,
  portfolio_links TEXT[],
  status application_status NOT NULL DEFAULT 'pending',
  brand_notes TEXT,
  rejection_reason TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(campaign_id, influencer_id)
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  attachments JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  brand_id UUID NOT NULL REFERENCES public.brand_profiles(id),
  influencer_id UUID REFERENCES public.influencer_profiles(id),
  type TEXT NOT NULL, -- 'campaign_payment', 'platform_fee', 'influencer_payout'
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'BGN',
  platform_fee DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  status payment_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  description TEXT,
  metadata JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.users(id),
  reviewed_id UUID NOT NULL REFERENCES public.users(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, reviewer_id, reviewed_id)
);

-- Platform settings
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default platform settings
INSERT INTO public.platform_settings (key, value, description) VALUES
  ('platform_fee_percentage', '25', 'Platform fee percentage charged on transactions'),
  ('min_campaign_budget', '100', 'Minimum campaign budget in BGN'),
  ('max_campaign_budget', '100000', 'Maximum campaign budget in BGN'),
  ('auto_close_inactive_days', '10', 'Days before auto-closing inactive deals');

-- Create indexes for better performance
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_status ON public.users(status);
CREATE INDEX idx_influencer_profiles_categories ON public.influencer_profiles USING GIN(categories);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_categories ON public.campaigns USING GIN(categories);
CREATE INDEX idx_campaign_applications_status ON public.campaign_applications(status);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_recipient ON public.messages(recipient_id, read);
CREATE INDEX idx_transactions_status ON public.transactions(status);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Public can view active influencer profiles
CREATE POLICY "Public can view active influencers" ON public.influencer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = influencer_profiles.user_id
      AND users.status = 'active'
    )
  );

-- Influencers can update their own profile
CREATE POLICY "Influencers can update own profile" ON public.influencer_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Public can view active campaigns
CREATE POLICY "Public can view active campaigns" ON public.campaigns
  FOR SELECT USING (status = 'active' AND visibility = 'public');

-- Brands can manage their own campaigns
CREATE POLICY "Brands can manage own campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.brand_profiles
      WHERE brand_profiles.id = campaigns.brand_id
      AND brand_profiles.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();