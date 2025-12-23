-- ============================================================
-- MIGRATION: ADVANCED FEATURES (Anti-Fraud, Leaderboards, Reputation)
-- DEPENDENCIES: 001_create_tables.sql (Core Schema)
-- ============================================================

-- =========================
-- 1. ANTI-FRAUD: GPS PROXIMITY CHECK
-- =========================
-- Function to validate that submission is close to the task location
CREATE OR REPLACE FUNCTION check_task_proximity()
RETURNS TRIGGER AS $$
DECLARE
  task_loc GEOGRAPHY;
  distance_meters FLOAT;
  max_distance FLOAT := 100.0; -- 100 meters tolerance
BEGIN
  -- Get task location
  SELECT location INTO task_loc
  FROM public.tasks
  WHERE id = NEW.task_id;

  -- Only check if both have valid locations
  IF task_loc IS NOT NULL AND NEW.location IS NOT NULL THEN
    distance_meters := ST_Distance(task_loc, NEW.location);

    -- Update metadata with check result
    -- Ensure metadata is initialized
    IF NEW.metadata IS NULL THEN
      NEW.metadata := '{}'::jsonb;
    END IF;

    NEW.metadata := jsonb_set(
      NEW.metadata,
      '{gps_check}',
      jsonb_build_object(
        'valid', distance_meters <= max_distance,
        'distance_meters', distance_meters
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run on new proofs
DROP TRIGGER IF EXISTS trg_check_proximity ON public.task_proofs;
CREATE TRIGGER trg_check_proximity
BEFORE INSERT ON public.task_proofs
FOR EACH ROW
EXECUTE FUNCTION check_task_proximity();


-- =========================
-- 2. ABUSIVE BEHAVIOR: SPAM THROTTLING
-- =========================
-- Prevent users from submitting too many tasks too quickly
CREATE OR REPLACE FUNCTION check_submission_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_count INTEGER;
  time_window INTERVAL := '5 minutes';
  max_submissions INTEGER := 3;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM public.task_proofs
  WHERE user_id = NEW.user_id
    AND created_at > NOW() - time_window;

  IF recent_count >= max_submissions THEN
    RAISE EXCEPTION 'Submission rate limit exceeded. Please wait a moment.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rate_limit ON public.task_proofs;
CREATE TRIGGER trg_rate_limit
BEFORE INSERT ON public.task_proofs
FOR EACH ROW
EXECUTE FUNCTION check_submission_rate_limit();


-- =========================
-- 3. ADVANCED LEADERBOARDS: SEASONAL & REGIONAL
-- =========================
-- Seasonal Leaderboard View (Partitioned by Year-Month)
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard_seasonal AS
SELECT
  p.id AS user_id,
  p.display_name,
  to_char(t.created_at, 'YYYY-MM') AS season_id,
  p.city,
  p.state,
  SUM(t.amount) AS seasonal_tokens,
  RANK() OVER (PARTITION BY to_char(t.created_at, 'YYYY-MM') ORDER BY SUM(t.amount) DESC) AS global_rank,
  RANK() OVER (PARTITION BY to_char(t.created_at, 'YYYY-MM'), p.city ORDER BY SUM(t.amount) DESC) AS city_rank
FROM public.profiles p
JOIN public.token_transactions t ON p.id = t.user_id
WHERE t.transaction_type = 'earned'
GROUP BY p.id, season_id, p.city, p.state;

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_seasonal ON leaderboard_seasonal(user_id, season_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_seasonal_leaderboard()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_seasonal;
END;
$$;


-- =========================
-- 4. REPUTATION SYSTEM: DECAY
-- =========================
-- Logic to decay XP/Score for inactive users (e.g., call via pg_cron)
CREATE OR REPLACE FUNCTION apply_reputation_decay()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Reduce current_streak if no activity for 2 days
  UPDATE public.profiles
  SET current_streak = 0
  WHERE last_activity_date < CURRENT_DATE - INTERVAL '2 days'
    AND current_streak > 0;

  -- Optional: Decay impact score slightly
  UPDATE public.profiles
  SET impact_score = GREATEST(0, impact_score - 0.5)
  WHERE last_activity_date < CURRENT_DATE - INTERVAL '7 days';

END;
$$;


-- =========================
-- 5. RLS POLICIES FOR NEW VIEWS
-- =========================
ALTER MATERIALIZED VIEW leaderboard_seasonal ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "seasonal_leaderboard_select_all" ON leaderboard_seasonal;
CREATE POLICY "seasonal_leaderboard_select_all" ON leaderboard_seasonal FOR SELECT USING (true);
