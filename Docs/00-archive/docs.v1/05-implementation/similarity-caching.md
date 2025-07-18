# Similarity-Based Caching System - AIdioma

## Overview

The Similarity-Based Caching System is an advanced AI cost optimization feature that extends exact match caching by identifying and reusing evaluations for translations that are highly similar but not identical. This enhancement can increase cache hit rates from 40-60% to 75-85%, achieving overall cost reductions of 95-98%.

## Business Impact

### Cost Optimization Goals
- **Current State**: 85-90% cost reduction with exact caching
- **Enhanced Target**: 95-98% cost reduction with similarity matching
- **Cache Hit Rate**: Increase from 60% to 85%+
- **Response Time**: Maintain <50ms for similarity matches

### Revenue Impact
```
Scenario: 10,000 daily translation evaluations

Without Similarity Caching:
- Exact cache hits: 6,000 (60%)
- AI API calls: 4,000 (40%)
- Daily cost: ~$8.00

With Similarity Caching:
- Exact cache hits: 4,000 (40%)
- Similarity hits: 4,500 (45%)
- AI API calls: 1,500 (15%)
- Daily cost: ~$3.00

Monthly Savings: $150 → $1,800/year per 10k daily evaluations
```

## Technical Implementation

### Phase 2A: Basic Similarity Matching

#### Core Algorithm
```typescript
interface SimilarityMatch {
  similarity: number;           // 0-1 confidence score
  cachedEvaluation: SentenceEvaluation;
  adjustmentNote: string;       // User-facing explanation
  confidenceLevel: 'high' | 'medium' | 'low';
  matchType: 'lexical' | 'semantic' | 'structural';
}

async function findBestSimilarMatch(
  sentenceId: number,
  userTranslation: string,
  threshold: number = 0.8
): Promise<SimilarityMatch | null> {
  
  const candidates = await storage.getCachedEvaluationsForSentence(sentenceId);
  let bestMatch: SimilarityMatch | null = null;
  
  for (const candidate of candidates) {
    const similarity = calculateCombinedSimilarity(
      userTranslation, 
      candidate.normalizedTranslation
    );
    
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = {
        similarity,
        cachedEvaluation: candidate,
        adjustmentNote: generateAdjustmentExplanation(userTranslation, candidate),
        confidenceLevel: determineConfidenceLevel(similarity),
        matchType: classifyMatchType(userTranslation, candidate.normalizedTranslation)
      };
    }
  }
  
  return bestMatch;
}
```

#### Similarity Calculation Methods

**1. Levenshtein Distance (Typo Detection)**
```typescript
function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = computeLevenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 1 : (1 - distance / maxLength);
}

// Handles: "café" vs "cafe", "mañana" vs "manana"
```

**2. Jaccard Similarity (Word Order Changes)**
```typescript
function jaccardWordSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().split(/\s+/));
  const words2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 1 : intersection.size / union.size;
}

// Handles: "bebo café yo" vs "yo bebo café"
```

**3. Spanish-Aware Semantic Similarity**
```typescript
function spanishSemanticSimilarity(str1: string, str2: string): number {
  const semanticMap = {
    // Verb variations
    'bebo': 'drink_verb', 'tomo': 'drink_verb',
    'como': 'eat_verb', 'desayuno': 'eat_verb',
    
    // Time expressions
    'mañana': 'morning_time', 'mañanas': 'morning_time',
    'cada': 'frequency_every', 'todas las': 'frequency_every',
    
    // Articles and determiners
    'el': 'article_masc', 'la': 'article_fem',
    'un': 'article_masc_indef', 'una': 'article_fem_indef'
  };
  
  const normalize = (text: string) => {
    return text.toLowerCase()
      .split(/\s+/)
      .map(word => semanticMap[word] || word)
      .join(' ');
  };
  
  return jaccardWordSimilarity(normalize(str1), normalize(str2));
}

// Handles: "bebo café" vs "tomo café" (both = drink coffee)
```

**4. Combined Weighted Score**
```typescript
function calculateCombinedSimilarity(str1: string, str2: string): number {
  const weights = {
    levenshtein: 0.2,    // Typos and character differences
    jaccard: 0.3,        // Word presence and order
    semantic: 0.5        // Spanish linguistic understanding
  };
  
  const scores = {
    levenshtein: levenshteinSimilarity(str1, str2),
    jaccard: jaccardWordSimilarity(str1, str2),
    semantic: spanishSemanticSimilarity(str1, str2)
  };
  
  return Object.entries(weights).reduce(
    (total, [method, weight]) => total + (scores[method] * weight), 
    0
  );
}
```

### Evaluation Adjustment Logic

#### Smart Score Adjustment
```typescript
function adjustEvaluationForSimilarity(
  similarMatch: SimilarityMatch,
  originalTranslation: string
): TranslationEvaluation {
  
  const baseScore = similarMatch.cachedEvaluation.evaluationScore * 10; // 0-10 → 0-100
  
  // Apply similarity penalty (max 5 points for 80% similarity)
  const similarityPenalty = (1 - similarMatch.similarity) * 25;
  const adjustedScore = Math.max(10, baseScore - similarityPenalty);
  
  // Determine correctness based on adjusted score and confidence
  const isCorrect = adjustedScore >= 80 && similarMatch.confidenceLevel !== 'low';
  
  return {
    score: Math.round(adjustedScore),
    isCorrect,
    feedback: generateSimilarityFeedback(similarMatch, adjustedScore),
    correctTranslations: JSON.parse(similarMatch.cachedEvaluation.correctTranslations || '[]'),
    improvements: generateSimilarityImprovements(similarMatch),
    cached: true,
    similarity: similarMatch.similarity,
    matchType: similarMatch.matchType
  };
}
```

#### Contextual Feedback Generation
```typescript
function generateSimilarityFeedback(
  match: SimilarityMatch, 
  adjustedScore: number
): string {
  const baseMessages = {
    high: "Your translation is very close to a perfect answer. ",
    medium: "Your translation is quite similar to correct answers. ",
    low: "Your translation has some elements of correct answers. "
  };
  
  const scoreMessages = {
    excellent: "Excellent work!",
    good: "Good job with minor adjustments needed.",
    fair: "Fair attempt, but review the differences.",
    needs_work: "Keep practicing to improve accuracy."
  };
  
  const scoreCategory = adjustedScore >= 95 ? 'excellent' :
                       adjustedScore >= 85 ? 'good' :
                       adjustedScore >= 70 ? 'fair' : 'needs_work';
  
  return `${baseMessages[match.confidenceLevel]}${match.adjustmentNote} ${scoreMessages[scoreCategory]}`;
}
```

## Database Schema Enhancement

### New Storage Requirements
```sql
-- Enhanced caching with similarity metadata
ALTER TABLE sentence_evaluations ADD COLUMN similarity_metadata TEXT; -- JSON

-- Similarity calculation cache for performance
CREATE TABLE similarity_cache (
  id INTEGER PRIMARY KEY,
  text1_hash VARCHAR(64) NOT NULL,
  text2_hash VARCHAR(64) NOT NULL,
  similarity_score REAL NOT NULL,
  calculation_method VARCHAR(20) NOT NULL,
  created_at INTEGER NOT NULL,
  
  UNIQUE(text1_hash, text2_hash, calculation_method)
);

-- Performance indexes
CREATE INDEX idx_similarity_cache_hashes ON similarity_cache(text1_hash, text2_hash);
CREATE INDEX idx_sentence_eval_similarity ON sentence_evaluations(sentenceId, similarity_metadata);
```

### Storage Interface Extensions
```typescript
interface IStorage {
  // New methods for similarity caching
  getCachedEvaluationsForSentence(sentenceId: number): Promise<SentenceEvaluation[]>;
  findSimilarEvaluations(
    sentenceId: number, 
    translation: string, 
    threshold: number
  ): Promise<SimilarityMatch[]>;
  cacheSimilarityScore(
    text1: string, 
    text2: string, 
    score: number, 
    method: string
  ): Promise<void>;
  getSimilarityScore(text1: string, text2: string, method: string): Promise<number | null>;
}
```

## Performance Optimization

### Caching Strategy
```typescript
// In-memory LRU cache for frequent similarity calculations
const similarityCache = new LRUCache<string, number>({
  max: 10000,
  ttl: 1000 * 60 * 60 // 1 hour
});

// Batch similarity calculations for efficiency
async function batchCalculateSimilarities(
  targetTranslation: string,
  candidates: string[]
): Promise<Map<string, number>> {
  
  const results = new Map();
  
  // Use web workers for CPU-intensive calculations
  const worker = new Worker('./similarity-worker.js');
  
  const similarities = await worker.calculateBatch({
    target: targetTranslation,
    candidates: candidates
  });
  
  similarities.forEach((score, index) => {
    results.set(candidates[index], score);
  });
  
  return results;
}
```

### Database Query Optimization
```sql
-- Optimized query for similarity candidates
SELECT 
  se.*,
  LENGTH(se.normalizedTranslation) as text_length
FROM sentence_evaluations se
WHERE 
  se.sentenceId = ? 
  AND ABS(LENGTH(se.normalizedTranslation) - ?) <= ? -- Length filter
  AND se.usageCount > 0 -- Prioritize proven evaluations
ORDER BY 
  se.usageCount DESC, -- Most used first
  ABS(LENGTH(se.normalizedTranslation) - ?) ASC -- Similar length first
LIMIT 20; -- Limit candidates for performance
```

## Quality Assurance

### Testing Strategy
```typescript
describe('Similarity-Based Caching', () => {
  test('High similarity matches maintain quality', async () => {
    const original = "Bebo café todas las mañanas";
    const similar = "Tomo café todas las mañanas";
    
    const match = await findBestSimilarMatch(1, similar, 0.8);
    
    expect(match.similarity).toBeGreaterThan(0.85);
    expect(match.confidenceLevel).toBe('high');
    
    const adjusted = adjustEvaluationForSimilarity(match, similar);
    expect(adjusted.score).toBeGreaterThan(85);
  });
  
  test('Handles Spanish linguistic variations', async () => {
    const testCases = [
      { base: "bebo café", variant: "tomo café", expectedSim: 0.9 },
      { base: "la mañana", variant: "las mañanas", expectedSim: 0.85 },
      { base: "en casa", variant: "en la casa", expectedSim: 0.8 }
    ];
    
    for (const testCase of testCases) {
      const similarity = calculateCombinedSimilarity(testCase.base, testCase.variant);
      expect(similarity).toBeGreaterThanOrEqual(testCase.expectedSim);
    }
  });
});
```

### Success Metrics
- **Accuracy**: >90% of similarity matches should maintain quality within 5% of AI evaluation
- **Performance**: Similarity calculation <10ms per comparison
- **Cache Hit Rate**: Increase from 60% to 85%+
- **Cost Reduction**: Achieve 95-98% overall AI cost reduction
- **User Satisfaction**: No decrease in feedback quality scores

## Rollout Strategy

### Phase 1: Development & Testing (Week 2.5)
- Implement core similarity algorithms
- Create comprehensive test suite
- Internal performance benchmarking

### Phase 2: Limited Beta (Week 3)
- Deploy to 10% of users
- Monitor quality metrics
- Collect feedback on adjusted evaluations

### Phase 3: Gradual Rollout (Week 3.5)
- Increase to 50% of users
- Optimize based on real-world data
- Fine-tune similarity thresholds

### Phase 4: Full Deployment (Week 4)
- 100% user activation
- Continuous monitoring
- Documentation of achieved metrics

## Future Enhancements

### Advanced Linguistic Features
- Conjugation-aware similarity (bebo/beber/bebió recognition)
- Regional variation handling (Mexican vs. Argentinian Spanish)
- Context-aware semantic matching
- Machine learning similarity models

### Integration Opportunities
- Combine with progressive hint system
- Enhance error template matching
- Support multi-language expansion
- Real-time similarity learning

---

*This system represents a significant advancement in AI cost optimization for language learning applications, providing both immediate cost benefits and a foundation for future intelligent caching enhancements.*
