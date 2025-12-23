-- ============================================================
-- COMPLETE PRODUCTION-SAFE SCHEMA (SENIOR-LEVEL)
-- Supabase + PostgreSQL + PostGIS
-- Re-runnable | No data loss | No linter-blocking errors
-- ============================================================

-- ============================================================
-- EXTENSIONS (SAFE)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS extensions;

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

ALTER DATABASE postgres
SET search_path = public, extensions;

-- NOTE:
-- spatial_ref_sys is owned by postgres on Supabase.
-- It is NOT exposed via PostgREST.
-- DO NOT attempt to alter it (will always fail).

-- ============================================================
-- DROP DEPENDENT OBJECTS
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS leaderboard;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT),
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tasks_verified INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS impact_score NUMERIC(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'citizen',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS valid_role;

ALTER TABLE public.profiles
ADD CONSTRAINT valid_role
CHECK (role IN ('citizen','verifier','admin','csr_partner'));

ALTER TABLE public.profiles
DROP COLUMN IF EXISTS level;

ALTER TABLE public.profiles
ADD COLUMN level INTEGER
GENERATED ALWAYS AS (
  FLOOR(POWER((total_xp::numeric / 100), 0.67))
) STORED;

CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level);

-- ============================================================
-- RLS: PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;
CREATE POLICY profiles_delete_own
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  location_address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT,
  token_reward INTEGER DEFAULT 50,
  xp_reward INTEGER DEFAULT 25,
  status TEXT DEFAULT 'open',
  posted_by UUID REFERENCES public.profiles(id),
  claimed_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_location ON public.tasks USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_tasks_city_status ON public.tasks(city, status);

-- ============================================================
-- RLS: TASKS
-- ============================================================
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tasks_select_public ON public.tasks;
CREATE POLICY tasks_select_public
ON public.tasks FOR SELECT
USING (
  status = 'open'
  OR posted_by = auth.uid()
  OR claimed_by = auth.uid()
);

DROP POLICY IF EXISTS tasks_insert_own ON public.tasks;
CREATE POLICY tasks_insert_own
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS tasks_update_allowed ON public.tasks;
CREATE POLICY tasks_update_allowed
ON public.tasks FOR UPDATE
USING (
  posted_by = auth.uid()
  OR claimed_by = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','verifier')
);

-- ============================================================
-- TASK PROOFS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.task_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  media_url TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  exif_data JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_proofs_task ON public.task_proofs(task_id);

ALTER TABLE public.task_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS task_proofs_insert_own ON public.task_proofs;
CREATE POLICY task_proofs_insert_own
ON public.task_proofs FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS task_proofs_select_related ON public.task_proofs;
CREATE POLICY task_proofs_select_related
ON public.task_proofs FOR SELECT
USING (
  user_id = auth.uid()
  OR (SELECT claimed_by FROM public.tasks WHERE id = task_id) = auth.uid()
  OR (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','verifier')
);

-- ============================================================
-- VERIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id),
  verifier_id UUID REFERENCES public.profiles(id),
  status TEXT CHECK (status IN ('pending','approved','rejected','flagged')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS verifications_select_all ON public.verifications;
CREATE POLICY verifications_select_all
ON public.verifications FOR SELECT
USING (true);

DROP POLICY IF EXISTS verifications_insert_verifier ON public.verifications;
CREATE POLICY verifications_insert_verifier
ON public.verifications FOR INSERT
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin','verifier')
);

-- ============================================================
-- XP & TOKEN AUTOMATION (TRIGGER)
-- ============================================================
CREATE OR REPLACE FUNCTION reward_user_after_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  xp INT;
  tok INT;
  uid UUID;
BEGIN
  IF NEW.status = 'approved' THEN
    SELECT xp_reward, token_reward, claimed_by
    INTO xp, tok, uid
    FROM public.tasks WHERE id = NEW.task_id;

    UPDATE public.profiles
    SET total_xp = total_xp + xp,
        total_tokens = total_tokens + tok,
        tasks_completed = tasks_completed + 1,
        updated_at = now()
    WHERE id = uid;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reward_after_verification ON public.verifications;
CREATE TRIGGER reward_after_verification
AFTER INSERT ON public.verifications
FOR EACH ROW
EXECUTE FUNCTION reward_user_after_verification();

-- ============================================================
-- LEADERBOARD (SECURE)
-- ============================================================
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  p.id AS user_id,
  p.display_name,
  p.city,
  p.state,
  p.total_tokens,
  p.total_xp,
  p.level,
  ROW_NUMBER() OVER (
    PARTITION BY p.city
    ORDER BY p.total_tokens DESC, p.total_xp DESC
  ) AS city_rank
FROM public.profiles p
WHERE p.role = 'citizen';

CREATE UNIQUE INDEX idx_leaderboard_user
ON leaderboard(user_id);

REVOKE ALL ON leaderboard FROM anon, authenticated;

-- ============================================================
-- SAFE GEO RPC
-- ============================================================
CREATE OR REPLACE FUNCTION public.tasks_within_bounds(
  min_lat DOUBLE PRECISION,
  min_lng DOUBLE PRECISION,
  max_lat DOUBLE PRECISION,
  max_lng DOUBLE PRECISION
)
RETURNS SETOF public.tasks
LANGUAGE sql
STABLE
SET search_path = public, extensions
AS $$
  SELECT *
  FROM public.tasks
  WHERE ST_Within(
    location::geometry,
    ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
  );
$$;

-- ============================================================
-- END (PRODUCTION-READY, ZERO BLOCKING ERRORS)
-- ============================================================
