<!--
FILE LOCATION: docs/04-learning-system/scoring-system.md

FOR LOCAL DEVELOPMENT: This document defines the dual scoring system for the Spanish learning app: severe 1-10 points per sentence response to drive learning behavior, and 1-100 scale for overall user performance tracking.

IMPLEMENTATION OBJECTIVE: Create meaningful per-sentence scoring (1-10) that rewards independence and penalizes hint dependency, while maintaining broader performance tracking (1-100) for user progress analytics and proficiency assessment.

KEY STRATEGY: Severe sentence-level penalties (1-10 points) force strategic thinking about hint usage, while overall performance metrics (1-100) provide comprehensive progress tracking and adaptive difficulty adjustment.

CRITICAL FEATURES:
- Individual sentences: 1-10 point scale with severe hint penalties
- Overall performance: 1-100 scale for proficiency tracking and analytics
- "1 point for trying" minimum for sentence attempts
- AI evaluation with cost optimization
- Dual-scale analytics for behavior and progress

Reference this when implementing translation evaluation endpoints, scoring calculations, and user progress tracking systems.
-->

# Spanish Learning App - Dual Scoring System

## Overview
A dual-scale scoring system combining severe per-sentence scoring (1-10 points) to drive learning behavior with comprehensive overall performance tracking (1-100 scale) for user progress analytics.

---

## Individual Sentence Scoring (1-10 Points)

### **Severe Scoring Philosophy**
```
10 points = Perfect translation, no hints used
8-9 points = Correct translation, minimal strategic hints  
6-7 points = Correct translation, moderate hint usage
4-5 points = Correct translation, heavy reliance on hints
2-3 points = Incorrect translation, but reasonable attempt
1 point = Completely wrong, but submitted something (participation credit)
```

### **Core Principle: "1 Point for Trying"**
Students never receive 0 points on individual sentences if they submit any reasonable attempt, removing fear of failure while incentivizing independence.

---

## Overall User Performance (1-100 Scale)

### **Comprehensive Performance Tracking**
```
90-100 = Advanced proficiency, consistent high performance
80-89 = Intermediate proficiency, good accuracy with minimal hints
70-79 = Developing proficiency, moderate hint dependency
60-69 = Beginner proficiency, learning fundamentals
50-59 = Struggling, needs foundational review
Below 50 = Requires significant support and easier content
```

### **Performance Calculation**
```javascript
function calculateOverallPerformance(userHistory) {
  const factors = {
    averageSentenceScore: 0.4,    // 40% - Recent sentence performance (1-10 scale)
    independenceRate: 0.3,        // 30% - Percentage of sentences without hints
    improvementTrend: 0.2,        // 20% - Score improvement over time
    conceptMastery: 0.1           // 10% - Grammar concept understanding
  };

  const overallScore = (
    (averageSentenceScore / 10 * 100) * factors.averageSentenceScore +
    independenceRate * 100 * factors.independenceRate +
    improvementTrend * 100 * factors.improvementTrend +
    conceptMastery * 100 * factors.conceptMastery
  );

  return Math.round(Math.max(1, Math.min(100, overallScore)));
}
```

---

## Severe Hint Penalties

### **Progressive Verb Hints**
- **Level 1** (infinitive): **-1.0 point**
- **Level 2** (conjugation table): **-1.5 points** 
- **Level 3** (final answer): **-2.0 points**
- **Total if all used**: **-4.5 points** (nearly half the maximum score)

### **Non-Verb Multiple Choice Hints**
- **Multiple Choice**: **-1.5 points** each
- **Rationale**: Significant penalty for getting targeted practice plus the answer

### **Penalty Impact Examples**
```
Perfect student (no hints): 10 points
Strategic user (1 Level 1 hint): 9 points  
Moderate dependency (2-3 hints): 6-7 points
Heavy dependency (5+ hints): 2-4 points
```

---

## AI-Powered Evaluation

### **Base Score Calculation (Before Hint Penalties)**
- **Semantic accuracy**: Does the translation convey the correct meaning?
- **Grammar correctness**: Proper verb conjugation, gender agreement, etc.
- **Contextual appropriateness**: Natural Spanish usage
- **Completeness**: All elements of original sentence translated

### **AI Evaluation Factors**
```javascript
const baseScoreFactors = {
  semanticAccuracy: 0.4,      // 40% weight - meaning preservation
  grammarCorrectness: 0.3,    // 30% weight - technical accuracy  
  contextualFit: 0.2,         // 20% weight - natural usage
  completeness: 0.1           // 10% weight - nothing missing
};
```

### **Score Calculation Process**
```javascript
function calculateFinalScore(translation, hintsUsed) {
  // Step 1: AI evaluates base quality (0-10)
  const baseScore = await evaluateTranslationQuality(translation);

  // Step 2: Apply severe hint penalties
  const hintPenalties = calculateHintPenalties(hintsUsed);

  // Step 3: Calculate final score (minimum 1 if attempt made)
  const finalScore = Math.max(1, baseScore - hintPenalties);

  return {
    baseScore,
    hintPenalties,
    finalScore,
    breakdown: getScoreBreakdown(baseScore, hintPenalties)
  };
}
```

---

## Adaptive Scoring by Proficiency Level

### **Beginner (A1-A2)**
- **More lenient on minor errors**: Small grammar mistakes don't heavily penalize
- **Focus on communication**: Meaning preservation prioritized over perfect grammar
- **Encouragement bias**: Slight scoring advantage to build confidence

### **Intermediate (B1-