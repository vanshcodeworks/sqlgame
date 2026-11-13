-- QueryQuest: security hardening for direct PostgREST access.
--
-- The original policies let a signed-in user update their own profile row,
-- including `role` and `arc_access`. Combined with the public anon key, that
-- is a privilege-escalation path. The API server uses the service-role key
-- (and enforces authorization itself), so browser clients only need read
-- access to their own rows.

begin;

-- ── profiles ─────────────────────────────────────────────────────────────
-- Players may edit presentation fields, never authorization fields.
revoke insert, update, delete on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, identity, tempo, onboarding_complete)
  on table public.profiles to authenticated;

-- Defense in depth: even if the column grants are ever widened, a signed-in
-- client cannot promote itself or unlock arcs.
create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Requests made with the service-role key have no end-user JWT, so
  -- auth.uid() is null. Those are the API server's own admin writes.
  if auth.uid() is not null then
    if new.role is distinct from old.role then
      raise exception 'role can only be changed by an administrator';
    end if;
    if new.arc_access is distinct from old.arc_access then
      raise exception 'arc_access can only be changed by an administrator';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

-- ── progress ─────────────────────────────────────────────────────────────
-- Progress is written by the server after it validates the level, so the
-- browser only needs to read its own row.
revoke insert, update, delete on table public.progress from anon, authenticated;
grant select on table public.progress to authenticated;

-- ── access_requests ──────────────────────────────────────────────────────
revoke insert, update, delete on table public.access_requests from anon, authenticated;
grant select on table public.access_requests to authenticated;

-- ── indexes for the admin queue ──────────────────────────────────────────
create index if not exists access_requests_status_created_idx
  on public.access_requests (status, created_at desc);

create index if not exists progress_last_played_idx
  on public.progress (last_played_date);

-- ── arc range guard ──────────────────────────────────────────────────────
do $$
begin
  alter table public.access_requests
    add constraint access_requests_arc_id_range check (arc_id between 1 and 7);
exception
  when duplicate_object then null;
end;
$$;

commit;
