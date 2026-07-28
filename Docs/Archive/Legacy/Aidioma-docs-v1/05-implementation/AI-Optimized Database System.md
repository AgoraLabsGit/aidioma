<!--
FILE LOCATION: docs/05-implementation/ai-optimization.md

FOR LOCAL DEVELOPMENT: This document defines a comprehensive database caching system to minimize OpenAI API costs 
for the Spanish learning app. The core problem: expensive AI calls are being made repeatedly for identical 
student translation errors (e.g., missing accent on "café"). 

IMPLEMENTATION OBJECTIVE: Reduce AI API costs by 85-90% through intelligent caching, pre-generation, and 
template-based responses while maintaining high-quality personalized feedback.

KEY STRATEGY: Three-tier system - (1) Pre-generated common responses, (2) Template-based error patterns, 
(3) AI calls only for novel cases. Reference this when implementing translation evaluation endpoints.
-->

# AI-Optimized Database System for Spanish Learning App

## Overview
Minimize AI API costs by pre-generating, caching, and reusing AI responses while maintaining personalized, intelligent feedback.

## Problem Statement
Currently, every student translation triggers an expensive OpenAI API call (~$0.001-0.01), even for common errors like "Bebo cafe cada mañana" (missing accent). With hundreds of students making identical mistakes, we're paying for the same AI response repeatedly.

---

## Database Schema for AI Optimization

### **1. Pre-Generated Sentence Evaluations**
```sql
CREATE TABLE sentence_evaluations (
    id INTEGER PRIMARY KEY,
    sentence_id INTEGER NOT NULL,
    user_translation TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    accuracy_percentage DECIMAL(4,1), -- 95.5% etc.

    -- Pre-generated feedback
    feedback_title VARCHAR(100), -- "¡Excelente! Perfect Translation"
    feedback_message TEXT, -- "The translation is mostly correct but..."
    correct_translations JSON, -- ["Bebo café todas las mañanas", "Tomo café todas las mañanas"]

    -- Error analysis
    error_types JSON, -- ["accent_error", "word_choice"]
    error_details JSON, -- Specific error explanations

    -- Improvements
    improvement_suggestions JSON, -- ["Correct the accent in 'café'", ...]

    -- Scoring
    base_score INTEGER DEFAULT 100,
    point_deductions JSON, -- [{"type": "accent_error", "points": 5}]

    -- Metadata
    generated_by VARCHAR(20) DEFAULT 'AI', -- 'AI', 'human', 'template'
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    INDEX idx_sentence_translation (sentence_id, user_translation(50)),
    INDEX idx_accuracy (accuracy_percentage, is_correct)
);
```

### **2. Grammar Rule Explanations (Reusable)**
```sql
CREATE TABLE grammar_explanations (
    id INTEGER PRIMARY KEY,
    rule_code VARCHAR(30) UNIQUE, -- 'accent_cafe', 'gender_agreement', etc.
    rule_name VARCHAR(100), -- "Accent marks on café"

    explanation_short TEXT, -- "In Spanish, 'café' requires an accent..."
    explanation_detailed TEXT, -- Full grammar explanation

    common_examples JSON, -- ["café vs cafe", "papá vs papa"]
    usage_context VARCHAR(100), -- "food_and_drink", "daily_routine"

    difficulty_level INTEGER, -- 1-9
    error_frequency DECIMAL(4,2), -- How often users make this error

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **3. Error Pattern Templates**
```sql
CREATE TABLE error_templates (
    id INTEGER PRIMARY KEY,
    error_type VARCHAR(30), -- 'accent_error', 'gender_mismatch', 'word_choice'
    error_subtype VARCHAR(50), -- 'cafe_accent', 'masculine_feminine'

    -- Template feedback (with placeholders)
    feedback_template TEXT, -- "The word '{word}' should be '{correct_word}' with an accent..."
    improvement_template TEXT, -- "Correct the accent in '{word}' to '{correct_word}'"

    -- Associated grammar rule
    grammar_rule_id INTEGER,

    severity VARCHAR(10), -- 'minor', 'moderate', 'major'
    point_deduction INTEGER DEFAULT 5,

    FOREIGN KEY (grammar_rule_id) REFERENCES grammar_explanations(id)
);
```

### **4. AI Response Cache**
```sql
CREATE TABLE ai_response_cache (
    id INTEGER PRIMARY KEY,
    request_hash VARCHAR(64) UNIQUE, -- MD5 of sentence + translation

    -- Request details
    sentence_id INTEGER,
    user_translation TEXT,

    -- AI response (stored for reuse)
    ai_response JSON, -- Full AI response object
    evaluation_data JSON, -- Parsed evaluation details

    -- Usage tracking
    cache_hits INTEGER DEFAULT 1,
    first_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    INDEX idx_request_hash (request_hash),
    INDEX idx_last_used (last_used)
);
```

### **5. Translation Variations (Common Alternatives)**
```sql
CREATE TABLE translation_variations (
    id INTEGER PRIMARY KEY,
    sentence_id INTEGER NOT NULL,

    spanish_variation TEXT NOT NULL,
    accuracy_score DECIMAL(4,1), -- 100.0, 95.5, 80.0, etc.
    is_preferred BOOLEAN DEFAULT FALSE,

    variation_type VARCHAR(20), -- 'perfect', 'good', 'acceptable', 'incorrect'
    notes TEXT, -- "More commonly used" or "Grammatically correct but less natural"

    -- Common error tracking
    is_common_error BOOLEAN DEFAULT FALSE,
    error_category VARCHAR(30), -- 'accent', 'gender', 'word_choice', 'tense'

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sentence_id) REFERENCES sentences(id),
    INDEX idx_sentence_accuracy (sentence_id, accuracy_score)
);
```

---

## AI Optimization Strategy

### **Phase 1: Pre-Generation (Batch Processing)**
```javascript
// Generate evaluations for common translation attempts
async function preGenerateCommonTranslations() {
  const sentences = await db.sentences.findAll();

  for (const sentence of sentences) {
    // Generate variations for each sentence
    const commonVariations = await generateTranslationVariations(sentence);

    for (const variation of commonVariations) {
      // Only call AI if not already cached
      const cached = await checkCache(sentence.id, variation);

      if (!cached) {
        const evaluation = await callAIForEvaluation(sentence, variation);
        await storeEvaluation(evaluation);

        // Rate limit: Wait between calls
        await sleep(1000);
      }
    }
  }
}

async function generateTranslationVariations(sentence) {
  // Create variations based on common errors:
  return [
    generatePerfectTranslation(sentence),
    generateAccentErrors(sentence),
    generateGenderErrors(sentence),
    generateWordChoiceVariations(sentence),
    generateTenseErrors(sentence)
  ];
}
```

### **Phase 2: Smart Caching System**
```javascript
async function evaluateTranslation(sentenceId, userTranslation) {
  // 1. Check exact match cache
  const exactMatch = await findExactEvaluation(sentenceId, userTranslation);
  if (exactMatch) {
    await updateUsageCount(exactMatch.id);
    return exactMatch;
  }

  // 2. Check fuzzy match (handle minor typos)
  const fuzzyMatch = await findFuzzyMatch(sentenceId, userTranslation);
  if (fuzzyMatch && similarity > 0.95) {
    return adaptFuzzyMatch(fuzzyMatch, userTranslation);
  }

  // 3. Check if we can build response from templates
  const templateResponse = await buildFromTemplates(sentenceId, userTranslation);
  if (templateResponse) {
    await storeNewEvaluation(templateResponse);
    return templateResponse;
  }

  // 4. Only now call AI (expensive!)
  const aiResponse = await callAIForEvaluation(sentenceId, userTranslation);
  await cacheAIResponse(aiResponse);

  return aiResponse;
}
```

### **Phase 3: Template-Based Feedback**
```javascript
async function buildFromTemplates(sentenceId, userTranslation) {
  const sentence = await db.sentences.findByPk(sentenceId);
  const correctTranslations = await getCorrectTranslations(sentenceId);

  // Analyze specific errors
  const errors = await analyzeErrors(userTranslation, correctTranslations);

  if (errors.length === 0) {
    return buildPerfectResponse();
  }

  // Build response from error templates
  let feedback = [];
  let totalDeduction = 0;

  for (const error of errors) {
    const template = await getErrorTemplate(error.type, error.subtype);

    feedback.push({
      message: fillTemplate(template.feedback_template, error.data),
      improvement: fillTemplate(template.improvement_template, error.data),
      grammarRule: await getGrammarExplanation(template.grammar_rule_id)
    });

    totalDeduction += template.point_deduction;
  }

  return {
    isCorrect: errors.length === 0,
    accuracyPercentage: Math.max(60, 100 - totalDeduction),
    feedback: combineFeedback(feedback),
    improvements: extractImprovements(feedback),
    score: Math.max(60, 100 - totalDeduction)
  };
}
```

---

## Cost Savings Analysis

### **Current System (AI-Heavy)**
```
Every translation check = 1 AI API call
Cost per call: ~$0.001-0.01
100 users × 20 translations/day = 2,000 API calls/day
Monthly cost: $60-600
```

### **Optimized System (Cache-Heavy)**
```
Pre-generate 1,000 common variations = 1,000 AI calls (one-time)
Cache hit rate: 85-95%
Daily AI calls: 100-300 (instead of 2,000)
Monthly cost: $9-90 (85-90% savings!)
```

---

## Implementation Steps

### **Week 1: Database Setup**
1. Create new tables for caching and templates
2. Migrate existing data
3. Build caching infrastructure

### **Week 2: Pre-Generation**
4. Generate common translation variations
5. Create error pattern templates
6. Build grammar rule explanations

### **Week 3: Smart Evaluation**
7. Implement cache-first evaluation
8. Build template-based responses
9. Add fuzzy matching for typos

### **Week 4: Optimization**
10. Monitor cache hit rates
11. Identify gaps in coverage
12. Fine-tune AI usage

---

## Example: Coffee Sentence Optimization

### **Pre-Generated Data for "I drink coffee every morning"**
```json
{
  "sentence_id": 1,
  "variations": [
    {
      "translation": "Bebo café cada mañana",
      "accuracy": 100.0,
      "feedback": "¡Perfecto! Excellent translation",
      "errors": []
    },
    {
      "translation": "Bebo cafe cada mañana", 
      "accuracy": 95.0,
      "feedback": "Mostly correct but missing accent on 'café'",
      "errors": [{"type": "accent_error", "word": "cafe", "correct": "café"}]
    },
    {
      "translation": "Bebo café todos los mañanas",
      "accuracy": 80.0, 
      "feedback": "Good attempt but 'todos los mañanas' should be 'todas las mañanas'",
      "errors": [{"type": "gender_agreement", "phrase": "todos los mañanas"}]
    }
  ]
}
```

### **Template Response Building**
```javascript
// For "Bebo cafe cada mañana" (missing accent)
const response = buildFromTemplate({
  errorType: 'accent_error',
  word: 'cafe',
  correctWord: 'café',
  template: "The word '{word}' should be '{correctWord}' with an accent on the 'é'"
});

// Result: Matches your screenshot exactly, no AI call needed!
```

---

## Benefits

### **💰 Cost Reduction**
- **85-90% fewer AI calls** for common translations
- **Predictable costs** through pre-generation
- **Instant responses** from cache (better UX)

### **🎯 Quality Improvement**
- **Consistent feedback** for similar errors
- **Comprehensive coverage** of common mistakes
- **Detailed grammar explanations** always available

### **⚡ Performance Gains**
- **Sub-100ms responses** from database vs 1-3s from AI
- **Offline capability** for cached content
- **Reduced server load** and API dependencies

This system transforms your AI usage from "call for every evaluation" to "call only for novel cases" - massive cost savings with better performance! 🚀