# AIdioma Development Memory Protocols

## Core Memory Protocols for Consistent Development

This document contains the essential protocols I commit to memory for AIdioma development. These are distilled from the comprehensive best practices and represent the critical rules I must always follow.

---

## Protocol 1: TypeScript First & Error Prevention

### ALWAYS Commands:
```bash
npx tsc --noEmit --skipLibCheck  # FIRST thing to run when debugging
```

### TypeScript Rules:
- ✅ **NEVER** use `any` type
- ✅ Use `NewSentence` not `InsertSentence` (Drizzle v0.29+ convention)
- ✅ Conditional rendering: `{currentSentence && <Component />}`
- ✅ JSON parsing with types: `JSON.parse(data) as TypeName[]`
- ✅ Type all component props with interfaces

### Critical Type Patterns:
```typescript
// Database types (MEMORIZED)
export type NewSentence = typeof sentences.$inferInsert;
export type Sentence = typeof sentences.$inferSelect;

// Component props (MEMORIZED)
interface ComponentProps {
  required: string;
  optional?: boolean;
  callback: (data: Type) => void;
}

// API responses (MEMORIZED)
type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};
```

---

## Protocol 2: Database & JSON Handling

### SQLite-Specific Rules (MEMORIZED):
- ✅ **Dates**: Always use `Math.floor(Date.now() / 1000)` for Unix timestamps
- ✅ **JSON Fields**: Always `JSON.stringify()` for storage, `JSON.parse()` for retrieval
- ✅ **Database Reset**: Safe to delete `database.db` for clean state
- ✅ **Migrations**: Always run after schema changes
- ✅ **AI Caching**: Always cache evaluations with `storage.cacheEvaluation()`
- ✅ **Score Conversion**: AI scores 0-100, database scores 0-10 (divide by 10)

### Critical Database Patterns:
```typescript
// JSON field handling (MEMORIZED)
spanishTranslations: JSON.stringify(["trans1", "trans2"]),
hints: JSON.stringify({ word: "hint" }),

// Date handling (MEMORIZED)
lastAttempted: Math.floor(Date.now() / 1000),

// Safe retrieval (MEMORIZED)
const translations = JSON.parse(sentence.spanishTranslations) as string[];
const hints = JSON.parse(sentence.hints) as Record<string, string>;

// AI Caching Pattern (MEMORIZED)
await storage.cacheEvaluation({
  sentenceId,
  userTranslation,
  normalizedTranslation,
  evaluationScore: score / 10, // Convert 0-100 to 0-10
  feedback,
  grammarAccuracy: score / 100,
  naturalness: score / 100,
  completeness: score / 100
});
```

---

## Protocol 3: File Structure & Architecture

### MEMORIZED File Organization:
```
server/
├── index.ts           # Server entry
├── routes.ts          # API routes
├── storage.ts         # IStorage interface
├── db.ts             # Database connection
└── services/         # Business logic

shared/
├── schema.ts         # SINGLE SOURCE OF TRUTH
└── types.ts          # Shared TypeScript types

client/src/
├── components/       # Feature-organized
├── hooks/           # Custom hooks
├── lib/             # Utilities
└── types/           # Client-specific types
```

### Architecture Rules (MEMORIZED):
- ✅ `shared/schema.ts` is the SINGLE SOURCE OF TRUTH
- ✅ All database ops through `IStorage` interface
- ✅ Controllers NEVER directly import database models
- ✅ Business logic in services, NOT routes

---

## Protocol 4: API & Route Patterns

### Standard API Route (MEMORIZED):
```typescript
app.post('/api/resource', isAuthenticated, async (req, res) => {
  try {
    const validated = schema.parse(req.body);
    const result = await storage.operation(validated);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

### Authentication Rules (MEMORIZED):
- ✅ **Local Dev**: Stubbed authentication with `next()`
- ✅ **Production**: TODO - implement proper auth system
- ✅ **Environment Detection**: `process.env.NODE_ENV === 'development'`

---

## Protocol 5: Component & Frontend Patterns

### React Component Pattern (MEMORIZED):
```typescript
interface ComponentProps {
  required: string;
  optional?: boolean;
  onAction: (data: Type) => void;
}

export function Component({ required, optional, onAction }: ComponentProps) {
  // Implementation
}
```

### Data Fetching Pattern (MEMORIZED):
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/endpoint', params],
  queryFn: getQueryFn<Type[]>({ on401: 'throw' }),
});

// Conditional rendering
{data && data.map(item => <Item key={item.id} {...item} />)}
```

---

## Protocol 6: Error Prevention Checklist

### Before Every Commit (MEMORIZED):
- [ ] `npx tsc --noEmit --skipLibCheck` passes
- [ ] No `any` types added
- [ ] All JSON fields properly stringified/parsed
- [ ] Date handling uses Unix timestamps
- [ ] Component props properly typed
- [ ] Conditional rendering for optional values
- [ ] API responses follow standard format

### When App Breaks (MEMORIZED):
1. Run TypeScript check first
2. Check database schema alignment
3. Verify JSON field formats
4. Check port conflicts (5000 → 5001)
5. Reset database if schema issues

---

## Protocol 7: Development Commands

### Essential Commands (MEMORIZED):
```bash
# Development
npm run dev                    # Start dev server
npx tsc --noEmit --skipLibCheck # Type check

# Database
rm database.db                 # Reset database
npx drizzle-kit generate      # Create migration
npx drizzle-kit migrate       # Apply migration

# Debug API
curl http://localhost:5001/api/auth/user
curl http://localhost:5001/api/sentences
```

---

## Protocol 8: Critical Environment Setup

### Local Development (MEMORIZED):
- ✅ **Node.js**: 18+
- ✅ **Database**: SQLite (`./database.db`)
- ✅ **Port**: 5001 (fallback from 5000)
- ✅ **Hot Reload**: Vite frontend, tsx backend
- ✅ **Auth**: Stubbed for development

### Environment Variables Pattern (MEMORIZED):
```typescript
const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;

server.listen(port, "localhost", () => {
  log(`serving on port ${port}`);
});
```

---

## Protocol 9: AI Integration Standards

### 3-Tier AI Evaluation Pattern (MEMORIZED):
```typescript
class AIService {
  async evaluateTranslation(
    englishText: string,
    userTranslation: string,
    correctTranslations: string[],
    sentenceId: number
  ): Promise<TranslationEvaluation> {
    // Tier 1: Check cache FIRST (40-50% hit rate)
    const normalizedTranslation = this.normalizeText(userTranslation);
    const cachedEvaluation = await storage.getCachedEvaluation(sentenceId, normalizedTranslation);
    if (cachedEvaluation) {
      return this.convertCachedResult(cachedEvaluation);
    }

    // Tier 2: Check error templates (30-40% hit rate)
    const errorTemplate = await this.checkErrorPatterns(userTranslation, sentenceId);
    if (errorTemplate) {
      const result = await this.applyErrorTemplate(errorTemplate, userTranslation, correctTranslations);
      await this.cacheResult(result, sentenceId, normalizedTranslation);
      return result;
    }

    // Tier 3: AI evaluation (10-20% hit rate)
    const aiResult = await this.performAIEvaluation(englishText, userTranslation, correctTranslations);
    await this.cacheResult(aiResult, sentenceId, normalizedTranslation);
    return aiResult;
  }
}
```

### AI Rules (MEMORIZED):
- ✅ **Always** check cache before AI calls (85-90% cost reduction)
- ✅ **Always** implement 3-tier evaluation system
- ✅ **Always** cache AI results with `storage.cacheEvaluation()`
- ✅ **Always** normalize translations for cache matching
- ✅ **Always** have fallback evaluation for errors
- ✅ **Always** validate AI responses and score ranges (0-100)

---

## Protocol 10: Emergency Debugging

### When Everything Breaks (MEMORIZED):
```bash
# 1. Type check first
npx tsc --noEmit --skipLibCheck

# 2. Reset database
rm database.db
npx drizzle-kit generate
npx drizzle-kit migrate

# 3. Restart everything
npm run dev

# 4. Test critical paths
curl http://localhost:5001/api/sentences
```

### Common Issues & Fixes (MEMORIZED):
- **Type errors**: Check for `any` types, missing interfaces
- **Database errors**: Check JSON stringify/parse, Unix timestamps
- **Port conflicts**: Change to 5001 or kill process on 5000
- **Module errors**: Check import paths, shared schema alignment

---

## COMMIT TO MEMORY: The Big 5

### 1. TypeScript First
Run `npx tsc --noEmit --skipLibCheck` before everything else

### 2. JSON + Dates for SQLite
`JSON.stringify()` for storage, `Math.floor(Date.now() / 1000)` for dates

### 3. Conditional Rendering
`{value && <Component value={value} />}` always

### 4. Schema as Truth
`shared/schema.ts` is the single source of truth for all types

### 5. AI 3-Tier Caching
Always Cache → Templates → AI. Never skip cache check first.

---

**This is my commitment**: I will follow these protocols religiously for consistent, error-free AIdioma development. When in doubt, refer back to these memorized patterns.
