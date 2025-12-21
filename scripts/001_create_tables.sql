-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'verifier', 'admin', 'csr_partner')),
  avatar_url TEXT,
  bio TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  city TEXT,
  state TEXT,
  pincode TEXT,
  aadhar_verified BOOLEAN DEFAULT FALSE,
  verification_level INTEGER DEFAULT 0 CHECK (verification_level >= 0 AND verification_level <= 3),
  total_tokens INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  tasks_completed INTEGER DEFAULT 0,
  tasks_verified INTEGER DEFAULT 0,
  impact_score DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('garbage', 'pothole', 'graffiti', 'drainage', 'streetlight', 'illegal_dump', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  location_address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  token_reward INTEGER NOT NULL,
  xp_reward INTEGER NOT NULL,
  estimated_time INTEGER, -- in minutes
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'submitted', 'verified', 'rejected', 'expired')),
  posted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  claimed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  required_proof_types TEXT[] DEFAULT ARRAY['before_photo', 'after_photo'],
  tags TEXT[],
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'csr_only')),
  csr_partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks policies
CREATE POLICY "tasks_select_public" ON public.tasks FOR SELECT USING (visibility = 'public' OR posted_by = auth.uid() OR claimed_by = auth.uid());
CREATE POLICY "tasks_insert_all" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = posted_by);
CREATE POLICY "tasks_update_own_or_claimed" ON public.tasks FOR UPDATE USING (posted_by = auth.uid() OR claimed_by = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'verifier'));
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (posted_by = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Task Proofs Table
CREATE TABLE IF NOT EXISTS public.task_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL CHECK (proof_type IN ('before_photo', 'after_photo', 'video', 'timestamp', 'location', 'additional')),
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  metadata JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_proofs
ALTER TABLE public.task_proofs ENABLE ROW LEVEL SECURITY;

-- Task proofs policies
CREATE POLICY "task_proofs_select_related" ON public.task_proofs FOR SELECT USING (
  user_id = auth.uid() OR 
  (SELECT claimed_by FROM public.tasks WHERE id = task_id) = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'verifier')
);
CREATE POLICY "task_proofs_insert_own" ON public.task_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "task_proofs_delete_own" ON public.task_proofs FOR DELETE USING (auth.uid() = user_id);

-- Verifications Table
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  verifier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'flagged')),
  quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
  cleanliness_score INTEGER CHECK (cleanliness_score >= 0 AND cleanliness_score <= 100),
  impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  notes TEXT,
  rejection_reason TEXT,
  ai_confidence_score DECIMAL(5, 2),
  verification_method TEXT DEFAULT 'manual' CHECK (verification_method IN ('manual', 'ai', 'hybrid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on verifications
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

-- Verifications policies
CREATE POLICY "verifications_select_all" ON public.verifications FOR SELECT USING (true);
CREATE POLICY "verifications_insert_verifiers" ON public.verifications FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('verifier', 'admin')
);

-- Token Transactions Table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'redeemed', 'bonus', 'penalty', 'transfer')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  redemption_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on token_transactions
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Token transactions policies
CREATE POLICY "token_transactions_select_own" ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "token_transactions_insert_system" ON public.token_transactions FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
);

-- Redemption Options Table
CREATE TABLE IF NOT EXISTS public.redemption_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('voucher', 'merchandise', 'donation', 'discount', 'service')),
  token_cost INTEGER NOT NULL,
  provider TEXT,
  provider_logo_url TEXT,
  image_url TEXT,
  terms_conditions TEXT,
  stock_available INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on redemption_options
ALTER TABLE public.redemption_options ENABLE ROW LEVEL SECURITY;

-- Redemption options policies
CREATE POLICY "redemption_options_select_active" ON public.redemption_options FOR SELECT USING (is_active = TRUE);
CREATE POLICY "redemption_options_all_admin" ON public.redemption_options FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Redemptions Table
CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  redemption_option_id UUID NOT NULL REFERENCES public.redemption_options(id) ON DELETE CASCADE,
  tokens_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'delivered', 'cancelled')),
  delivery_details JSONB,
  redemption_code TEXT,
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on redemptions
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- Redemptions policies
CREATE POLICY "redemptions_select_own" ON public.redemptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "redemptions_insert_own" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Badges Table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'streak', 'special', 'achievement')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  criteria JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Badges policies
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (is_active = TRUE);

-- User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS on user_badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- User badges policies
CREATE POLICY "user_badges_select_all" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_insert_system" ON public.user_badges FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
);

-- Leaderboard Table (Materialized View for Performance)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_tokens INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  impact_score DECIMAL(10, 2) DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on leaderboard
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Leaderboard policies
CREATE POLICY "leaderboard_select_all" ON public.leaderboard FOR SELECT USING (true);

-- Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_claimed', 'task_verified', 'task_rejected', 'badge_earned', 'token_earned', 'level_up', 'streak_milestone', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- CSR Partners Table
CREATE TABLE IF NOT EXISTS public.csr_partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  total_budget INTEGER DEFAULT 0,
  spent_budget INTEGER DEFAULT 0,
  tasks_sponsored INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on csr_partners
ALTER TABLE public.csr_partners ENABLE ROW LEVEL SECURITY;

-- CSR partners policies
CREATE POLICY "csr_partners_select_all" ON public.csr_partners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "csr_partners_update_own" ON public.csr_partners FOR UPDATE USING (auth.uid() = partner_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_location ON public.tasks USING GIST (
  ll_to_earth(location_lat, location_lng)
);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_city ON public.tasks(city);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, is_read);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
