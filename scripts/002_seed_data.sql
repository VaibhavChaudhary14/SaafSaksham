-- Seed Badges
INSERT INTO public.badges (name, description, icon_url, category, rarity, criteria) VALUES
('First Task', 'Complete your first civic task', '/badges/first-task.png', 'milestone', 'common', '{"tasks_completed": 1}'),
('Task Master', 'Complete 10 tasks', '/badges/task-master.png', 'milestone', 'common', '{"tasks_completed": 10}'),
('Civic Champion', 'Complete 50 tasks', '/badges/civic-champion.png', 'milestone', 'rare', '{"tasks_completed": 50}'),
('Century Club', 'Complete 100 tasks', '/badges/century-club.png', 'milestone', 'epic', '{"tasks_completed": 100}'),
('On Fire', 'Maintain a 7-day streak', '/badges/on-fire.png', 'streak', 'rare', '{"current_streak": 7}'),
('Unstoppable', 'Maintain a 30-day streak', '/badges/unstoppable.png', 'streak', 'epic', '{"current_streak": 30}'),
('Legend', 'Maintain a 100-day streak', '/badges/legend.png', 'streak', 'legendary', '{"current_streak": 100}'),
('Verified Warrior', 'Verify 50 tasks', '/badges/verified-warrior.png', 'achievement', 'rare', '{"tasks_verified": 50}'),
('Impact Hero', 'Achieve 1000 impact score', '/badges/impact-hero.png', 'achievement', 'epic', '{"impact_score": 1000}'),
('Token Collector', 'Earn 10,000 tokens', '/badges/token-collector.png', 'milestone', 'epic', '{"total_tokens": 10000}')
ON CONFLICT (name) DO NOTHING;

-- Seed Redemption Options
INSERT INTO public.redemption_options (title, description, category, token_cost, provider, image_url, stock_available) VALUES
('Amazon Gift Card - Rs. 100', 'Redeem tokens for Amazon shopping', 'voucher', 1000, 'Amazon', '/redemptions/amazon.png', 1000),
('Flipkart Voucher - Rs. 100', 'Use on Flipkart for online shopping', 'voucher', 1000, 'Flipkart', '/redemptions/flipkart.png', 1000),
('Food Delivery Voucher - Rs. 200', 'Order your favorite food with Zomato/Swiggy', 'voucher', 2000, 'Zomato/Swiggy', '/redemptions/food.png', 500),
('SaafSaksham T-Shirt', 'Official merchandise t-shirt', 'merchandise', 500, 'SaafSaksham', '/redemptions/tshirt.png', 200),
('Plant a Tree', 'Donate to plant a tree in your city', 'donation', 300, 'Green India Initiative', '/redemptions/tree.png', 9999),
('Clean Water Donation', 'Provide clean water to underserved communities', 'donation', 500, 'WaterAid India', '/redemptions/water.png', 9999),
('Education Donation', 'Support education for underprivileged children', 'donation', 750, 'Teach For India', '/redemptions/education.png', 9999),
('Movie Tickets - Rs. 300', 'Enjoy a movie at your nearest PVR', 'voucher', 3000, 'PVR Cinemas', '/redemptions/movie.png', 300),
('Cafe Voucher - Rs. 150', 'Coffee and snacks at Cafe Coffee Day', 'voucher', 1500, 'Cafe Coffee Day', '/redemptions/cafe.png', 400),
('Spa Discount - 20%', 'Wellness spa discount voucher', 'discount', 2500, 'O2 Spa', '/redemptions/spa.png', 100)
ON CONFLICT DO NOTHING;
