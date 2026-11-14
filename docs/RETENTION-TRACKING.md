# Retention, Telemetry & Lifecycle Design — QueryQuest

> Goal: maximise the number of players who finish all 16 missions, keep session
> length in the "flow" band, and bring lapsed players back — without collecting
> data we don't use, and without breaking privacy law.

---

## 1. How games actually retain people (the research)

The mechanics below are the ones with published, replicated effect sizes. Everything
in the product should map to one of them.

| # | Mechanic | Study / source | Effect | QueryQuest application |
|---|----------|----------------|--------|------------------------|
| 1 | **Endowed progress** — starting a user part-way through | Nunes & Drèze (2006), car-wash loyalty cards | Users given a card with 2 of 8 stamps pre-filled completed **~2×** more | Show "Arc 1 · 3/5 restored" instead of "0/5". Never start a bar at zero. |
| 2 | **Goal-gradient effect** — effort accelerates near the finish | Nunes & Drèze (2006), Kivetz et al. (2006) | Purchase/ completion frequency rises as the goal nears | "1 mission left in Arc 1" copy on the last node of every arc. |
| 3 | **Variable-ratio reward** — unpredictable beats predictable | Skinner (1957), Zeigarnik (1927) | Variable rewards create the most durable habits | Random "lore fragment" / flavour reward on completion, not a fixed line. |
| 4 | **Loss aversion** — losing hurts ~2× as much as gaining feels good | Kahneman & Tversky (1979) | Users act to prevent loss | Arc "chest" that decays if unclaimed; league/rank demotion; a visible streak. |
| 5 | **Interrupted-task memory (Zeigarnik)** | Zeigarnik (1927) | Unfinished tasks stay mentally "open" | Persistent **Continue Level 7 →** CTA on landing, after login, and in email/push. |
| 6 | **Flow** — challenge must track skill | Csikszentmihalyi (1990) | Engagement peaks when both are matched | Level-abandonment telemetry → auto-tune hint depth per level. |
| 7 | **Competence + autonomy + relatedness** | Deci & Ryan, Self-Determination Theory | These three drive intrinsic motivation | Competence = progress rings; autonomy = identity/ tempo choice (already built); relatedness = **missing** — see leaderboards/social below. |
| 8 | **Hook loop** — Trigger → Action → Reward → Investment | Nir Eyal (2014) | Every loop compounds the next trigger | Notification (trigger) → continue level (action) → lore/progress (reward) → sunk progress (investment). |
| 9 | **Sunk cost / IKEA effect** | Arkes & Blumer (1985) | Past investment predicts continuation | After level 5, show a "commitment" milestone screen: "You've restored 4 fragments." |

**Duolingo's actual retention stack** (the benchmark to copy):
- **Streaks** — the single strongest feature; loss-aversion at daily cadence
- **Hearts (5 lives)** — a hard stop that regenerates on a timer, creating a *reason to return tomorrow*
- **Leagues** — weekly closed cohort of 30 users (competitive but attainable), promotion/demotion
- **Daily goal ring** — 3 intensities chosen at onboarding (we already collect this as `tempo`!)
- **Chests** — a daily claim, decayed if not opened
- **Permanence of progress** — XP and crowns never decrease
- **Notification copy that is A/B-tested to the character**, including guilt and humour

**What the data says about *time*:**
- Casual/educational game session: **4–10 minutes** is the sweet spot; keep a single
  level completable inside that, or split the level.
- Landing page: **90 seconds** of engaged time is the target; the story hero should
  deliver the hook inside 10 seconds (we already do — the typewriter + story cards).
- Retention benchmark (education apps): **D1 ≈ 25–35%**, **D7 ≈ 12–18%**, **D30 ≈ 5–10%**.
  Improving D1 by 5 points compounds harder than any acquisition spend.
- **Activation is everything**: a player who completes level 1 in their first session
  retains at multiples of one who doesn't. That single event is the most important
  metric in the product.

---

## 2. What to collect — and why (nothing without a use)

### 2.1 Anonymous, pre-signup (needed to know *why* players convert)
Collected with a persistent `device_id` in `localStorage` so behaviour before and
after signup can be stitched to one person.

| Signal | Source | Used for |
|---|---|---|
| `device_id` | client localStorage | Cohort stitching, anonymous retention curves |
| `session_id` | client, per tab-session | Session definition, time-on-site |
| First-touch **UTM / referrer** | `document.referrer`, URL params | Which acquisition channel actually retains (not just signs up) |
| **Time on landing page** | visibility + heartbeat | Hero hook test; pre-signup drop-off |
| **Scroll depth** | IntersectionObserver | Is the story section ever seen? |
| **CTA clicks** | delegated listener | Funnel: hero CTA vs. world CTA |
| Locale | `navigator.language` | Copy/language priority |
| Device class | UA parse | Mobile-first prioritisation, editor usability |
| Viewport + DPR | `screen`, `window` | Responsive bug triage, editor on small screens |
| Effective connection | `navigator.connection` | Detect slow-network failure of the WASM engine |
| Timezone | `Intl.DateTimeFormat().resolvedOptions().timeZone` | Correct notification send hour |

### 2.2 Server-enriched (free, one lookup)
| Signal | Source | Care |
|---|---|---|
| **Country / region / city** | IP → GeoIP (Cloudflare header on Render, or a self-hosted MaxMind DB) | Resolve to **country + city only**, never store the raw IP. |
| **IP hash** | `crypto.createHash('sha256')` of IP + daily salt | Dedupe abuse without storing PII. Keep hash for 7 days max. |
| **Network / ASN** | GeoIP | Detect datacenter/bot traffic for the demo endpoint. |
| **HTTP-level timing** | middleware `Date.now()` deltas | Cold-start impact on completion rate. |

### 2.3 Authenticated gameplay telemetry (the core loop)
| Event | Properties | Used for |
|---|---|---|
| `signup_started` / `signup_completed` / `email_confirmed` | source | Activation funnel; find email-delivery breakage |
| `onboarding_step` | step, duration, skipped | Find the onboarding drop-off |
| `level_started` | level_id, arc_id, entry (resume vs direct) | Difficulty calibration, resume rate |
| `level_completed` | level_id, attempts, time_ms, hints_used | The single most valuable row in the DB |
| `level_abandoned` | level_id, elapsed_ms, last_query_len | Levels 8/9/12 are the classic churn points |
| `run_failed` | level_id, error_class, attempts | Where the SQL is too hard or the message is unhelpful |
| `hint_used` | level_id, identity | Validate that `rookie/agent` actually changes hint use |
| `arc_unlocked_request` | arc_id, message | Demand signal for content prioritisation |
| `notification_permission` | granted/denied | Push opt-in rate |
| `notification_clicked` | notification_id | True notification ROI |
| `session_end` | duration_ms | p50/p90 session length |

### 2.4 Derived metrics (computed nightly, not stored raw)
- **DAU / WAU / MAU**, new vs returning
- **Retention curve D1 / D7 / D30** by cohort × source × device × country
- **Activation rate** = level 1 complete in first session (track separately by source)
- **Level funnel** = started → completed, per level (the difficulty curve)
- **Session length p50/p90** split landing vs game
- **Notification-driven return rate** = sessions within 24h of a notification
- **Time-to-level-1** (the single best predictor of D30)

### 2.5 Retention targets
| Metric | Now (baseline) | 30-day target | 90-day target |
|---|---|---|---|
| D1 retention | measure | 35% | 45% |
| D7 retention | measure | 18% | 25% |
| Activation (level 1, session 1) | measure | 55% | 70% |
| Median game session | measure | 6 min | 9 min |
| Landing engaged time | measure | 75 s | 110 s |
| Email list → active | — | 25% | 40% |

---

## 3. Notification system (the return engine)

### 3.1 Channel priority for THIS product

| Channel | Reach | Cost | Best for | Verdict |
|---|---|---|---|---|
| **Email** | 100% of signups | ~$0 (Resend free tier: 3k/mo) | Lifecycle, win-back, "new arc" | **Build first** |
| **Web Push** | ~5–15% opt-in, desktop+Android | $0 | Daily nudge at the user's local best hour | Build second |
| **In-app banner** | 100% of active users | $0 | "Continue Level 7" | Build with landing page |
| **SMS/WhatsApp** | Optional | $ | Skip | Too invasive/costly for a game |

### 3.2 The lifecycle sequence (the highest-ROI asset)
| Trigger | Timing | Copy principle | Deep link |
|---|---|---|---|
| Welcome | T+0 | One line of story + one CTA. Never "verify your email first". | `/level/1` |
| Onboarding incomplete | T+2h, T+24h | Zeigarnik — "Unit-7 is waiting" | `/onboarding` |
| Activation nudge | T+6h if no level complete | "First missions are the hardest — 4 minutes" | `/level/1` |
| **Abandoned mid-level** | T+1h, T+24h | **Highest conversion notification in games** — the level is still "open" | `/level/{id}` |
| Daily goal | at user's local best hour | Goal-gradient + loss aversion | `/levels` |
| Streak-equivalent | before local midnight | Loss aversion | `/levels` |
| **Win-back** | D3, D7, D14, D30 inactive | Escalating copy + "your progress is saved" | `/levels` |
| New content / arc | on release | Variable reward | `/levels#arc-{n}` |

### 3.3 Notification science (what actually works)
- **Timing beats copy.** Send inside the user's habitual play window (measured from
  telemetry, not guesswork). A perfectly-written push at 3 AM is worse than a generic
  one at 7 PM.
- **Personalisation lifts clicks 2–4×.** "Level 7 is still open" beats "Come back and
  learn SQL."
- **Frequency cap: 1 push/day, 2 emails/week.** Beyond that, unsubscribes cost more
  than the extra opens.
- **Ask for permission *after the first win*** (post level 1), never on page load.
  Permission-fatigue asked-at-load converts at roughly half the rate.
- **Guilt/curiosity copy outperforms neutral copy** in education apps (Duolingo's
  own A/B data) — "Unit-7 wrote 847 records while you were away" is a *far* better
  subject line than "We miss you."
- **Always include the exact continuation URL.** Every notification must resume state.

### 3.4 Scheduling architecture (must survive Render's free-tier spin-down)
```
Vercel Cron (or a GitHub Action schedule)
   └─> POST /api/cron/notifications   (secret-token protected)
         ├─ query: users whose local "best hour" == now
         ├─ dedupe against notifications_sent (24h CAP)
         ├─ send via Resend (email) / Web Push (VAPID)
         └─ insert rows into notification_log
```
- Vercel's free cron (daily) is enough to start. For hourly precision, use
  `vercel.json` `crons` with an hourly schedule hitting the API.
- **Never trust the free Render instance to run the scheduler** — it sleeps. Vercel
  Cron is the scheduler; Render is only the API.

---

## 4. Recommended architecture (fits the current stack exactly)

```
client ──track()──▶ Supabase: public.events (append-only, RLS: insert-only)
                        ▲
server ──/api/events───┘   (enriches IP/geo in the same request)
                        │
Vercel Cron ──▶ /api/cron/notifications ──▶ Resend / Web Push
```

### 4.1 `events` table (migration `0003_events_analytics.sql`)
```sql
create table public.events (
  id           uuid primary key default gen_random_uuid(),
  device_id    text not null,          -- anonymous, localStorage
  user_id      uuid,                   -- null until signup
  session_id   text not null,
  name         text not null,          -- event name, index on this
  properties   jsonb not null default '{}',
  country      text,                   -- from IP, no raw IP stored
  city         text,
  device_class text,                   -- mobile | tablet | desktop
  created_at   timestamptz not null default now()
);
create index events_name_created on public.events (name, created_at desc);
create index events_user_created on public.events (user_id, created_at desc);

-- Anon may insert, never read back. All reads go through the service key.
revoke all on table public.events from anon, authenticated;
grant insert on table public.events to anon, authenticated;
alter table public.events enable row level security;
create policy "events_insert_only" on public.events for insert with check (true);
```

### 4.2 Client `track()` (the one function everything uses)
```ts
// batches to ≤ 20 events / ≤ 5s, sendBeacon on pagehide (survives tab close)
export function track(name: string, properties: Record<string, unknown> = {})
```
Key correctness details:
- `navigator.sendBeacon` for `pagehide` — a `fetch` is cancelled when the tab closes
  and you lose **all** time-on-page data.
- Heartbeat every 15s on landing/game, so time-on-page is measured, not guessed.
- Respect `navigator.globalPrivacyControl` and a "Do Not Track" toggle by disabling
  all tracking (cheap, and it's the honest default).

### 4.3 Notifications tables
```sql
create table public.notifications (
  id uuid pk, user_id uuid, channel text,  -- email | push
  template text, send_at timestamptz, status text,
  sent_at timestamptz, clicked_at timestamptz
);
create table public.notification_prefs (
  user_id uuid pk, email_ok bool default true, push_ok bool default false,
  best_hour smallint, timezone text
);
```

---

## 5. Privacy / legal (non-negotiable if we take IP + location)
- **GDPR / India DPDP**: IP + inferred location is personal data. Requires a consent
  banner at first visit, a privacy policy, a data-export path, and deletion on request.
- **PII minimisation**: store country + city, hash-and-salt the IP, never store raw IP
  beyond the request.
- **Retention policy**: raw `events` purged after **90 days**; keep only aggregates.
- **Notification consent is separate from account consent** — keep an unsubscribe link
  in every email and a toggle in settings.

---

## 6. Prioritised roadmap

| Phase | Work | Effort | Expected retention impact |
|---|---|---|---|
| **1** | **Continue-where-you-left-off CTA** (landing + post-login) | 0.5 day | **High** — Zeigarnik + goal-gradient, zero infra |
| **2** | **Endowed progress** everywhere (arc bars pre-seeded, "1 left" copy) | 0.5 day | **High** — 2× effect on completion |
| **3** | **Duolingo-style lesson path** (winding nodes, boss levels, daily goal ring) | 1–2 days | **High** — the visible progression loop |
| **4** | **`events` table + `track()` + server enrichment** | 2 days | *Measurement* — without this we're guessing |
| **5** | **Email lifecycle** (welcome / abandoned / win-back, via Resend + Vercel Cron) | 3 days | **Highest long-term** — ~25–40% of returning users come from email |
| **6** | **Web Push** (VAPID, ask-after-first-win) | 2 days | Medium — daily cadence needs push |
| **7** | Retention dashboard (Supabase SQL → weekly report) | 1 day | Keeps phases 1–6 honest |
| **8** | Leaderboards / leagues (relatedness) | 3 days | Medium-high, but social needs volume first |

**Recommended order: 3 → 4 → 5 → 6 → 1 → 2 → 7 → 8.**
Build the mechanic that shows progress, then measure it, then automate the return
loop — and only then turn on the acquisition-style features.