# QueryQuest

A SQL learning game. Write real queries in the browser against progressively harder challenges, with saves and streak tracking.

> **Live:** https://qq.vanshcodeworks.com
>
> | Piece | Host | URL |
> |---|---|---|
> | Client (static) | Vercel — project `queryquest` | https://qq.vanshcodeworks.com |
> | API (Express) | Render — service `queryquest-api` (free, Oregon) | https://queryquest-api.onrender.com |
> | Database + Auth | Supabase | `dxtfjszjcdbwykthbfhz.supabase.co` |
>
> DNS: CNAME `qq` → `3442a19f6e1c1694.vercel-dns-017.com.`
>
> Render free tier sleeps after ~15 min idle; the client retries cold starts once
> with a longer timeout (`authFetch` in `client/src/lib/auth.ts`).

## Layout

```
client/      React + Vite, CodeMirror 6 with SQL autocomplete
server/      API and challenge verification (Express + sql.js WASM)
packages/    shared types and logic (@queryquest/shared)
supabase/    database schema and migrations (PostgreSQL + RLS)
```

## Quick Start

```bash
# Install all dependencies
npm ci

# Start development servers (client on :5173, server on :3001)
npm run dev
```

## Environment Variables

Create `.env` files in both `client/` and `server/` directories.

### Server (`server/.env`)

```env
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:5173
CORS_ORIGINS=http://localhost:5174,http://localhost:5175

# Supabase (required for auth)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Run migrations:
   ```bash
   cd supabase
   supabase db push
   ```
3. Copy the Project URL and anon key to your `.env` files
4. Enable Email auth provider in Supabase Dashboard → Authentication → Providers
5. Configure Site URL and Redirect URLs in Supabase Auth settings

## Deployment

### Render (API) + Vercel (Client) — Free Tier

#### 1. Render Web Service
- Connect this repository to Render
- Create a **Web Service** with:
  - Build Command: `npm ci && npm run build --workspace=server`
  - Start Command: `npm run start --workspace=server`
  - Environment: Node
  - Plan: Free
- Add environment variables:
  - `NODE_ENV=production`
  - `PORT=3001` (Render sets this automatically)
  - `CLIENT_URL=https://your-app.vercel.app`
  - `CORS_ORIGINS=https://your-app.vercel.app`
  - `CORS_ORIGIN_REGEX=https://.*\.vercel\.app`
  - `SUPABASE_URL` (from Supabase dashboard)
  - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase dashboard)

#### 2. Vercel Static Site
- Import the same repository to Vercel
- Configure:
  - Framework Preset: Vite
  - Build Command: `npm ci && npm run build --workspace=client`
  - Output Directory: `client/dist`
  - Install Command: `npm ci`
- Add environment variables:
  - `VITE_API_URL=https://your-api.onrender.com`
  - `VITE_SUPABASE_URL` (from Supabase)
  - `VITE_SUPABASE_ANON_KEY` (from Supabase)

#### 3. Supabase Auth Redirects
In Supabase Dashboard → Authentication → URL Configuration:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/auth`

### Alternative: Docker

```bash
# Build images
docker build -t queryquest-client ./client
docker build -t queryquest-server ./server

# Run with docker-compose
docker-compose up -d
```

## Project Structure Details

### Client (`client/`)
- **Framework**: React 19 + Vite 8 + TypeScript
- **Editor**: CodeMirror 6 with SQL language support
- **Styling**: Tailwind CSS 4 + CSS Modules
- **State**: React Router 6 + localStorage + Supabase sync
- **Visual Effects**: Custom WebGL shaders (liquid glass, particles, blobs)

### Server (`server/`)
- **Framework**: Express 5 + TypeScript
- **Validation**: sql.js WASM (SQLite in browser & server)
- **Auth**: Supabase JWT verification (JWKS + service-role fallback)
- **Rate Limiting**: Per-route limits (validate, auth, demo, access)
- **Security**: Helmet, CORS with origin validation, query caps (5k chars, 2k rows)

### Shared (`packages/shared/`)
- **Types**: Level definitions, validation logic, SQL engine
- **Validation**: Server-authoritative XP, arc access checks
- **Testing**: Vitest (32 tests passing)

### Database (`supabase/migrations/`)
- `0001_init.sql` — Core schema (profiles, progress, access_requests, RLS)
- `0002_security_hardening.sql` — RLS tightening, privilege guards, indexes

## Development Notes

### Running Tests
```bash
npm run test:shared
```

### Linting
```bash
npm run lint
```

### Database Migrations
```bash
npm run db:push    # Apply migrations to linked Supabase project
npm run db:reset   # Reset local database (requires Supabase CLI)
```

## Tech Stack Summary

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, TypeScript, Tailwind CSS 4 |
| Editor | CodeMirror 6 (@codemirror/lang-sql, autocomplete) |
| Backend | Express 5, TypeScript, sql.js WASM |
| Auth | Supabase (JWT + PostgREST + RLS) |
| Database | PostgreSQL (Supabase) |
| Validation | sql.js (SQLite) in WASM |
| Deployment | Render (API) + Vercel (Client) |
| CI/CD | GitHub Actions (configured separately) |

## Free Tier Limits (Render + Vercel + Supabase)

| Service | Limit |
|---------|-------|
| Render Web Service | 750 hrs/mo, spins down after 15 min inactivity |
| Vercel | 100 GB bandwidth, 6000 serverless function invocations |
| Supabase | 500 MB database, 2 GB bandwidth, 50k MAU |

## License

MIT