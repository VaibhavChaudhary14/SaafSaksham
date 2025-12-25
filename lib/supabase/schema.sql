-- ==========================================
-- 1. CLEANUP (If resetting)
-- ==========================================
-- DROP TABLE IF EXISTS token_transactions CASCADE;
-- DROP TABLE IF EXISTS tasks CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- ==========================================
-- 2. EXTENSIONS
-- ==========================================
CREATE EXTENSION IF NOT EXISTS postgis;

-- ==========================================
-- 3. TABLES
-- ==========================================

-- PROFILES
CREATE TABLE profiles (
  id TEXT PRIMARY KEY, -- Firebase UID
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'citizen',
  total_tokens INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_verified INTEGER DEFAULT 0,
  last_known_location GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access" ON profiles FOR ALL TO public USING (true) WITH CHECK (true);

-- TASKS
CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT,
    description TEXT,
    
    -- Geospatial
    location_geo GEOGRAPHY(POINT, 4326),
    location_address TEXT,
    city TEXT,
    
    image_url TEXT,
    reward_amount INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open', -- open, in_progress, verification, completed
    category TEXT DEFAULT 'other',
    severity TEXT DEFAULT 'medium',
    
    -- Foreign Keys (Explicitly named for PostgREST)
    posted_by TEXT,
    claimed_by TEXT,
    verified_by TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT posted_by FOREIGN KEY (posted_by) REFERENCES profiles(id),
    CONSTRAINT claimed_by FOREIGN KEY (claimed_by) REFERENCES profiles(id),
    CONSTRAINT verified_by FOREIGN KEY (verified_by) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS tasks_location_geo_idx ON tasks USING GIST (location_geo);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public access tasks" ON tasks FOR ALL TO public USING (true) WITH CHECK (true);

-- ==========================================
-- 4. RPC FUNCTIONS
-- ==========================================

-- Get Nearby Tasks
CREATE OR REPLACE FUNCTION get_nearby_tasks(
  lat float,
  long float,
  radius_meters float default 5000
)
RETURNS SETOF tasks
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM tasks
  WHERE ST_DWithin(
    location_geo,
    ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography,
    radius_meters
  )
  ORDER BY 
    ST_Distance(
      location_geo, 
      ST_SetSRID(ST_MakePoint(long, lat), 4326)::geography
    ) ASC;
$$;

-- ==========================================
-- 5. STORAGE POLICIES (Bucket: 'task-proofs')
-- ==========================================
-- (Make sure bucket exists in Storage UI first)

-- DROP POLICY IF EXISTS "Public Access" ON storage.objects;
-- CREATE POLICY "Public Access"
--   ON storage.objects FOR SELECT
--   USING ( bucket_id = 'task-proofs' );

-- DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
-- CREATE POLICY "Authenticated users can upload"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK ( bucket_id = 'task-proofs' );
