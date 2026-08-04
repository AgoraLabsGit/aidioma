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
Operator scripts default to the dedicated `aidioma_development` database/role and fail if an
ambient URL resolves anywhere else. Set `AIDIOMA_DB_TARGET=preview` for Preview. Production also
requires the second explicit acknowledgement `AIDIOMA_ALLOW_PRODUCTION_WRITES=AIDIOMA_PRODUCTION`.

SQL files in `drizzle/` are the sole DDL authority. The Drizzle schema is a typed query map and
intentionally omits the deferred `lessons_ordinal_unique` constraint that Drizzle cannot model.
Do not use `drizzle-kit push` or `drizzle-kit generate`; add immutable SQL migrations instead.
The runner serializes planning and application with a transaction-scoped advisory lock, verifies
the live deferred constraint on every run, and closes the database connection before exiting.

## Gates

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run smoke` (requires a prior production build and installed Playwright Chromium)

`npm run smoke:install` installs only the Chromium binary used by the headless smoke check.
The smoke gate exercises the current application directly and writes its ignored evidence under
`apps/web/artifacts/`. `npm run references` captures the temporary static lesson-review surface;
it is not the learner application or a product source of truth.
