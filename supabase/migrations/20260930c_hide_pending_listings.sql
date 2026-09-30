-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- The public can see only approved listings; each alum can still see their own
-- pending ones. Admins in the Supabase dashboard continue to see everything.

-- Public: approved listings only (replaces the old "see everything" rule)
drop policy if exists "Anyone can view businesses" on public.businesses;
drop policy if exists "Anyone can view approved businesses" on public.businesses;
create policy "Anyone can view approved businesses"
  on public.businesses for select
  using (is_approved = true);

-- Logged-in alum: their own listings, approved or pending
drop policy if exists "Alumni read own businesses" on public.businesses;
create policy "Alumni read own businesses"
  on public.businesses for select
  to authenticated
  using (auth.uid() = user_id);

-- Only logged-in alumni can submit, and only under their own account
drop policy if exists "Users can insert their own business" on public.businesses;
create policy "Users can insert their own business"
  on public.businesses for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Confirm the result
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'businesses';
