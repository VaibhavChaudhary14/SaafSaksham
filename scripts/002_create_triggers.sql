-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen'),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update profile updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger for profiles table
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update leaderboard cache
CREATE OR REPLACE FUNCTION public.refresh_leaderboard()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.leaderboard_cache;
  
  INSERT INTO public.leaderboard_cache (user_id, full_name, avatar_url, city, total_tasks, total_tokens, current_streak, rank)
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.city,
    COUNT(DISTINCT s.id) as total_tasks,
    p.total_tokens,
    p.current_streak,
    ROW_NUMBER() OVER (ORDER BY p.total_tokens DESC, COUNT(DISTINCT s.id) DESC) as rank
  FROM public.profiles p
  LEFT JOIN public.submissions s ON s.user_id = p.id AND s.verification_status = 'approved'
  WHERE p.role = 'citizen'
  GROUP BY p.id, p.full_name, p.avatar_url, p.city, p.total_tokens, p.current_streak
  ORDER BY rank
  LIMIT 100;
END;
$$;
