-- Cleaning App — initial schema
-- Roles: 'admin' (le boss, vue web only) et 'employee' (app mobile)

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles (1-1 avec auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up (Google or email/password)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- apartments
-- ============================================================
create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- tasks (planning: un ménage d'un appartement, un jour, assigné à un employé)
-- ============================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id),
  title text not null default 'Ménage',
  description text,
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'done', 'skipped')),
  is_urgent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_assigned_to_date_idx on public.tasks (assigned_to, scheduled_date);
create index tasks_apartment_idx on public.tasks (apartment_id);

-- ============================================================
-- task_photos (preuves déposées par les employés)
-- ============================================================
create table public.task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id),
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- notifications
-- ============================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade, -- null = broadcast à tous les employés
  sender_id uuid references public.profiles(id),
  title text not null,
  body text,
  type text not null default 'info' check (type in ('reminder', 'urgent', 'info')),
  related_task_id uuid references public.tasks(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

-- ============================================================
-- activity_log (traçabilité : qui se connecte, qui fait quoi, où, quand)
-- ============================================================
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  action text not null, -- ex: 'login', 'task_status_change', 'photo_upload'
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_profile_idx on public.activity_log (profile_id, created_at desc);

-- ============================================================
-- helper: is the current user an admin?
-- ============================================================
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.apartments enable row level security;
alter table public.tasks enable row level security;
alter table public.task_photos enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;

-- profiles
create policy "profiles: self or admin can select" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self can update own basic info" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- apartments
create policy "apartments: employees can read, admin full" on public.apartments
  for select using (auth.uid() is not null);
create policy "apartments: admin can insert" on public.apartments
  for insert with check (public.is_admin());
create policy "apartments: admin can update" on public.apartments
  for update using (public.is_admin());
create policy "apartments: admin can delete" on public.apartments
  for delete using (public.is_admin());

-- tasks
create policy "tasks: assignee or admin can select" on public.tasks
  for select using (assigned_to = auth.uid() or public.is_admin());
create policy "tasks: admin can insert" on public.tasks
  for insert with check (public.is_admin());
create policy "tasks: assignee can update status, admin can update all" on public.tasks
  for update using (assigned_to = auth.uid() or public.is_admin());
create policy "tasks: admin can delete" on public.tasks
  for delete using (public.is_admin());

-- task_photos
create policy "task_photos: uploader or admin can select" on public.task_photos
  for select using (
    uploaded_by = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.tasks t where t.id = task_id and t.assigned_to = auth.uid())
  );
create policy "task_photos: assignee can insert on own task" on public.task_photos
  for insert with check (
    uploaded_by = auth.uid()
    and exists (select 1 from public.tasks t where t.id = task_id and (t.assigned_to = auth.uid() or public.is_admin()))
  );
create policy "task_photos: admin can delete" on public.task_photos
  for delete using (public.is_admin());

-- notifications
create policy "notifications: recipient (or broadcast) or admin can select" on public.notifications
  for select using (recipient_id = auth.uid() or recipient_id is null or public.is_admin());
create policy "notifications: admin can insert" on public.notifications
  for insert with check (public.is_admin());
create policy "notifications: recipient can mark own as read" on public.notifications
  for update using (recipient_id = auth.uid() or public.is_admin());

-- activity_log
create policy "activity_log: self can insert own" on public.activity_log
  for insert with check (profile_id = auth.uid());
create policy "activity_log: admin can select all, self can select own" on public.activity_log
  for select using (profile_id = auth.uid() or public.is_admin());

-- ============================================================
-- Storage bucket for task photos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('task-photos', 'task-photos', false)
on conflict (id) do nothing;

create policy "task-photos storage: authenticated can read own/admin all"
  on storage.objects for select
  using (bucket_id = 'task-photos' and auth.uid() is not null);

create policy "task-photos storage: authenticated can upload"
  on storage.objects for insert
  with check (bucket_id = 'task-photos' and auth.uid() is not null);
