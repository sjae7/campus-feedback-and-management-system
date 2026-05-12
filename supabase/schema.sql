create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.suggestion_status as enum ('new', 'reviewing', 'resolved', 'rejected');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 5 and 120),
  message text not null check (char_length(message) between 15 and 3000),
  category text not null,
  status public.suggestion_status not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suggestion_attachments (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.suggestions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  bucket text not null default 'suggestion-attachments',
  path text not null unique,
  file_name text not null,
  mime_type text,
  size bigint,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists suggestions_user_id_created_at_idx on public.suggestions(user_id, created_at desc);
create index if not exists suggestions_status_created_at_idx on public.suggestions(status, created_at desc);
create index if not exists suggestion_attachments_suggestion_id_idx on public.suggestion_attachments(suggestion_id);
create index if not exists suggestion_attachments_user_id_idx on public.suggestion_attachments(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_suggestions_updated_at on public.suggestions;
create trigger set_suggestions_updated_at
before update on public.suggestions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'user'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
stable
security definer
set search_path = public
language sql
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.suggestions enable row level security;
alter table public.suggestion_attachments enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (id = auth.uid() and role = 'user');

drop policy if exists "Users can read own suggestions and admins can read all" on public.suggestions;
create policy "Users can read own suggestions and admins can read all"
on public.suggestions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own suggestions" on public.suggestions;
create policy "Users can create own suggestions"
on public.suggestions for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Admins can update suggestions" on public.suggestions;
create policy "Admins can update suggestions"
on public.suggestions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users can read own attachments and admins can read all" on public.suggestion_attachments;
create policy "Users can read own attachments and admins can read all"
on public.suggestion_attachments for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users can create own attachment metadata" on public.suggestion_attachments;
create policy "Users can create own attachment metadata"
on public.suggestion_attachments for insert
to authenticated
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('suggestion-attachments', 'suggestion-attachments', false)
on conflict (id) do update set public = false;

drop policy if exists "Users can upload own suggestion attachments" on storage.objects;
create policy "Users can upload own suggestion attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'suggestion-attachments'
  and split_part(name, '/', 1) = auth.uid()::text
);

drop policy if exists "Users can read own suggestion attachments and admins can read all" on storage.objects;
create policy "Users can read own suggestion attachments and admins can read all"
on storage.objects for select
to authenticated
using (
  bucket_id = 'suggestion-attachments'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
);

drop policy if exists "Users can delete own suggestion attachments and admins can delete all" on storage.objects;
create policy "Users can delete own suggestion attachments and admins can delete all"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'suggestion-attachments'
  and (split_part(name, '/', 1) = auth.uid()::text or public.is_admin())
);
