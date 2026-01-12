-- ============================================================
-- COMPLETE SCHEMA & RLS FIX (Run this single file)
-- ============================================================

-- 1. CLEANUP (Prevent "already exists" errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_check_proximity ON public.task_proofs;
DROP TRIGGER IF EXISTS trg_rate_limit ON public.task_proofs;

-- 2. TABLE DEFINITIONS (Idempotent)

-- Profiles (PK is user_id)
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id uuid REFERENCES auth.users(id) PRIMARY KEY,
  name text,
  avatar_url text,
  civic_rank text DEFAULT 'Citizen',
  total_xp int DEFAULT 0,
  updated_at timestamptz,
  display_name text,
  city text,
  state text,
  current_streak int DEFAULT 0,
  last_activity_date date DEFAULT CURRENT_DATE,
  impact_score float DEFAULT 0.0,
  role text DEFAULT 'citizen' -- e.g. admin, verifier, citizen
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by uuid REFERENCES auth.users(id),
  location geography(point),
  category text,
  severity text,
  status text DEFAULT 'open',
  media_urls text[],
  verified_at timestamptz,
  verifier_id uuid REFERENCES auth.users(id),
  ai_confidence float,
  fraud_score float,
  created_at timestamptz DEFAULT now(),
  visibility text DEFAULT 'public',
  claimed_by uuid REFERENCES auth.users(id)
);

-- Task Proofs
CREATE TABLE IF NOT EXISTS public.task_proofs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES public.tasks(id),
    user_id uuid REFERENCES auth.users(id),
    location geography(point),
    media_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Token Transactions
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    task_id uuid REFERENCES public.tasks(id),
    amount int,
    transaction_type text,
    description text,
    created_at timestamptz DEFAULT now()
);

-- Reputation Logs
CREATE TABLE IF NOT EXISTS public.reputation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  delta int,
  reason text,
  task_id uuid REFERENCES public.tasks(id),
  created_at timestamptz DEFAULT now()
);

-- 3. TRIGGERS & FUNCTIONS

-- User Creation Handler
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, total_xp)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Proximity Check
CREATE OR REPLACE FUNCTION check_task_proximity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  task_loc GEOGRAPHY;
  distance_meters FLOAT;
BEGIN
  SELECT location INTO task_loc FROM public.tasks WHERE id = NEW.task_id;
  IF task_loc IS NOT NULL AND NEW.location IS NOT NULL THEN
    distance_meters := ST_Distance(task_loc, NEW.location);
    IF NEW.metadata IS NULL THEN NEW.metadata := '{}'::jsonb; END IF;
    NEW.metadata := jsonb_set(NEW.metadata, '{gps_check}', jsonb_build_object('valid', distance_meters <= 100.0, 'distance_meters', distance_meters));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_proximity BEFORE INSERT ON public.task_proofs FOR EACH ROW EXECUTE FUNCTION check_task_proximity();

-- Rate Limit
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO recent_count FROM public.task_proofs WHERE user_id = NEW.user_id AND created_at > NOW() - INTERVAL '5 minutes';
  IF recent_count >= 3 THEN RAISE EXCEPTION 'Submission rate limit exceeded.'; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rate_limit BEFORE INSERT ON public.task_proofs FOR EACH ROW EXECUTE FUNCTION check_submission_rate_limit();


-- 4. RLS POLICIES (FIXED COLUMN NAMES)

-- Profiles (PK is user_id, NOT id)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id); -- FIXED

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id); -- FIXED

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = user_id); -- FIXED

-- 5. LEADERBOARD VIEW (FIXED JOIN KEY)
DROP MATERIALIZED VIEW IF EXISTS leaderboard_seasonal;

CREATE MATERIALIZED VIEW leaderboard_seasonal AS
SELECT
  p.user_id AS user_id,  -- FIXED
  p.display_name,
  to_char(t.created_at, 'YYYY-MM') AS season_id,
  p.city,
  p.state,
  SUM(t.amount) AS seasonal_tokens,
  RANK() OVER (PARTITION BY to_char(t.created_at, 'YYYY-MM') ORDER BY SUM(t.amount) DESC) AS global_rank,
  RANK() OVER (PARTITION BY to_char(t.created_at, 'YYYY-MM'), p.city ORDER BY SUM(t.amount) DESC) AS city_rank
FROM public.profiles p
JOIN public.token_transactions t ON p.user_id = t.user_id -- FIXED
WHERE t.transaction_type = 'earned'
GROUP BY p.user_id, season_id, p.city, p.state;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_seasonal ON leaderboard_seasonal(user_id, season_id);
GRANT SELECT ON leaderboard_seasonal TO anon, authenticated, service_role;
