# AIdioma Database Architecture & Data Requirements
## Comprehensive Database Schema Analysis & Implementation Plan

---

## 🎯 **Current Implementation Status**

### ✅ **Core Database Tables (IMPLEMENTED - Neon PostgreSQL)**

| Table | Status | Purpose | Records |
|-------|--------|---------|---------|
| **`users`** | ✅ Active | User accounts, preferences, level tracking | User profiles |
| **`sentences`** | ✅ Seeded | Spanish practice content with difficulty levels | 3+ practice sentences |
| **`user_progress`** | ✅ Active | Individual sentence progress tracking | User/sentence progress |
| **`practice_sessions`** | ✅ Active | Practice session management and metrics | Session data |
| **`evaluations`** | ✅ Active | AI evaluation results and feedback | Individual evaluations |
| **`evaluation_cache`** | ✅ Active | AI response caching for cost optimization | Cached AI responses |
| **`learning_analytics`** | ✅ Active | Daily learning metrics and patterns | Daily analytics |

**Database Infrastructure**: Neon PostgreSQL with Drizzle ORM, SSL-secured connection pooling  
**Project ID**: flat-hill-33432526  
**Health Status**: ✅ Operational, API endpoints updated, seed data loaded

---

## 📊 **Data Requirements Analysis**

Based on comprehensive documentation review of the Master Roadmap, Universal AI Integration, and Cross-Page Integration Patterns, several critical database tables are missing for complete AIdioma functionality:

### **🚨 CRITICAL GAPS IDENTIFIED:**

1. **Cross-Page Integration Tables** - No universal activity tracking or unified goals
2. **Content-Specific Tables** - Missing Reading, Memorize, Conversation content storage
3. **Advanced User Analytics** - No comprehensive user learning context tracking
4. **Gamification System** - No achievements or advanced progress tracking

---

## 🔍 **PRIORITY 1: Cross-Page Integration Tables (MISSING - CRITICAL)**

These tables are essential for Universal AI Service and cross-page functionality as outlined in the Master Roadmap:

### **1. Universal Activity Events**
```sql
-- PURPOSE: Track all learning activities across Practice, Reading, Memorize, Conversation pages
-- IMPORTANCE: Critical for cross-page analytics and unified progress tracking
CREATE TABLE universal_activity_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Activity Classification
  activity_type TEXT NOT NULL, -- 'sentence_translated', 'word_memorized', 'conversation_turn', 'text_read'
  content_type TEXT NOT NULL,  -- 'practice', 'reading', 'memorize', 'conversation'
  page_source TEXT NOT NULL,   -- Source page identifier for analytics
  
  -- Universal Performance Metrics
  score INTEGER NOT NULL,              -- 0-100 universal scoring system
  time_spent INTEGER NOT NULL,         -- milliseconds for learning velocity analysis
  hints_used INTEGER DEFAULT 0,        -- Learning support tracking
  difficulty_level INTEGER,            -- Content difficulty assessment
  attempts_required INTEGER DEFAULT 1, -- Learning efficiency tracking
  
  -- Content Metadata for Cross-Page Correlation
  content_id TEXT,                     -- Reference to specific content (sentence_id, flashcard_id, etc.)
  grammar_concepts TEXT,               -- JSON array: ['present_tense', 'ser_vs_estar']
  vocabulary_words TEXT,               -- JSON array: ['caminar', 'mesa', 'gusta']
  
  -- AI Cost Tracking Integration
  ai_response_type TEXT,               -- 'cached', 'similarity', 'ai_generated'
  ai_cost DECIMAL(10,6),              -- Cost in dollars for budget tracking
  ai_response_time INTEGER,            -- Response time in ms for performance monitoring
  ai_confidence DECIMAL(3,2),          -- AI evaluation confidence score (0.00-1.00)
  evaluation_model TEXT,               -- AI model used ('gpt-4o-mini', 'claude-3-haiku')
  cached BOOLEAN DEFAULT FALSE,        -- Cache performance tracking
  
  -- Goal Contribution Tracking for Unified Progress
  contributes_to_daily TEXT,           -- JSON: ['sentences_translated', 'practice_minutes']
  contributes_to_weekly TEXT,          -- JSON: ['learning_streak', 'total_score']
  contributes_to_monthly TEXT,         -- JSON: ['skill_advancement']
  
  -- Session and Device Context
  session_id TEXT,                     -- Groups activities by learning session
  device_type TEXT,                    -- 'desktop', 'mobile', 'tablet' for UX analytics
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### **2. Unified Goals System**
```sql
-- PURPOSE: Cross-page goal tracking with weighted contributions from all learning activities
-- IMPORTANCE: Critical for gamification and motivation across all pages
CREATE TABLE unified_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Goal Classification and Scope
  goal_type TEXT NOT NULL,             -- 'daily', 'weekly', 'monthly', 'custom'
  goal_category TEXT NOT NULL,         -- 'sentences_translated', 'words_memorized', 'conversations_held', 'reading_time'
  target_value INTEGER NOT NULL,       -- Numeric target for achievement
  current_value INTEGER DEFAULT 0,     -- Current progress toward goal
  
  -- Goal Scheduling and Lifecycle
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  
  -- Cross-Page Contribution Weighting
  practice_weight DECIMAL(3,2) DEFAULT 1.0,    -- Weight of practice activities toward goal
  reading_weight DECIMAL(3,2) DEFAULT 1.0,     -- Weight of reading activities toward goal
  memorize_weight DECIMAL(3,2) DEFAULT 1.0,    -- Weight of memorization activities toward goal
  conversation_weight DECIMAL(3,2) DEFAULT 1.0, -- Weight of conversation activities toward goal
  
  -- Achievement and Motivation Features
  reward_type TEXT,                    -- 'badge', 'points', 'unlock_feature'
  reward_value TEXT,                   -- Specific reward details (JSON)
  celebration_message TEXT,            -- Custom completion message
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

---

## 🔍 **PRIORITY 2: Content-Specific Tables (MISSING - HIGH PRIORITY)**

Content tables needed for Reading, Memorize, and Conversation pages as identified in system implementation status:

### **3. Reading Content**
```sql
-- PURPOSE: Spanish text content for Reading page with comprehension tracking
CREATE TABLE reading_content (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  spanish_text TEXT NOT NULL,          -- Full Spanish text for reading
  english_translation TEXT,            -- Optional English reference
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_reading_time INTEGER,      -- Minutes for reading planning
  
  -- Content Classification
  category TEXT,                       -- 'news', 'story', 'dialogue', 'article'
  topic TEXT,                         -- 'travel', 'food', 'business', 'culture'
  source_type TEXT,                   -- 'original', 'adapted', 'authentic'
  
  -- Learning Support Metadata
  vocabulary_words TEXT,              -- JSON array of key vocabulary with definitions
  grammar_points TEXT,                -- JSON array of grammar concepts featured
  cultural_notes TEXT,                -- JSON array of cultural context notes
  
  -- Comprehension Questions (embedded)
  comprehension_questions TEXT,       -- JSON array of questions with answers
  
  -- Analytics and Usage
  read_count INTEGER DEFAULT 0,
  average_completion_rate DECIMAL(5,2) DEFAULT 0,
  average_comprehension_score DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### **4. Vocabulary/Flashcards**
```sql
-- PURPOSE: Vocabulary flashcards for Memorize page with spaced repetition
CREATE TABLE vocabulary_flashcards (
  id TEXT PRIMARY KEY,
  spanish_word TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  pronunciation TEXT,                  -- IPA or phonetic guide
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Learning Context
  example_sentence_spanish TEXT,       -- Example usage in Spanish
  example_sentence_english TEXT,       -- English translation of example
  word_type TEXT,                     -- 'noun', 'verb', 'adjective', 'phrase'
  gender TEXT,                        -- 'masculine', 'feminine', 'neutral' (for nouns)
  
  -- Categorization
  category TEXT,                      -- 'food', 'travel', 'business', 'emotions'
  topic TEXT,                         -- More specific topic classification
  frequency_rank INTEGER,             -- How common the word is (1-5000)
  
  -- Learning Metadata
  related_words TEXT,                 -- JSON array of related vocabulary
  grammar_notes TEXT,                 -- Special grammar considerations
  cultural_context TEXT,              -- Cultural usage notes
  
  -- Usage Analytics
  total_reviews INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  average_response_time INTEGER,      -- Average time to recall (ms)
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### **5. Conversation Scenarios**
```sql
-- PURPOSE: Conversation scenarios and dialogue templates for Conversation page
CREATE TABLE conversation_scenarios (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,           -- Scenario description
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Scenario Configuration
  scenario_type TEXT NOT NULL,         -- 'guided', 'free_form', 'role_play'
  setting TEXT,                       -- 'restaurant', 'airport', 'business_meeting'
  participant_role TEXT,              -- User's role in conversation
  ai_character_persona TEXT,          -- AI character description and personality
  
  -- Conversation Structure
  opening_message TEXT,               -- AI's opening message
  conversation_goals TEXT,            -- JSON array of learning objectives
  expected_turns INTEGER,             -- Approximate conversation length
  
  -- Learning Targets
  vocabulary_focus TEXT,              -- JSON array of vocabulary to practice
  grammar_focus TEXT,                 -- JSON array of grammar concepts
  cultural_elements TEXT,             -- JSON array of cultural learning points
  
  -- Evaluation Criteria
  evaluation_criteria TEXT,           -- JSON: fluency, vocabulary usage, grammar accuracy
  success_benchmarks TEXT,            -- JSON: minimum scores for success
  
  -- Usage Analytics
  total_conversations INTEGER DEFAULT 0,
  average_turns INTEGER,
  average_satisfaction DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## 🔍 **PRIORITY 3: User Learning Context & Analytics (MISSING - MEDIUM PRIORITY)**

Advanced user tracking for Universal AI Service personalization:

### **6. User Learning Contexts**
```sql
-- PURPOSE: Comprehensive user learning profiles for AI personalization across pages
CREATE TABLE user_learning_contexts (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall Learning Profile
  overall_level TEXT NOT NULL DEFAULT 'beginner',
  learning_velocity DECIMAL(5,2) DEFAULT 0,    -- Learning speed metric
  retention_strength DECIMAL(5,2) DEFAULT 0,   -- Memory retention metric
  consistency_score DECIMAL(5,2) DEFAULT 0,    -- Regularity of practice
  
  -- Page-Specific Progress Metrics
  practice_sentences_completed INTEGER DEFAULT 0,
  practice_average_score DECIMAL(5,2) DEFAULT 0,
  practice_grammar_mastery TEXT,                -- JSON array of mastered grammar points
  
  reading_words_encountered INTEGER DEFAULT 0,
  reading_comprehension_level DECIMAL(5,2) DEFAULT 0,
  reading_speed_wpm INTEGER DEFAULT 0,         -- Words per minute
  
  memorize_words_learned INTEGER DEFAULT 0,
  memorize_retention_rate DECIMAL(5,2) DEFAULT 0,
  memorize_review_streak INTEGER DEFAULT 0,
  
  conversation_conversations_held INTEGER DEFAULT 0,
  conversation_fluency_level DECIMAL(5,2) DEFAULT 0,
  conversation_cultural_awareness DECIMAL(5,2) DEFAULT 0,
  
  -- Learning Patterns and Preferences
  preferred_difficulty TEXT DEFAULT 'adaptive', -- 'easy', 'medium', 'hard', 'adaptive'
  preferred_session_length INTEGER DEFAULT 15,  -- Minutes
  error_patterns TEXT,                          -- JSON array of common error types
  learning_schedule_preferences TEXT,           -- JSON: preferred times, frequency
  
  -- AI Personalization Data
  ai_interaction_history TEXT,                  -- JSON: AI response effectiveness tracking
  personalization_insights TEXT,               -- JSON: AI-generated insights about learning style
  recommended_focus_areas TEXT,                 -- JSON: AI-recommended improvement areas
  
  last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### **7. User Vocabulary Progress**
```sql
-- PURPOSE: Track individual vocabulary word learning progress for spaced repetition
CREATE TABLE user_vocabulary_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id TEXT NOT NULL REFERENCES vocabulary_flashcards(id) ON DELETE CASCADE,
  
  -- Spaced Repetition Algorithm Data
  easiness_factor DECIMAL(4,2) DEFAULT 2.5,    -- SM-2 algorithm easiness factor
  interval_days INTEGER DEFAULT 1,             -- Days until next review
  repetition_count INTEGER DEFAULT 0,          -- Number of successful repetitions
  
  -- Performance Tracking
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  average_response_time INTEGER,               -- Milliseconds
  
  -- Learning Progress
  mastery_level INTEGER DEFAULT 0,            -- 0-5 mastery scale
  last_attempt_score INTEGER,                 -- 0-100 last attempt score
  is_known BOOLEAN DEFAULT FALSE,             -- Marked as known/mastered
  
  -- Review Scheduling
  next_review_date TIMESTAMP,
  last_reviewed_at TIMESTAMP,
  last_attempt_at TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, flashcard_id)
);
```

---

## 🔍 **PRIORITY 4: Gamification & Achievements (MISSING - MEDIUM PRIORITY)**

### **8. User Achievements**
```sql
-- PURPOSE: Track badges, achievements, and gamification elements
CREATE TABLE user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Achievement Definition
  achievement_type TEXT NOT NULL,              -- 'milestone', 'streak', 'skill', 'special'
  achievement_id TEXT NOT NULL,                -- Reference to achievement definition
  achievement_name TEXT NOT NULL,
  achievement_description TEXT,
  
  -- Progress and Completion
  target_value INTEGER,                        -- Target for achievement
  current_value INTEGER DEFAULT 0,             -- Current progress
  is_completed BOOLEAN DEFAULT FALSE,
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Cross-Page Achievement Tracking
  contributing_pages TEXT,                     -- JSON array: ['practice', 'reading']
  related_activity_types TEXT,                 -- JSON array of contributing activities
  
  -- Rewards and Recognition
  points_awarded INTEGER DEFAULT 0,
  badge_icon_url TEXT,
  reward_message TEXT,
  
  earned_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🎯 **Implementation Priority Matrix**

| Priority | Tables | Implementation Effort | Dependencies | Impact |
|----------|--------|----------------------|--------------|--------|
| **CRITICAL** | Universal Activity Events, Unified Goals | 2-3 days | Current tables ✅ | Cross-page functionality |
| **HIGH** | Reading Content, Vocabulary Flashcards | 3-4 days | Universal Events | Complete 3 additional pages |
| **MEDIUM** | User Learning Contexts, Vocabulary Progress | 2-3 days | Content tables | AI personalization |
| **LOW** | Conversation Scenarios, Achievements | 1-2 days | Core system | Enhanced UX |

---

## 📋 **Database Schema Migration Plan**

### **Phase 1: Cross-Page Integration (Week 1)**
1. **Universal Activity Events table** - Enable cross-page tracking
2. **Unified Goals table** - Cross-page goal system
3. **Update existing services** to log universal activities
4. **Test cross-page data flow** with Practice page

### **Phase 2: Content Expansion (Week 2)**
1. **Reading Content table** - Enable Reading page AI integration
2. **Vocabulary Flashcards table** - Enable Memorize page functionality
3. **Seed content data** for both content types
4. **Update Universal AI Service** for new content types

### **Phase 3: Advanced Features (Week 3)**
1. **User Learning Contexts table** - Enhanced AI personalization
2. **User Vocabulary Progress table** - Spaced repetition system
3. **Cross-page analytics implementation**
4. **Performance optimization and indexing**

### **Phase 4: Gamification (Week 4)**
1. **Conversation Scenarios table** - Complete Conversation page
2. **User Achievements table** - Gamification system
3. **Achievement logic implementation**
4. **Comprehensive testing and optimization**

---

## 🔗 **Table Relationships & Indexes**

### **Critical Indexes for Performance**
```sql
-- Universal Activity Events indexes
CREATE INDEX idx_activity_events_user_date ON universal_activity_events(user_id, created_at);
CREATE INDEX idx_activity_events_content_type ON universal_activity_events(content_type, page_source);
CREATE INDEX idx_activity_events_goals ON universal_activity_events(user_id, contributes_to_daily);

-- Goals and Progress indexes  
CREATE INDEX idx_unified_goals_user_active ON unified_goals(user_id, is_active, goal_type);
CREATE INDEX idx_user_vocabulary_progress_review ON user_vocabulary_progress(user_id, next_review_date);
CREATE INDEX idx_user_contexts_updated ON user_learning_contexts(user_id, last_updated);
```

### **Foreign Key Relationships**
- All tables properly reference `users(id)` with CASCADE DELETE
- Content tables use TEXT PRIMARY KEYS for flexibility  
- Cross-references between activity events and content tables
- Proper normalization maintaining data integrity

---

## ✅ **Data Quality & Validation Requirements**

### **Required Validations**
- **Score ranges**: 0-100 for all scoring systems
- **Difficulty levels**: Enforce 'beginner', 'intermediate', 'advanced'
- **Timestamp consistency**: created_at ≤ updated_at
- **JSON field validation**: Valid JSON structure for all JSON fields
- **Positive integers**: No negative values for counts, times, attempts

### **Data Consistency Rules**
- User learning context updates triggered by activity events
- Goal progress automatically calculated from activity contributions
- Vocabulary progress follows spaced repetition algorithm constraints
- Cross-page analytics maintain referential integrity

---

## 🚀 **Next Steps**

### **Immediate Actions Needed**
1. **Create Universal Activity Events table** - Critical for cross-page functionality
2. **Create Unified Goals table** - Essential for motivation and progress tracking
3. **Update Universal AI Service** to log activities to new tables
4. **Create content tables** for Reading and Memorize pages
5. **Implement cross-page analytics queries**

### **Technical Dependencies**
- ✅ **Neon Database**: Operational and ready for schema additions
- ✅ **Drizzle ORM**: Configured for PostgreSQL migrations
- ✅ **API Infrastructure**: Ready to support new endpoints
- ❌ **Schema Migrations**: Need to create migration scripts
- ❌ **Seed Data**: Need content for Reading and Vocabulary tables

**This comprehensive database architecture supports AIdioma's evolution from a single Practice page to a complete multi-page Spanish learning platform with advanced AI personalization and cross-page analytics.**
