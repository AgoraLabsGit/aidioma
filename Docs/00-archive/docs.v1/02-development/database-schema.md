# Enhanced Database Schema - Comprehensive Implementation

## Overview
This enhanced schema builds upon the current implementation to support progressive hints, severe scoring, topic-based learning, AI content generation, and advanced analytics while maintaining backward compatibility with the existing system.

## Enhanced Core Tables

### **users** (Enhanced)
```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    firstName VARCHAR,
    lastName VARCHAR,
    profileImageUrl VARCHAR,

    -- Enhanced Level & Progress Tracking
    currentLevel INTEGER DEFAULT 1 CHECK (currentLevel BETWEEN 1 AND 9),
    totalPoints INTEGER DEFAULT 0,
    streakCount INTEGER DEFAULT 0,
    lastPracticeDate TIMESTAMP,

    -- Topic-Based Progress (NEW)
    topicProgress JSONB DEFAULT '{}', -- {topicId: {mastery: 0.85, level: 3}}

    -- Hint Usage Analytics (NEW)
    hintDependency REAL DEFAULT 0.0 CHECK (hintDependency BETWEEN 0.0 AND 1.0),
    averageScore REAL DEFAULT 10.0 CHECK (averageScore BETWEEN 1.0 AND 10.0),

    -- Learning Analytics (NEW)
    conceptWeaknesses JSONB DEFAULT '{}', -- {concept: weaknessScore}
    reviewQueueSize INTEGER DEFAULT 0,
    
    -- Multi-Dimensional Analytics (NEW)
    masteryLevels JSONB DEFAULT '{}', -- {topic: masteryScore, tense: proficiencyLevel}
    learningVelocity REAL DEFAULT 0.0, -- sentences mastered per session
    adaptiveDifficultyLevel REAL DEFAULT 5.0 CHECK (adaptiveDifficultyLevel BETWEEN 1.0 AND 9.0),
    retentionRate REAL DEFAULT 1.0 CHECK (retentionRate BETWEEN 0.0 AND 1.0),
    engagementScore REAL DEFAULT 0.0 CHECK (engagementScore BETWEEN 0.0 AND 10.0),
    learningStyle VARCHAR(20) DEFAULT 'balanced', -- 'visual', 'auditory', 'kinesthetic', 'balanced'

    -- Existing Fields
    preferences JSONB DEFAULT '{}',
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW()
);
```

### **sentences** (Enhanced)
```sql
CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    englishText TEXT NOT NULL,
    spanishTranslations TEXT[] NOT NULL CHECK (array_length(spanishTranslations, 1) > 0),

    -- Enhanced Difficulty & Classification
    difficultyLevel INTEGER NOT NULL CHECK (difficultyLevel BETWEEN 1 AND 9),
    difficultyScore REAL DEFAULT 5.0 CHECK (difficultyScore BETWEEN 1.0 AND 9.0),

    -- Topic Integration (NEW)
    primaryTopicId INTEGER REFERENCES topics(id),
    secondaryTopics INTEGER[] DEFAULT '{}',

    -- Grammatical Analysis (NEW)
    tenseType VARCHAR(30) NOT NULL,
    grammarConcepts TEXT[] DEFAULT '{}', -- ['present_tense', 'first_person', 'regular_verb']
    verbPatterns TEXT[] DEFAULT '{}',   -- ['regular_ar', 'stem_changing']

    -- Word Analysis (NEW)
    wordCount INTEGER NOT NULL,
    vocabularyTier REAL DEFAULT 1.0 CHECK (vocabularyTier BETWEEN 1.0 AND 3.0),

    -- AI Integration Foundation (NEW)
    aiGenerated BOOLEAN DEFAULT FALSE,
    generationMetadata JSONB DEFAULT '{}', -- {model: 'gpt-4', session: 'GEN_001'}
    qualityScore REAL DEFAULT 0.0 CHECK (qualityScore BETWEEN 0.0 AND 10.0),
    
    -- Regional & Cultural Context (ENHANCED)
    regionalVariant VARCHAR(20) DEFAULT 'neutral' CHECK (regionalVariant IN ('neutral', 'mexican', 'argentinian', 'spanish', 'colombian', 'peruvian')),
    register VARCHAR(20) DEFAULT 'neutral' CHECK (register IN ('formal', 'informal', 'academic', 'colloquial', 'neutral')),
    culturalContext JSONB DEFAULT '{}', -- Cultural notes and appropriateness
    
    -- Content Management Workflow (NEW)
    reviewStatus VARCHAR(20) DEFAULT 'approved' CHECK (reviewStatus IN ('pending', 'approved', 'rejected', 'needs_revision')),
    reviewedBy VARCHAR(255),
    reviewedAt TIMESTAMP,
    submittedBy VARCHAR(255), -- AI system or user ID
    submissionType VARCHAR(20) DEFAULT 'human' CHECK (submissionType IN ('ai_generated', 'user_submitted', 'community_contributed', 'human'))

    -- Legacy Support
    topicCategory VARCHAR, -- Keep for backward compatibility
    hints JSONB DEFAULT '{}', -- Deprecated - use sentence_hint_definitions

    -- Usage Tracking
    usageCount INTEGER DEFAULT 0,
    successRate REAL DEFAULT 0.0 CHECK (successRate BETWEEN 0.0 AND 1.0),

    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),

    -- Indexes for Performance
    INDEX idx_sentences_topic_level (primaryTopicId, difficultyLevel),
    INDEX idx_sentences_tense (tenseType),
    INDEX idx_sentences_ai_quality (aiGenerated, qualityScore)
);
```

### **userProgress** (Enhanced)
```sql
CREATE TABLE userProgress (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    sentenceId INTEGER NOT NULL REFERENCES sentences(id),

    -- Enhanced Scoring (Severe 1-10 System)
    attempts INTEGER DEFAULT 0,
    bestScore REAL DEFAULT 10.0 CHECK (bestScore BETWEEN 1.0 AND 10.0),
    lastScore REAL CHECK (lastScore BETWEEN 1.0 AND 10.0),

    -- Progressive Hints Tracking (NEW)
    hintsUsed INTEGER DEFAULT 0,
    hintLevelsUsed JSONB DEFAULT '{}', -- {wordIndex: {type: 'verb', levels: [1,2], cost: 2.5}}
    totalHintCost REAL DEFAULT 0.0,

    -- Independence Metrics (NEW)
    independenceScore REAL DEFAULT 1.0 CHECK (independenceScore BETWEEN 0.0 AND 1.0),
    strategicHintUse BOOLEAN DEFAULT TRUE, -- Used hints wisely vs dependent

    -- Learning Analytics (NEW)
    conceptStruggles JSONB DEFAULT '{}', -- {concept: struggleCount}
    masteryLevel INTEGER DEFAULT 1 CHECK (masteryLevel BETWEEN 1 AND 5),

    -- Timing & Engagement
    lastAttempted TIMESTAMP DEFAULT NOW(),
    practiceTime INTEGER DEFAULT 0, -- seconds spent on this sentence

    -- Status Tracking
    isCorrect BOOLEAN DEFAULT FALSE,
    needsReview BOOLEAN DEFAULT FALSE,
    nextReviewDate TIMESTAMP,

    UNIQUE(userId, sentenceId),
    INDEX idx_user_progress_user (userId),
    INDEX idx_user_progress_review (needsReview, nextReviewDate),
    INDEX idx_user_progress_mastery (userId, masteryLevel)
);
```

### **practiceSessions** (Enhanced)
```sql
CREATE TABLE practiceSessions (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    sessionCode VARCHAR(50) UNIQUE, -- 'SESS_2024_001'

    -- Enhanced Session Tracking
    startTime TIMESTAMP DEFAULT NOW(),
    endTime TIMESTAMP,
    duration INTEGER, -- seconds

    -- Topic Focus (NEW)
    targetTopicId INTEGER REFERENCES topics(id),
    topicFilter JSONB DEFAULT '{}', -- Applied filters for this session

    -- Severe Scoring Analytics (NEW)
    sentencesCompleted INTEGER DEFAULT 0,
    totalScore INTEGER DEFAULT 0,
    averageScore REAL DEFAULT 10.0 CHECK (averageScore BETWEEN 1.0 AND 10.0),

    -- Progressive Hints Analytics (NEW)
    hintsUsed INTEGER DEFAULT 0,
    totalHintCost REAL DEFAULT 0.0,
    independentSentences INTEGER DEFAULT 0, -- 10/10 scores
    strategicSentences INTEGER DEFAULT 0,   -- 7-9 scores
    dependentSentences INTEGER DEFAULT 0,   -- <7 scores

    -- Learning Outcomes (NEW)
    conceptsStruggled JSONB DEFAULT '{}', -- {concept: struggleCount}
    improvementTrend VARCHAR(20), -- 'improving', 'stable', 'declining'

    -- Session Quality
    completionRate REAL DEFAULT 0.0 CHECK (completionRate BETWEEN 0.0 AND 1.0),
    engagementScore REAL DEFAULT 0.0,

    INDEX idx_practice_sessions_user (userId),
    INDEX idx_practice_sessions_topic (targetTopicId),
    INDEX idx_practice_sessions_date (startTime)
);
```

## New Essential Tables

### **topics** (Core Feature Support)
```sql
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    topicCode VARCHAR(30) UNIQUE NOT NULL, -- 'daily_life', 'food_drink'
    topicName VARCHAR(100) NOT NULL,
    description TEXT,

    -- Enhanced Hierarchical Structure
    parentTopicId INTEGER REFERENCES topics(id),
    topicPath VARCHAR(200), -- 'daily_life.food.breakfast'
    depth INTEGER DEFAULT 0, -- 0=root, 1=category, 2=subcategory
    ancestorIds INTEGER[] DEFAULT '{}', -- All parent topic IDs for fast queries

    -- Difficulty & Learning
    difficultyRange VARCHAR(10) DEFAULT '1-9', -- '1-3', '4-6', etc.
    recommendedLevel INTEGER DEFAULT 1,
    learningPriority INTEGER DEFAULT 1,

    -- UI & Organization
    iconName VARCHAR(50),
    colorCode VARCHAR(7), -- hex color
    sortOrder INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT TRUE,

    -- Analytics & Metrics
    totalSentences INTEGER DEFAULT 0,
    averageDifficulty REAL DEFAULT 5.0,
    aiGeneratedCount INTEGER DEFAULT 0,
    avgUserScore REAL DEFAULT 0.0,
    popularityScore REAL DEFAULT 0.0, -- Based on usage patterns

    createdAt TIMESTAMP DEFAULT NOW(),

    INDEX idx_topics_parent (parentTopicId),
    INDEX idx_topics_code (topicCode),
    INDEX idx_topics_active (isActive, sortOrder)
);

-- Sample Topics Data
INSERT INTO topics (topicCode, topicName, description, difficultyRange) VALUES
('daily_life', 'Daily Life', 'Everyday activities and routines', '1-6'),
('food_drink', 'Food & Drink', 'Meals, restaurants, cooking', '1-5'),
('travel', 'Travel', 'Transportation, hotels, directions', '2-7'),
('work', 'Work & Career', 'Professional life and workplace', '4-9'),
('culture', 'Culture & Society', 'Traditions, customs, social topics', '5-9');
```

### **sentence_hint_definitions** (Progressive Hints System)
```sql
CREATE TABLE sentence_hint_definitions (
    id SERIAL PRIMARY KEY,
    sentenceId INTEGER NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
    wordIndex INTEGER NOT NULL, -- 0-based position in English sentence
    englishWord VARCHAR(50) NOT NULL,

    -- Word Classification
    wordType VARCHAR(20) NOT NULL CHECK (wordType IN ('verb', 'noun', 'adjective', 'connector', 'preposition', 'article', 'adverb')),
    grammarConcepts TEXT[] DEFAULT '{}', -- ['present_tense', 'first_person']

    -- Progressive Hint System
    maxHintLevels INTEGER DEFAULT 3,
    hintSystem VARCHAR(20) DEFAULT 'progressive' CHECK (hintSystem IN ('progressive', 'multiple_choice')),

    -- VERB Hints (3-Level Progressive)
    verbLevel1Text VARCHAR(200), -- Infinitive: "beber"
    verbLevel1Cost REAL DEFAULT 1.0,

    verbLevel2Text TEXT, -- Conjugation table + person identification
    verbLevel2Cost REAL DEFAULT 1.5,

    verbLevel3Text VARCHAR(200), -- Complete answer: "bebo"
    verbLevel3Cost REAL DEFAULT 2.0,

    -- NON-VERB Hints (Multiple Choice)
    mcQuestion TEXT, -- "Choose the correct translation:"
    mcOptions JSONB, -- ["el café", "la café", "los cafés", "la comida"]
    mcCorrectAnswer VARCHAR(100),
    mcExplanations JSONB, -- {option: explanation}
    mcCost REAL DEFAULT 1.5,

    -- Learning Metadata
    difficultyLevel INTEGER DEFAULT 1 CHECK (difficultyLevel BETWEEN 1 AND 9),
    learningPriority INTEGER DEFAULT 1 CHECK (learningPriority BETWEEN 1 AND 5),

    -- Quality Control
    isActive BOOLEAN DEFAULT TRUE,
    qualityScore REAL DEFAULT 0.0,

    createdAt TIMESTAMP DEFAULT NOW(),

    UNIQUE(sentenceId, wordIndex),
    INDEX idx_hint_definitions_sentence (sentenceId),
    INDEX idx_hint_definitions_type (wordType),
    INDEX idx_hint_definitions_concepts (grammarConcepts)
);
```

### **user_hint_usage** (Detailed Hint Analytics)
```sql
CREATE TABLE user_hint_usage (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    sentenceId INTEGER NOT NULL REFERENCES sentences(id),
    hintDefinitionId INTEGER NOT NULL REFERENCES sentence_hint_definitions(id),
    sessionId VARCHAR(50) NOT NULL, -- Groups hints from same practice session

    -- Progressive VERB Tracking
    verbLevelReached INTEGER CHECK (verbLevelReached BETWEEN 1 AND 3),
    verbTotalCost REAL DEFAULT 0.0,
    verbLevelsUsed INTEGER[] DEFAULT '{}', -- [1, 2] or [1, 2, 3]

    -- Multiple Choice NON-VERB Tracking
    mcSelectedAnswer VARCHAR(100),
    mcCorrectAnswer VARCHAR(100),
    mcIsCorrect BOOLEAN,
    mcCost REAL DEFAULT 1.5,

    -- Universal Tracking
    wordType VARCHAR(20) NOT NULL,
    attemptTime INTEGER, -- milliseconds
    gotFinalAnswerCorrect BOOLEAN, -- After hints, did they translate correctly

    -- Learning Analytics
    needsReview BOOLEAN DEFAULT FALSE,
    conceptsToReview TEXT[] DEFAULT '{}',

    createdAt TIMESTAMP DEFAULT NOW(),

    INDEX idx_hint_usage_user_session (userId, sessionId),
    INDEX idx_hint_usage_concepts (conceptsToReview),
    INDEX idx_hint_usage_learning (userId, wordType, mcIsCorrect)
);
```

### **user_concept_weaknesses** (Learning Analytics)
```sql
CREATE TABLE user_concept_weaknesses (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    grammarConcept VARCHAR(50) NOT NULL, -- 'present_tense', 'ser_vs_estar'
    wordType VARCHAR(20), -- 'verb', 'noun', etc. (nullable for general concepts)

    -- Statistical Analysis
    hintRequests INTEGER DEFAULT 0,
    totalExposures INTEGER DEFAULT 0,
    weaknessScore REAL DEFAULT 0.0 CHECK (weaknessScore BETWEEN 0.0 AND 1.0),

    -- Spaced Repetition
    needsReview BOOLEAN DEFAULT FALSE,
    reviewPriority INTEGER DEFAULT 1 CHECK (reviewPriority BETWEEN 1 AND 5),
    lastHintDate TIMESTAMP,
    nextReviewDate TIMESTAMP,
    reviewFrequencyDays INTEGER DEFAULT 7,

    -- Learning Progress
    improvementTrend VARCHAR(20) DEFAULT 'stable', -- 'improving', 'stable', 'declining'
    masteryLevel VARCHAR(20) DEFAULT 'novice', -- 'novice', 'developing', 'proficient'

    -- Metadata
    firstEncountered TIMESTAMP DEFAULT NOW(),
    lastUpdated TIMESTAMP DEFAULT NOW(),

    UNIQUE(userId, grammarConcept, wordType),
    INDEX idx_concept_weaknesses_user (userId, needsReview),
    INDEX idx_concept_weaknesses_review (reviewPriority, nextReviewDate)
);
```

## AI Integration Foundation

### **ai_response_cache** (Cost Optimization)
```sql
CREATE TABLE ai_response_cache (
    id SERIAL PRIMARY KEY,
    requestHash VARCHAR(64) UNIQUE NOT NULL, -- MD5 of sentence + user translation

    -- Request Details
    sentenceId INTEGER REFERENCES sentences(id),
    userTranslation TEXT NOT NULL,

    -- Cached AI Response
    aiResponse JSONB NOT NULL,
    evaluationScore REAL CHECK (evaluationScore BETWEEN 1.0 AND 10.0),
    feedback TEXT,

    -- Usage Analytics
    cacheHits INTEGER DEFAULT 1,
    costSaved DECIMAL(8,4) DEFAULT 0.0000,

    -- Freshness
    firstUsed TIMESTAMP DEFAULT NOW(),
    lastUsed TIMESTAMP DEFAULT NOW(),
    expiresAt TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),

    INDEX idx_ai_cache_hash (requestHash),
    INDEX idx_ai_cache_sentence (sentenceId),
    INDEX idx_ai_cache_usage (cacheHits, lastUsed)
);
```

### **user_topic_mastery** (Multi-Dimensional Progress Tracking)
```sql
CREATE TABLE user_topic_mastery (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    topicId INTEGER NOT NULL REFERENCES topics(id),
    
    -- Mastery Metrics
    masteryLevel VARCHAR(20) DEFAULT 'novice' CHECK (masteryLevel IN ('novice', 'developing', 'proficient', 'advanced', 'expert')),
    masteryScore REAL DEFAULT 0.0 CHECK (masteryScore BETWEEN 0.0 AND 100.0),
    confidenceLevel REAL DEFAULT 0.0 CHECK (confidenceLevel BETWEEN 0.0 AND 1.0),
    
    -- Progress Tracking
    sentencesAttempted INTEGER DEFAULT 0,
    sentencesCompleted INTEGER DEFAULT 0,
    averageScore REAL DEFAULT 10.0 CHECK (averageScore BETWEEN 1.0 AND 10.0),
    independenceRate REAL DEFAULT 1.0 CHECK (independenceRate BETWEEN 0.0 AND 1.0),
    
    -- Learning Velocity
    learningVelocity REAL DEFAULT 0.0, -- Sentences mastered per session
    timeToMastery INTEGER, -- Days to reach proficient level
    retentionRate REAL DEFAULT 1.0 CHECK (retentionRate BETWEEN 0.0 AND 1.0),
    
    -- Spaced Repetition (ENHANCED)
    needsReview BOOLEAN DEFAULT FALSE,
    nextReviewDate TIMESTAMP,
    reviewFrequency INTEGER DEFAULT 7, -- Days between reviews
    optimalReviewInterval INTEGER DEFAULT 7, -- Calculated optimal interval
    lastReviewAccuracy REAL DEFAULT 1.0,
    
    -- Metadata
    firstAttempted TIMESTAMP,
    lastPracticed TIMESTAMP,
    lastUpdated TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(userId, topicId),
    INDEX idx_topic_mastery_user (userId, masteryLevel),
    INDEX idx_topic_mastery_review (needsReview, nextReviewDate),
    INDEX idx_topic_mastery_velocity (userId, learningVelocity)
);
```

### **content_review_queue** (Content Management Workflow)
```sql
CREATE TABLE content_review_queue (
    id SERIAL PRIMARY KEY,
    sentenceId INTEGER NOT NULL REFERENCES sentences(id),
    submittedBy VARCHAR(255), -- AI system or user ID
    submissionType VARCHAR(20) NOT NULL CHECK (submissionType IN ('ai_generated', 'user_submitted', 'community_contributed')),
    
    -- Review Assignment
    assignedReviewer VARCHAR(255),
    reviewPriority INTEGER DEFAULT 3 CHECK (reviewPriority BETWEEN 1 AND 5),
    reviewDeadline TIMESTAMP,
    
    -- Review Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'needs_revision')),
    reviewNotes TEXT,
    rejectionReason TEXT,
    
    -- Quality Flags
    hasGrammarIssues BOOLEAN DEFAULT FALSE,
    hasCulturalIssues BOOLEAN DEFAULT FALSE,
    hasDifficultyMismatch BOOLEAN DEFAULT FALSE,
    hasTopicMismatch BOOLEAN DEFAULT FALSE,
    hasRegionalIssues BOOLEAN DEFAULT FALSE,
    
    -- Automated Quality Checks
    automatedChecks JSONB DEFAULT '{}', -- Results of automated quality checks
    confidenceScore REAL DEFAULT 0.0 CHECK (confidenceScore BETWEEN 0.0 AND 1.0),
    
    -- Timestamps
    submittedAt TIMESTAMP DEFAULT NOW(),
    reviewStartedAt TIMESTAMP,
    reviewCompletedAt TIMESTAMP,
    
    INDEX idx_review_queue_status (status, reviewPriority),
    INDEX idx_review_queue_reviewer (assignedReviewer, status),
    INDEX idx_review_queue_deadline (reviewDeadline),
    INDEX idx_review_queue_type (submissionType, status)
);
```

## Advanced AI Integration Tables

### **ai_generation_sessions** (Content Generation Pipeline)
```sql
CREATE TABLE ai_generation_sessions (
    id SERIAL PRIMARY KEY,
    sessionCode VARCHAR(50) UNIQUE NOT NULL, -- 'GEN_DAILY_2024_001'
    
    -- Generation Parameters
    targetTopicId INTEGER NOT NULL REFERENCES topics(id),
    targetLevelRange VARCHAR(10) NOT NULL, -- '1-3', '4-6', '7-9'
    targetTense VARCHAR(30),
    targetWordCountRange VARCHAR(10), -- '5-8', '10-15'
    additionalConstraints JSONB DEFAULT '{}', -- Custom generation parameters
    
    -- Generation Prompts & Settings
    basePrompt TEXT NOT NULL,
    modelUsed VARCHAR(50) NOT NULL, -- 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'
    temperature REAL DEFAULT 0.7,
    maxTokens INTEGER DEFAULT 1000,
    
    -- Cost & Performance Tracking
    sentencesRequested INTEGER NOT NULL,
    sentencesGenerated INTEGER DEFAULT 0,
    sentencesApproved INTEGER DEFAULT 0,
    totalTokensUsed INTEGER DEFAULT 0,
    generationCost DECIMAL(10,4) DEFAULT 0.0000,
    
    -- Quality Control
    avgQualityScore REAL DEFAULT 0.0,
    humanReviewRequired BOOLEAN DEFAULT TRUE,
    batchApproved BOOLEAN DEFAULT FALSE,
    approvedBy VARCHAR(255),
    approvedAt TIMESTAMP,
    
    -- Session Status
    sessionStatus VARCHAR(20) DEFAULT 'active' CHECK (sessionStatus IN ('active', 'completed', 'failed')),
    errorMessage TEXT,
    
    createdAt TIMESTAMP DEFAULT NOW(),
    completedAt TIMESTAMP,
    
    INDEX idx_generation_topic_level (targetTopicId, targetLevelRange),
    INDEX idx_generation_date (createdAt),
    INDEX idx_generation_status (sessionStatus, humanReviewRequired)
);
```

### **ai_content_quality** (Quality Assessment)
```sql
CREATE TABLE ai_content_quality (
    id SERIAL PRIMARY KEY,
    sentenceId INTEGER NOT NULL REFERENCES sentences(id),
    generationSessionId INTEGER REFERENCES ai_generation_sessions(id),
    
    -- Quality Metrics
    grammarAccuracy REAL DEFAULT 0.0 CHECK (grammarAccuracy BETWEEN 0.0 AND 10.0),
    naturalness REAL DEFAULT 0.0 CHECK (naturalness BETWEEN 0.0 AND 10.0),
    difficultyAccuracy REAL DEFAULT 0.0 CHECK (difficultyAccuracy BETWEEN 0.0 AND 10.0),
    topicRelevance REAL DEFAULT 0.0 CHECK (topicRelevance BETWEEN 0.0 AND 10.0),
    culturalAppropriateness REAL DEFAULT 0.0 CHECK (culturalAppropriateness BETWEEN 0.0 AND 10.0),
    
    -- Automated Checks
    passesGrammarCheck BOOLEAN DEFAULT FALSE,
    passesProfanityCheck BOOLEAN DEFAULT FALSE,
    passesCulturalCheck BOOLEAN DEFAULT FALSE,
    passesRegionalCheck BOOLEAN DEFAULT FALSE,
    
    -- Human Review
    humanQualityScore REAL CHECK (humanQualityScore BETWEEN 0.0 AND 10.0),
    humanFeedback TEXT,
    requiresRevision BOOLEAN DEFAULT FALSE,
    
    -- Issues & Improvements
    identifiedIssues JSONB DEFAULT '[]', -- Array of specific problems
    suggestedImprovements JSONB DEFAULT '[]',
    
    -- Review Status
    reviewStatus VARCHAR(20) DEFAULT 'pending' CHECK (reviewStatus IN ('pending', 'approved', 'rejected', 'needs_revision')),
    
    reviewedBy VARCHAR(255),
    reviewedAt TIMESTAMP,
    
    createdAt TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_content_quality_review (reviewStatus, humanQualityScore),
    INDEX idx_content_quality_session (generationSessionId),
    INDEX idx_content_quality_scores (grammarAccuracy, naturalness)
);
```

### **user_learning_preferences** (Advanced User Analytics)
```sql
CREATE TABLE user_learning_preferences (
    id SERIAL PRIMARY KEY,
    userId VARCHAR NOT NULL REFERENCES users(id),
    
    -- Topic Preferences
    preferredTopics INTEGER[] DEFAULT '{}', -- Array of topic IDs
    avoidedTopics INTEGER[] DEFAULT '{}',
    topicWeights JSONB DEFAULT '{}', -- {topicId: weight}
    
    -- Difficulty Preferences
    difficultyPreference VARCHAR(20) DEFAULT 'adaptive' CHECK (difficultyPreference IN ('easy', 'balanced', 'challenging', 'adaptive')),
    adaptiveDifficulty BOOLEAN DEFAULT TRUE,
    manualDifficultyOverride INTEGER CHECK (manualDifficultyOverride BETWEEN 1 AND 9),
    
    -- Learning Style
    hintTolerance VARCHAR(20) DEFAULT 'moderate' CHECK (hintTolerance IN ('minimal', 'moderate', 'generous')),
    sessionLengthPreference INTEGER DEFAULT 10, -- Number of sentences
    repetitionTolerance INTEGER DEFAULT 3, -- Times to see similar content
    
    -- Regional Preferences (NEW)
    preferredRegion VARCHAR(20) DEFAULT 'neutral' CHECK (preferredRegion IN ('neutral', 'mexican', 'argentinian', 'spanish', 'colombian')),
    exposureToVariants BOOLEAN DEFAULT FALSE,
    registerPreference VARCHAR(20) DEFAULT 'balanced' CHECK (registerPreference IN ('formal', 'informal', 'balanced')),
    
    -- Schedule Preferences
    dailyGoal INTEGER DEFAULT 10,
    preferredStudyTimes TIME[],
    reminderSettings JSONB DEFAULT '{}',
    
    -- Learning Methodology
    focusMode VARCHAR(20) DEFAULT 'balanced' CHECK (focusMode IN ('speed', 'accuracy', 'balanced')),
    reviewFrequency VARCHAR(20) DEFAULT 'adaptive' CHECK (reviewFrequency IN ('daily', 'weekly', 'adaptive')),
    
    updatedAt TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(userId),
    INDEX idx_user_preferences_topics (preferredTopics),
    INDEX idx_user_preferences_difficulty (difficultyPreference),
    INDEX idx_user_preferences_region (preferredRegion)
);
```

## Migration Strategy

### **Phase 1: Enhance Existing Tables (Week 1)**
```sql
-- Add new columns to existing tables
ALTER TABLE users ADD COLUMN topicProgress JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN hintDependency REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN averageScore REAL DEFAULT 10.0;

ALTER TABLE sentences ADD COLUMN primaryTopicId INTEGER;
ALTER TABLE sentences ADD COLUMN grammarConcepts TEXT[] DEFAULT '{}';
ALTER TABLE sentences ADD COLUMN aiGenerated BOOLEAN DEFAULT FALSE;

ALTER TABLE userProgress ADD CONSTRAINT check_score_range 
    CHECK (bestScore BETWEEN 1.0 AND 10.0);
ALTER TABLE userProgress ADD COLUMN hintLevelsUsed JSONB DEFAULT '{}';
ALTER TABLE userProgress ADD COLUMN independenceScore REAL DEFAULT 1.0;
```

### **Phase 2: Add Essential Tables (Week 2)**
```sql
-- Create new core tables
CREATE TABLE topics (...);
CREATE TABLE sentence_hint_definitions (...);
CREATE TABLE user_hint_usage (...);

-- Populate with initial data
INSERT INTO topics VALUES (...);
```

### **Phase 3: Enhanced Analytics (Week 3)**
```sql
-- Add advanced tracking
CREATE TABLE user_concept_weaknesses (...);
CREATE TABLE ai_response_cache (...);
CREATE TABLE user_learning_preferences (...);
CREATE TABLE user_topic_mastery (...);

-- Create performance indexes
CREATE INDEX idx_sentences_topic_level ON sentences(primaryTopicId, difficultyLevel);
```

### **Phase 4: AI Content Pipeline (Week 4)**
```sql
-- Add AI generation and quality control
CREATE TABLE ai_generation_sessions (...);
CREATE TABLE ai_content_quality (...);
CREATE TABLE content_review_queue (...);

-- Create AI-specific indexes
CREATE INDEX idx_generation_sessions_topic ON ai_generation_sessions(targetTopicId);
CREATE INDEX idx_content_quality_review ON ai_content_quality(reviewStatus);
CREATE INDEX idx_review_queue_priority ON content_review_queue(status, reviewPriority);
```

## Sample Queries

### **Topic-Based Sentence Selection**
```sql
SELECT s.*, t.topicName, up.bestScore, up.hintsUsed
FROM sentences s
JOIN topics t ON s.primaryTopicId = t.id
LEFT JOIN userProgress up ON s.id = up.sentenceId AND up.userId = $1
WHERE t.topicCode = $2 
  AND s.difficultyLevel BETWEEN $3 AND $4
  AND (up.bestScore < 8.0 OR up.bestScore IS NULL)
ORDER BY s.difficultyScore ASC, s.usageCount ASC
LIMIT 10;
```

### **Progressive Hints for Word**
```sql
SELECT shd.*, s.englishText
FROM sentence_hint_definitions shd
JOIN sentences s ON shd.sentenceId = s.id
WHERE shd.sentenceId = $1 AND shd.wordIndex = $2;
```

### **User Weakness Analysis**
```sql
SELECT grammarConcept, weaknessScore, reviewPriority
FROM user_concept_weaknesses
WHERE userId = $1 AND needsReview = TRUE
ORDER BY reviewPriority ASC, weaknessScore DESC
LIMIT 5;
```

### **AI Content Generation Session**
```sql
-- Start new generation session
INSERT INTO ai_generation_sessions (
    sessionCode, targetTopicId, targetLevelRange, 
    basePrompt, modelUsed, sentencesRequested
) VALUES (
    'GEN_DAILY_2024_001', 1, '1-3', 
    'Generate Spanish sentences about daily life...', 
    'gpt-4o', 20
);
```

### **Content Quality Assessment**
```sql
SELECT s.englishText, s.spanishTranslations, acq.humanQualityScore
FROM sentences s
JOIN ai_content_quality acq ON s.id = acq.sentenceId
WHERE s.aiGenerated = TRUE 
  AND acq.requiresRevision = TRUE
ORDER BY acq.humanQualityScore ASC;
```

### **Advanced Topic-Based Sentence Selection with Regional Preferences**
```sql
SELECT s.*, t.topicName, up.bestScore, up.hintsUsed, utm.masteryLevel
FROM sentences s
JOIN topics t ON s.primaryTopicId = t.id
LEFT JOIN userProgress up ON s.id = up.sentenceId AND up.userId = $1
LEFT JOIN user_topic_mastery utm ON t.id = utm.topicId AND utm.userId = $1
LEFT JOIN user_learning_preferences ulp ON ulp.userId = $1
WHERE t.topicCode = $2 
  AND s.difficultyLevel BETWEEN $3 AND $4
  AND (ulp.preferredRegion IS NULL OR s.regionalVariant IN ('neutral', ulp.preferredRegion))
  AND s.reviewStatus = 'approved'
  AND (up.bestScore < 8.0 OR up.bestScore IS NULL)
ORDER BY s.difficultyScore ASC, s.usageCount ASC
LIMIT 10;
```

### **Multi-Dimensional User Progress Analytics**
```sql
SELECT 
    u.id,
    u.learningVelocity,
    u.retentionRate,
    u.engagementScore,
    u.masteryLevels,
    COUNT(utm.id) as topicsInProgress,
    AVG(utm.masteryScore) as overallMastery,
    COUNT(CASE WHEN ucw.needsReview = TRUE THEN 1 END) as conceptsNeedingReview
FROM users u
LEFT JOIN user_topic_mastery utm ON u.id = utm.userId
LEFT JOIN user_concept_weaknesses ucw ON u.id = ucw.userId
WHERE u.id = $1
GROUP BY u.id, u.learningVelocity, u.retentionRate, u.engagementScore, u.masteryLevels;
```

### **Spaced Repetition Review Queue Generation**
```sql
SELECT 
    ucw.grammarConcept,
    ucw.weaknessScore,
    ucw.reviewPriority,
    utm.masteryLevel,
    COUNT(s.id) as availableSentences
FROM user_concept_weaknesses ucw
LEFT JOIN user_topic_mastery utm ON ucw.userId = utm.userId
LEFT JOIN sentences s ON s.grammarConcepts @> ARRAY[ucw.grammarConcept]
WHERE ucw.userId = $1 
  AND ucw.needsReview = TRUE
  AND ucw.nextReviewDate <= NOW()
GROUP BY ucw.grammarConcept, ucw.weaknessScore, ucw.reviewPriority, utm.masteryLevel
ORDER BY ucw.reviewPriority ASC, ucw.weaknessScore DESC
LIMIT 5;
```

### **Session Performance Summary**
```sql
SELECT 
    COUNT(*) as totalSentences,
    AVG(bestScore) as averageScore,
    SUM(CASE WHEN hintsUsed = 0 THEN 1 ELSE 0 END) as independentCount,
    SUM(totalHintCost) as totalHintCost
FROM userProgress
WHERE userId = $1 AND lastAttempted > NOW() - INTERVAL '1 day';
```

## Implementation Notes

### **Backward Compatibility**
- Existing `topicCategory` field maintained during transition
- Old `hints` JSONB field deprecated but kept for migration
- Current API endpoints continue working during enhancement

### **Performance Considerations**
- Strategic indexing for common query patterns
- JSONB fields for flexibility without performance penalty
- Proper constraints to maintain data integrity

### **Feature Enablement**
- **Progressive Hints**: Enabled via `sentence_hint_definitions` table
- **Severe Scoring**: Enforced via CHECK constraints and application logic
- **Topic Filtering**: Enabled via `topics` hierarchy and foreign keys
- **AI Optimization**: Foundation laid with caching and metadata tracking
- **AI Content Generation**: Full pipeline via `ai_generation_sessions` and `ai_content_quality`
- **Regional Variants**: Support for different Spanish dialects and registers
- **User Personalization**: Comprehensive preferences via `user_content_preferences`
- **Multi-Dimensional Analytics**: Advanced progress tracking and adaptive learning

### **Advanced Features Supported**
- **Spaced Repetition**: Intelligent review scheduling based on user weaknesses
- **Adaptive Difficulty**: Dynamic adjustment based on performance and preferences
- **Content Quality Control**: Human review workflow for AI-generated content
- **Cultural Appropriateness**: Regional variant support for authentic Spanish learning
- **Learning Style Adaptation**: Personalized content delivery based on user preferences
- **Cost-Effective AI**: Response caching and generation session tracking

This enhanced schema provides comprehensive support for a sophisticated Spanish learning platform with AI-powered content generation, advanced analytics, and personalized learning experiences while maintaining backward compatibility with the existing MVP implementation. immediate support for your core features while maintaining a clear evolution path to the comprehensive architecture.