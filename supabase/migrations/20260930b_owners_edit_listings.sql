-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Lets each logged-in alum see and edit their own listings (including pending ones).
-- They still cannot touch anyone else's listing or change approval status.

drop policy if exists "Alumni read own businesses" on public.businesses;
create policy "Alumni read own businesses"
  on public.businesses for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Alumni update own businesses" on public.businesses;
create policy "Alumni update own businesses"
  on public.businesses for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Shows every rule on the table so you can confirm the result
-- (rls_on should be true; otherwise the rules are not being enforced)
select (select relrowsecurity from pg_class where oid = 'public.businesses'::regclass) as rls_on,
       policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'businesses';
