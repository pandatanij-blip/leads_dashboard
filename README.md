# WEBX CRM

Sales CRM for WEBX – Digital Solutions. Next.js 14 (App Router) + TypeScript + Tailwind, Prisma + PostgreSQL, Auth.js (credentials).

## Run locally
1. Create a free Postgres database (Neon or Supabase) and copy its connection string.
2. `cp .env.example .env` and fill in `DATABASE_URL`, `NEXTAUTH_SECRET` (`openssl rand -base64 32`).
3. `npm install`
4. `npm run db:push` (creates tables) then `npm run db:seed` (users, industries, sources, packages, Diwali campaign, Meghha's Boutique + 49 DEMO leads).
5. `npm run dev` → http://localhost:3000

Seeded logins (password = `SEED_PASSWORD`, default `ChangeMe123!` — change it):
- shubham9971833801@gmail.com (Admin / Sales)
- tanisha@webx.local (Developer: read leads, edit technical notes only)

## Deploy to Vercel
Push to GitHub, import the repo in Vercel, add env vars `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (your Vercel URL). Run `db:push` and `db:seed` once from your computer against the same DATABASE_URL.

## Included
Login + roles, dashboard KPIs (computed from DB), leads list (search, filters, pagination, CSV export, duplicate check), lead detail with activity timeline, call / WhatsApp (editable message, never auto-sent), drag-and-drop pipeline, follow-ups (overdue / today / tomorrow / upcoming; complete / reschedule), auto lead scoring, notifications on Interested / Negotiation / Won.

## Not built yet (schema already has tables for these)
Public Signals page, Campaigns page, Quotations page, Packages/Industries/Settings admin screens, Analytics charts, CSV/Excel import with column mapping, lead edit/duplicate/delete screens (API exists: PATCH/DELETE `/api/leads/[id]`), notification list.

## Privacy
Only manually entered or publicly visible information. No scraping, no private search history.
