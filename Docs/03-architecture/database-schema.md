# Database Architecture
## TypeScript-First Schema with Drizzle ORM

---

## 📊 **Overview**

**Database**: PostgreSQL (production) / SQLite (development)  
**ORM**: Drizzle ORM with full TypeScript integration  
**Schema Location**: `shared/schema.ts` (single source of truth)  
**Type Safety**: Zero `any` usage with strict TypeScript  
**Migration**: Drizzle Kit for schema evolution

---

## 🏗️ **Design Principles**

### **Core Standards**
- **Single Source of Truth**: All types in `shared/schema.ts`
- **Type Safety**: Full TypeScript integration with Drizzle
- **Performance**: Optimized queries with proper indexing
- **Scalability**: Designed for user growth and content expansion
- **AI Cost Optimization**: Built-in caching for expensive operations

### **Technology Integration**
```typescript
// Schema Pattern Example
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  level: text('level').$type<'beginner' | 'intermediate' | 'advanced'>(),
  createdAt: timestamp('created_at').defaultNow()
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

---

## 🗄️ **Database Schema**

### **1. Users Table**
```typescript
users {
  id: text (PK)              // Unique user identifier
  email: text (UNIQUE)       // User email address
  name: text                 // Display name
  level: enum               // 'beginner' | 'intermediate' | 'advanced'
  streak: integer           // Consecutive learning days
  totalScore: integer       // Cumulative learning points
  preferences: jsonb        // User customization settings
  createdAt: timestamp      // Account creation
  updatedAt: timestamp      // Last profile update
}
```

**Purpose**: Core user management with learning preferences  
**Indexes**: `email` (unique), `level`  
**Relations**: One-to-many with all user-related tables

### **2. Sentences Table**
```typescript
sentences {
  id: text (PK)             // Unique sentence identifier
  spanish: text             // Spanish text (source)
  english: text             // English translation (target)
  difficulty: enum          // 'beginner' | 'intermediate' | 'advanced'
  category: text            // Content category
  hints: jsonb              // Progressive hints array
  grammarPoints: jsonb      // Grammar concepts covered
  isActive: boolean         // Content visibility
  createdAt: timestamp      // Content creation
}
```

**Purpose**: Content library for translation practice  
**Indexes**: `difficulty`, `category`, `isActive`  
**Content**: Curated Spanish sentences with educational metadata

### **3. User Progress Table**
```typescript
userProgress {
  id: text (PK)             // Unique progress record
  userId: text (FK)         // Reference to users.id
  sentenceId: text (FK)     // Reference to sentences.id
  attempts: integer         // Total practice attempts
  bestScore: integer        // Highest score (0-100)
  lastPracticed: timestamp  // Most recent practice
  masteryLevel: enum        // 'learning' | 'practiced' | 'mastered'
  hintsUsed: integer        // Total hints consumed
  averageTime: integer      // Average completion time (ms)
}
```

**Purpose**: Individual learning progress tracking  
**Indexes**: `userId`, `sentenceId`, `masteryLevel`  
**Relations**: Many-to-one with users and sentences

### **4. Practice Sessions Table**
```typescript
practiceSessions {
  id: text (PK)             // Unique session identifier
  userId: text (FK)         // Reference to users.id
  startTime: timestamp      // Session start
  endTime: timestamp        // Session end
  totalSentences: integer   // Sentences practiced
  averageScore: decimal     // Session average (0-100)
  pointsEarned: integer     // Gamification points
  sessionType: enum         // 'practice' | 'reading' | 'conversation'
}
```

**Purpose**: Practice session management and analytics  
**Indexes**: `userId`, `sessionType`, `startTime`  
**Analytics**: Support for progress tracking and engagement metrics

### **5. Evaluations Table**
```typescript
evaluations {
  id: text (PK)             // Unique evaluation identifier
  userId: text (FK)         // Reference to users.id
  sentenceId: text (FK)     // Reference to sentences.id
  userTranslation: text     // User's translation attempt
  score: integer            // AI evaluation score (0-100)
  feedback: text            // AI-generated feedback
  grammarErrors: jsonb      // Grammar issues identified
  evaluatedAt: timestamp    // Evaluation timestamp
  evaluationTime: integer   // AI processing time (ms)
  cached: boolean           // Whether result was cached
}
```

**Purpose**: AI evaluation results and detailed feedback  
**Indexes**: `userId`, `sentenceId`, `evaluatedAt`, `cached`  
**AI Integration**: Supports caching strategy and performance monitoring

### **6. Evaluation Cache Table**
```typescript
evaluationCache {
  id: text (PK)             // Unique cache entry
  cacheKey: text (UNIQUE)   // Hash of input parameters
  result: jsonb             // Cached evaluation result
  hitCount: integer         // Number of cache uses
  createdAt: timestamp      // Cache creation
  lastUsed: timestamp       // Most recent access
  expiresAt: timestamp      // Cache expiration
}
```

**Purpose**: AI cost optimization through intelligent caching  
**Indexes**: `cacheKey` (unique), `expiresAt`  
**Performance**: 85-90% cache hit rate target

### **7. Learning Analytics Table**
```typescript
learningAnalytics {
  id: text (PK)             // Unique analytics record
  userId: text (FK)         // Reference to users.id
  date: date                // Analytics date
  practiceMinutes: integer  // Time spent practicing
  sentencesCompleted: integer // Sentences finished
  averageScore: decimal     // Daily average score
  streakDays: integer       // Consecutive days
  weaknessAreas: jsonb      // Identified weak points
  improvementRate: decimal  // Learning velocity
}
```

**Purpose**: Learning insights and progress metrics  
**Indexes**: `userId`, `date`  
**Analytics**: Support gamification and progress tracking

---

## 🔗 **Schema Relations**

### **Database Relationships**
```typescript
// Drizzle Relations Definition
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  sessions: many(practiceSessions),
  evaluations: many(evaluations),
  analytics: many(learningAnalytics)
}))

export const sentencesRelations = relations(sentences, ({ many }) => ({
  progress: many(userProgress),
  evaluations: many(evaluations)
}))
```

### **Type Safety Pattern**
```typescript
// API Response Types
export interface UserProgressWithSentence {
  id: string
  userId: string
  attempts: number
  bestScore: number
  sentence: {
    spanish: string
    english: string
    difficulty: string
  }
}

// Query Helpers
export const getUserProgress = async (userId: string) => {
  return await db
    .select()
    .from(userProgress)
    .innerJoin(sentences, eq(userProgress.sentenceId, sentences.id))
    .where(eq(userProgress.userId, userId))
}
```

---

## ⚡ **Performance Optimization**

### **Query Optimization**
- **Indexed Columns**: All foreign keys and commonly queried fields
- **Composite Indexes**: Multi-column indexes for complex queries
- **Query Planning**: Optimized joins and subqueries
- **Connection Pooling**: Efficient database connection management

### **Caching Strategy**
- **Application Cache**: In-memory caching for frequent queries
- **Database Cache**: Evaluation results cached in database
- **CDN Caching**: Static content and API responses
- **AI Cache**: 3-tier caching for expensive AI operations

### **Scalability Features**
- **Read Replicas**: Support for read-heavy workloads
- **Partitioning**: Time-based partitioning for analytics tables
- **Archiving**: Historical data management strategy
- **Monitoring**: Query performance and database health metrics 