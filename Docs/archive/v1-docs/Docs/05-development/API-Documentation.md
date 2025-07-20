# API Documentation - AIdioma v2

## Overview

This document outlines all API endpoints for the AIdioma Spanish learning platform, organized by functional area and page integration.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://aidioma.app/api`

## Authentication

All authenticated endpoints require a valid session token. Local development uses stubbed authentication.

```typescript
// Authentication header
headers: {
  'Authorization': 'Bearer <session-token>'
}
```

---

## Practice Page Endpoints

### Translation Practice

#### `GET /api/sentences`
**Purpose**: Fetch practice sentences with filtering
**Authentication**: Required

**Query Parameters**:
```typescript
{
  difficulty?: number;     // 1-9 scale
  topic?: string;          // 'daily_life', 'food', 'travel', etc.
  limit?: number;          // Default: 10
  offset?: number;         // For pagination
  userId?: string;         // User context for personalization
}
```

**Response**:
```typescript
{
  sentences: Array<{
    id: number;
    english_text: string;
    spanish_text: string;
    difficulty: number;
    topic: string;
    grammar_concepts: string[];
    hints: HintData[];
  }>;
  total: number;
  hasMore: boolean;
}
```

#### `POST /api/evaluate-translation`
**Purpose**: Submit translation for AI evaluation
**Authentication**: Required

**Request Body**:
```typescript
{
  sentenceId: number;
  userTranslation: string;
  hintsUsed: number;
  timeSpent: number;      // milliseconds
  sessionId: string;
}
```

**Response**:
```typescript
{
  score: number;          // 0-100
  grade: string;          // 'A', 'B', 'C', 'D', 'F'
  feedback: string;
  explanations: string[];
  pointsEarned: number;
  cached: boolean;
}
```

#### `POST /api/hint-used`
**Purpose**: Track hint usage for analytics
**Authentication**: Required

**Request Body**:
```typescript
{
  sentenceId: number;
  wordIndex: number;
  hintType: string;       // 'verb_level_1', 'multiple_choice', etc.
  pointsDeducted: number;
  sessionId: string;
}
```

---

## Reading Page Endpoints

### Content Management

#### `POST /api/reading/upload`
**Purpose**: Upload and process content files
**Authentication**: Required

**Request**: Multipart form data
```typescript
{
  file: File;             // .txt, .pdf, .docx
  title: string;
  author?: string;
  contentType: 'ai_story' | 'web_story' | 'book' | 'conversation';
  topics?: string[];
  metadata?: object;
}
```

**Response**:
```typescript
{
  contentId: number;
  processingStatus: 'queued' | 'processing' | 'completed' | 'failed';
  estimatedTime: number;  // seconds
  message: string;
}
```

#### `GET /api/reading`
**Purpose**: Browse content library
**Authentication**: Required

**Query Parameters**:
```typescript
{
  contentType?: string;
  difficulty?: number;
  topic?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
```

**Response**:
```typescript
{
  content: Array<{
    id: number;
    title: string;
    author: string;
    contentType: string;
    difficulty: number;
    topics: string[];
    wordCount: number;
    estimatedReadingTime: number;
    userProgress?: {
      sentencesRead: number;
      totalSentences: number;
      lastReadAt: string;
    };
  }>;
  total: number;
  filters: {
    availableTopics: string[];
    difficultyRange: [number, number];
    contentTypes: string[];
  };
}
```

#### `GET /api/reading/:id`
**Purpose**: Get specific content details
**Authentication**: Required

**Response**:
```typescript
{
  id: number;
  title: string;
  author: string;
  contentType: string;
  difficulty: number;
  topics: string[];
  content: string;
  metadata: object;
  totalSentences: number;
  userProgress: {
    sentencesRead: number;
    bookmarkedWords: number;
    lastReadAt: string;
    readingSpeed: number;    // words per minute
  };
}
```

#### `GET /api/reading/:id/sentences`
**Purpose**: Get sentences for interactive reading
**Authentication**: Required

**Query Parameters**:
```typescript
{
  startIndex?: number;
  limit?: number;
}
```

**Response**:
```typescript
{
  sentences: Array<{
    id: number;
    index: number;
    spanish_text: string;
    english_translation: string;
    difficulty: number;
    words: Array<{
      text: string;
      index: number;
      translation: string;
      wordType: string;
      canBookmark: boolean;
    }>;
    grammarConcepts: string[];
  }>;
  contentInfo: {
    title: string;
    totalSentences: number;
    userProgress: number;   // percentage
  };
}
```

#### `POST /api/reading/progress`
**Purpose**: Track reading progress
**Authentication**: Required

**Request Body**:
```typescript
{
  contentId: number;
  sentenceIndex: number;
  timeSpent: number;      // milliseconds
  wordsClicked: number;
  comprehensionRating?: number;  // 1-5 scale
}
```

#### `POST /api/reading/feedback`
**Purpose**: User feedback on sentences
**Authentication**: Required

**Request Body**:
```typescript
{
  sentenceId: number;
  feedback: 'known' | 'needs_review' | 'too_easy' | 'too_hard';
  notes?: string;
}
```

---

## Memorize Page Endpoints

### Vocabulary & Flash Cards

#### `POST /api/vocabulary/bookmark`
**Purpose**: Bookmark word for flash card review
**Authentication**: Required

**Request Body**:
```typescript
{
  word: string;
  translation: string;
  sentenceId: number;
  sentenceText: string;
  wordType: string;       // 'verb', 'noun', 'adjective', etc.
  grammarConcepts: string[];
  source: 'practice' | 'reading' | 'conversation';
  difficulty?: number;    // 1-5 scale
}
```

**Response**:
```typescript
{
  bookmarkId: number;
  message: string;
  totalBookmarks: number;
}
```

#### `GET /api/vocabulary/flashcards`
**Purpose**: Get user's flash card deck
**Authentication**: Required

**Query Parameters**:
```typescript
{
  status?: 'new' | 'learning' | 'review' | 'known';
  wordType?: string;
  difficulty?: number;
  limit?: number;
  sortBy?: 'dateAdded' | 'difficulty' | 'lastReviewed';
}
```

**Response**:
```typescript
{
  flashcards: Array<{
    id: number;
    word: string;
    translation: string;
    wordType: string;
    difficulty: number;
    grammarConcepts: string[];
    originalSentence: string;
    source: string;
    status: string;
    timesReviewed: number;
    lastReviewed?: string;
    nextReview?: string;
    masteryLevel: number;   // 0-100
  }>;
  stats: {
    total: number;
    new: number;
    learning: number;
    review: number;
    known: number;
  };
}
```

#### `POST /api/vocabulary/review`
**Purpose**: Submit flash card review result
**Authentication**: Required

**Request Body**:
```typescript
{
  flashcardId: number;
  result: 'again' | 'hard' | 'good' | 'easy';
  responseTime: number;   // milliseconds
  confidence: number;     // 1-5 scale
  sessionId: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  nextReview: string;     // ISO date
  masteryLevel: number;
  intervalDays: number;
}
```

#### `GET /api/vocabulary/queue`
**Purpose**: Get spaced repetition review queue
**Authentication**: Required

**Query Parameters**:
```typescript
{
  limit?: number;         // Default: 20
  includePastDue?: boolean;
}
```

**Response**:
```typescript
{
  queue: Array<{
    flashcardId: number;
    word: string;
    priority: number;      // 1=urgent, 5=low
    daysPastDue: number;
    estimatedDifficulty: number;
  }>;
  totalDue: number;
  recommendedSessionSize: number;
}
```

#### `POST /api/vocabulary/difficulty`
**Purpose**: Update word difficulty rating
**Authentication**: Required

**Request Body**:
```typescript
{
  flashcardId: number;
  newDifficulty: number;  // 1-5 scale
  reason?: string;
}
```

#### `GET /api/vocabulary/analytics`
**Purpose**: Get vocabulary learning analytics
**Authentication**: Required

**Response**:
```typescript
{
  overview: {
    totalWords: number;
    wordsLearned: number;
    currentStreak: number;
    averageRetention: number;
  };
  progress: {
    wordsAddedThisWeek: number;
    reviewsCompletedThisWeek: number;
    averageSessionTime: number;
    weakestConcepts: string[];
  };
  retention: {
    oneDayRetention: number;
    oneWeekRetention: number;
    oneMonthRetention: number;
  };
}
```

---

## Conversations Page Endpoints (Planned)

### AI Chat System

#### `POST /api/conversations/start`
**Purpose**: Initialize new conversation
**Authentication**: Required

**Request Body**:
```typescript
{
  topic: string;
  difficulty: number;
  persona: string;        // 'casual', 'formal', 'teacher', etc.
  region: string;         // 'mexico', 'spain', 'argentina', etc.
}
```

#### `POST /api/conversations/:id/message`
**Purpose**: Send message and get AI response
**Authentication**: Required

**Request Body**:
```typescript
{
  message: string;
  responseTime?: number;
}
```

**Response**:
```typescript
{
  aiResponse: string;
  corrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
  newVocabulary?: Array<{
    word: string;
    translation: string;
    difficulty: number;
  }>;
  conversationRating: number;  // 1-10
}
```

#### `GET /api/conversations/history`
**Purpose**: Get conversation history
**Authentication**: Required

#### `GET /api/vocabulary/from-conversation`
**Purpose**: Get vocabulary from conversations
**Authentication**: Required

---

## Progress Page Endpoints

### Analytics & Tracking

#### `GET /api/progress`
**Purpose**: Get comprehensive user statistics
**Authentication**: Required

**Response**:
```typescript
{
  overall: {
    totalSentencesPracticed: number;
    averageAccuracy: number;
    currentStreak: number;
    pointsEarned: number;
    currentLevel: number;
    timeSpentLearning: number;   // minutes
  };
  practice: {
    sentencesCompleted: number;
    averageScore: number;
    hintsUsed: number;
    independence: number;        // percentage
  };
  reading: {
    contentRead: number;
    wordsEncountered: number;
    readingSpeed: number;        // words per minute
    comprehensionRate: number;
  };
  vocabulary: {
    totalWords: number;
    wordsLearned: number;
    reviewsCompleted: number;
    retentionRate: number;
  };
  conversations: {
    conversationsCompleted: number;
    averageRating: number;
    topicsDiscussed: string[];
  };
}
```

#### `GET /api/progress/history`
**Purpose**: Get detailed progress history
**Authentication**: Required

**Query Parameters**:
```typescript
{
  period?: 'week' | 'month' | 'quarter' | 'year';
  metric?: 'accuracy' | 'speed' | 'vocabulary' | 'streaks';
}
```

#### `GET /api/progress/vocabulary`
**Purpose**: Get vocabulary-specific progress metrics
**Authentication**: Required

---

## System Endpoints

### Health & Status

#### `GET /api/health`
**Purpose**: System health check
**Authentication**: None

**Response**:
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: string;
    ai: string;
    cache: string;
  };
}
```

#### `GET /api/cache/stats`
**Purpose**: Cache performance statistics
**Authentication**: Admin only

**Response**:
```typescript
{
  hitRate: number;
  totalRequests: number;
  cacheSize: number;
  tier1Hits: number;
  tier2Hits: number;
  tier3Hits: number;
  aiFallbacks: number;
}
```

---

## Error Responses

All endpoints return consistent error responses:

```typescript
{
  error: {
    code: string;           // 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string;
    details?: object;
    timestamp: string;
  };
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate limited to ensure system stability:

- **Practice endpoints**: 60 requests per minute
- **Reading endpoints**: 100 requests per minute
- **Vocabulary endpoints**: 120 requests per minute
- **Upload endpoints**: 10 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

This API documentation provides complete coverage of all endpoints across the 7-page AIdioma application architecture.
