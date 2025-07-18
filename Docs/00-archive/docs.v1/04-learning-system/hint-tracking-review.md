<!--
FILE LOCATION: docs/04-learning-system/hint-tracking-review.md

FOR LOCAL DEVELOPMENT: This document defines the foundational hint tracking and review system for the Spanish learning app. It focuses on capturing user hint usage data, identifying learning weaknesses, and creating targeted review sessions.

IMPLEMENTATION OBJECTIVE: Build a comprehensive tracking system that monitors which words/concepts users struggle with, logs hint usage with point deductions, and generates personalized review queues based on identified weaknesses.

KEY STRATEGY: Track hint usage at word-concept level, build weakness profiles for each user, and create spaced repetition review sessions. This works alongside the Progressive Hints System but focuses on the data tracking and review generation aspects.

CRITICAL FEATURES:
- Word-level concept mapping for detailed tracking
- User weakness scoring and analysis
- Adaptive review queue generation
- Spaced repetition scheduling
- Integration with hint usage patterns

Reference this when implementing hint usage logging, weakness tracking APIs, and review session generation. This complements the Progressive Hints System document.
-->

# Spanish Learning App - Hint Tracking & Review System

## Overview
A comprehensive system to track which words/concepts users need hints for, deduct points appropriately, and create targeted review sessions based on identified weaknesses.

## Database Schema Additions

### 1. **Word-Level Concept Mapping**
```sql
CREATE TABLE sentence_word_concepts (
    id INTEGER PRIMARY KEY,
    sentence_id INTEGER NOT NULL,
    word_index INTEGER NOT NULL, -- 0-based index in English sentence
    english_word VARCHAR(50) NOT NULL,
    spanish_translation VARCHAR(100) NOT NULL,
    word_type VARCHAR(20) NOT NULL, -- 'verb', 'noun', 'adjective', 'connector'
    grammar_concepts JSON NOT NULL, -- ['present_tense', 'first_person', 'regular_verb']
    difficulty_level INTEGER DEFAULT 1, -- 1-9 difficulty
    hint_text VARCHAR(200) NOT NULL, -- "bebo (I drink - present tense)"
    hint_priority INTEGER DEFAULT 1, -- 1=most helpful, 5=least helpful
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    INDEX idx_sentence_word (sentence_id, word_index)
);
```

### 2. **Hint Usage Tracking**
```sql
CREATE TABLE user_hint_usage (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    sentence_id INTEGER NOT NULL,
    word_concept_id INTEGER NOT NULL, -- references sentence_word_concepts
    session_id VARCHAR(50) NOT NULL, -- groups hints from same practice session
    hint_type VARCHAR(20) NOT NULL, -- 'verb_form', 'noun_gender', 'connector'
    points_deducted INTEGER DEFAULT 5,
    context_data JSON, -- stores any additional context about the hint
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    FOREIGN KEY (word_concept_id) REFERENCES sentence_word_concepts(id),
    INDEX idx_user_concept (user_id, word_concept_id),
    INDEX idx_session (session_id)
);
```

### 3. **User Concept Weakness Tracking**
```sql
CREATE TABLE user_concept_weaknesses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    grammar_concept VARCHAR(50) NOT NULL, -- 'present_tense', 'ser_vs_estar', etc.
    word_type VARCHAR(20), -- 'verb', 'noun', etc. (can be NULL for general concepts)

    -- Statistics
    hint_requests INTEGER DEFAULT 0,
    total_exposures INTEGER DEFAULT 0,
    weakness_score DECIMAL(4,2) DEFAULT 0.00, -- calculated: hint_requests / total_exposures

    -- Review scheduling
    needs_review BOOLEAN DEFAULT FALSE,
    last_hint_date TIMESTAMP,
    next_review_date TIMESTAMP,
    review_priority INTEGER DEFAULT 1, -- 1=urgent, 5=low priority

    -- Metadata
    first_encountered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_user_concept (user_id, grammar_concept, word_type),
    INDEX idx_review_queue (user_id, needs_review, review_priority)
);
```

### 4. **Enhanced User Progress Tracking**
```sql
-- Add columns to existing user_progress table
ALTER TABLE user_progress ADD COLUMN hint_usage_count INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN concept_weaknesses JSON; -- quick lookup for common weaknesses
ALTER TABLE user_progress ADD COLUMN last_review_session TIMESTAMP;
```

---

## UI Implementation Changes

### 1. **Click-Based Hint System**

#### JavaScript Implementation
```javascript
// Replace hover events with click events
class HintWordComponent {
  constructor(wordElement, wordData) {
    this.element = wordElement;
    this.wordData = wordData; // from sentence_word_concepts table
    this.isHintUsed = false;
    this.setupClickHandler();
  }

  setupClickHandler() {
    this.element.addEventListener('click', async (event) => {
      event.preventDefault();

      if (!this.isHintUsed) {
        await this.revealHint();
      }
    });

    // Add visual cue that word is clickable
    this.element.classList.add('hint-clickable');
  }

  async revealHint() {
    try {
      // Call API to log hint usage and deduct points
      const response = await fetch('/api/hints/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: getCurrentSessionId(),
          sentenceId: this.wordData.sentence_id,
          wordConceptId: this.wordData.id,
          hintType: this.wordData.word_type
        })
      });

      const result = await response.json();

      if (result.success) {
        // Update UI immediately
        this.showHintTooltip(this.wordData.hint_text);
        this.markAsUsed();
        this.updatePointsDisplay(result.pointsDeducted);
        this.updateHintCounter(result.totalHints);

        // Track for review
        this.flagForReview(this.wordData.grammar_concepts);
      }
    } catch (error) {
      console.error('Failed to log hint usage:', error);
    }
  }

  showHintTooltip(hintText) {
    // Create persistent tooltip that stays until next action
    const tooltip = document.createElement('div');
    tooltip.className = 'hint-tooltip permanent';
    tooltip.textContent = hintText;

    // Position relative to clicked word
    const rect = this.element.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 8}px`;
    tooltip.style.left = `${rect.left}px`;

    document.body.appendChild(tooltip);

    // Remove on next sentence or check translation
    this.scheduleTooltipRemoval(tooltip);
  }

  markAsUsed() {
    this.isHintUsed = true;
    this.element.classList.add('hint-used');
    this.element.style.backgroundColor = '#3B4252'; // subtle highlight
  }
}
```

#### CSS Styling
```css
/* Clickable hint words */
.hint-clickable {
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;
}

.hint-clickable:hover {
  background-color: var(--background-interactive);
  transform: translateY(-1px);
}

.hint-used {
  background-color: #5E81AC !important;
  color: white;
  font-weight: 500;
}

/* Persistent hint tooltips */
.hint-tooltip.permanent {
  position: fixed;
  background: var(--background-elevated);
  border: 1px solid var(--success);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--success);
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 200px;
}

/* Hint usage indicator */
.hint-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--warning);
}

.hint-counter.has-hints {
  color: var(--error);
  font-weight: 500;
}
```

### 2. **Enhanced Feedback Display**

#### Points Deduction Animation
```javascript
function animatePointsDeduction(pointsLost) {
  const pointsDisplay = document.querySelector('.points-display');

  // Create floating animation for lost points
  const floatingText = document.createElement('div');
  floatingText.textContent = `-${pointsLost} pts`;
  floatingText.className = 'floating-points-lost';

  pointsDisplay.appendChild(floatingText);

  // Animate upward and fade out
  floatingText.animate([
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(-30px)', opacity: 0 }
  ], {
    duration: 1500,
    easing: 'ease-out'
  }).onfinish = () => floatingText.remove();
}
```

### 3. **Review Needed Indicators**

#### Component for Flagging Review
```javascript
function addReviewFlag(conceptsNeedingReview) {
  const reviewContainer = document.querySelector('.practice-metadata');

  if (conceptsNeedingReview.length > 0) {
    const reviewFlag = document.createElement('div');
    reviewFlag.className = 'review-needed-flag';
    reviewFlag.innerHTML = `
      <span class="icon">📚</span>
      <span>Review needed: ${conceptsNeedingReview.join(', ')}</span>
    `;

    reviewContainer.appendChild(reviewFlag);
  }
}
```

---

## Backend API Implementation

### 1. **Hint Usage Endpoint**
```javascript
// POST /api/hints/use
app.post('/api/hints/use', authenticateUser, async (req, res) => {
  try {
    const { sessionId, sentenceId, wordConceptId, hintType } = req.body;
    const userId = req.user.id;

    // Log the hint usage
    const hintUsage = await db.user_hint_usage.create({
      user_id: userId,
      sentence_id: sentenceId,
      word_concept_id: wordConceptId,
      session_id: sessionId,
      hint_type: hintType,
      points_deducted: 5 // configurable
    });

    // Update user's total hints for this session
    const sessionHints = await db.user_hint_usage.count({
      where: { user_id: userId, session_id: sessionId }
    });

    // Get the word concept data for weakness tracking
    const wordConcept = await db.sentence_word_concepts.findByPk(wordConceptId);

    // Update concept weakness tracking
    await updateConceptWeaknesses(userId, wordConcept.grammar_concepts);

    // Calculate new point total for session
    const totalPointsDeducted = sessionHints * 5;

    res.json({
      success: true,
      pointsDeducted: 5,
      totalHints: sessionHints,
      totalPointsDeducted,
      conceptsToReview: wordConcept.grammar_concepts
    });

  } catch (error) {
    console.error('Hint usage logging failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to update weakness tracking
async function updateConceptWeaknesses(userId, grammarConcepts) {
  for (const concept of grammarConcepts) {
    await db.user_concept_weaknesses.upsert({
      user_id: userId,
      grammar_concept: concept,
      hint_requests: db.literal('hint_requests + 1'),
      last_hint_date: new Date(),
      needs_review: true,
      weakness_score: db.literal('hint_requests / GREATEST(total_exposures, 1)')
    });
  }
}
```

### 2. **Review Queue Generation**
```javascript
// GET /api/review/queue
app.get('/api/review/queue', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get concepts that need review, ordered by priority
    const reviewConcepts = await db.user_concept_weaknesses.findAll({
      where: {
        user_id: userId,
        needs_review: true
      },
      order: [
        ['review_priority', 'ASC'],
        ['weakness_score', 'DESC'],
        ['last_hint_date', 'DESC']
      ],
      limit: 10
    });

    // Generate targeted sentences for these concepts
    const reviewSentences = await generateReviewSentences(userId, reviewConcepts);

    res.json({
      concepts: reviewConcepts,
      sentences: reviewSentences,
      reviewCount: reviewConcepts.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Data Population Strategy

### 1. **Word Concept Mapping**
```javascript
// Script to populate sentence_word_concepts for existing sentences
async function populateWordConcepts() {
  const sentences = await db.sentences.findAll();

  for (const sentence of sentences) {
    const englishWords = sentence.english_text.split(' ');

    for (let i = 0; i < englishWords.length; i++) {
      const word = englishWords[i].toLowerCase().replace(/[.,!?]/, '');
      const conceptData = await analyzeWordConcepts(word, sentence);

      await db.sentence_word_concepts.create({
        sentence_id: sentence.id,
        word_index: i,
        english_word: word,
        spanish_translation: conceptData.translation,
        word_type: conceptData.type,
        grammar_concepts: conceptData.concepts,
        difficulty_level: conceptData.difficulty,
        hint_text: conceptData.hint
      });
    }
  }
}

// AI-powered word analysis
async function analyzeWordConcepts(word, sentence) {
  const prompt = `
    Analyze the word "${word}" in the sentence "${sentence.english_text}".

    Return JSON with:
    - translation: Spanish translation of this word
    - type: grammatical type (verb, noun, adjective, connector, etc.)
    - concepts: array of grammar concepts (present_tense, first_person, etc.)
    - difficulty: 1-9 difficulty level
    - hint: helpful hint text for Spanish learners
  `;

  const analysis = await callOpenAI(prompt);
  return JSON.parse(analysis);
}
```

---

## Implementation Priority

### **Phase 1: Core Hint Tracking (Week 1)**
1. Add database tables
2. Implement click-based hint system
3. Basic points deduction and logging

### **Phase 2: Weakness Analysis (Week 2)**
4. Populate word concept mappings
5. Build weakness tracking algorithms
6. Create review flagging system

### **Phase 3: Review System (Week 3)**
7. Build review queue generation
8. Create targeted review sessions
9. Add spaced repetition scheduling

### **Phase 4: Advanced Analytics (Week 4)**
10. User progress dashboards
11. Concept mastery visualization
12. Adaptive difficulty based on weaknesses

---

This system will provide detailed insight into what each user struggles with and create personalized review sessions to address their specific weaknesses!