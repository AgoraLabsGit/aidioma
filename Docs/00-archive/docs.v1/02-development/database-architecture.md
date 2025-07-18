<!--
FILE LOCATION: docs/02-development/database-architecture.md

FOR LOCAL DEVELOPMENT: This document defines the comprehensive database architecture for the Spanish learning app, focusing on sentence categorization, AI-generated content storage, and multi-dimensional language data organization.

IMPLEMENTATION OBJECTIVE: Create a scalable database structure that supports topic-based sentence organization, AI content generation with full metadata tracking, word-level analysis, and adaptive difficulty progression.

KEY STRATEGY: Multi-dimensional categorization system with normalized tables for sentences, topics, grammar concepts, and user progress. Supports both human-created and AI-generated content with full traceability and metadata.

CRITICAL FEATURES:
- Topic-based sentence categorization and filtering
- AI-generated content tracking with generation metadata
- Word-level concept mapping and analysis
- Multi-dimensional difficulty and proficiency tracking
- Comprehensive user progress and weakness analytics

Reference this when implementing content management, AI content generation, and user progress tracking systems.
-->

<!--
FILE LOCATION: docs/02-development/database-architecture.md

FOR LOCAL DEVELOPMENT: This document defines the comprehensive database architecture for the Spanish learning app, supporting both SQLite (local development) and PostgreSQL (production), combining practical implementation strategies with advanced learning system features.

IMPLEMENTATION OBJECTIVE: Create a scalable, cross-database compatible structure that supports topic-based sentence organization, AI content generation with cost optimization, word-level analysis, and comprehensive user progress tracking.

KEY STRATEGY: Database-agnostic schema design with SQLite for local development and PostgreSQL for production. Includes comprehensive learning analytics, AI cost optimization, and multi-dimensional user progress tracking. Explicit indexing strategy and migration planning for both database engines.

CRITICAL FEATURES:
- Cross-database compatible schema (SQLite/PostgreSQL)
- Topic-based sentence categorization with hierarchical organization
- AI content generation tracking with cost optimization
- Comprehensive user weakness analysis and review scheduling
- Multi-dimensional progress tracking and adaptive learning support
- Migration strategy and performance optimization for both databases

Reference this when implementing database setup, content management APIs, and user progress tracking systems.
-->

# Spanish Learning App - Database Architecture (Cross-Database Compatible)

## Overview
Comprehensive database structure supporting topic-based sentence organization, AI-generated content management with cost optimization, and advanced learning analytics. Designed for SQLite (local development) and PostgreSQL (production) compatibility.

---

## Core Content Tables

### **1. Topics & Categories**
```sql
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,
    topic_code VARCHAR(30) UNIQUE NOT NULL,
    topic_name VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_range_min INTEGER DEFAULT 1 CHECK (difficulty_range_min BETWEEN 1 AND 9),
    difficulty_range_max INTEGER DEFAULT 9 CHECK (difficulty_range_max BETWEEN 1 AND 9),
    icon_name VARCHAR(50),
    color_code VARCHAR(7),
    parent_topic_id INTEGER REFERENCES topics(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT valid_difficulty_range CHECK (difficulty_range_min <= difficulty_range_max)
);

-- Sample data
INSERT INTO topics (topic_code, topic_name, description) VALUES
('daily_life', 'Daily Life', 'Everyday activities and routines'),
('food_drink', 'Food & Drink', 'Meals, restaurants, cooking'),
('travel', 'Travel', 'Transportation, hotels, directions'),
('work', 'Work & Career', 'Professional life and workplace'),
('culture', 'Culture & Society', 'Traditions, customs, social topics');
```

### **2. Comprehensive Sentences Table (PostgreSQL-Optimized)**
```sql
CREATE TABLE sentences (
    id SERIAL PRIMARY KEY,
    english_text TEXT NOT NULL,
    spanish_translations TEXT[] NOT NULL, -- PostgreSQL array for multiple translations

    -- Topic Classification
    primary_topic_id INTEGER NOT NULL REFERENCES topics(id),
    secondary_topics INTEGER[] DEFAULT '{}', -- Array of topic IDs

    -- Difficulty & Level Classification
    proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 9),
    difficulty_score REAL DEFAULT 5.0 CHECK (difficulty_score BETWEEN 1.0 AND 9.0),
    word_count INTEGER NOT NULL,
    clause_count INTEGER DEFAULT 1,
    sentence_structure VARCHAR(20) DEFAULT 'simple' CHECK (sentence_structure IN ('simple', 'compound', 'complex', 'compound_complex')),

    -- Grammatical Classification
    primary_tense VARCHAR(30) NOT NULL,
    secondary_tenses TEXT[] DEFAULT '{}',
    verb_patterns TEXT[] DEFAULT '{}',
    grammar_concepts TEXT[] DEFAULT '{}',

    -- Word Type Analysis
    word_types_breakdown JSONB DEFAULT '{}',
    vocabulary_tier REAL DEFAULT 1.0 CHECK (vocabulary_tier BETWEEN 1.0 AND 3.0),

    -- Content Source & Metadata
    created_by VARCHAR(20) NOT NULL DEFAULT 'human' CHECK (created_by IN ('AI', 'human', 'community')),
    source_metadata JSONB DEFAULT '{}',
    generation_prompt TEXT,
    quality_score REAL DEFAULT 0.0 CHECK (quality_score BETWEEN 0.0 AND 10.0),

    -- Regional & Register
    regional_variant VARCHAR(20) DEFAULT 'neutral',
    register VARCHAR(20) DEFAULT 'neutral' CHECK (register IN ('formal', 'informal', 'academic', 'colloquial', 'neutral')),

    -- Usage & Performance Tracking
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0.0 CHECK (success_rate BETWEEN 0.0 AND 1.0),
    avg_attempts REAL DEFAULT 0.0,
    avg_score REAL DEFAULT 0.0 CHECK (avg_score BETWEEN 1.0 AND 10.0),

    -- Content Management
    is_active BOOLEAN DEFAULT TRUE,
    review_status VARCHAR(20) DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### **3. AI Generation Sessions (Cost Optimization)**
```sql
CREATE TABLE ai_generation_sessions (
    id SERIAL PRIMARY KEY,
    session_code VARCHAR(50) UNIQUE NOT NULL,

    -- Generation Parameters
    target_topic_id INTEGER NOT NULL REFERENCES topics(id),
    target_level_range VARCHAR(10) NOT NULL, -- '1-3', '4-6', etc.
    target_tense VARCHAR(30),
    target_word_count_range VARCHAR(10),
    additional_constraints JSONB DEFAULT '{}',

    -- Generation Prompts & Settings
    base_prompt TEXT NOT NULL,
    model_used VARCHAR(50) NOT NULL,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,

    -- Cost & Performance Tracking
    sentences_requested INTEGER NOT NULL,
    sentences_generated INTEGER DEFAULT 0,
    sentences_approved INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    generation_cost DECIMAL(10,4) DEFAULT 0.0000,

    -- Quality Control
    avg_quality_score REAL DEFAULT 0.0,
    human_review_required BOOLEAN DEFAULT TRUE,
    batch_approved BOOLEAN DEFAULT FALSE,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP,

    -- Session Status
    session_status VARCHAR(20) DEFAULT 'active' CHECK (session_status IN ('active', 'completed', 'failed')),
    error_message TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

### **4. AI Response Cache (Cost Optimization)**
```sql
CREATE TABLE ai_response_cache (
    id SERIAL PRIMARY KEY,
    request_hash VARCHAR(64) UNIQUE NOT NULL, -- MD5 of sentence + translation

    -- Request details
    sentence_id INTEGER REFERENCES sentences(id),
    user_translation TEXT NOT NULL,

    -- AI response (stored for reuse)
    ai_response JSONB NOT NULL,
    evaluation_data JSONB DEFAULT '{}',

    -- Usage tracking
    cache_hits INTEGER DEFAULT 1,
    first_used TIMESTAMP DEFAULT NOW(),
    last_used TIMESTAMP DEFAULT NOW()
);
```

### **5. Word-Level Analysis (Enhanced)**
```sql
CREATE TABLE sentence_words (
    id SERIAL PRIMARY KEY,
    sentence_id INTEGER NOT NULL REFERENCES sentences(id) ON DELETE CASCADE,
    word_index INTEGER NOT NULL,

    -- Word Content
    english_word VARCHAR(50) NOT NULL,
    spanish_translation VARCHAR(100) NOT NULL,
    word_root VARCHAR(50),

    -- Grammatical Classification
    word_type VARCHAR(20) NOT NULL CHECK (word_type IN ('verb', 'noun', 'adjective', 'adverb', 'connector', 'preposition', 'article')),
    grammatical_function VARCHAR(30),
    grammar_concepts TEXT[] DEFAULT '{}',

    -- Difficulty & Learning
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 9),
    vocabulary_tier INTEGER DEFAULT 1 CHECK (vocabulary_tier BETWEEN 1 AND 3),
    learning_priority INTEGER DEFAULT 1 CHECK (learning_priority BETWEEN 1 AND 5),

    -- Progressive Hint System Integration
    hint_text VARCHAR(200),
    hint_type VARCHAR(20) CHECK (hint_type IN ('progressive', 'multiple_choice', 'direct')),
    hint_levels JSONB DEFAULT '{}', -- For progressive hints

    -- AI Analysis Metadata
    analysis_confidence REAL DEFAULT 0.0 CHECK (analysis_confidence BETWEEN 0.0 AND 1.0),
    needs_human_review BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## User Progress & Analytics Tables

### **6. User Topic Progress**
```sql
CREATE TABLE user_topic_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    topic_id INTEGER NOT NULL REFERENCES topics(id),

    -- Progress Metrics
    sentences_attempted INTEGER DEFAULT 0,
    sentences_completed INTEGER DEFAULT 0,
    avg_score REAL DEFAULT 0.0 CHECK (avg_score BETWEEN 1.0 AND 10.0),
    total_hints_used INTEGER DEFAULT 0,
    independence_rate REAL DEFAULT 0.0 CHECK (independence_rate BETWEEN 0.0 AND 1.0),

    -- Mastery Tracking
    mastery_level VARCHAR(20) DEFAULT 'novice' CHECK (mastery_level IN ('novice', 'developing', 'proficient', 'advanced', 'expert')),
    mastery_score REAL DEFAULT 0.0 CHECK (mastery_score BETWEEN 0.0 AND 100.0),

    -- Difficulty Progression
    current_difficulty_level INTEGER DEFAULT 1 CHECK (current_difficulty_level BETWEEN 1 AND 9),
    max_difficulty_reached INTEGER DEFAULT 1 CHECK (max_difficulty_reached BETWEEN 1 AND 9),
    ready_for_next_level BOOLEAN DEFAULT FALSE,

    -- Timing & Engagement
    first_attempted TIMESTAMP,
    last_practiced TIMESTAMP,
    total_practice_time INTEGER DEFAULT 0, -- seconds

    -- Review Scheduling (Spaced Repetition)
    needs_review BOOLEAN DEFAULT FALSE,
    next_review_date TIMESTAMP,
    review_frequency_days INTEGER DEFAULT 7,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, topic_id)
);
```

### **7. User Concept Weaknesses (Learning Analytics)**
```sql
CREATE TABLE user_concept_weaknesses (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    grammar_concept VARCHAR(50) NOT NULL,
    word_type VARCHAR(20),

    -- Statistics
    hint_requests INTEGER DEFAULT 0,
    total_exposures INTEGER DEFAULT 0,
    weakness_score REAL DEFAULT 0.0 CHECK (weakness_score BETWEEN 0.0 AND 1.0),

    -- Review scheduling
    needs_review BOOLEAN DEFAULT FALSE,
    last_hint_date TIMESTAMP,
    next_review_date TIMESTAMP,
    review_priority INTEGER DEFAULT 1 CHECK (review_priority BETWEEN 1 AND 5),

    -- Metadata
    first_encountered TIMESTAMP DEFAULT NOW(),
    last_updated TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, grammar_concept, word_type)
);
```

### **8. User Hint Usage (Progressive Hints Integration)**
```sql
CREATE TABLE user_hint_usage (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sentence_id INTEGER NOT NULL REFERENCES sentences(id),
    hint_definition_id INTEGER REFERENCES sentence_words(id),
    session_id VARCHAR(50) NOT NULL,

    -- VERB tracking (progressive)
    verb_level_reached INTEGER CHECK (verb_level_reached BETWEEN 1 AND 3),
    verb_total_points REAL DEFAULT 0.0,
    verb_levels_used INTEGER[] DEFAULT '{}',

    -- NON-VERB tracking (multiple choice)
    mc_selected_answer VARCHAR(100),
    mc_correct_answer VARCHAR(100),
    mc_is_correct BOOLEAN,
    mc_points_used REAL DEFAULT 1.5,

    -- Universal tracking
    word_type VARCHAR(20) NOT NULL,
    attempt_time_ms INTEGER,
    got_final_answer_correct BOOLEAN,

    created_at TIMESTAMP DEFAULT NOW()
);
```

### **9. User Sentence Scores (Dual Scoring System)**
```sql
CREATE TABLE user_sentence_scores (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    sentence_id INTEGER NOT NULL REFERENCES sentences(id),
    session_id VARCHAR(50) NOT NULL,

    -- Severe 1-10 scoring breakdown
    base_points REAL DEFAULT 10.0,
    hint_deductions REAL DEFAULT 0.0,
    final_score REAL NOT NULL CHECK (final_score BETWEEN 1.0 AND 10.0),

    -- Attempt details
    translation_submitted TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    hints_used_count INTEGER DEFAULT 0,
    total_hint_cost REAL DEFAULT 0.0,

    -- Learning metrics
    attempt_time_seconds INTEGER,
    independence_level VARCHAR(20) CHECK (independence_level IN ('independent', 'strategic', 'dependent')),

    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Performance Optimization

### **Database Indexes**
```sql
-- Core performance indexes
CREATE INDEX idx_sentences_topic_level ON sentences(primary_topic_id, proficiency_level);
CREATE INDEX idx_sentences_tense_topic ON sentences(primary_tense, primary_topic_id);
CREATE INDEX idx_sentences_active_approved ON sentences(is_active, review_status) WHERE is_active = TRUE;

-- User progress indexes
CREATE INDEX idx_user_topic_progress_user ON user_topic_progress(user_id);
CREATE INDEX idx_user_topic_progress_review ON user_topic_progress(needs_review, next_review_date) WHERE needs_review = TRUE;

-- Word analysis indexes
CREATE INDEX idx_sentence_words_sentence ON sentence_words(sentence_id, word_index);
CREATE INDEX idx_sentence_words_type_level ON sentence_words(word_type, difficulty_level);

-- Hint usage indexes
CREATE INDEX idx_hint_usage_user_session ON user_hint_usage(user_id, session_id);
CREATE INDEX idx_hint_usage_sentence ON user_hint_usage(sentence_id);

-- AI optimization indexes
CREATE INDEX idx_ai_cache_hash ON ai_response_cache(request_hash);
CREATE INDEX idx_ai_cache_usage ON ai_response_cache(cache_hits, last_used);

-- Weakness tracking indexes
CREATE INDEX idx_concept_weaknesses_user ON user_concept_weaknesses(user_id, needs_review);
CREATE INDEX idx_concept_weaknesses_review ON user_concept_weaknesses(review_priority, next_review_date) WHERE needs_review = TRUE;
```

---

## Migration Strategy

### **Phase 1: Core Tables (Week 1)**
```sql
-- Create core tables
CREATE TABLE topics (...);
CREATE TABLE sentences (...);
CREATE TABLE ai_generation_sessions (...);

-- Migrate existing data
INSERT INTO topics (topic_code, topic_name, description) VALUES (...);
UPDATE sentences SET primary_topic_id = ... WHERE ...;
```

### **Phase 2: AI Optimization (Week 2)**
```sql
-- Add AI optimization tables
CREATE TABLE ai_response_cache (...);
CREATE TABLE sentence_words (...);

-- Populate word analysis for existing sentences
INSERT INTO sentence_words (sentence_id, word_index, ...) 
SELECT ... FROM analyze_sentence_words(...);
```

### **Phase 3: User Analytics (Week 3)**
```sql
-- Add comprehensive user tracking
CREATE TABLE user_topic_progress (...);
CREATE TABLE user_concept_weaknesses (...);
CREATE TABLE user_hint_usage (...);
CREATE TABLE user_sentence_scores (...);

-- Migrate existing user progress data
INSERT INTO user_topic_progress (...) 
SELECT ... FROM existing_user_progress;
```

### **Phase 4: Optimization (Week 4)**
```sql
-- Add all performance indexes
CREATE INDEX ...;

-- Create database views for common queries
CREATE VIEW user_progress_summary AS ...;
CREATE VIEW topic_difficulty_stats AS ...;
```

---

## Common Query Patterns

### **Topic-Based Content Retrieval**
```sql
-- Get sentences by topic and level with word analysis
SELECT s.*, t.topic_name, 
       array_agg(sw.english_word ORDER BY sw.word_index) as words,
       array_agg(sw.hint_text ORDER BY sw.word_index) as hints
FROM sentences s
JOIN topics t ON s.primary_topic_id = t.id
LEFT JOIN sentence_words sw ON s.id = sw.sentence_id
WHERE t.topic_code = $1 
  AND s.proficiency_level BETWEEN $2 AND $3
  AND s.is_active = TRUE
  AND s.review_status = 'approved'
GROUP BY s.id, t.topic_name
ORDER BY s.difficulty_score ASC;
```

### **AI Cost Optimization**
```sql
-- Check cache before AI call
SELECT ai_response, evaluation_data 
FROM ai_response_cache 
WHERE request_hash = md5($1 || $2)
  AND last_used > NOW() - INTERVAL '30 days';

-- Update cache usage
UPDATE ai_response_cache 
SET cache_hits = cache_hits + 1, last_used = NOW()
WHERE request_hash = $1;
```

### **User Progress Analytics**
```sql
-- Comprehensive user progress report
SELECT 
    t.topic_name,
    utp.sentences_completed,
    utp.mastery_score,
    utp.avg_score,
    utp.independence_rate,
    utp.current_difficulty_level,
    COUNT(ucw.id) as weakness_count
FROM user_topic_progress utp
JOIN topics t ON utp.topic_id = t.id
LEFT JOIN user_concept_weaknesses ucw ON utp.user_id = ucw.user_id 
    AND ucw.needs_review = TRUE
WHERE utp.user_id = $1
GROUP BY t.topic_name, utp.sentences_completed, utp.mastery_score, 
         utp.avg_score, utp.independence_rate, utp.current_difficulty_level
ORDER BY utp.mastery_score DESC;
```

---

This PostgreSQL-optimized architecture combines the best of both approaches: practical database optimization with comprehensive learning system features!

---

## AI Content Generation Tables

### **4. AI Generation Sessions**
```sql
CREATE TABLE ai_generation_sessions (
    id INTEGER PRIMARY KEY,
    session_code VARCHAR(50) UNIQUE, -- 'GEN_2024_001'

    -- Generation Parameters
    target_topic_id INTEGER NOT NULL,
    target_level_range VARCHAR(10), -- '1-3', '4-6', etc.
    target_tense VARCHAR(30),
    target_word_count_range VARCHAR(10), -- '5-8', '10-15'
    additional_constraints JSON, -- Custom generation parameters

    -- Generation Prompts & Settings
    base_prompt TEXT NOT NULL,
    model_used VARCHAR(50), -- 'gpt-4', 'gpt-3.5-turbo'
    temperature DECIMAL(2,1),
    max_tokens INTEGER,

    -- Session Metadata
    sentences_requested INTEGER,
    sentences_generated INTEGER,
    sentences_approved INTEGER,
    generation_cost DECIMAL(8,4), -- API cost tracking

    -- Quality Control
    avg_quality_score DECIMAL(3,1),
    human_review_required BOOLEAN DEFAULT TRUE,
    batch_approved BOOLEAN DEFAULT FALSE,
    approved_by INTEGER,
    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (target_topic_id) REFERENCES topics(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    INDEX idx_topic_level (target_topic_id, target_level_range),
    INDEX idx_generation_date (created_at),
    INDEX idx_approval_status (batch_approved, human_review_required)
);
```

### **5. AI Content Quality Tracking**
```sql
CREATE TABLE ai_content_quality (
    id INTEGER PRIMARY KEY,
    sentence_id INTEGER NOT NULL,
    generation_session_id INTEGER,

    -- Quality Metrics
    grammar_accuracy DECIMAL(3,1), -- 1-10 scale
    naturalness_score DECIMAL(3,1), -- How natural the Spanish sounds
    difficulty_accuracy DECIMAL(3,1), -- Matches intended difficulty
    topic_relevance DECIMAL(3,1), -- Fits the topic category

    -- Automated Checks
    passes_grammar_check BOOLEAN,
    passes_profanity_check BOOLEAN,
    passes_cultural_check BOOLEAN,

    -- Human Review
    human_quality_score DECIMAL(3,1),
    human_feedback TEXT,
    requires_revision BOOLEAN DEFAULT FALSE,

    -- Issues & Improvements
    identified_issues JSON, -- Array of specific problems
    suggested_improvements JSON,

    reviewed_by INTEGER,
    reviewed_at TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (generation_session_id) REFERENCES ai_generation_sessions(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_quality_scores (grammar_accuracy, naturalness_score),
    INDEX idx_review_status (requires_revision, reviewed_at)
);
```

---

## User Progress & Analytics Tables

### **6. User Topic Progress**
```sql
CREATE TABLE user_topic_progress (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    topic_id INTEGER NOT NULL,

    -- Progress Metrics
    sentences_attempted INTEGER DEFAULT 0,
    sentences_completed INTEGER DEFAULT 0,
    avg_score DECIMAL(3,1), -- Average 1-10 score for this topic
    total_hints_used INTEGER DEFAULT 0,
    independence_rate DECIMAL(4,2), -- Percentage without hints

    -- Mastery Tracking
    mastery_level VARCHAR(20) DEFAULT 'novice', -- 'novice', 'developing', 'proficient', 'advanced'
    mastery_score DECIMAL(4,2), -- 0-100 calculated mastery

    -- Difficulty Progression
    current_difficulty_level INTEGER DEFAULT 1,
    max_difficulty_reached INTEGER DEFAULT 1,
    ready_for_next_level BOOLEAN DEFAULT FALSE,

    -- Timing & Engagement
    first_attempted TIMESTAMP,
    last_practiced TIMESTAMP,
    total_practice_time INTEGER DEFAULT 0, -- seconds

    -- Review Scheduling
    needs_review BOOLEAN DEFAULT FALSE,
    next_review_date TIMESTAMP,
    review_frequency_days INTEGER DEFAULT 7,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id),
    UNIQUE KEY unique_user_topic (user_id, topic_id),
    INDEX idx_user_progress (user_id, mastery_score),
    INDEX idx_review_queue (needs_review, next_review_date)
);
```

### **7. Content Filtering & Recommendations**
```sql
CREATE TABLE user_content_preferences (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,

    -- Topic Preferences
    preferred_topics JSON, -- Array of topic IDs
    avoided_topics JSON, -- Topics user wants to avoid
    topic_weights JSON, -- Custom weighting for topic selection

    -- Difficulty Preferences
    auto_difficulty_adjustment BOOLEAN DEFAULT TRUE,
    manual_difficulty_override INTEGER, -- Force specific level
    challenge_preference VARCHAR(20) DEFAULT 'balanced', -- 'easy', 'balanced', 'challenging'

    -- Content Type Preferences
    preferred_tenses JSON, -- Focus on specific tenses
    sentence_length_preference VARCHAR(20) DEFAULT 'mixed', -- 'short', 'medium', 'long', 'mixed'

    -- Learning Style
    hint_tolerance VARCHAR(20) DEFAULT 'moderate', -- 'minimal', 'moderate', 'frequent'
    repetition_tolerance INTEGER DEFAULT 3, -- How many times to see similar content

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user_prefs (user_id)
);
```

---

## Sample Data & Usage Examples

### **Topic Categorization Example**
```sql
-- Sample topics
INSERT INTO topics (topic_code, topic_name, description, difficulty_range) VALUES
('daily_life', 'Daily Life', 'Everyday activities and routines', 'all'),
('food_drink', 'Food & Drink', 'Meals, restaurants, cooking', '1-6'),
('travel', 'Travel', 'Transportation, hotels, directions', '2-7'),
('work', 'Work & Career', 'Professional life and workplace', '4-9'),
('culture', 'Culture & Society', 'Traditions, customs, social topics', '5-9');

-- Sample sentence with full categorization
INSERT INTO sentences (
    english_text,
    spanish_translations,
    primary_topic_id,
    secondary_topics,
    proficiency_level,
    difficulty_score,
    word_count,
    primary_tense,
    grammar_concepts,
    created_by,
    source_metadata
) VALUES (
    'I drink coffee every morning',
    '["Bebo café cada mañana", "Tomo café cada mañana", "Yo bebo café cada mañana"]',
    1, -- daily_life
    '[2]', -- also food_drink
    2,
    2.5,
    5,
    'present',
    '["present_tense", "first_person", "regular_verb", "frequency_expression"]',
    'AI',
    '{"generation_session": "GEN_2024_001", "model": "gpt-4", "confidence": 0.95}'
);
```

### **AI Generation Session Example**
```sql
-- Track AI generation batch
INSERT INTO ai_generation_sessions (
    session_code,
    target_topic_id,
    target_level_range,
    target_tense,
    base_prompt,
    sentences_requested,
    model_used
) VALUES (
    'GEN_DAILY_LIFE_001',
    1, -- daily_life
    '1-3',
    'present',
    'Generate Spanish sentences about daily life activities using present tense, appropriate for beginner level (A1-A2)',
    50,
    'gpt-4'
);
```

---

## Query Examples for Common Operations

### **Get Sentences by Topic and Level**
```sql
SELECT s.*, t.topic_name 
FROM sentences s
JOIN topics t ON s.primary_topic_id = t.id
WHERE t.topic_code = 'daily_life' 
  AND s.proficiency_level BETWEEN 1 AND 3
  AND s.is_active = TRUE
ORDER BY s.difficulty_score ASC;
```

### **Get User's Topic Progress**
```sql
SELECT t.topic_name, utp.mastery_level, utp.avg_score, utp.independence_rate
FROM user_topic_progress utp
JOIN topics t ON utp.topic_id = t.id
WHERE utp.user_id = ?
ORDER BY utp.mastery_score DESC;
```

### **Find Sentences Needing Review**
```sql
SELECT s.*, acq.human_quality_score
FROM sentences s
LEFT JOIN ai_content_quality acq ON s.id = acq.sentence_id
WHERE s.created_by = 'AI'
  AND (s.review_status = 'pending' OR acq.requires_revision = TRUE)
ORDER BY s.created_at ASC;
```

---

This architecture provides comprehensive support for topic-based categorization, AI content generation with full traceability, and detailed analytics for both content and user progress!