-- Enable RLS and create policies for tables disabled in public

-- 1. PROFILES
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);


-- 2. TASKS
ALTER TABLE IF EXISTS public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_select_public" ON public.tasks;
CREATE POLICY "tasks_select_public" ON public.tasks FOR SELECT USING (
  visibility = 'public' OR 
  posted_by = auth.uid() OR 
  claimed_by = auth.uid()
);

DROP POLICY IF EXISTS "tasks_insert_all" ON public.tasks;
CREATE POLICY "tasks_insert_all" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "tasks_update_own_or_claimed" ON public.tasks;
CREATE POLICY "tasks_update_own_or_claimed" ON public.tasks FOR UPDATE USING (
  posted_by = auth.uid() OR 
  claimed_by = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'verifier')
);

DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (
  posted_by = auth.uid() OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 3. TASK PROOFS
ALTER TABLE IF EXISTS public.task_proofs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_proofs_select_related" ON public.task_proofs;
CREATE POLICY "task_proofs_select_related" ON public.task_proofs FOR SELECT USING (
  user_id = auth.uid() OR 
  (SELECT claimed_by FROM public.tasks WHERE id = task_id) = auth.uid() OR
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'verifier')
);

DROP POLICY IF EXISTS "task_proofs_insert_own" ON public.task_proofs;
CREATE POLICY "task_proofs_insert_own" ON public.task_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "task_proofs_delete_own" ON public.task_proofs;
CREATE POLICY "task_proofs_delete_own" ON public.task_proofs FOR DELETE USING (auth.uid() = user_id);


-- 4. VERIFICATIONS
ALTER TABLE IF EXISTS public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verifications_select_all" ON public.verifications;
CREATE POLICY "verifications_select_all" ON public.verifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "verifications_insert_verifiers" ON public.verifications;
CREATE POLICY "verifications_insert_verifiers" ON public.verifications FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('verifier', 'admin')
);


-- 5. TOKEN TRANSACTIONS
ALTER TABLE IF EXISTS public.token_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "token_transactions_select_own" ON public.token_transactions;
CREATE POLICY "token_transactions_select_own" ON public.token_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "token_transactions_insert_system" ON public.token_transactions;
CREATE POLICY "token_transactions_insert_system" ON public.token_transactions FOR INSERT WITH CHECK (
  auth.uid() = user_id OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
);


-- 6. REDEMPTION OPTIONS
ALTER TABLE IF EXISTS public.redemption_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemption_options_select_active" ON public.redemption_options;
CREATE POLICY "redemption_options_select_active" ON public.redemption_options FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "redemption_options_all_admin" ON public.redemption_options;
CREATE POLICY "redemption_options_all_admin" ON public.redemption_options FOR ALL USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);


-- 7. REDEMPTIONS
ALTER TABLE IF EXISTS public.redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions_select_own" ON public.redemptions;
CREATE POLICY "redemptions_select_own" ON public.redemptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "redemptions_insert_own" ON public.redemptions;
CREATE POLICY "redemptions_insert_own" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 8. BADGES
ALTER TABLE IF EXISTS public.badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "badges_select_all" ON public.badges;
CREATE POLICY "badges_select_all" ON public.badges FOR SELECT USING (is_active = TRUE);


-- 9. USER BADGES
ALTER TABLE IF EXISTS public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_all" ON public.user_badges;
CREATE POLICY "user_badges_select_all" ON public.user_badges FOR SELECT USING (true);

DROP POLICY IF EXISTS "user_badges_insert_system" ON public.user_badges;
CREATE POLICY "user_badges_insert_system" ON public.user_badges FOR INSERT WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin')
);


-- 10. NOTIFICATIONS
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- 11. CSR PARTNERS
ALTER TABLE IF EXISTS public.csr_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "csr_partners_select_all" ON public.csr_partners;
CREATE POLICY "csr_partners_select_all" ON public.csr_partners FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "csr_partners_update_own" ON public.csr_partners;
CREATE POLICY "csr_partners_update_own" ON public.csr_partners FOR UPDATE USING (auth.uid() = partner_id);


-- 12. SPATIAL_REF_SYS (PostGIS)
-- Usually publicly readable info
ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "spatial_ref_sys_select_all" ON public.spatial_ref_sys;
CREATE POLICY "spatial_ref_sys_select_all" ON public.spatial_ref_sys FOR SELECT USING (true);
