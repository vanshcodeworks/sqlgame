-- QueryQuest — Retention Dashboard
--
-- Run these in the Supabase SQL Editor weekly. Every query is a decision:
-- if a number moves the wrong way, there is a specific thing to change.
--
-- Baseline all of these once, then track the direction, not the absolute.

-- ── 1. The one number that predicts everything ────────────────────────
-- Activation: share of new accounts that complete level 1 in their first
-- session. This is the strongest predictor of D30 in education games.
--
-- "First session" = events for a device within 24h of its first event.
with first_seen as (
  select
    coalesce(e.user_id::text, e.device_id) as person,
    date_trunc('hour', min(e.created_at)) as started
  from public.events e
  where e.name in ('identify', 'signup_started', 'level_started')
  group by 1
),
activated as (
  select distinct coalesce(e.user_id::text, e.device_id) as person
  from public.events e
  where e.name = 'level_completed'
    and e.properties->>'level_id' = '1'
)
select
  count(*)                                            as new_players,
  count(*) filter (where a.person is not null)       as activated,
  round(
    100.0 * count(*) filter (where a.person is not null) / count(*),
    1
  )                                                   as activation_pct
from first_seen f
left join activated a on a.person = f.person;


-- ── 2. Retention curve by cohort (D1 / D7 / D30) ─────────────────────
-- A player is "active" on a day if they fired any event that day.
with days as (
  select
    coalesce(e.user_id::text, e.device_id) as person,
    (e.created_at at time zone 'UTC')::date as day
  from public.events e
  group by 1, 2
),
cohort as (
  select person, min(day) as first_day from days group by 1
)
select
  c.first_day                                        as cohort_date,
  count(distinct c.person)                           as cohort_size,
  count(distinct d.person) filter (where d.day = c.first_day + 1)  as d1,
  count(distinct d.person) filter (where d.day = c.first_day + 7)  as d7,
  count(distinct d.person) filter (where d.day = c.first_day + 30) as d30,
  round(100.0 * count(distinct d.person) filter (where d.day = c.first_day + 1)
        / count(distinct c.person), 1)               as d1_pct
from cohort c
left join days d on d.person = c.person
group by c.first_day
order by c.first_day desc
limit 12;


-- ── 3. Level funnel — where players actually quit ────────────────────
-- Started vs completed per level. A steep drop is a difficulty problem, not a
-- motivation problem: fix the level before adding a notification.
select
  (properties->>'level_id')::int                      as level_id,
  (properties->>'arc_id')::int                        as arc_id,
  count(*) filter (where name = 'level_started')     as starts,
  count(*) filter (where name = 'level_completed')   as completions,
  round(100.0 * count(*) filter (where name = 'level_completed')
        / nullif(count(*) filter (where name = 'level_started'), 0), 1) as completion_pct
from public.events
where name in ('level_started', 'level_completed')
group by 1, 2
order by level_id;


-- ── 4. Median time-to-complete per level (difficulty signal) ──────────
-- Flat or rising times mean the level is fighting the player.
select
  (properties->>'level_id')::int                      as level_id,
  count(*)                                           as samples,
  percentile_disc(0.5) within group (
    order by (properties->>'ms')::numeric
  )                                                   as p50_ms,
  percentile_disc(0.9) within group (
    order by (properties->>'ms')::numeric
  )                                                   as p90_ms
from public.events
where name = 'level_completed'
group by 1
order by level_id;


-- ── 5. Session length (p50/p90), landing vs game ────────────────────
-- Target: landing 60–90s engaged, game session 6–9 min.
select
  properties->>'page'                                 as page,
  count(*)                                            as sessions,
  round(percentile_disc(0.5) within group (
    order by (properties->>'ms')::numeric
  ) / 1000.0, 1)                                      as p50_seconds,
  round(percentile_disc(0.9) within group (
    order by (properties->>'ms')::numeric
  ) / 1000.0, 1)                                      as p90_seconds
from public.events
where name = 'page_time'
group by 1
order by p50_seconds desc;


-- ── 6. Landing funnel — how far people read before acting ────────────
-- If most sessions end at scroll_depth < 0.4, the hero is carrying the whole page.
select
  percentage_bucket,
  count(*)                                            as sessions
from (
  select
    width_bucket((properties->>'depth')::numeric, 0, 1, 20) as percentage_bucket,
    session_id
  from public.events
  where name = 'scroll_depth'
  group by 1, session_id
) b
group by percentage_bucket
order by percentage_bucket;


-- ── 7. Acquisition quality — which source actually retains ──────────
-- The channel with the highest signup rate is often the worst D1. Rank by D1.
with first_seen as (
  select
    coalesce(e.user_id::text, e.device_id) as person,
    date_trunc('hour', min(e.created_at)) as started
  from public.events e
  where e.name in ('identify', 'signup_started', 'level_started')
  group by 1
),
source as (
  select distinct on (coalesce(user_id::text, device_id))
    coalesce(user_id::text, device_id) as person,
    coalesce(utm_source, 'direct')      as utm_source
  from public.events
  order by coalesce(user_id::text, device_id), created_at
),
active_d1 as (
  select distinct coalesce(e.user_id::text, e.device_id) as person
  from public.events e
  join first_seen f on coalesce(e.user_id::text, e.device_id) = f.person
  where e.created_at >= f.started + interval '1 day'
    and e.created_at <  f.started + interval '2 days'
)
select
  s.utm_source                                        as source,
  count(*)                                            as new_players,
  count(*) filter (where a.person is not null)       as returned_d1,
  round(100.0 * count(*) filter (where a.person is not null) / count(*), 1) as d1_pct
from first_seen f
join source s on s.person = f.person
left join active_d1 a on a.person = f.person
group by s.utm_source
order by d1_pct desc nulls last;


-- ── 8. Device mix — is mobile playable? ────────────────────────────
-- If mobile completion of the SQL editor is materially worse, the editor
-- needs a mobile-specific input path, not a bigger mission count.
select
  device_class,
  count(*) filter (where name = 'level_started')     as starts,
  count(*) filter (where name = 'level_completed')   as completions,
  round(100.0 * count(*) filter (where name = 'level_completed')
        / nullif(count(*) filter (where name = 'level_started'), 0), 1) as completion_pct
from public.events
where name in ('level_started', 'level_completed')
group by device_class
order by completion_pct desc;


-- ── 9. Daily goal hit rate ────────────────────────────────────────
-- If few players hit the daily goal, the target is wrong (too high) — this is
-- a one-line change in TEMPO_TARGET, not a new feature.
select
  timezone                                            as tz,
  count(distinct session_id)                          as active_days,
  count(*) filter (where name = 'level_completed')    as missions_completed
from public.events
where created_at > now() - interval '7 days'
group by timezone
order by active_days desc
limit 20;


-- ── 10. Share-card usage (virality) ───────────────────────────────
-- Downloads per sector completion tells us whether the share moment earns its place.
select
  properties->>'arc_id'                                as arc_id,
  count(*) filter (where name = 'level_completed')     as sector_finales,
  count(*) filter (where name = 'share_card')          as share_opens
from public.events
where name in ('level_completed', 'share_card')
group by 1
order by 1;


-- ── 11. Hygiene — consent and volume ──────────────────────────────
-- If `events_disabled` is high, the banner copy or placement needs work.
select
  created_at::date                                     as day,
  count(*)                                             as events,
  count(distinct device_id)                            as devices,
  count(distinct country)                              as countries
from public.events
group by 1
order by 1 desc
limit 14;