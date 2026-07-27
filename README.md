# Coridoor

Coridoor is a secure M&A readiness workspace. Its first product, the Buyer
Objection Report, turns company information into an evidence-based view of the
questions, doubts, and dependencies a demanding buyer is likely to raise.

The product combines a premium public acquisition site with a protected client
deal room and an internal analyst console. The visual system is deliberately
editorial and restrained: warm white, navy, electric blue, soft lilac, lime,
peach, and yellow; Manrope for precision and Instrument Serif for emphasis.

## Product surface

- conversion-focused landing page and Buyer Objection Report offer
- security, NDA, privacy, imprint, and illustrative sample-report pages
- email/password registration, confirmation, login, recovery, and sign-out
- versioned NDA acceptance before engagement access
- adaptive executive interview with autosave, progress, and conditional questions
- direct-to-private-storage document upload with validation, progress, and cancel
- structured clarification threads instead of ungoverned chat
- analyst workspace for review, findings, internal notes, and release control
- PDF deliverable upload and client-only signed downloads
- tenant-aware RLS, audit logging, and explicit Data API grants

## Architecture

| Layer | Choice | Responsibility |
| --- | --- | --- |
| Web | Next.js 16 App Router, React 19, TypeScript | public site, server-rendered workspaces, route handlers |
| Data | Supabase Postgres | transactional product model and audit trail |
| Identity | Supabase Auth | verified email/password sessions |
| Files | Supabase Storage | private engagement documents and deliverables |
| Hosting | Vercel | build, edge routing, TLS, previews, production |
| Email | Resend-compatible HTTP API | optional transactional workflow notifications |

The browser receives only the Supabase publishable key. Authorization is
enforced again in PostgreSQL through Row Level Security. The secret key is
optional and never exposed to client code.

## Local setup

Requirements: Node.js 22–24, npm, Docker, and the Supabase CLI.

```bash
npm ci
cp .env.example .env.local
npx supabase start
npx supabase db reset
npm run dev
```

Copy the local API URL and publishable key printed by the Supabase CLI into
`.env.local`. The seed installs static interview definitions. New signups create
their profile, organisation, engagement, questionnaire response, and initial
document requests through one database trigger.

To grant an internal user admin access after that user has signed up:

```sql
update public.profiles
set role = 'admin'
where email = 'analyst@example.com';
```

Never expose `SUPABASE_SECRET_KEY` through a `NEXT_PUBLIC_` variable.

## Environment

See [`.env.example`](./.env.example). Required in production:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Optional operational variables:

- `SUPABASE_SECRET_KEY`
- `ADMIN_EMAILS`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SIGNED_URL_EXPIRY_SECONDS`
- `MAX_UPLOAD_SIZE_MB`

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

GitHub Actions executes the first four gates on every pull request and every
push to `main`.

## Database deployment

The initial schema lives in
`supabase/migrations/20260727220132_coridoor_initial_schema.sql`. It creates all
tables, indexes, triggers, RLS policies, grants, and the private storage bucket.
Apply it to a linked project with the Supabase CLI or through the project
dashboard, then run the security and performance advisors.

The bundled NDA and legal pages are intentionally marked as drafts. Replace
them only with approved operator and counsel-provided text before processing
real customer data.

## Vercel

This workspace is linked through `.vercel/project.json`. Set all environment
variables for Production, Preview, and Development before promoting a release.
Supabase Auth redirect URLs must include the production origin and
`/auth/confirm`.

## License

Copyright © 2026 Coridoor. All rights reserved. No license is granted for use,
copying, modification, or distribution unless agreed in writing.
