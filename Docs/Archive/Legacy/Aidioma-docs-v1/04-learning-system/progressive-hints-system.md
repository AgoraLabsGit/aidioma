<!--
FILE LOCATION: docs/04-learning-system/progressive-hints-system.md

FOR LOCAL DEVELOPMENT: This document defines the comprehensive hint system for the Spanish learning app, including 
progressive verb hints (3-level) and multiple choice hints (non-verbs), plus the severe 0-10 point scoring 
system that drives learning behavior.

IMPLEMENTATION OBJECTIVE: Create an educational hint system that teaches Spanish grammar processes rather 
than just providing answers, while using severe point penalties to encourage independence and strategic 
thinking.

KEY STRATEGY: Verbs get progressive scaffolding (infinitive → conjugation table → answer) with increasing 
costs. All other word types get targeted multiple choice practice. Severe scoring (0-10 points) with 
meaningful penalties transforms hints from "easy answers" into "strategic learning investments."

CRITICAL FEATURES: 
- Verb hints: -1.0, -1.5, -2.0 points for progressive levels
- Non-verb hints: -1.5 points for multiple choice
- "1 point for trying" minimum score removes fear of failure
- Real-time cost warnings before hint usage
Reference this when implementing hint components and scoring logic.
-->

# Progressive Hints System - Spanish Learning App

## Overview
A multi-level hint system that scaffolds learning by revealing grammatical information progressively, teaching students the thinking process rather than just giving answers.

## Progressive Hint Categories

### **1. Verbs (3-Level System)**

#### Level 1: Infinitive Form (2 points)
- **Show**: Root verb in infinitive
- **Example**: "I speak" → **"hablar"** (to speak)
- **Purpose**: Helps identify the base verb

#### Level 2: Conjugation Pattern (3 points) 
- **Show**: Pattern table + person identification (regular vs irregular)

**For Regular Verbs:**
```
Present tense -AR verbs:
yo: -o    nosotros: -amos
tú: -as   vosotros: -áis  
él: -a    ellos: -an

"I" = yo (first person singular)
```

**For Irregular Verbs:**
```
SER (to be) - Irregular:
yo: soy    nosotros: somos
tú: eres   vosotros: sois
él: es     ellos: son

"I" = yo → soy (completely irregular)
```

**For Stem-Changing Verbs:**
```
PODER (o→ue stem change):
yo: puedo   nosotros: podemos  
tú: puedes  vosotros: podéis
él: puede   ellos: pueden

Stem changes: o→ue (except nosotros/vosotros)
```
- **Purpose**: Teaches conjugation rules (regular) or irregular patterns

#### Level 3: Complete Answer (5 points)
- **Show**: Final conjugated form
- **Examples**: **"hablo"** (regular), **"soy"** (irregular), **"puedo"** (stem-changing)
- **Purpose**: Provides answer but with maximum point cost

### **2. Nouns (Multiple Choice - 3 points)**

**Single interactive hint testing gender, number, and vocabulary:**

#### Example: "coffee" in "I drink coffee every morning"
```
Choose the correct translation:
A) el café     ← CORRECT (masculine singular)
B) la café     ← Wrong gender (feminine)
C) los cafés   ← Wrong number (plural)
D) la comida   ← Wrong word (food)
```

**Learning Focus:**
- **Gender recognition** (el vs la)
- **Number agreement** (singular vs plural context)
- **Vocabulary accuracy** (correct word vs distractors)

### **3. Adjectives (Multiple Choice - 3 points)**

**Single interactive hint testing agreement and vocabulary:**

#### Example: "good" in "good coffee" (masculine singular)
```
Choose the correct form:
A) buena      ← Wrong gender (feminine)
B) bueno      ← CORRECT (masculine singular)
C) buenos     ← Wrong number (plural)
D) excelente  ← Different word (excellent)
```

**Learning Focus:**
- **Gender agreement** with the noun it modifies
- **Number agreement** (singular vs plural)
- **Word choice** (correct adjective vs synonyms)

### **4. Connectors (Multiple Choice - 3 points)**

**Single interactive hint testing connector choice and usage:**

#### Example: "but" in "I like it, but it's expensive"
```
Choose the best connector:
A) pero       ← CORRECT (general contrast)
B) sino       ← Wrong usage (only after negatives)
C) aunque     ← Wrong meaning (although/even though)
D) y          ← Wrong function (addition, not contrast)
```

**Learning Focus:**
- **Connector function** (contrast vs addition vs time)
- **Usage context** (pero vs sino nuances)
- **Register appropriateness** (formal vs informal)

### **5. Prepositions (Multiple Choice - 3 points)**

**Single interactive hint testing preposition selection:**

#### Example: "for" in "working for 3 hours"
```
Choose the correct preposition:
A) por        ← CORRECT (duration of time)
B) para       ← Wrong usage (purpose/destination)
C) de         ← Wrong function (possession/origin)
D) durante    ← Possible but less common
```

**Learning Focus:**
- **Por vs Para** distinction (the classic Spanish challenge)
- **Functional meaning** (time vs purpose vs location)
- **Context appropriateness** (duration vs destination)

---

## Database Schema

### **Progressive Hint Definitions**
```sql
CREATE TABLE progressive_hint_definitions (
    id INTEGER PRIMARY KEY,
    sentence_id INTEGER NOT NULL,
    word_index INTEGER NOT NULL,
    english_word VARCHAR(50) NOT NULL,
    word_type VARCHAR(20) NOT NULL, -- 'verb', 'noun', 'adjective', 'connector'

    -- Level 1 Hint
    hint_level_1_text VARCHAR(200) NOT NULL,
    hint_level_1_points INTEGER DEFAULT 2,
    hint_level_1_type VARCHAR(50), -- 'infinitive', 'gender', 'base_form', 'category'

    -- Level 2 Hint  
    hint_level_2_text TEXT,
    hint_level_2_points INTEGER DEFAULT 3,
    hint_level_2_type VARCHAR(50), -- 'conjugation_table', 'agreement_rules', 'article'

    -- Level 3 Hint
    hint_level_3_text VARCHAR(200),
    hint_level_3_points INTEGER DEFAULT 5,
    hint_level_3_type VARCHAR(50), -- 'complete_answer', 'context_example'

    -- Metadata
    grammar_concepts JSON, -- ['present_tense', 'first_person', 'regular_verb']
    difficulty_level INTEGER DEFAULT 1,
    max_hint_levels INTEGER DEFAULT 3,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    INDEX idx_sentence_word (sentence_id, word_index)
);
```

### **Simplified Hint Usage Tracking**
```sql
CREATE TABLE user_hint_usage (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    sentence_id INTEGER NOT NULL,
    hint_definition_id INTEGER NOT NULL,
    session_id VARCHAR(50) NOT NULL,

    -- VERB tracking (progressive)
    verb_level_reached INTEGER, -- 1, 2, or 3 (NULL for non-verbs)
    verb_total_points INTEGER, -- Total points used across all levels
    verb_levels_used JSON, -- [1, 2] or [1, 2, 3]

    -- NON-VERB tracking (multiple choice)
    mc_selected_answer VARCHAR(100), -- What they chose
    mc_correct_answer VARCHAR(100), -- What was correct
    mc_is_correct BOOLEAN, -- Did they get it right
    mc_points_used INTEGER DEFAULT 3, -- Always 3 for multiple choice

    -- Universal tracking
    word_type VARCHAR(20) NOT NULL, -- 'verb', 'noun', 'adjective', etc.
    attempt_time_ms INTEGER, -- How long they took
    got_final_answer_correct BOOLEAN, -- After hints, did they translate correctly

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hint_definition_id) REFERENCES progressive_hint_definitions(id),
    INDEX idx_user_learning (user_id, word_type, mc_is_correct),
    INDEX idx_verb_progression (user_id, verb_level_reached)
);
```

---

## UI Implementation

### **Severe Scoring UI Implementation**

#### **Real-Time Hint Cost Warning**
```javascript
class SevereScoreTracker {
  constructor(initialScore = 10.0) {
    this.currentScore = initialScore;
    this.hintsUsed = [];
  }

  async requestHint(hintType, hintLevel = null) {
    const cost = this.calculateHintCost(hintType, hintLevel);
    const projectedScore = Math.max(1, this.currentScore - cost);

    // Warn user before applying hint
    const confirmUse = await this.showHintCostWarning(cost, projectedScore);

    if (confirmUse) {
      this.applyHintCost(cost, hintType, hintLevel);
      return true;
    }
    return false;
  }

  calculateHintCost(hintType, hintLevel) {
    if (hintType === 'verb') {
      const costs = { 1: 1.0, 2: 1.5, 3: 2.0 };
      return costs[hintLevel];
    } else {
      return 1.5; // Multiple choice cost
    }
  }

  showHintCostWarning(cost, projectedScore) {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'hint-cost-warning-modal';
      modal.innerHTML = `
        <div class="warning-content">
          <h3>⚠️ Hint Cost Warning</h3>
          <p>This hint costs <strong>${cost} points</strong></p>
          <p>Your score will drop from <span class="current-score">${this.currentScore}</span> to <span class="projected-score">${projectedScore}</span></p>

          <div class="score-impact ${this.getScoreClass(projectedScore)}">
            ${this.getScoreMessage(projectedScore)}
          </div>

          <div class="warning-buttons">
            <button class="btn-cancel" onclick="resolve(false)">
              Think More First
            </button>
            <button class="btn-use-hint" onclick="resolve(true)">
              Use Hint (-${cost} pts)
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
    });
  }

  applyHintCost(cost, hintType, hintLevel) {
    this.currentScore = Math.max(1, this.currentScore - cost);
    this.hintsUsed.push({ type: hintType, level: hintLevel, cost });

    this.updateScoreDisplay();
    this.showPointsDeductionAnimation(cost);
  }

  updateScoreDisplay() {
    const scoreElement = document.querySelector('.score-display');
    scoreElement.textContent = `${this.currentScore.toFixed(1)} / 10`;
    scoreElement.className = `score-display ${this.getScoreClass(this.currentScore)}`;
  }

  getScoreClass(score) {
    if (score >= 9) return 'score-excellent';
    if (score >= 7) return 'score-good';  
    if (score >= 5) return 'score-fair';
    if (score >= 2) return 'score-struggling';
    return 'score-participation';
  }

  getScoreMessage(score) {
    if (score >= 9) return '¡Excelente! Nearly perfect!';
    if (score >= 7) return 'Good work! Try fewer hints next time.';
    if (score >= 5) return 'Making progress. Focus on independence.';
    if (score >= 2) return 'Keep practicing. Review the basics.';
    return 'Great effort! Try again when ready.';
  }

  showPointsDeductionAnimation(pointsLost) {
    const floatingText = document.createElement('div');
    floatingText.className = 'floating-points-lost';
    floatingText.textContent = `-${pointsLost} pts`;

    const scoreDisplay = document.querySelector('.score-display');
    scoreDisplay.appendChild(floatingText);

    // Animate upward and fade out
    floatingText.animate([
      { transform: 'translateY(0)', opacity: 1, color: '#EF4444' },
      { transform: 'translateY(-40px)', opacity: 0, color: '#EF4444' }
    ], {
      duration: 2000,
      easing: 'ease-out'
    }).onfinish = () => floatingText.remove();
  }
}
```

#### **Enhanced CSS for Severe Scoring**
```css
/* Hint cost warning modal */
.hint-cost-warning-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.warning-content {
  background: var(--background-elevated);
  border: 2px solid var(--warning);
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.warning-content h3 {
  color: var(--warning);
  margin: 0 0 16px 0;
  font-size: 18px;
}

.current-score {
  color: var(--success);
  font-weight: 600;
}

.projected-score {
  color: var(--error);
  font-weight: 600;
  font-size: 1.1em;
}

.score-impact {
  margin: 16px 0;
  padding: 12px;
  border-radius: 8px;
  font-weight: 500;
}

.warning-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-cancel {
  background: var(--background-surface);
  border: 2px solid var(--border-default);
  color: var(--text-secondary);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
}

.btn-use-hint {
  background: var(--warning-bg);
  border: 2px solid var(--warning);
  color: var(--warning);
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  font-weight: 600;
}

/* Score display classes */
.score-excellent {
  color: var(--success);
  background: var(--success-bg);
  border-color: var(--success);
}

.score-good {
  color: var(--warning);
  background: var(--warning-bg);
  border-color: var(--warning);
}

.score-fair {
  color: #EF4444;
  background: var(--error-bg);
  border-color: #EF4444;
}

.score-struggling {
  color: #8B5CF6;
  background: #F3E8FF;
  border-color: #8B5CF6;
}

.score-participation {
  color: var(--text-muted);
  background: var(--background-surface);
  border-color: var(--border-default);
}

/* Floating points animation */
.floating-points-lost {
  position: absolute;
  top: -10px;
  right: -10px;
  font-weight: 600;
  font-size: 14px;
  pointer-events: none;
}
```
```

### **2. Enhanced CSS Styling**
```css
/* Progressive hint words */
.progressive-hint-word {
  position: relative;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.progressive-hint-word:hover {
  border-color: var(--primary);
  background-color: var(--background-interactive);
}

/* Different visual states for each hint level */
.progressive-hint-word.level-1 {
  background-color: #FEF3C7; /* Light yellow */
  color: #92400E;
  border-color: #F59E0B;
}

.progressive-hint-word.level-2 {
  background-color: #FECACA; /* Light orange */  
  color: #DC2626;
  border-color: #EF4444;
}

.progressive-hint-word.level-3 {
  background-color: #F3E8FF; /* Light purple */
  color: #7C3AED;
  border-color: #8B5CF6;
  font-weight: 600;
}

/* Hint level indicator */
.hint-level-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

/* Conjugation table styling */
.conjugation-table {
  background: var(--background-elevated);
  border: 2px solid var(--warning);
  border-radius: 12px;
  padding: 16px;
  min-width: 300px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.conjugation-table h4 {
  color: var(--warning);
  margin: 0 0 12px 0;
  text-align: center;
}

.conjugation-table table {
  width: 100%;
  border-collapse: collapse;
}

.conjugation-table td {
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  background: var(--background-surface);
  font-family: var(--font-mono);
}

.person-hint {
  margin: 12px 0 0 0;
  padding: 8px;
  background: var(--warning-bg);
  border-radius: 6px;
  color: var(--warning);
  text-align: center;
  font-weight: 500;
}

/* Progressive hint containers */
.progressive-hint-container {
  position: fixed;
  z-index: 1000;
  animation: hintAppear 0.3s ease-out;
}

@keyframes hintAppear {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Hint level styling */
.hint-level-1 .hint-label {
  color: var(--warning);
}

.hint-level-2 .hint-label {
  color: var(--error);
}

.hint-level-3 .hint-label {
  color: #8B5CF6;
}
```

---

## Backend API Implementation

### **Progressive Hints Endpoint**
```javascript
// POST /api/hints/progressive
app.post('/api/hints/progressive', authenticateUser, async (req, res) => {
  try {
    const {
      sessionId,
      hintDefinitionId,
      levelReached,
      totalPointsDeducted,
      levelsUsed,
      timeBetweenHints
    } = req.body;

    const userId = req.user.id;

    // Log the progressive hint usage
    await db.user_progressive_hint_usage.create({
      user_id: userId,
      sentence_id: req.body.sentenceId,
      hint_definition_id: hintDefinitionId,
      session_id: sessionId,
      hint_level_reached: levelReached,
      total_points_deducted: totalPointsDeducted,
      levels_used: JSON.stringify(levelsUsed),
      time_between_hints: JSON.stringify(timeBetweenHints)
    });

    // Update user's session points
    await updateSessionPoints(userId, sessionId, -totalPointsDeducted);

    // Track concept weaknesses based on level needed
    await updateConceptWeakness(userId, hintDefinitionId, levelReached);

    res.json({
      success: true,
      pointsDeducted: totalPointsDeducted,
      levelReached: levelReached
    });

  } catch (error) {
    console.error('Progressive hint logging failed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to assess learning difficulty
async function updateConceptWeakness(userId, hintDefinitionId, levelReached) {
  const hintDef = await db.progressive_hint_definitions.findByPk(hintDefinitionId);

  // Higher hint levels indicate more difficulty
  const difficultyScore = levelReached / hintDef.max_hint_levels;

  for (const concept of hintDef.grammar_concepts) {
    await db.user_concept_weaknesses.upsert({
      user_id: userId,
      grammar_concept: concept,
      hint_requests: db.literal('hint_requests + 1'),
      weakness_score: db.literal(`(weakness_score + ${difficultyScore}) / 2`),
      needs_review: difficultyScore > 0.5, // Need review if used > 50% of hints
      last_hint_date: new Date()
    });
  }
}
```

---

## Data Population Examples

### **Example 1: Regular Verb - "drink"**
```json
{
  "sentence_id": 1,
  "word_index": 1,
  "english_word": "drink",
  "word_type": "verb",

  "verb_level_1_text": "beber",
  "verb_level_1_points": 2,

  "verb_level_2_text": "{\"tense\": \"Present\", \"verb_type\": \"-ER regular\", \"endings\": {\"yo\": \"-o\", \"tu\": \"-es\", \"el\": \"-e\", \"nosotros\": \"-emos\", \"vosotros\": \"-éis\", \"ellos\": \"-en\"}, \"english_subject\": \"I\", \"spanish_subject\": \"yo\"}",
  "verb_level_2_points": 3,
  "verb_irregularity_type": "regular",

  "verb_level_3_text": "bebo",
  "verb_level_3_points": 5,

  "grammar_concepts": ["present_tense", "first_person_singular", "regular_er_verb"]
}
```

### **Example 2: Irregular Verb - "am/is"**
```json
{
  "sentence_id": 2,
  "word_index": 0,
  "english_word": "am",
  "word_type": "verb",

  "verb_level_1_text": "ser/estar",
  "verb_level_1_points": 2,

  "verb_level_2_text": "{\"tense\": \"Present\", \"verb_type\": \"SER (irregular)\", \"endings\": {\"yo\": \"soy\", \"tu\": \"eres\", \"el\": \"es\", \"nosotros\": \"somos\", \"vosotros\": \"sois\", \"ellos\": \"son\"}, \"english_subject\": \"I\", \"spanish_subject\": \"yo\", \"irregularity_note\": \"SER is completely irregular - memorize each form\"}",
  "verb_level_2_points": 3,
  "verb_irregularity_type": "irregular",

  "verb_level_3_text": "soy",
  "verb_level_3_points": 5,

  "grammar_concepts": ["present_tense", "first_person_singular", "ser_irregular", "permanent_characteristics"]
}
```

### **Example 3: Stem-Changing Verb - "can"**
```json
{
  "sentence_id": 3,
  "word_index": 2,
  "english_word": "can",
  "word_type": "verb",

  "verb_level_1_text": "poder",
  "verb_level_1_points": 2,

  "verb_level_2_text": "{\"tense\": \"Present\", \"verb_type\": \"PODER (o→ue stem change)\", \"endings\": {\"yo\": \"puedo\", \"tu\": \"puedes\", \"el\": \"puede\", \"nosotros\": \"podemos\", \"vosotros\": \"podéis\", \"ellos\": \"pueden\"}, \"english_subject\": \"I\", \"spanish_subject\": \"yo\", \"irregularity_note\": \"Stem changes o→ue except for nosotros/vosotros\"}",
  "verb_level_2_points": 3,
  "verb_irregularity_type": "stem_changing",

  "verb_level_3_text": "puedo",
  "verb_level_3_points": 5,

  "grammar_concepts": ["present_tense", "first_person_singular", "stem_changing_verb", "o_to_ue"]
}
```

### **Example 4: Noun Multiple Choice - "coffee"**
```json
{
  "sentence_id": 1,
  "word_index": 2,
  "english_word": "coffee",
  "word_type": "noun",

  "mc_question_text": "Choose the correct translation:",
  "mc_options": ["el café", "la café", "los cafés", "la comida"],
  "mc_correct_answer": "el café",
  "mc_explanations": {
    "el café": "¡Correcto! Coffee is masculine singular",
    "la café": "Wrong gender - café is masculine (el café)",
    "los cafés": "Wrong number - context needs singular, not plural",
    "la comida": "Wrong word - this means 'food', not 'coffee'"
  },
  "mc_points": 3,

  "learning_focuses": ["gender_recognition", "vocabulary_accuracy"],
  "grammar_concepts": ["masculine_noun", "singular_form"]
}
```

### **Example 5: Preposition Multiple Choice - "for"**
```json
{
  "sentence_id": 4,
  "word_index": 3,
  "english_word": "for", 
  "word_type": "preposition",

  "mc_question_text": "Choose the correct preposition for duration:",
  "mc_options": ["por", "para", "de", "durante"],
  "mc_correct_answer": "por",
  "mc_explanations": {
    "por": "¡Correcto! Use 'por' for duration of time",
    "para": "Wrong - 'para' is for purpose/destination, not duration",
    "de": "Wrong - 'de' shows possession/origin, not time",
    "durante": "Possible, but 'por' is more commonly used for time periods"
  },
  "mc_points": 3,

  "learning_focuses": ["por_vs_para", "time_expressions"],
  "grammar_concepts": ["duration_preposition", "por_para_distinction"]
}
```

---

## Enhanced Learning Analytics with Severe Scoring

### **Psychological Impact & Behavior Change**

#### **🎯 Forces Strategic Thinking**
- **"That hint will cost me 1.5 points - do I really need it?"**
- **"Maybe I can figure out the conjugation myself"**
- **Students become much more selective about hint usage**

#### **📚 Rewards True Independence**
- **9-10 points feels truly earned and meaningful**
- **6-7 points signals "you're learning but need to push yourself"**
- **2-4 points signals "time to review fundamentals"**

#### **💪 Builds Confidence Gradually**
- **Week 1**: Student averaging 3-4 points (lots of hints)
- **Week 4**: Student averaging 7-8 points (strategic hints)
- **Week 8**: Student averaging 9-10 points (independent)

### **Progress Tracking & Analytics**

#### **Independence Metrics**
```javascript
function calculateProgressMetrics(userHistory) {
  return {
    averageScore: calculateAverage(userHistory.scores),
    independenceRate: userHistory.sentencesWithoutHints / userHistory.totalSentences,
    hintDependency: calculateHintTrend(userHistory), // Increasing or decreasing
    struggleAreas: identifyLowScorePatterns(userHistory),
    improvementRate: calculateScoreImprovement(userHistory),
    severePenaltyImpact: measureBehaviorChange(userHistory) // Before/after severe scoring
  };
}
```

#### **Adaptive Difficulty Based on Severe Scores**
```javascript
function selectNextSentence(userMetrics) {
  if (userMetrics.averageScore >= 8.5) {
    // High scorers get challenging content
    return getSentence({ 
      difficulty: 'increase',
      message: 'Ready for a challenge!'
    });
  } else if (userMetrics.averageScore <= 4.0) {
    // Low scorers get foundational review
    return getSentence({ 
      difficulty: 'review_basics',
      message: 'Let\'s strengthen the fundamentals'
    });
  } else if (userMetrics.hintDependency === 'increasing') {
    // Becoming too hint-dependent
    return getSentence({ 
      difficulty: 'hint_restriction',
      message: 'Try this one without hints!'
    });
  } else {
    return getSentence({ difficulty: 'current_level' });
  }
}
```

### **Learning Insights by Score Range**

#### **9-10 Points: Independent Mastery**
- **Behavior**: Rarely uses hints, strong foundational knowledge
- **Next Steps**: Increase difficulty, introduce new grammar concepts
- **Message**: "¡Excelente! You're ready for advanced content"

#### **7-8 Points: Strategic Learning**
- **Behavior**: Uses Level 1 hints strategically, avoids expensive hints
- **Next Steps**: Encourage full independence on current level
- **Message**: "Great strategy! Try the next one without hints"

#### **5-6 Points: Moderate Dependency**
- **Behavior**: Uses multiple hints but gets answers correct
- **Next Steps**: Focus on independence building, review fundamentals
- **Message**: "You're learning! Try to use fewer hints next time"

#### **3-4 Points: High Dependency**
- **Behavior**: Uses most/all available hints for each sentence
- **Next Steps**: Structured review, easier content, confidence building
- **Message**: "Keep practicing! The basics are getting stronger"

#### **1-2 Points: Participation Credit**
- **Behavior**: Wrong answers but showing effort
- **Next Steps**: Fundamental review, possibly easier proficiency level
- **Message**: "Great effort! Let's review some basics together"

### **Session Summary Analytics**
```javascript
function generateSessionSummary(sessionData) {
  return {
    totalSentences: sessionData.sentences.length,
    averageScore: calculateAverage(sessionData.scores),
    hintsUsed: sessionData.totalHints,
    independentSentences: sessionData.scores.filter(s => s === 10).length,
    mostCostlyHints: identifyExpensiveHints(sessionData),
    improvementTrend: compareToRecentSessions(sessionData),
    nextRecommendation: generateRecommendation(sessionData)
  };
}

// Example session summary
{
  "message": "Session Complete!",
  "averageScore": 7.2,
  "breakdown": {
    "independent": 2, // sentences with 10 points
    "strategic": 3,   // sentences with 8-9 points  
    "dependent": 1    // sentences with < 7 points
  },
  "hintCosts": {
    "totalPoints": 8.5,
    "mostExpensive": "verb Level 3 hints (4 points lost)"
  },
  "recommendation": "Try completing more verbs with just Level 1-2 hints!"
}
```

This progressive system transforms hints from "cheating" into a **guided learning experience** that teaches the thinking process behind Spanish grammar!