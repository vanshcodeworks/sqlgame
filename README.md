# QueryQuest

A SQL learning game. Write real queries in the browser against progressively
harder challenges, with saves and streak tracking.

## Layout

```
client/      React + Vite, CodeMirror 6 with SQL autocomplete
server/      API and challenge verification
packages/    shared types and logic
supabase/    database schema and migrations
```

## Setup

```bash
npm install
npm run dev      # client
```

Each workspace installs independently; see the `package.json` in `client/` and
`server/`.

## Editor

The client uses CodeMirror 6 with the SQL language package, a one-dark theme
and autocomplete wired to the schema - so completions reflect the tables
actually present in the database rather than a generic list.

## Stack

- `codemirror` (state, view, commands, lang-sql, autocomplete, theme-one-dark)
- `react`, `react-router-dom`
- `@queryquest/shared` - types shared across client and server

## Progress tracking

Saves record a `playedDates` history, which drives the streak calendar. A
migration backfills that column for saves created before the streak feature
existed, so older rows do not break the streak calculation.
