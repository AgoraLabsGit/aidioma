# AIdioma v2 Database Architecture
## Comprehensive Schema Documentation

---

## 📊 **Overview**

**Database Type**: SQLite (development) / PostgreSQL (production-ready)  
**ORM**: Drizzle ORM with TypeScript  
**Schema Location**: `/shared/schema.ts`  
**Migration Status**: ✅ Complete (Phase 1) - All 7 core tables implemented  
**Version Alignment**: Drizzle ORM v0.44.3 (shared) - requires server sync  
**Last Updated**: July 18, 2025 - Phase 1 Finalization

---

## 🏗️ **Architecture Design Principles**

### **Core Principles**
- **Type Safety**: Full TypeScript integration with Drizzle ORM
- **Performance**: Optimized queries with proper indexing
- **Scalability**: Designed for user growth and content expansion
- **Data Integrity**: Comprehensive foreign key relationships
- **Cost Efficiency**: Built-in caching layer for AI evaluations

### **Technology Stack**
```typescript
ORM:           Drizzle ORM
Database:      SQLite (dev) / PostgreSQL (prod)
Validation:    Zod schemas
Type Safety:   TypeScript strict mode
Migrations:    Drizzle Kit
Query Builder: Type-safe query composition
```

---

## 📋 **Database Schema**

### **Schema Overview**
The AIdioma database consists of 7 interconnected tables designed to support comprehensive language learning functionality:

1. **users** - User management and preferences
2. **sentences** - Content library (Spanish/English pairs)
3. **userProgress** - Individual learning progress tracking
4. **practiceSessions** - Practice session management
5. **evaluations** - AI evaluation results and feedback
6. **evaluationCache** - Cost optimization through intelligent caching
7. **learningAnalytics** - Learning insights and metrics

---

## 🗄️ **Table Specifications**

### **1. Users Table**
```typescript
users {
  id: text (PK)              // Unique user identifier
  email: text (UNIQUE)       // User email address
  name: text                 // Display name
  createdAt: timestamp       // Account creation
  updatedAt: timestamp       // Last profile update
  level: enum               // 'beginner' | 'intermediate' | 'advanced'
  streak: integer           // Consecutive learning days
  totalScore: integer       // Cumulative learning points
  preferences: json         // User customization settings
}
```

**Purpose**: Core user management with learning preferences  
**Indexes**: email (unique), level  
**Relations**: One-to-many with all other user-related tables

### **2. Sentences Table**
```typescript
sentences {
  id: text (PK)             // Unique sentence identifier
  spanish: text             // Spanish text (source)
  english: text             // English translation (target)
  difficulty: enum          // 'beginner' | 'intermediate' | 'advanced'
  category: text            // Content category (e.g., 'daily_life', 'business')
  hints: json               // Array of progressive hints
  grammarPoints: json       // Array of grammar concepts
  createdAt: timestamp      // Content creation date
  isActive: boolean         // Content visibility flag
}
```

**Purpose**: Content library for translation practice  
**Indexes**: difficulty, category, isActive  
**Content Strategy**: Curated Spanish sentences with educational metadata

### **3. User Progress Table**
```typescript
userProgress {
  id: text (PK)             // Unique progress record
  userId: text (FK)         // Reference to users.id
  sentenceId: text (FK)     // Reference to sentences.id
  attempts: integer         // Total practice attempts
  bestScore: integer        // Highest score achieved (0-100)
  lastAttemptAt: timestamp  // Most recent practice
  mastered: boolean         // Mastery status flag
  averageScore: real        // Average performance metric
}
```

**Purpose**: Individual sentence mastery tracking  
**Indexes**: userId, sentenceId, mastered  
**Composite Key**: (userId, sentenceId) for unique progress records

### **4. Practice Sessions Table**
```typescript
practiceSessions {
  id: text (PK)             // Unique session identifier
  userId: text (FK)         // Reference to users.id
  startedAt: timestamp      // Session start time
  completedAt: timestamp    // Session completion (nullable)
  totalSentences: integer   // Planned sentence count
  completedSentences: integer // Actually completed count
  averageScore: real        // Session performance metric
  sessionType: text         // 'standard' | 'review' | 'challenge'
}
```

**Purpose**: Practice session management and analytics  
**Indexes**: userId, startedAt, sessionType  
**Session Types**: Different practice modes for varied learning

### **5. Evaluations Table**
```typescript
evaluations {
  id: text (PK)             // Unique evaluation record
  userId: text (FK)         // Reference to users.id
  sentenceId: text (FK)     // Reference to sentences.id
  sessionId: text (FK)      // Reference to practiceSessions.id (nullable)
  userTranslation: text     // User's translation attempt
  aiEvaluation: json        // Full AI response data
  score: integer            // Evaluation score (0-100)
  feedback: text            // AI-generated feedback
  hintsUsed: integer        // Number of hints accessed
  timeSpent: integer        // Time in seconds
  createdAt: timestamp      // Evaluation timestamp
}
```

**Purpose**: Individual translation evaluation records  
**Indexes**: userId, sentenceId, score, createdAt  
**AI Integration**: Stores complete AI evaluation context

### **6. Evaluation Cache Table**
```typescript
evaluationCache {
  id: text (PK)             // Unique cache entry
  sentenceId: text (FK)     // Reference to sentences.id
  userTranslation: text     // Cached translation
  translationHash: text     // Normalized translation hash
  aiResponse: json          // Cached AI response
  score: integer            // Cached score
  feedback: text            // Cached feedback
  cacheLevel: enum          // 'exact' | 'similar' | 'semantic'
  createdAt: timestamp      // Cache creation
  hitCount: integer         // Cache usage counter
}
```

**Purpose**: AI cost optimization through intelligent caching  
**Indexes**: sentenceId, translationHash, cacheLevel  
**Cache Strategy**: Multi-level caching for cost reduction (target: 85% savings)

### **7. Learning Analytics Table**
```typescript
learningAnalytics {
  id: text (PK)             // Unique analytics record
  userId: text (FK)         // Reference to users.id
  date: text                // Date in YYYY-MM-DD format
  practiceTime: integer     // Daily practice minutes
  sentencesCompleted: integer // Daily sentence count
  averageScore: real        // Daily performance average
  hintsUsed: integer        // Daily hints accessed
  streakDay: integer        // Streak day number
  difficultiesEncountered: json // Array of challenge areas
}
```

**Purpose**: Daily learning analytics and insights  
**Indexes**: userId, date  
**Analytics Strategy**: Daily aggregation for performance tracking

---

## 🔗 **Relationships & Constraints**

### **Relationship Diagram**
```
users (1) ←→ (M) userProgress ←→ (M) sentences
  ↓                                    ↑
  (1) ←→ (M) practiceSessions         ↑
  ↓              ↓                     ↑
  (1) ←→ (M) evaluations ←→ (M) ←→ (M) ↑
  ↓                                    ↑
  (1) ←→ (M) learningAnalytics        ↑
                                       ↑
evaluationCache ←→ (M) ←→ (1) sentences
```

### **Foreign Key Constraints**
- **CASCADE DELETE**: User deletion removes all related records
- **RESTRICT DELETE**: Sentences protected while referenced
- **NULL HANDLING**: Optional session references in evaluations

### **Data Integrity Rules**
- Email uniqueness enforced at database level
- Score ranges validated (0-100) at application level
- Timestamp consistency maintained across related records
- Cache invalidation triggers on sentence updates

---

## ⚡ **Performance Optimization**

### **Indexing Strategy**
```sql
-- Primary indexes (automatic)
users.id, sentences.id, userProgress.id, etc.

-- Performance indexes
users.email (UNIQUE)
sentences.difficulty, sentences.category
userProgress.userId, userProgress.sentenceId
evaluations.userId, evaluations.createdAt
evaluationCache.translationHash
learningAnalytics.userId, learningAnalytics.date

-- Composite indexes
(userProgress.userId, userProgress.mastered)
(evaluations.sentenceId, evaluations.score)
```

### **Query Optimization**
- **Lazy Loading**: Relations loaded on-demand
- **Batch Operations**: Multiple records processed efficiently
- **Connection Pooling**: Optimized database connections
- **Query Caching**: Frequent queries cached at ORM level

### **Caching Strategy**
- **L1 Cache**: Application-level query results
- **L2 Cache**: AI evaluation responses (evaluationCache table)
- **L3 Cache**: Static content (sentences, user preferences)

---

## 🛡️ **Security & Privacy**

### **Data Protection**
- **No PII Storage**: Minimal personal information
- **Password Handling**: External authentication (planned)
- **Data Encryption**: At-rest encryption for production
- **Access Control**: Row-level security for user data

### **Privacy Compliance**
- **GDPR Ready**: User data deletion capabilities
- **Data Minimization**: Only necessary data collected
- **Consent Management**: Preference-based data usage
- **Audit Trail**: User action logging capabilities

---

## 🔄 **Migration & Versioning**

### **Current Version**: v1.0 (Phase 1 Complete)
### **Migration History**
- **v1.0** (July 18, 2025): Initial schema from AIdioma v1 extraction
  - All 7 tables implemented
  - TypeScript integration complete
  - Drizzle ORM configuration established

### **Migration Commands**
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# View current schema
npm run db:introspect
```

### **Version Control**
- Schema changes tracked in git
- Migration files preserved for rollback
- Development/production parity maintained

---

## 📈 **Scalability Considerations**

### **Current Capacity**
- **Users**: Designed for 100K+ users
- **Sentences**: Supports 50K+ content items
- **Evaluations**: Millions of evaluation records
- **Analytics**: Daily aggregation supports long-term storage

### **Growth Strategy**
- **Horizontal Scaling**: Read replicas for query distribution
- **Vertical Scaling**: Index optimization for larger datasets
- **Archive Strategy**: Cold storage for old evaluations
- **Sharding Ready**: User-based partitioning possible

### **Performance Targets**
- **Query Response**: < 100ms for 95% of queries
- **Cache Hit Rate**: > 80% for AI evaluations
- **Database Size**: < 1GB for 10K active users
- **Backup Time**: < 5 minutes for full backup

---

## 🔧 **Development Tools**

### **Schema Management**
```typescript
// Schema definition
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// Type generation
import { createSelectSchema, createInsertSchema } from 'drizzle-zod'

// Query building
import { eq, and, desc, count } from 'drizzle-orm'
```

### **Development Commands**
```bash
# Start database
npm run db:start

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed

# Generate types
npm run db:generate-types
```

### **Testing Strategy**
- **Unit Tests**: Individual table operations
- **Integration Tests**: Cross-table relationships
- **Performance Tests**: Query optimization validation
- **Migration Tests**: Schema change verification

---

## 🚀 **Future Enhancements**

### **Phase 2 Extensions** (Weeks 3-4) - **IN PROGRESS**
- **Content Tables**: Text passages, reading materials, content metadata
- **Content Processing**: Upload, analysis, categorization workflows  
- **Reading Interface**: Paragraph-level tracking, vertical scrolling
- **Content Library**: Filtering, search, recommendation engine

### **Phase 3 Extensions** (Weeks 5-6) - **PLANNED**
- **Vocabulary Tables**: Word extraction and spaced repetition tracking
- **Conversation History**: AI chat session storage and persona management
- **Memory Analytics**: Flash card system with intelligent scheduling

### **Phase 4 Extensions** (Weeks 7-8) - **PLANNED**
- **Achievement System**: Badges, milestones, and gamification
- **User Preferences**: Advanced customization and settings management
- **Advanced Analytics**: ML-powered learning insights and recommendations

---

## 📚 **API Integration Examples**

### **User Operations**
```typescript
// Get user with progress
const userWithProgress = await db.query.users.findFirst({
  where: eq(users.id, userId),
  with: {
    progress: {
      where: eq(userProgress.mastered, false),
      limit: 10
    }
  }
})

// Update user streak
await db.update(users)
  .set({ 
    streak: sql`${users.streak} + 1`,
    updatedAt: new Date()
  })
  .where(eq(users.id, userId))
```

### **Practice Session Management**
```typescript
// Start new session
const session = await db.insert(practiceSessions).values({
  userId,
  startedAt: new Date(),
  totalSentences: 10,
  sessionType: 'standard'
}).returning()

// Complete session
await db.update(practiceSessions)
  .set({ 
    completedAt: new Date(),
    completedSentences: 8,
    averageScore: 85.5
  })
  .where(eq(practiceSessions.id, sessionId))
```

### **Evaluation with Caching**
```typescript
// Check cache first
const cached = await db.query.evaluationCache.findFirst({
  where: and(
    eq(evaluationCache.sentenceId, sentenceId),
    eq(evaluationCache.translationHash, hash)
  )
})

if (cached) {
  // Use cached result
  return cached.aiResponse
} else {
  // Call AI API and cache result
  const aiResult = await evaluateTranslation(translation)
  await db.insert(evaluationCache).values({
    sentenceId,
    userTranslation: translation,
    translationHash: hash,
    aiResponse: aiResult,
    cacheLevel: 'exact'
  })
  return aiResult
}
```

---

## 🔍 **Monitoring & Maintenance**

### **Health Checks**
- **Connection Status**: Database connectivity monitoring
- **Query Performance**: Slow query detection
- **Cache Efficiency**: Hit rate monitoring
- **Data Integrity**: Relationship constraint validation

### **Maintenance Tasks**
- **Daily**: Analytics aggregation, cache cleanup
- **Weekly**: Performance index analysis
- **Monthly**: Data archival, backup verification
- **Quarterly**: Schema optimization review

---

This comprehensive database architecture serves as the foundation for AIdioma v2, supporting the complete language learning platform while maintaining performance, scalability, and development efficiency.

**Next Steps**: Phase 2 will extend this schema with content management tables for the reading system implementation.
