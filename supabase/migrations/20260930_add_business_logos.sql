-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Project: HUAC-DFW Project - Business Registry (qtzapzawmunfriexkefs)

-- 1. Thumbnail column on each listing (headshot or company logo)
alter table public.businesses
  add column if not exists logo_url text;

-- 2. Public storage bucket for the images (2 MB max, images only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view the images (they appear on the public directory)
drop policy if exists "Public read business logos" on storage.objects;
create policy "Public read business logos"
  on storage.objects for select
  using (bucket_id = 'business-logos');

-- Logged-in alumni can upload only into their own folder: <user_id>/<file>
drop policy if exists "Alumni upload own business logos" on storage.objects;
create policy "Alumni upload own business logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Keep the approval workflow honest: a logged-in alum can never approve
--    their own listing. Admins editing in the Supabase dashboard are unaffected.
create or replace function public.enforce_business_approval()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' then
      new.is_approved := false;
    else
      new.is_approved := old.is_approved;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists businesses_enforce_approval on public.businesses;
create trigger businesses_enforce_approval
  before insert or update on public.businesses
  for each row execute function public.enforce_business_approval();

-- 4. Data fix: Ware Intelligence contact email
update public.businesses
  set email = 'fred@wareintelligence.ai'
  where business_name = 'Ware Intelligence';
