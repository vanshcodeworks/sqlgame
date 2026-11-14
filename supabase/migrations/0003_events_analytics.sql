-- QueryQuest: append-only event stream.
--
-- One table, insert-only, never read back through PostgREST. Supabase tables
-- that existed before a "hash IP / store country only" data policy are what
-- get projects in trouble later, so this one is designed for our own policy:
-- no raw IP, no email in events, 90-day raw retention, aggregates kept.
--
-- The Express server reads these with the service-role key only.

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  -- Anonymous, persistent per device so pre-signup behaviour can be joined
  -- to the account after signup. Not a login; it is a browser fingerprint-ish
  -- id we generate ourselves, and it is not cross-site.
  device_id    text not null,
  user_id      uuid,
  session_id   text not null,
  name         text not null,
  properties   jsonb not null default '{}'::jsonb,
  -- Enriched server-side from the request. Country/city only — the raw IP is
  -- looked up and immediately discarded, never stored.
  country      text,
  city         text,
  device_class text check (device_class in ('mobile', 'tablet', 'desktop')),
  timezone     text,
  -- UTM captured on the first landing, replayed with every event in the session.
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  referrer     text,
  created_at   timestamptz not null default now()
);

-- The two queries we actually run: "events by name over time" and
-- "events for one user over time".
create index if not exists events_name_created_idx
  on public.events (name, created_at desc);

create index if not exists events_user_created_idx
  on public.events (user_id, created_at desc)
  where user_id is not null;

create index if not exists events_device_created_idx
  on public.events (device_id, created_at desc);

create index if not exists events_session_idx
  on public.events (session_id, created_at desc);

-- ── Access control ───────────────────────────────────────────────────────
-- The browser can append events and nothing else. It cannot read any event
-- (not even its own) — that prevents the table becoming a free API for
-- scraping other users' behaviour and keeps it small.
alter table public.events enable row level security;

revoke all on table public.events from anon, authenticated;

grant insert on table public.events to anon, authenticated;
grant select on table public.events to service_role;

create policy "events_insert_only" on public.events
  for insert
  with check (true);

-- ── Retention ────────────────────────────────────────────────────────────
-- Raw event data is disposable: keep 90 days, keep aggregates forever.
-- Run this from Vercel Cron hitting an admin endpoint, or a scheduled SQL job.
create or replace function public.purge_old_events(retain_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  removed integer;
begin
  with gone as (
    delete from public.events
    where created_at < now() - make_interval(days => retain_days)
    returning 1
  )
  select count(*)::integer into removed from gone;
  return removed;
end;
$$;

revoke all on function public.purge_old_events(integer) from anon, authenticated;
grant execute on function public.purge_old_events(integer) to service_role;

comment on table public.events is
  'Append-only product telemetry. PII policy: no raw IP, no email, country+city only, 90-day raw retention.';