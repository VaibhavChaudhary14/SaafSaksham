# Scaffolding added by Copilot

This file lists placeholder files added to the project to make the missing features visible and ready for implementation.

Files added:

- `app/merchant/page.tsx` (placeholder merchant dashboard)
- `app/onboarding/page.tsx` (placeholder onboarding page)
- `app/api/upload/route.ts` (stub)
- `app/api/verify-ai/route.ts` (stub)
- `app/api/generate-qr/route.ts` (stub)
- `app/api/webhooks/route.ts` (stub)
- `components/shared/image-upload.tsx` (placeholder)
- `components/shared/qr-code-display.tsx` (placeholder)
- `components/shared/analytics-chart.tsx` (placeholder)
- `lib/ai/image-verification.ts` (stub)
- `lib/qr/generator.ts` (stub)
- `lib/storage/upload.ts` (stub)
- `lib/analytics/tracking.ts` (stub)
- `supabase/functions/*/README.md` (guidance for function implementations)
- `public/workers/service-worker.js` (placeholder)
- `public/sounds/README.md` (guidance for assets)

Next steps:
- Replace placeholders with real implementations per prioritized features (onboarding, merchant flows, AI verification, storage integration).
- Add unit and integration tests for API routes and lib logic.
- Wire components into pages and add styling.

Environment variables and local setup (added)
- A committed `.env.example` has been added showing required keys and placeholders.
- A local `.env.local` was created in the workspace with the credentials you supplied **and is listed in `.gitignore`** so it will not be committed. The file contains:
  - `NEXT_PUBLIC_SUPABASE_URL` (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable)
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
  - `SUPABASE_JWT_SECRET` (legacy JWT secret)
  - `DATABASE_URL` (Postgres connection string)

Security notes:
- **Do not commit** `.env.local` or other secret files. Keep server-only keys (service role, DB, JWT) strictly server-side and do not expose them to client bundles.

Deployment:
- Add these same variables to your deployment provider (Vercel/GitHub Actions) as protected environment variables.
