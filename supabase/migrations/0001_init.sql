-- QueryQuest: profiles, progress, access_requests
-- Replaces the MongoDB shadow layer with Supabase Postgres + RLS.

create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                  uuid primary key references auth.users (id) on delete cascade,
  email               text not null,
  display_name        text not null default '',
  identity            text not null default 'rookie' check (identity in ('rookie', 'engineer', 'agent')),
  tempo               text not null default 'agent'  check (tempo in ('scout', 'agent', 'elite')),
  onboarding_complete boolean not null default false,
  arc_access          integer[] not null default '{1,2,3}',
  role                text not null default 'user' check (role in ('user', 'admin')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── progress ─────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id           uuid primary key references public.profiles (id) on delete cascade,
  xp                integer not null default 0,
  streak            integer not null default 0,
  last_played_date  date,
  completed_levels  integer[] not null default '{}'
);

-- ── access_requests ──────────────────────────────────────────────────────
create table if not exists public.access_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  arc_id      integer not null,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  message     text not null default '',
  admin_note  text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, arc_id)
);

-- ── auto-provision profile + progress on signup ─────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'displayName', ''))
  on conflict (id) do nothing;

  insert into public.progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── updated_at maintenance ───────────────────────────────────────────────
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
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_access_requests_updated_at on public.access_requests;
create trigger set_access_requests_updated_at
  before update on public.access_requests
  for each row execute procedure public.set_updated_at();

-- ── row level security ───────────────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.progress       enable row level security;
alter table public.access_requests enable row level security;

-- profiles: a user can read/update only their own row
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- progress: a user can read/update only their own row
create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);

-- access_requests: a user can insert/read only their own; admins can read/update all
create policy "access_requests_select_own" on public.access_requests
  for select using (auth.uid() = user_id);
create policy "access_requests_insert_own" on public.access_requests
  for insert with check (auth.uid() = user_id);
create policy "access_requests_admin_all" on public.access_requests
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Note: the Express server uses the Supabase service-role key (bypasses RLS)
-- for all reads/writes below, since it independently verifies the caller's
-- JWT and enforces per-user scoping in application code. RLS above is the
-- defense-in-depth layer for any direct client-side Supabase access.
