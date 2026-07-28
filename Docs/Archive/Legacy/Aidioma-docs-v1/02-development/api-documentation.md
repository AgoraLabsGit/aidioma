# AIdioma API Documentation

## Overview
Complete API reference for the AIdioma Spanish Learning Platform, supporting progressive hints, severe scoring (1-10 points), topic-based learning, and AI-powered content generation.

**Base URL**: `/api/v1`  
**Authentication**: JWT Bearer tokens  
**Content Type**: `application/json`

---

## Authentication Endpoints

### **POST** `/auth/register`
Create new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "Maria",
  "lastName": "Garcia"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "user": {
    "id": "user_123abc",
    "email": "user@example.com",
    "firstName": "Maria",
    "lastName": "Garcia",
    "currentLevel": 1,
    "totalPoints": 0,
    "streakCount": 0
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **POST** `/auth/login`
Authenticate existing user

**Request Body:**
```json
{
  "email": "user@example.com", 
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user_123abc",
    "email": "user@example.com",
    "firstName": "Maria",
    "currentLevel": 3,
    "totalPoints": 1247,
    "streakCount": 5,
    "averageScore": 7.8,
    "hintDependency": 0.3
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **POST** `/auth/refresh`
Refresh JWT token

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-15T14:30:00Z"
}
```

---

## Topics & Filtering Endpoints

### **GET** `/topics`
Get hierarchical topic structure for filtering

**Query Parameters:**
- `includeStats` (boolean): Include sentence counts and difficulty stats
- `userProgress` (boolean): Include user's topic-specific progress

**Response:** `200 OK`
```json
{
  "success": true,
  "topics": [
    {
      "id": 1,
      "topicCode": "daily_life",
      "topicName": "Daily Life",
      "description": "Everyday activities and routines",
      "parentTopicId": null,
      "depth": 0,
      "difficultyRange": "1-6",
      "iconName": "home",
      "colorCode": "#3B82F6",
      "totalSentences": 156,
      "averageDifficulty": 3.2,
      "userProgress": {
        "masteryLevel": "developing",
        "masteryScore": 67.5,
        "sentencesCompleted": 23,
        "averageScore": 7.8
      },
      "children": [
        {
          "id": 2,
          "topicCode": "food_drink",
          "topicName": "Food & Drink",
          "parentTopicId": 1,
          "depth": 1,
          "totalSentences": 45
        }
      ]
    }
  ]
}
```

### **GET** `/topics/{topicId}/sentences`
Get sentences filtered by topic with user progress

**Path Parameters:**
- `topicId` (integer): Topic ID for filtering

**Query Parameters:**
- `difficultyMin` (integer, 1-9): Minimum difficulty level
- `difficultyMax` (integer, 1-9): Maximum difficulty level
- `tenseType` (string): Filter by tense ('present', 'preterite', etc.)
- `excludeCompleted` (boolean): Exclude sentences with score ≥ 8.0
- `limit` (integer): Number of sentences to return (default: 10)

**Response:** `200 OK`
```json
{
  "success": true,
  "sentences": [
    {
      "id": 142,
      "englishText": "I drink coffee every morning",
      "spanishTranslations": ["Bebo café cada mañana", "Tomo café cada mañana"],
      "difficultyLevel": 2,
      "difficultyScore": 2.3,
      "tenseType": "present",
      "grammarConcepts": ["present_tense", "first_person", "regular_verb"],
      "wordCount": 5,
      "topicName": "Daily Life",
      "userProgress": {
        "attempts": 2,
        "bestScore": 6.5,
        "hintsUsed": 3,
        "lastAttempted": "2024-01-15T10:30:00Z",
        "needsReview": true
      },
      "hasProgressiveHints": true
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

---

## Progressive Hints System Endpoints

### **GET** `/sentences/{sentenceId}/hints`
Get progressive hint definitions for sentence

**Path Parameters:**
- `sentenceId` (integer): Sentence ID

**Response:** `200 OK`
```json
{
  "success": true,
  "sentence": {
    "id": 142,
    "englishText": "I drink coffee every morning",
    "words": [
      {
        "wordIndex": 0,
        "englishWord": "I",
        "wordType": "pronoun",
        "hasHints": false
      },
      {
        "wordIndex": 1,
        "englishWord": "drink",
        "wordType": "verb",
        "hasHints": true,
        "hintSystem": "progressive",
        "maxLevels": 3,
        "grammarConcepts": ["present_tense", "first_person", "regular_verb"]
      },
      {
        "wordIndex": 2,
        "englishWord": "coffee",
        "wordType": "noun", 
        "hasHints": true,
        "hintSystem": "multiple_choice",
        "grammarConcepts": ["masculine_noun", "singular"]
      }
    ]
  }
}
```

### **POST** `/sentences/{sentenceId}/hints/{wordIndex}/request`
Request progressive hint for specific word

**Path Parameters:**
- `sentenceId` (integer): Sentence ID
- `wordIndex` (integer): 0-based word position

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "requestedLevel": 1,
  "currentScore": 8.5
}
```

**Response:** `200 OK`

**For Verb (Progressive Hints):**
```json
{
  "success": true,
  "hintType": "verb",
  "level": 1,
  "cost": 1.0,
  "projectedScore": 7.5,
  "hint": {
    "type": "infinitive",
    "text": "beber",
    "explanation": "The infinitive form of 'drink' in Spanish"
  },
  "availableNextLevels": [2, 3],
  "warningMessage": "This hint will cost 1.0 point. Your score will drop to 7.5/10."
}
```

**For Verb Level 2:**
```json
{
  "success": true,
  "hintType": "verb",
  "level": 2,
  "cost": 1.5,
  "projectedScore": 6.0,
  "hint": {
    "type": "conjugation_table",
    "text": {
      "tense": "Present",
      "verbType": "-ER regular",
      "conjugations": {
        "yo": "bebo",
        "tú": "bebes", 
        "él": "bebe",
        "nosotros": "bebemos",
        "vosotros": "bebéis",
        "ellos": "beben"
      },
      "personHint": "\"I\" = yo (first person singular)",
      "pattern": "For -ER verbs, add -o for 'yo' form"
    }
  },
  "availableNextLevels": [3]
}
```

**For Non-Verb (Multiple Choice):**
```json
{
  "success": true,
  "hintType": "multiple_choice",
  "cost": 1.5,
  "projectedScore": 7.0,
  "hint": {
    "question": "Choose the correct translation for 'coffee':",
    "options": [
      "el café",
      "la café", 
      "los cafés",
      "la comida"
    ],
    "correctAnswer": "el café",
    "explanations": {
      "el café": "¡Correcto! Coffee is masculine singular",
      "la café": "Wrong gender - café is masculine (el café)",
      "los cafés": "Wrong number - context needs singular",
      "la comida": "Wrong word - this means 'food', not 'coffee'"
    }
  }
}
```

### **POST** `/sentences/{sentenceId}/hints/{wordIndex}/use`
Log hint usage and apply point deduction

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "hintType": "verb",
  "levelUsed": 1,
  "pointsDeducted": 1.0,
  "selectedAnswer": "el café",
  "isCorrect": true,
  "attemptTime": 2340
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "pointsDeducted": 1.0,
  "newScore": 7.5,
  "hintUsageLogged": true,
  "conceptsForReview": ["present_tense", "regular_verb"],
  "sessionStats": {
    "totalHints": 2,
    "totalCost": 2.5,
    "dependencyRate": 0.4
  }
}
```

---

## Sentence Practice & Scoring Endpoints

### **POST** `/sentences/{sentenceId}/attempt`
Submit translation attempt with severe scoring (1-10 system)

**Request Body:**
```json
{
  "sessionId": "sess_abc123",
  "userTranslation": "Bebo café cada mañana",
  "hintsUsed": [
    {
      "wordIndex": 1,
      "type": "verb",
      "levelsUsed": [1],
      "cost": 1.0
    },
    {
      "wordIndex": 2, 
      "type": "multiple_choice",
      "cost": 1.5,
      "selectedAnswer": "el café",
      "isCorrect": true
    }
  ],
  "totalHintCost": 2.5,
  "attemptTime": 45000
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "evaluation": {
    "isCorrect": true,
    "baseScore": 10.0,
    "hintPenalty": 2.5,
    "finalScore": 7.5,
    "scoreCategory": "strategic",
    "independenceLevel": "strategic_hint_use"
  },
  "feedback": {
    "message": "¡Correcto! Good strategic use of hints.",
    "improvements": ["Try completing verbs with just Level 1 hints next time"],
    "explanation": "Your translation is accurate. The hint usage was strategic."
  },
  "progress": {
    "masteryLevel": 3,
    "needsReview": false,
    "conceptsStruggled": ["present_tense"],
    "nextReviewDate": null
  },
  "aiEvaluation": {
    "grammarAccuracy": 10,
    "naturalness": 9,
    "alternativeTranslations": ["Tomo café cada mañana"],
    "cached": true,
    "cacheSource": "exact_match",
    "similarity": 1.0,
    "usageCount": 15
  }
}
```

### **POST** `/sentences/{sentenceId}/check`
Check translation without submitting (for real-time feedback)

**Request Body:**
```json
{
  "userTranslation": "Bebo café",
  "partial": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "partialEvaluation": {
    "status": "incomplete",
    "correctSoFar": true,
    "missingWords": ["cada", "mañana"],
    "suggestions": ["Continue with time expression"],
    "confidence": 0.85
  }
}
```

---

## User Progress & Analytics Endpoints

### **GET** `/users/me/progress`
Get comprehensive user progress analytics

**Query Parameters:**
- `timeframe` (string): 'day', 'week', 'month', 'all'
- `includeWeaknesses` (boolean): Include concept weakness analysis

**Response:** `200 OK`
```json
{
  "success": true,
  "user": {
    "id": "user_123abc",
    "currentLevel": 3,
    "totalPoints": 1247,
    "streakCount": 5,
    "averageScore": 7.8,
    "hintDependency": 0.3
  },
  "timeframeStats": {
    "timeframe": "week",
    "sentencesCompleted": 23,
    "averageScore": 8.1,
    "improvementTrend": "improving",
    "hintsPerSentence": 2.1,
    "independentSentences": 8,
    "strategicSentences": 12,
    "dependentSentences": 3
  },
  "topicProgress": [
    {
      "topicId": 1,
      "topicName": "Daily Life",
      "masteryLevel": "developing",
      "masteryScore": 67.5,
      "sentencesCompleted": 23,
      "averageScore": 7.8,
      "independenceRate": 0.7,
      "needsReview": false
    }
  ],
  "conceptWeaknesses": [
    {
      "grammarConcept": "ser_vs_estar",
      "wordType": "verb",
      "weaknessScore": 0.75,
      "hintRequests": 12,
      "totalExposures": 16,
      "reviewPriority": 1,
      "nextReviewDate": "2024-01-16T09:00:00Z"
    }
  ],
  "achievements": [
    {
      "type": "streak",
      "name": "5-Day Streak",
      "unlockedAt": "2024-01-15T14:00:00Z"
    }
  ]
}
```

### **GET** `/users/me/review-queue`
Get personalized review queue based on weaknesses

**Query Parameters:**
- `limit` (integer): Number of review items (default: 10)
- `priority` (string): 'high', 'medium', 'low', 'all'

**Response:** `200 OK`
```json
{
  "success": true,
  "reviewQueue": {
    "totalItems": 8,
    "highPriority": 3,
    "concepts": [
      {
        "grammarConcept": "ser_vs_estar",
        "priority": "high",
        "lastReviewDate": "2024-01-10T10:00:00Z",
        "targetSentences": [142, 156, 203]
      }
    ],
    "sentences": [
      {
        "id": 142,
        "englishText": "I am happy today",
        "reviewReason": "ser_vs_estar practice needed",
        "lastScore": 4.5,
        "attempts": 3
      }
    ]
  }
}
```

### **POST** `/users/me/preferences`
Update user learning preferences

**Request Body:**
```json
{
  "preferredTopics": [1, 2, 5],
  "difficultyPreference": "challenging",
  "hintTolerance": "moderate",
  "dailyGoal": 20,
  "reminderSettings": {
    "enabled": true,
    "time": "09:00",
    "timezone": "America/New_York"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "preferences": {
    "preferredTopics": [1, 2, 5],
    "difficultyPreference": "challenging",
    "hintTolerance": "moderate",
    "dailyGoal": 20,
    "adaptiveDifficulty": true,
    "updatedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

## Practice Session Management

### **POST** `/sessions/start`
Start new practice session with topic filtering

**Request Body:**
```json
{
  "targetTopicId": 1,
  "difficultyRange": [2, 4],
  "tenseFilter": ["present", "preterite"],
  "sentenceCount": 10,
  "sessionType": "regular"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "sessionCode": "SESS_2024_001",
    "startTime": "2024-01-15T14:30:00Z",
    "targetTopicId": 1,
    "filters": {
      "difficultyRange": [2, 4],
      "tenseFilter": ["present", "preterite"]
    },
    "sentencesPlanned": 10,
    "currentScore": 10.0
  }
}
```

### **PUT** `/sessions/{sessionId}/complete`
Complete practice session with analytics

**Request Body:**
```json
{
  "endTime": "2024-01-15T15:15:00Z",
  "sentencesCompleted": 8,
  "totalScore": 67.5,
  "hintsUsed": 12,
  "conceptsStruggled": ["ser_vs_estar", "preterite_irregular"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "session": {
    "id": "sess_abc123",
    "duration": 2700,
    "sentencesCompleted": 8,
    "averageScore": 8.4,
    "independentSentences": 3,
    "strategicSentences": 4,
    "dependentSentences": 1,
    "improvementTrend": "improving",
    "newAchievements": []
  },
  "summary": {
    "message": "Great session! Your independence rate is improving.",
    "recommendations": [
      "Try completing more sentences without hints",
      "Focus on ser vs estar review"
    ],
    "nextSessionSuggestion": {
      "topicId": 1,
      "focus": "ser_vs_estar_practice"
    }
  }
}
```

---

## AI Integration Endpoints

### **POST** `/ai/evaluate`
Get AI evaluation of translation (with caching)

**Request Body:**
```json
{
  "sentenceId": 142,
  "englishText": "I drink coffee every morning",
  "userTranslation": "Bebo café cada mañana",
  "acceptedTranslations": ["Bebo café cada mañana", "Tomo café cada mañana"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "evaluation": {
    "isCorrect": true,
    "score": 9.5,
    "grammarAccuracy": 10,
    "naturalness": 9,
    "culturalAppropriately": 10,
    "feedback": "Excellent translation! Very natural Spanish.",
    "alternativeTranslations": ["Tomo café cada mañana"],
    "explanation": "Both 'beber' and 'tomar' are correct for 'drink' with beverages."
  },
  "metadata": {
    "cached": false,
    "model": "gpt-4",
    "responseTime": 1200,
    "costSaved": 0.0
  }
}
```

### **POST** `/ai/generate-content`
Generate new sentences for topic (Admin only)

**Request Body:**
```json
{
  "targetTopicId": 1,
  "difficultyLevel": 3,
  "tenseType": "present",
  "count": 10,
  "constraints": {
    "wordCountRange": [6, 10],
    "grammarFocus": ["regular_verbs", "present_tense"]
  }
}
```

**Response:** `202 Accepted`
```json
{
  "success": true,
  "generationSession": {
    "sessionCode": "GEN_2024_001",
    "status": "processing",
    "estimatedCompletion": "2024-01-15T15:00:00Z",
    "trackingUrl": "/ai/generation-sessions/GEN_2024_001"
  }
}
```

---

## Error Responses

### **Standard Error Format**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "difficultyLevel",
      "value": 15,
      "constraint": "Must be between 1 and 9"
    }
  },
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### **Common Error Codes**
- `AUTHENTICATION_REQUIRED` (401): Invalid or missing JWT token
- `INSUFFICIENT_PERMISSIONS` (403): User lacks required permissions
- `RESOURCE_NOT_FOUND` (404): Sentence, topic, or user not found
- `VALIDATION_ERROR` (400): Invalid request parameters
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `AI_SERVICE_ERROR` (503): OpenAI API unavailable
- `DATABASE_ERROR` (500): Internal database error

---

## AI Cost Optimization System

### **3-Tier Evaluation Architecture**

AIdioma implements a sophisticated 3-tier evaluation system for cost optimization:

#### **Tier 1: Exact Cache Matches (40-50% of evaluations)**
- Instant responses for identical translations
- Cache hit indicated by `"cached": true, "cacheSource": "exact_match"`
- No AI API calls required

#### **Tier 2: Error Template Matching (30-40% of evaluations)**
- Pattern-based responses for common errors
- Cache hit indicated by `"cached": true, "cacheSource": "template_match"`
- Pre-defined feedback templates for consistent guidance

#### **Tier 3: AI Evaluation (10-20% of evaluations)**
- Full GPT-4o evaluation for novel translations
- Cache miss indicated by `"cached": false`
- Results automatically cached for future use

### **Cache Response Indicators**

```json
{
  "aiEvaluation": {
    "cached": true,
    "cacheSource": "exact_match",     // or "template_match"
    "similarity": 1.0,                // confidence score (0-1)
    "usageCount": 15,                 // how often this cached result was used
    "lastUsed": "2024-01-15T14:30:00Z"
  }
}
```

### **Cost Optimization Results**
- **85-90% cost reduction** from baseline AI usage
- **Sub-50ms response times** for cached evaluations
- **Consistent quality** maintained across all evaluation types

---

## Rate Limiting

### **Limits by Endpoint Type**
- **Authentication**: 5 requests/minute per IP
- **Hint Requests**: 30 requests/minute per user
- **Translation Attempts**: 60 requests/minute per user  
- **AI Evaluation**: 20 requests/minute per user
- **General API**: 100 requests/minute per user

### **Rate Limit Headers**
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1642258800
```

---

## Webhooks (Future)

### **Progress Milestones**
Notify external systems when users achieve milestones

**Endpoint**: `POST /webhooks/progress`
**Payload**:
```json
{
  "event": "milestone_achieved",
  "userId": "user_123abc",
  "milestone": {
    "type": "level_up",
    "newLevel": 4,
    "achievedAt": "2024-01-15T14:30:00Z"
  }
}
```

---

## API Versioning

### **Current Version**: `v1`
- All endpoints prefixed with `/api/v1`
- Backward compatibility maintained within major versions
- Breaking changes require new major version

### **Deprecation Policy**
- 90-day notice for endpoint deprecation
- Migration guides provided for major version changes
- Legacy endpoints supported for 6 months post-deprecation

This API documentation supports the complete AIdioma learning ecosystem with progressive hints, severe scoring behavioral psychology, topic-based content organization, and AI-powered evaluation system.