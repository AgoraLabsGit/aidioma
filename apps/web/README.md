# AIdioma web

The production learner app is a responsive Next.js 16 App Router application.

## Local setup

1. Use Node.js 20.9 or newer.
2. Install dependencies from the repository root after the root workspace includes `apps/web`.
3. Copy `.env.example` to `.env.local` and add Clerk/Neon credentials when those integrations are needed.
4. Run `npm run dev` from this directory.

The shell deliberately works without credentials. `next dev` uses Clerk v7 keyless development
mode when no key is present. Production builds without both Clerk keys show a setup message instead
of initializing Clerk. The database client is created only when server code calls `getDatabase()`,
so `DATABASE_URL` is not required for typecheck, test, build, or shell smoke gates.

## Gates

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run smoke` (requires a prior production build and installed Playwright Chromium)

`npm run smoke:install` installs only the Chromium binary used by the headless smoke check.
