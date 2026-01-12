-- Seed initial badges
INSERT INTO public.badges (name, description, icon_url, category, criteria_type, criteria_value, rarity) VALUES
  ('Cleanup Rookie', 'Complete your first cleanup task', '/badges/rookie.svg', 'task_count', 'tasks_completed', 1, 'common'),
  ('Cleanup Veteran', 'Complete 10 cleanup tasks', '/badges/veteran.svg', 'task_count', 'tasks_completed', 10, 'common'),
  ('Cleanup Champion', 'Complete 50 cleanup tasks', '/badges/champion.svg', 'task_count', 'tasks_completed', 50, 'rare'),
  ('Cleanup Legend', 'Complete 100 cleanup tasks', '/badges/legend.svg', 'task_count', 'tasks_completed', 100, 'epic'),
  ('Streak Starter', 'Maintain a 3-day streak', '/badges/streak-3.svg', 'streak', 'streak_days', 3, 'common'),
  ('Streak Master', 'Maintain a 7-day streak', '/badges/streak-7.svg', 'streak', 'streak_days', 7, 'rare'),
  ('Streak Champion', 'Maintain a 30-day streak', '/badges/streak-30.svg', 'streak', 'streak_days', 30, 'epic'),
  ('Streak Legend', 'Maintain a 100-day streak', '/badges/streak-100.svg', 'streak', 'streak_days', 100, 'legendary'),
  ('Token Collector', 'Earn 100 tokens', '/badges/tokens-100.svg', 'impact', 'tokens_earned', 100, 'common'),
  ('Token Master', 'Earn 500 tokens', '/badges/tokens-500.svg', 'impact', 'tokens_earned', 500, 'rare'),
  ('Token Legend', 'Earn 1000 tokens', '/badges/tokens-1000.svg', 'impact', 'tokens_earned', 1000, 'epic'),
  ('Early Adopter', 'Join SaafSaksham in its first month', '/badges/early.svg', 'special', 'special', 1, 'legendary'),
  ('City Hero', 'Most tasks completed in your city', '/badges/hero.svg', 'special', 'special', 1, 'legendary'),
  ('Eco Warrior', 'Plant 10 trees or complete 10 environmental tasks', '/badges/eco.svg', 'impact', 'eco_tasks', 10, 'rare')
ON CONFLICT (name) DO NOTHING;
