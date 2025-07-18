# AIdioma Development Protocols for Local Development

*Comprehensive development protocols specifically designed for local IDE development environment*
*Updated: January 17, 2025 - Local Development Setup*

## Project Context & Stack
**AIdioma Spanish Learning Platform** - Full-stack TypeScript application with progressive hints, severe scoring (1-10), and AI-powered evaluation.

**Current Stack (Local Development):**
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + TypeScript + Express
- **Database**: SQLite (local development) / PostgreSQL (production) with Drizzle ORM
- **Auth**: Environment-aware authentication (stubbed for local development)
- **AI Integration**: OpenAI GPT-4 for content generation/evaluation
- **Development**: Local IDE environment with hot reload and database reset capabilities
- **IDE**: VS Code or any preferred editor with TypeScript support

## Core Development Principles

### 1. TypeScript Conformity Standards
```typescript
// ✅ ALWAYS use proper types - never 'any'
interface UserProgress {
  id: string;
  userId: string;
  sentenceId: number;
  bestScore: number; // 1.0-10.0 severe scoring
  hintsUsed: number;
  totalHintCost: number;
  independenceScore: number; // 0.0-1.0
}

// ✅ Use proper error handling
type APIResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  details?: unknown;
};

// ✅ Database schema consistency with Drizzle (Updated naming)
export const userProgress = pgTable('userProgress', {
  id: serial('id').primaryKey(),
  userId: varchar('userId').notNull(),
  sentenceId: integer('sentenceId').notNull(),
  bestScore: real('bestScore').default(10.0).notNull(),
  hintsUsed: integer('hintsUsed').default(0).notNull(),
});

// ✅ Use NewSentence not InsertSentence (v0.29+ convention)
export type NewSentence = typeof sentences.$inferInsert;
export type Sentence = typeof sentences.$inferSelect;
```

### 2. File Structure Conventions (Current)
```
server/
├── db.ts              # Database connection
├── index.ts           # Server entry point
├── routes.ts          # API route definitions
├── storage.ts         # IStorage interface implementation
├── vite.ts            # Vite development server integration
└── services/
    └── sentenceService.ts  # Sample data initialization

shared/
├── schema.ts          # Drizzle schema definitions (SINGLE SOURCE OF TRUTH)
├── schema-sqlite.ts   # SQLite-specific schema
└── schema-pg.ts.bak   # PostgreSQL backup schema

client/src/
├── components/        # Feature-organized React components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
├── pages/            # Route-based page components
└── types/            # Client-specific TypeScript types

docs/
├── 01-project/       # Project overview and requirements
├── 02-development/   # Development guidelines and protocols
├── 03-design/        # UI/UX and design specifications
├── 04-learning-system/ # Learning algorithm documentation
├── 05-implementation/ # Implementation details
├── 06-operations/    # Deployment and operations
├── 07-dev-logs/      # Development logs and decisions
└── 08-Alex-Notes/    # Additional notes and references
```

### 3. Database Operations Protocol (SQLite Compatible)
```typescript
// ✅ ALWAYS use proper JSON handling for SQLite
const sentenceData: NewSentence = {
  englishText: "Hello, how are you?",
  spanishTranslations: JSON.stringify(["Hola, ¿cómo estás?", "Hola, ¿qué tal?"]),
  hints: JSON.stringify({ "how": "cómo", "are": "estás" }),
  lastAttempted: Math.floor(Date.now() / 1000), // Unix timestamp for SQLite
};

// ✅ ALWAYS use transactions for multi-table operations
export async function submitTranslationAttempt(
  userId: string, 
  sentenceId: number, 
  attempt: TranslationAttempt
) {
  return await db.transaction(async (tx) => {
    // Update user progress
    await tx.update(userProgress)
      .set({ bestScore: attempt.finalScore })
      .where(eq(userProgress.userId, userId));
    
    // Log hint usage
    if (attempt.hintsUsed.length > 0) {
      await tx.insert(userHintUsage).values(attempt.hintsUsed);
    }
    
    return { success: true };
  });
}

// ✅ Proper retrieval with JSON parsing
const sentence = await db.select().from(sentences).where(eq(sentences.id, id));
const translations = JSON.parse(sentence.spanishTranslations) as string[];
const hints = JSON.parse(sentence.hints) as Record<string, string>;
```

### 4. API Design Standards (Updated)
```typescript
// ✅ Environment-aware authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    // Stub auth for local development
    next();
  } else {
    // Production authentication logic
    // TODO: Implement production auth system
  }
};

// ✅ Consistent API response format
app.post('/api/sentences/:id/evaluate', isAuthenticated, async (req, res) => {
  try {
    const result = await evaluateTranslation(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});
```

## Development Workflow (Local Environment)

### 1. Feature Development Process
1. **TypeScript Check**: Run `npx tsc --noEmit --skipLibCheck` first
2. **Schema First**: Update `shared/schema.ts` for new features
3. **Migration**: Generate migration with `npx drizzle-kit generate`
4. **API Design**: Define TypeScript interfaces in `shared/schema.ts`
5. **Database Layer**: Implement queries through `IStorage` interface
6. **Route Handler**: Add endpoints in `server/routes.ts`
7. **Frontend Integration**: Update React components with proper types

### 2. Database Changes (Updated Commands)
```bash
# TypeScript validation (ALWAYS FIRST)
npx tsc --noEmit --skipLibCheck

# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate

# Reset database (local development - safe operation)
rm database.db && npx drizzle-kit migrate

# Start development server
npm run dev
```

### 3. Testing Protocol
- **TypeScript Compilation**: Zero errors required before commit
- **Unit Tests**: All database operations and business logic
- **Integration Tests**: API endpoints with proper error handling
- **Type Tests**: Critical interfaces and schema validation
- **Manual Testing**: Progressive hints workflow and user flows

## AI Integration Guidelines (Cost Optimized)

### 1. OpenAI API Usage with Caching
```typescript
// ✅ Proper error handling, caching, and fallback
export async function evaluateTranslation(
  sentence: string, 
  userTranslation: string
): Promise<AIEvaluation> {
  // Check cache first to reduce costs
  const cached = await checkCache(sentence, userTranslation);
  if (cached) return cached;
  
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [/* ... */],
      temperature: 0.3,
    });
    
    const evaluation = parseEvaluation(response);
    await cacheResult(sentence, userTranslation, evaluation);
    return evaluation;
  } catch (error) {
    // ALWAYS have fallback evaluation
    console.warn('AI evaluation failed, using fallback:', error.message);
    return this.fallbackEvaluation(userTranslation, sentence);
  }
}
```

### 2. Cost Optimization Strategies
- **Template-Based Feedback**: Use pre-generated responses for common errors
- **Intelligent Caching**: Cache by translation similarity, not exact match
- **Batch Operations**: Generate content in batches to optimize API usage
- **Fallback Systems**: Always have non-AI backup evaluation
- **Cost Monitoring**: Track API usage and implement rate limiting

## Common TypeScript Issues & Solutions (Local Development Best Practices)

### 1. Database Query Types (SQLite Compatible)
```typescript
// ❌ Avoid - loses type safety and SQLite compatibility
const user = await db.select().from(users).where(eq(users.id, userId));

// ✅ Proper - maintains types and handles JSON fields
const [user] = await db.select({
  id: users.id,
  email: users.email,
  currentLevel: users.currentLevel,
}).from(users).where(eq(users.id, userId));

// ✅ Handle JSON fields properly
const sentence = await db.select().from(sentences).where(eq(sentences.id, id));
if (sentence) {
  const translations = JSON.parse(sentence.spanishTranslations) as string[];
  const hints = JSON.parse(sentence.hints) as Record<string, string>;
}
```

### 2. API Request/Response Types
```typescript
// ✅ Define comprehensive interfaces
interface EvaluateTranslationRequest {
  userTranslation: string;
  hintsUsed: HintUsage[];
  attemptTime: number;
  sentenceId: number;
}

interface EvaluateTranslationResponse {
  isCorrect: boolean;
  finalScore: number; // 1.0-10.0 severe scoring
  feedback: string;
  aiEvaluation?: AIEvaluation; // Optional - might use fallback
  hintsUsed: number;
  costDeduction: number;
}
```

### 3. Component Props with Conditional Rendering
```typescript
// ✅ Proper React component typing with safety
interface TranslationInputProps {
  sentence: Sentence;
  onSubmit: (translation: string) => void;
  currentScore: number;
  hintsAvailable: boolean;
  disabled?: boolean;
}

// ✅ Safe conditional rendering
export function TranslationPractice({ sentences }: Props) {
  const currentSentence = sentences[currentIndex];
  
  return (
    <div>
      {currentSentence && (
        <SentenceDisplay 
          sentence={currentSentence} 
          onHintUsed={handleHintUsed}
        />
      )}
    </div>
  );
}
```

## Error Prevention Checklist (Local Development Best Practices)

### Before Each Commit:
- [ ] `npx tsc --noEmit --skipLibCheck` passes with zero errors
- [ ] Database schema changes have proper migrations
- [ ] All JSON fields use `JSON.stringify()` for storage
- [ ] All date fields use Unix timestamps (`Math.floor(Date.now() / 1000)`)
- [ ] API endpoints return proper response types
- [ ] No `any` types in new code
- [ ] Conditional rendering for all optional values
- [ ] Error boundaries handle edge cases
- [ ] Console logs removed from production code

### Code Review Focus Areas:
- Type safety maintenance across client/server boundary
- Database query optimization and SQLite compatibility
- API response consistency and error handling
- Component prop validation and conditional rendering
- JSON field serialization and deserialization
- Date handling for cross-database compatibility

## Quick Reference Commands (Local Development)

```bash
# Development Workflow
npm run dev                         # Start dev server (port 5001)
npx tsc --noEmit --skipLibCheck    # TypeScript validation (FIRST!)
npx drizzle-kit generate           # Create migration
npx drizzle-kit migrate            # Apply migrations

# Database Management
rm database.db                     # Reset local database (safe)
npx drizzle-kit migrate           # Reinitialize database

# Debugging
curl http://localhost:5001/api/auth/user      # Test auth endpoint
curl http://localhost:5001/api/sentences     # Test sentences endpoint

# Git Workflow
git add .
git commit -m "feat: descriptive message"
git push origin main
```

## Local Development IDE Guidelines

### 1. Development Environment Setup
- Use any preferred IDE with TypeScript support (VS Code, WebStorm, etc.)
- Ensure proper TypeScript language server configuration
- Use the established file structure and naming conventions
- Reference `shared/schema.ts` as the single source of truth
- Implement proper error handling and fallbacks
- Follow established coding patterns for consistency

### 2. IDE-Agnostic Best Practices
- Provide complete file context when making changes
- Use proper linting and formatting tools
- Follow the established coding patterns and conventions
- Maintain type safety throughout all implementations
- Reference existing successful patterns in the codebase

---

**Remember**: The AIdioma platform focuses on **educational effectiveness** through progressive hints and severe scoring psychology. Every feature should enhance the learning experience while maintaining type safety, development efficiency, and cost optimization.

**Local Development Focus**: Design for platform independence and maintain comprehensive error handling for smooth development experience across different IDEs and environments.
