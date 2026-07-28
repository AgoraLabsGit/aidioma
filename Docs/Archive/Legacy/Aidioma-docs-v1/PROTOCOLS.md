Key Memory Protocols:

Protocol 1: TypeScript First
Always run npx tsc --noEmit --skipLibCheck when debugging
Never use any types
Use NewSentence not InsertSentence (Drizzle v0.29+)
Conditional rendering patterns for optional values
Protocol 2: Database & JSON Handling
Unix timestamps: Math.floor(Date.now() / 1000)
JSON fields: JSON.stringify() for storage, JSON.parse() for retrieval
SQLite-specific patterns for compatibility
Protocol 3: Architecture Rules
schema.ts as single source of truth
IStorage interface for all database operations
Proper file organization patterns
Protocol 4: API Patterns
Standard error handling format
Environment-aware authentication
Consistent response structures
Protocol 5: React Patterns
Proper component prop typing
TanStack Query patterns
Conditional rendering safety
The Big 5 Commitments:
TypeScript First - Always type check before debugging
JSON + Dates for SQLite - Proper serialization patterns
Conditional Rendering - Safe optional value handling
Schema as Truth - Single source for all types
Fallback Everything - Always have backup plans