-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Adds each alum's Major at Howard and Graduation Year, plus their choice of
-- whether to show it on their directory cards (hidden by default).

-- 1. One row of alumni info per account
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  major text,
  grad_year integer check (grad_year between 1867 and 2100),
  show_on_card boolean not null default false
);

alter table public.profiles enable row level security;

-- Public: only info the alum chose to make visible
drop policy if exists "Anyone can view visible profiles" on public.profiles;
create policy "Anyone can view visible profiles"
  on public.profiles for select
  using (show_on_card = true);

-- Logged-in alum: read, add, and change their own info
drop policy if exists "Alumni read own profile" on public.profiles;
create policy "Alumni read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Alumni insert own profile" on public.profiles;
create policy "Alumni insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Alumni update own profile" on public.profiles;
create policy "Alumni update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. Save what was entered on the Sign Up form when the account is created.
--    (The alum is not logged in until they confirm their email, so the site
--    passes the answers along with the sign-up and this copies them over.)
--    Bad values are dropped rather than blocking the sign-up.
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  year_text text := new.raw_user_meta_data ->> 'grad_year';
begin
  insert into public.profiles (user_id, major, grad_year, show_on_card)
  values (
    new.id,
    nullif(trim(new.raw_user_meta_data ->> 'major'), ''),
    case
      when year_text ~ '^\d{4}$' and year_text::int between 1867 and 2100
        then year_text::int
    end,
    coalesce(new.raw_user_meta_data ->> 'show_on_card', '') = 'true'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- Confirm the result
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'profiles';
