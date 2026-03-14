# Backend Plan — Calorie Tracker

## Goal
Add a server-side backend to persist data across devices using Supabase (PostgreSQL + magic link auth) and Drizzle ORM.

## Approach
- **Auth**: Supabase magic link (passwordless email OTP) via `@supabase/ssr`
- **Database**: Supabase PostgreSQL, accessed via Drizzle ORM
- **API**: Next.js Route Handlers (already in use)
- **Sync strategy**: Keep Zustand as the client-side cache; sync to server on mutations and on load

---

## Stack Additions

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client |
| `@supabase/ssr` | Auth helpers for Next.js App Router (cookies, middleware) |
| `drizzle-orm` + `drizzle-kit` | ORM + migrations |
| `postgres` (pg driver) | Drizzle's Postgres driver |
| `zod` | Input validation on API routes |

---

## Work Plan

### Phase 1 — Supabase + Auth
- [ ] Create Supabase project (manual step — user does this)
- [ ] Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL`
- [ ] Install `@supabase/supabase-js` and `@supabase/ssr`
- [ ] Create `lib/supabase/client.ts` — browser Supabase client
- [ ] Create `lib/supabase/server.ts` — server Supabase client (uses cookies)
- [ ] Create `middleware.ts` — refresh auth session on every request
- [ ] Create auth UI: `/app/login/page.tsx` — magic link email form
- [ ] Create auth callback handler: `/app/auth/callback/route.ts`
- [ ] Protect routes: redirect unauthenticated users to `/login`

### Phase 2 — Drizzle ORM + Schema
- [ ] Install `drizzle-orm`, `drizzle-kit`, `postgres`
- [ ] Create `lib/db/schema.ts` — Drizzle schema (meal_entries, user_goals)
- [ ] Create `lib/db/index.ts` — Drizzle client (`lib/db.ts` replacement)
- [ ] Create `drizzle.config.ts`
- [ ] Run first migration → push schema to Supabase

### Phase 3 — API Routes
- [ ] `POST   /api/meals`          — create meal entry
- [ ] `GET    /api/meals?date=`    — fetch meals for a date
- [ ] `PATCH  /api/meals/[id]`     — update meal entry
- [ ] `DELETE /api/meals/[id]`     — delete meal entry
- [ ] `GET    /api/profile`        — fetch user profile/goals
- [ ] `PUT    /api/profile`        — upsert user profile/goals

### Phase 4 — Sync Layer
- [ ] Remove `persist` middleware and `safeStorage` from `lib/store.ts` (localStorage no longer needed)
- [ ] Update Zustand store actions to call API routes after local mutations
- [ ] On app load, hydrate store from server (server component or initial fetch)
- [ ] Handle optimistic updates + error rollback

### Phase 5 — Documentation Update

---

## Notes
- Row Level Security (RLS) will be enabled on Supabase tables so users can only access their own data — the Supabase anon key is safe to expose client-side with RLS in place.
- No changes to existing UI components needed in phases 1–3.
