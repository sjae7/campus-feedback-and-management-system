create extension if not exists pgcrypto;

do $$
begin
  create type public.suggestion_status as enum (
    'new',
    'reviewing',
    'approved',
    'resolved',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

alter type public.suggestion_status add value if not exists 'approved';

create table if not exists public.departments (
  id text primary key,
  name text not null unique,
  created_at timestamptz not null default now()
);

insert into public.departments (id, name)
values
  ('computer-studies', 'Computer Studies Department'),
  ('engineering', 'Engineering Department'),
  ('technology', 'Technology Department'),
  ('entrepreneurship', 'Entrepreneurship Department'),
  ('teacher-education', 'Teacher Education Department'),
  ('nursing', 'Nursing Department')
on conflict (id) do update set name = excluded.name;

create table if not exists public.students (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  department_id text not null references public.departments(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.students(id) on delete cascade,
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
  user_id uuid not null references public.students(id) on delete cascade,
  bucket text not null default 'suggestion-attachments',
  path text not null unique,
  file_name text not null,
  mime_type text,
  size bigint,
  created_at timestamptz not null default now()
);

create index if not exists students_department_id_idx on public.students(department_id);
create index if not exists students_email_idx on public.students(email);
create index if not exists admins_email_idx on public.admins(email);
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

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

drop trigger if exists set_admins_updated_at on public.admins;
create trigger set_admins_updated_at
before update on public.admins
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
declare
  account_role text := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  department text := coalesce(new.raw_user_meta_data ->> 'department_id', 'computer-studies');
begin
  if account_role = 'admin' then
    insert into public.admins (id, full_name, email)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      new.email
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email;
  else
    insert into public.students (id, full_name, email, department_id)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      new.email,
      department
    )
    on conflict (id) do update set
      full_name = excluded.full_name,
      email = excluded.email,
      department_id = excluded.department_id;
  end if;

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
    from public.admins
    where id = auth.uid()
  );
$$;

alter table public.departments enable row level security;
alter table public.students enable row level security;
alter table public.admins enable row level security;
alter table public.suggestions enable row level security;
alter table public.suggestion_attachments enable row level security;

drop policy if exists "Departments are readable" on public.departments;
create policy "Departments are readable"
on public.departments for select
to anon, authenticated
using (true);

drop policy if exists "Students can read own profile and admins can read all" on public.students;
create policy "Students can read own profile and admins can read all"
on public.students for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Students can insert own profile" on public.students;
create policy "Students can insert own profile"
on public.students for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Students can update own profile" on public.students;
create policy "Students can update own profile"
on public.students for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Admins can read admin accounts" on public.admins;
create policy "Admins can read admin accounts"
on public.admins for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can read own suggestions and admins can read all" on public.suggestions;
create policy "Users can read own suggestions and admins can read all"
on public.suggestions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Students can create own suggestions" on public.suggestions;
create policy "Students can create own suggestions"
on public.suggestions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.students
    where id = auth.uid()
  )
);

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

drop policy if exists "Students can create own attachment metadata" on public.suggestion_attachments;
create policy "Students can create own attachment metadata"
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
