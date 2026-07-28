# AIdioma web

The production learner app is a responsive Next.js 16 App Router application.

## Local setup

1. Use Node.js 22.22.2 or newer.
2. Install dependencies from the repository root after the root workspace includes `apps/web`.
3. Copy `.env.example` to `.env.local` and add Clerk/Neon credentials when those integrations are needed.
4. Run `npm run dev` from this directory.

The shell deliberately works without credentials. `next dev` uses Clerk v7 keyless development
mode when no key is present. Production builds without both Clerk keys show a setup message instead
of initializing Clerk. The database client is created only when server code calls `getDatabase()`,
so `DATABASE_URL` is not required for typecheck, test, build, or shell smoke gates.

From the repository root, `npm run content:seed` validates canonical JSON, applies pending
checksum-protected migrations, and idempotently upserts lessons/items into Neon. It requires
`DATABASE_URL` in `apps/web/.env.local`; repeating it must report zero changed rows.

## Gates

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run smoke` (requires a prior production build and installed Playwright Chromium)

`npm run smoke:install` installs only the Chromium binary used by the headless smoke check.
`npm run references` refreshes the 16 light/dark phone/desktop prototype reference screenshots;
the smoke gate saves matching application screenshots and verifies the shared token and geometry
contract against those references.
