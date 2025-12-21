-- Seed sample tasks (for testing and demo)
INSERT INTO public.tasks (title, description, task_type, location_name, latitude, longitude, city, state, pincode, token_reward, difficulty, estimated_time) VALUES
  ('Clean Connaught Place Market Area', 'Remove litter and plastic waste from the central market area near Gate 1', 'litter_pickup', 'Connaught Place, Gate 1', 28.6315, 77.2167, 'New Delhi', 'Delhi', '110001', 50, 'easy', 30),
  ('Paint Over Graffiti at India Gate', 'Remove inappropriate graffiti from the walls near India Gate entrance', 'graffiti_removal', 'India Gate Main Entrance', 28.6129, 77.2295, 'New Delhi', 'Delhi', '110001', 100, 'medium', 60),
  ('Clear Blocked Drain - Karol Bagh', 'Remove debris blocking the storm drain causing waterlogging', 'drain_cleaning', 'Karol Bagh Metro Station Road', 28.6508, 77.1923, 'New Delhi', 'Delhi', '110005', 75, 'medium', 45),
  ('Plant Saplings at Lodhi Garden', 'Plant 5 native tree saplings in designated area', 'tree_planting', 'Lodhi Garden North Section', 28.5931, 77.2197, 'New Delhi', 'Delhi', '110003', 150, 'hard', 90),
  ('Organize Awareness Drive - Chandni Chowk', 'Distribute pamphlets and educate shopkeepers about waste segregation', 'awareness_campaign', 'Chandni Chowk Main Market', 28.6506, 77.2303, 'New Delhi', 'Delhi', '110006', 80, 'medium', 120),
  ('Report Illegal Dumping - Nehru Place', 'Document and report illegal waste dumping site with photos', 'report_issue', 'Nehru Place Metro Station Area', 28.5494, 77.2501, 'New Delhi', 'Delhi', '110019', 30, 'easy', 15),
  ('Beach Cleanup - Juhu Beach', 'Remove plastic bottles and waste from 100m stretch of beach', 'litter_pickup', 'Juhu Beach North End', 19.1075, 72.8263, 'Mumbai', 'Maharashtra', '400049', 60, 'easy', 40),
  ('Street Cleanup - Brigade Road', 'Clean cigarette butts and small litter from main shopping street', 'litter_pickup', 'Brigade Road Shopping Area', 12.9716, 77.5946, 'Bangalore', 'Karnataka', '560001', 40, 'easy', 25),
  ('Park Beautification - Cubbon Park', 'Remove weeds and clean flower beds in designated section', 'litter_pickup', 'Cubbon Park East Gate', 12.9766, 77.5993, 'Bangalore', 'Karnataka', '560001', 70, 'medium', 60),
  ('Lake Cleanup - Hussain Sagar', 'Remove floating plastic and debris from lake shore', 'litter_pickup', 'Hussain Sagar Tank Bund', 17.4239, 78.4738, 'Hyderabad', 'Telangana', '500001', 90, 'medium', 75)
ON CONFLICT DO NOTHING;
