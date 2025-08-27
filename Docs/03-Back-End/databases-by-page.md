# AIdioma Database Tables by Page
## Page-Specific Database Usage & Dependencies

---

## 📊 **Database Usage Matrix**

| Page | Core Tables | Content Tables | Analytics Tables | Special Features |
|------|-------------|----------------|------------------|------------------|
| **Practice** | ✅ 5 tables | ✅ sentences | ✅ activity_events | AI evaluation, hints, progress |
| **Reading** | ✅ 3 tables | ❌ reading_content | ✅ activity_events | Comprehension, word lookup |
| **Memorize** | ✅ 3 tables | ❌ vocabulary_flashcards | ✅ activity_events | Spaced repetition, mastery |
| **Conversation** | ✅ 3 tables | ❌ conversation_scenarios | ✅ activity_events | AI dialogue, persona chat |
| **Progress** | ✅ 2 tables | ❌ None | ✅ All analytics | Cross-page insights, goals |
| **Settings** | ✅ 2 tables | ❌ None | ❌ None | User preferences, account |

**Legend**: ✅ Implemented | ❌ Missing/Needed | 📋 Planned

---

## 🎯 **Practice Page Database Usage**

### **✅ IMPLEMENTED TABLES**

| Table | Usage | Operations | Performance Notes |
|-------|-------|------------|-------------------|
| **`users`** | User profile, level, streak tracking | SELECT, UPDATE | Indexed on id |
| **`sentences`** | Spanish practice content with hints | SELECT | Seeded with 3+ sentences |
| **`user_progress`** | Individual sentence progress | SELECT, INSERT, UPDATE | Composite index on user_id, sentence_id |
| **`practice_sessions`** | Session management, metrics | INSERT, UPDATE, SELECT | Indexed on user_id, started_at |
| **`evaluations`** | AI evaluation results | INSERT, SELECT | Indexed on user_id, created_at |
| **`evaluation_cache`** | AI response caching | SELECT, INSERT | Hash index for 85% cache hit rate |
| **`learning_analytics`** | Daily learning metrics | INSERT, UPDATE | Aggregated daily stats |

### **❌ MISSING CRITICAL TABLES**

| Table | Purpose | Impact | Priority |
|-------|---------|--------|----------|
| **`universal_activity_events`** | Cross-page progress tracking | No unified analytics | **CRITICAL** |
| **`unified_goals`** | Daily/weekly goal tracking | No motivation system | **HIGH** |

### **Practice Page Queries**
```sql
-- Most common Practice page database operations
SELECT * FROM sentences WHERE difficulty = 'beginner' AND is_active = true;
SELECT * FROM user_progress WHERE user_id = ? AND sentence_id = ?;
INSERT INTO evaluations (user_id, sentence_id, score, feedback, hints_used);
SELECT * FROM evaluation_cache WHERE translation_hash = ? AND sentence_id = ?;
UPDATE users SET total_score = total_score + ?, streak = ? WHERE id = ?;
```

---

## 📖 **Reading Page Database Usage**

### **✅ CURRENT TABLES (Partial Implementation)**

| Table | Usage | Status | Notes |
|-------|-------|--------|-------|
| **`users`** | User reading progress tracking | ✅ Active | Reading level, comprehension scores |
| **`universal_activity_events`** | Reading activity logging | ❌ Missing | Will track reading time, comprehension |
| **`evaluation_cache`** | AI comprehension response caching | ✅ Ready | Can cache reading comprehension evaluations |

### **❌ MISSING CRITICAL TABLES**

| Table | Purpose | Data Structure | Priority |
|-------|---------|----------------|----------|
| **`reading_content`** | Spanish texts with comprehension questions | title, spanish_text, difficulty, comprehension_questions (JSON) | **CRITICAL** |
| **`user_reading_progress`** | Individual text reading progress | user_id, content_id, completion_percentage, comprehension_score | **HIGH** |

### **Reading Page Requirements**
```sql
-- Reading page will need these database operations
SELECT * FROM reading_content WHERE difficulty = ? AND category = ?;
INSERT INTO universal_activity_events (activity_type='text_read', content_type='reading');
SELECT * FROM evaluation_cache WHERE content_id = ? AND interaction_type = 'comprehension';
UPDATE user_learning_contexts SET reading_words_encountered = ?, reading_speed_wpm = ?;
```

---

## 🧠 **Memorize Page Database Usage**

### **✅ CURRENT TABLES (Partial Implementation)**

| Table | Usage | Status | Notes |
|-------|-------|--------|-------|
| **`users`** | Vocabulary mastery tracking | ✅ Active | Word count, retention rates |
| **`universal_activity_events`** | Flashcard activity logging | ❌ Missing | Will track review sessions, mastery |
| **`evaluation_cache`** | AI vocabulary response caching | ✅ Ready | Can cache vocabulary evaluations |

### **❌ MISSING CRITICAL TABLES**

| Table | Purpose | Data Structure | Priority |
|-------|---------|----------------|----------|
| **`vocabulary_flashcards`** | Spanish vocabulary with spaced repetition data | spanish_word, english_translation, difficulty, example_sentence | **CRITICAL** |
| **`user_vocabulary_progress`** | Individual word learning progress | user_id, flashcard_id, mastery_level, next_review_date, easiness_factor | **CRITICAL** |

### **Memorize Page Requirements**
```sql
-- Memorize page will need these database operations
SELECT * FROM vocabulary_flashcards WHERE difficulty = ? ORDER BY frequency_rank;
SELECT * FROM user_vocabulary_progress WHERE user_id = ? AND next_review_date <= NOW();
INSERT INTO universal_activity_events (activity_type='word_memorized', score=?, time_spent=?);
UPDATE user_vocabulary_progress SET easiness_factor=?, interval_days=?, next_review_date=?;
```

---

## 💬 **Conversation Page Database Usage**

### **✅ CURRENT TABLES (Partial Implementation)**

| Table | Usage | Status | Notes |
|-------|-------|--------|-------|
| **`users`** | Conversation fluency tracking | ✅ Active | Conversation count, fluency level |
| **`universal_activity_events`** | Conversation activity logging | ❌ Missing | Will track dialogue turns, fluency |
| **`evaluation_cache`** | AI conversation response caching | ✅ Ready | Can cache conversation evaluations |

### **❌ MISSING CRITICAL TABLES**

| Table | Purpose | Data Structure | Priority |
|-------|---------|----------------|----------|
| **`conversation_scenarios`** | Dialogue templates and personas | title, description, ai_character_persona, conversation_goals (JSON) | **HIGH** |
| **`conversation_sessions`** | Individual conversation tracking | user_id, scenario_id, turn_count, fluency_score, completion_status | **MEDIUM** |

### **Conversation Page Requirements**
```sql
-- Conversation page will need these database operations
SELECT * FROM conversation_scenarios WHERE difficulty = ? AND setting = ?;
INSERT INTO universal_activity_events (activity_type='conversation_turn', ai_confidence=?);
INSERT INTO conversation_sessions (user_id, scenario_id, turn_count, fluency_score);
UPDATE user_learning_contexts SET conversation_fluency_level=?, cultural_awareness=?;
```

---

## 📊 **Progress Page Database Usage**

### **✅ CURRENT TABLES (Partial Implementation)**

| Table | Usage | Status | Notes |
|-------|-------|--------|-------|
| **`users`** | Overall user statistics | ✅ Active | Total score, streak, level |
| **`learning_analytics`** | Daily learning metrics | ✅ Active | Practice-only analytics |

### **❌ MISSING CRITICAL TABLES**

| Table | Purpose | Data Structure | Priority |
|-------|---------|----------------|----------|
| **`universal_activity_events`** | Cross-page activity aggregation | ALL learning activities across pages | **CRITICAL** |
| **`unified_goals`** | Goal progress visualization | goal_type, target_value, current_value, completion_percentage | **CRITICAL** |
| **`user_learning_contexts`** | Comprehensive learning insights | Cross-page progress metrics, learning velocity | **HIGH** |
| **`user_achievements`** | Achievement and badge display | achievement_type, completion_status, points_awarded | **MEDIUM** |

### **Progress Page Requirements**
```sql
-- Progress page will need these comprehensive queries
SELECT * FROM universal_activity_events WHERE user_id = ? ORDER BY created_at DESC;
SELECT * FROM unified_goals WHERE user_id = ? AND is_active = true;
SELECT AVG(score), COUNT(*) FROM universal_activity_events WHERE user_id = ? GROUP BY content_type;
SELECT * FROM user_achievements WHERE user_id = ? AND is_completed = true;
```

---

## ⚙️ **Settings Page Database Usage**

### **✅ CURRENT TABLES (Sufficient Implementation)**

| Table | Usage | Operations | Notes |
|-------|-------|------------|-------|
| **`users`** | User preferences, account settings | SELECT, UPDATE | email, name, level, preferences (JSON) |
| **`user_learning_contexts`** | Learning preference updates | SELECT, UPDATE | preferred_difficulty, session_length |

### **Settings Page Requirements**
```sql
-- Settings page database operations
SELECT * FROM users WHERE id = ?;
UPDATE users SET name=?, email=?, preferences=? WHERE id = ?;
UPDATE user_learning_contexts SET preferred_difficulty=?, preferred_session_length=? WHERE user_id = ?;
```

---

## 🎯 **Cross-Page Dependencies**

### **Shared Tables (Used by Multiple Pages)**

| Table | Pages | Purpose | Critical Indexes |
|-------|-------|---------|------------------|
| **`users`** | ALL | Core user profile | PRIMARY KEY (id) |
| **`universal_activity_events`** | Practice, Reading, Memorize, Conversation, Progress | Cross-page analytics | (user_id, created_at), (content_type) |
| **`unified_goals`** | ALL | Cross-page goal tracking | (user_id, is_active, goal_type) |
| **`evaluation_cache`** | Practice, Reading, Memorize, Conversation | AI cost optimization | (translation_hash, sentence_id) |
| **`user_learning_contexts`** | ALL | AI personalization | (user_id, last_updated) |

### **Page-Specific Tables**

| Table | Page | Dependency Level | Implementation Status |
|-------|------|------------------|----------------------|
| **`sentences`** | Practice | Core functionality | ✅ Implemented |
| **`reading_content`** | Reading | Core functionality | ❌ Missing |
| **`vocabulary_flashcards`** | Memorize | Core functionality | ❌ Missing |
| **`conversation_scenarios`** | Conversation | Core functionality | ❌ Missing |

---

## 📋 **Implementation Priority by Page**

### **Phase 1: Complete Practice Page (Current Focus)**
```
✅ DONE: Core tables operational
❌ TODO: Universal activity events integration
❌ TODO: Unified goals system
```

### **Phase 2: Enable Reading Page**
```
❌ TODO: reading_content table
❌ TODO: Universal AI Service integration
❌ TODO: Comprehension tracking
```

### **Phase 3: Enable Memorize Page**
```
❌ TODO: vocabulary_flashcards table
❌ TODO: user_vocabulary_progress table
❌ TODO: Spaced repetition algorithm
```

### **Phase 4: Enable Conversation Page**
```
❌ TODO: conversation_scenarios table
❌ TODO: conversation_sessions table
❌ TODO: AI dialogue system
```

### **Phase 5: Enhanced Progress Page**
```
❌ TODO: Cross-page analytics queries
❌ TODO: Achievement system
❌ TODO: Learning insights generation
```

---

## 🚀 **Database Readiness Score by Page**

| Page | Database Readiness | Missing Tables | Estimated Implementation |
|------|-------------------|----------------|-------------------------|
| **Practice** | 85% ✅ | Universal events, Unified goals | 2-3 days |
| **Reading** | 30% ⚠️ | Reading content, Activity tracking | 4-5 days |
| **Memorize** | 25% ⚠️ | Vocabulary tables, Progress tracking | 4-5 days |
| **Conversation** | 25% ⚠️ | Scenario tables, Session tracking | 3-4 days |
| **Progress** | 40% ⚠️ | Cross-page analytics, Achievements | 3-4 days |
| **Settings** | 90% ✅ | None (sufficient) | Ready |

**This page-by-page analysis provides clear implementation priorities and database requirements for completing AIdioma's multi-page learning platform.**
