# Neon Integration Checklist for AIdioma

Complete migration from SQLite to Neon PostgreSQL with integrated authentication.

## 🎉 **MIGRATION STATUS: CORE DATABASE COMPLETED** ✅

**Date Completed:** August 27, 2025  
**Status:** Database migration phase complete, authentication integration pending

### ✅ **Successfully Completed Today:**
- **Database Connection:** ✅ Connected to Neon PostgreSQL (Project ID: flat-hill-33432526)
- **Schema Migration:** ✅ All 7 tables converted from SQLite to PostgreSQL
- **Data Migration:** ✅ Initial Spanish sentences seeded successfully  
- **API Integration:** ✅ Routes updated to use Neon database instead of static files
- **Health Monitoring:** ✅ Database health check passing
- **Connection Pooling:** ✅ SSL-secured connection pool configured

### 🔄 **Next Phase:** Neon Auth Integration with Stack Auth

---

## ✅ Pre-Migration Preparation

### Account Setup
- [x] Create Neon account at [neon.tech](https://neon.tech)
- [x] Create new Neon project for AIdioma (Project ID: flat-hill-33432526)
- [x] Note project ID and connection string
- [ ] Set up Neon Auth integration (Stack Auth)

### Backup Current State
- [x] Backup current SQLite database (original code preserved in BACK_UP_PAGES/)
- [x] Create git branch for Neon migration
- [x] Export existing data if needed (seed data preserved)

## ✅ Database Migration

### 1. Dependencies Update
- [x] Remove SQLite dependencies:
  ```bash
  npm uninstall better-sqlite3 @types/better-sqlite3
  ```
- [x] Add PostgreSQL dependencies:
  ```bash
  npm install pg @types/pg drizzle-orm
  ```
- [x] Add Neon-specific packages:
  ```bash
  npm install @neondatabase/serverless
  ```

### 2. Schema Migration (shared/schema.ts)
- [x] Update imports from SQLite to PostgreSQL:
  ```typescript
  import { pgTable, text, integer, decimal, timestamp, boolean } from 'drizzle-orm/pg-core'
  ```
- [x] Convert SQLite types to PostgreSQL types:
  - [x] `integer('created_at', { mode: 'timestamp' })` → `timestamp('created_at').notNull().defaultNow()`
  - [x] `integer('mode: boolean')` → `boolean('column_name')`
  - [x] `real('average_score')` → `decimal('average_score', { precision: 5, scale: 2 })`
  - [x] Add proper constraints and indexes
- [x] Update all table definitions (7 tables migrated)
- [x] Verify schema compatibility with current types

### 3. Drizzle Configuration
- [x] Create/update `drizzle.config.ts`:
  ```typescript
  import type { Config } from 'drizzle-kit'
  
  export default {
    schema: '../shared/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
      connectionString: process.env.DATABASE_URL!,
    },
    verbose: true,
    strict: true,
  } satisfies Config
  ```
- [x] Update database connection in server code (src/db/connection.ts)
- [x] Replace SQLite client with Neon PostgreSQL client

### 4. Environment Configuration
- [x] Add Neon environment variables:
  ```env
  DATABASE_URL=postgresql://neondb_owner:npg_Rr5cQMgOHL1m@ep-wispy-cell-afb21gbj-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  NEON_PROJECT_ID=flat-hill-33432526
  ```
- [x] Update `.env.example` with new variables
- [x] Configure production environment variables

## ✅ Neon Auth Integration

### 1. Provision Neon Auth
- [ ] Enable Neon Auth in Neon dashboard
- [ ] Configure Stack Auth integration
- [ ] Note auth credentials (Client Key, Secret Key)

### 2. Stack Auth Setup
- [ ] Install Stack Auth dependencies:
  ```bash
  npm install @stackframe/stack
  ```
- [ ] Run Stack Auth initialization:
  ```bash
  npx @stackframe/init-stack . --no-browser
  ```

### 3. Environment Variables for Auth
- [ ] Add auth environment variables:
  ```env
  NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
  NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
  STACK_SECRET_SERVER_KEY=your_secret_key
  ```

### 4. Auth Schema Integration
- [ ] Review auto-generated `neon_auth` schema
- [ ] Verify user table structure
- [ ] Plan integration with existing user data
- [ ] Update TypeScript types for auth

## ✅ Application Updates

### 1. Server-Side Changes
- [x] Update database connection logic (src/db/connection.ts with connection pooling)
- [x] Migrate existing data (3 seed sentences successfully loaded)
- [x] Update API endpoints for PostgreSQL syntax (sentences routes updated)
- [ ] Add auth middleware integration
- [x] Test database operations (health check passing, API functioning)

### 2. Client-Side Auth Integration
- [ ] Wrap app with `StackProvider` and `StackTheme`
- [ ] Create `app/loading.tsx` for auth loading states
- [ ] Set up auth routes in `app/handler/[...stack]/page.tsx`
- [ ] Update components to use auth hooks:
  ```typescript
  import { useUser } from '@stackframe/stack'
  const user = useUser() // null when not signed in
  ```

### 3. Protected Routes
- [ ] Implement auth middleware
- [ ] Protect sensitive pages with `useUser({ or: "redirect" })`
- [ ] Add server-side auth checks with `stackServerApp.getUser()`
- [ ] Create sign-in/sign-up flows

### 4. User Management
- [ ] Implement user profile management
- [ ] Add user settings integration
- [ ] Plan user progress/data migration
- [ ] Update progress tracking with user context

## ✅ AI Caching Optimization

### Cache Performance Setup
- [x] Verify `evaluationCache` table migration (table created successfully)
- [ ] Update cache keys to include user context
- [ ] Implement user-specific caching strategy
- [ ] Set up cache metrics tracking
- [x] Target 80%+ cache hit rate (infrastructure ready)
- [ ] Ensure <2000ms AI response times

## ✅ Testing & Validation

### Database Testing
- [x] Run `npm run type-check` - must pass
- [x] Verify all database operations work (API endpoints tested)
- [x] Test data persistence (data successfully seeded and retrievable)
- [x] Validate schema migrations (all 7 tables created successfully)
- [x] Check connection pooling (connection established with SSL)

### Auth Testing
- [ ] Test sign-up flow
- [ ] Test sign-in flow
- [ ] Test protected routes
- [ ] Verify user sessions
- [ ] Test auth state persistence

### Performance Testing
- [ ] Measure AI response times (<2000ms)
- [ ] Verify cache hit rates (>80%)
- [ ] Test UI responsiveness (<100ms)
- [ ] Monitor bundle size impact
- [ ] Load test database connections

## ✅ Production Deployment

### Final Checks
- [ ] Update production environment variables
- [ ] Run full test suite (>90% coverage required)
- [ ] Verify performance requirements met
- [ ] Test auth flows in production
- [ ] Monitor error rates and performance

### Documentation Updates
- [ ] Update README with new setup instructions
- [ ] Document auth integration patterns
- [ ] Update development guide
- [ ] Create troubleshooting guide

## ✅ Post-Migration

### Monitoring
- [ ] Set up database monitoring
- [ ] Monitor auth success rates
- [ ] Track AI caching performance
- [ ] Monitor user engagement metrics

### Optimization
- [ ] Review and optimize queries
- [ ] Implement additional indexes if needed
- [ ] Fine-tune cache strategies
- [ ] Monitor costs and optimize

---

## 🚀 Benefits Achieved

After completion, AIdioma will have:
- **Serverless PostgreSQL** with autoscaling
- **Integrated authentication** with Stack Auth
- **Optimized AI caching** reducing API costs
- **Production-ready infrastructure** 
- **Improved performance** with edge locations
- **Cost-effective scaling** with usage-based pricing

## ⚠️ Critical Requirements

This migration MUST maintain:
- Zero `any` types in TypeScript
- >90% test coverage
- <2000ms AI response times
- >80% cache hit rates
- Module reusability across pages
- WCAG AA accessibility compliance