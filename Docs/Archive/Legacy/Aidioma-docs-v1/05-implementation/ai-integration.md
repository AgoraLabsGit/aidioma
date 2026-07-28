# AI Integration Guide - AIdioma Spanish Learning App

## Overview

This document provides comprehensive guidance for integrating OpenAI GPT-4o and implementing AI-powered features in the Spanish learning application, with a focus on cost optimization, error handling, and maintaining high-quality educational experiences.

## Current AI Implementation

### OpenAI GPT-4o Integration
- **Service**: `server/services/aiService.ts`
- **Model**: GPT-4o for advanced translation evaluation
- **Purpose**: Semantic analysis, grammar assessment, and personalized feedback
- **Average Response Time**: 4-8 seconds per evaluation

### API Configuration
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 second timeout
  maxRetries: 3,  // Retry failed requests up to 3 times
});
```

## Cost Optimization Strategy

### Enhanced Three-Tier Evaluation System with Similarity Matching

#### Tier 1: Exact Cache Matches (40-50% of evaluations)
```typescript
// Check cache first for identical translations
const cachedEvaluation = await storage.getCachedEvaluation(sentenceId, normalizedTranslation);
if (cachedEvaluation) {
  return { ...cachedEvaluation, cached: true };
}
```

#### Tier 1.5: Similarity-Based Cache Matches (35-45% of evaluations) 🆕
```typescript
// NEW: Check for similar translations with 80%+ similarity
const similarEvaluation = await storage.getSimilarEvaluation(sentenceId, normalizedTranslation);
if (similarEvaluation && similarEvaluation.similarity >= 0.8) {
  return adjustEvaluationForSimilarity(similarEvaluation);
}
```

**Similarity Matching Examples:**
- `"bebo café todas las mañanas"` (cached)
- `"tomo café todas las mañanas"` (90% similar → reuse with note)
- `"bebo el café cada mañana"` (85% similar → reuse with adjustment)
- `"yo bebo café por la mañana"` (80% similar → reuse with feedback)

#### Tier 2: Template-Based Responses (10-15% of evaluations)
```typescript
// Use templates for common error patterns
const errorPattern = await detectErrorPattern(userTranslation, sentenceId);
if (errorPattern) {
  return generateTemplateResponse(errorPattern);
}
```

#### Tier 3: AI API Calls (5-10% of evaluations)
```typescript
// Only call AI for novel or complex cases
const aiEvaluation = await callOpenAI(userTranslation, correctTranslations);
await storage.cacheEvaluation(sentenceId, userTranslation, aiEvaluation);
return aiEvaluation;
```

### Cost Reduction Implementation

#### 1. Response Caching
```typescript
interface CachedEvaluation {
  sentenceId: number;
  userTranslation: string;
  evaluation: TranslationEvaluation;
  usageCount: number;
  lastUsed: Date;
}

async function getCachedEvaluation(
  sentenceId: number, 
  userTranslation: string
): Promise<TranslationEvaluation | null> {
  // Normalize translation for better cache hits
  const normalized = normalizeText(userTranslation);
  
  const cached = await db.select()
    .from(sentenceEvaluations)
    .where(and(
      eq(sentenceEvaluations.sentenceId, sentenceId),
      eq(sentenceEvaluations.normalizedTranslation, normalized)
    ))
    .limit(1);
    
  if (cached.length > 0) {
    // Update usage statistics
    await updateUsageStats(cached[0].id);
    return cached[0].evaluation;
  }
  
  return null;
}
```

## Similarity-Based Caching (Advanced Optimization)

### Overview
Similarity-based caching extends exact match caching by identifying and reusing evaluations for translations that are highly similar but not identical. This can increase cache hit rates from 40-60% to 75-85%, achieving 95-98% cost reduction.

### Implementation Strategy

#### Phase 2A: Basic Similarity Matching
```typescript
interface SimilarityResult {
  similarity: number;           // 0-1 similarity score
  cachedEvaluation: SentenceEvaluation;
  adjustmentNote: string;       // Explanation of differences
  confidenceLevel: 'high' | 'medium' | 'low';
}

async function findSimilarEvaluation(
  sentenceId: number, 
  translation: string,
  threshold: number = 0.8
): Promise<SimilarityResult | null> {
  
  const existingEvaluations = await storage.getCachedEvaluationsForSentence(sentenceId);
  let bestMatch: SimilarityResult | null = null;
  
  for (const cached of existingEvaluations) {
    const similarity = calculateSimilarity(translation, cached.normalizedTranslation);
    
    if (similarity >= threshold && (!bestMatch || similarity > bestMatch.similarity)) {
      bestMatch = {
        similarity,
        cachedEvaluation: cached,
        adjustmentNote: generateAdjustmentNote(translation, cached.normalizedTranslation),
        confidenceLevel: similarity >= 0.9 ? 'high' : similarity >= 0.85 ? 'medium' : 'low'
      };
    }
  }
  
  return bestMatch;
}
```

#### Similarity Calculation Methods
```typescript
// Method 1: Levenshtein Distance (for typos and minor variations)
function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (distance / maxLength);
}

// Method 2: Word-based Jaccard Similarity (for word order changes)
function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().split(/\s+/));
  const set2 = new Set(str2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// Method 3: Spanish-Aware Similarity (for linguistic variations)
function spanishAwareSimilarity(str1: string, str2: string): number {
  // Normalize Spanish-specific variations
  const normalize = (text: string) => text
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    // Handle common verb variations
    .replace(/\bbebo\b/g, 'drink_verb')
    .replace(/\btomo\b/g, 'drink_verb')
    .replace(/\bcomo\b/g, 'eat_verb')
    .replace(/\bmañana\b/g, 'morning')
    .replace(/\bmañanas\b/g, 'morning');
    
  return jaccardSimilarity(normalize(str1), normalize(str2));
}

// Combined similarity score
function calculateSimilarity(str1: string, str2: string): number {
  const levenshtein = levenshteinSimilarity(str1, str2);
  const jaccard = jaccardSimilarity(str1, str2);
  const spanishAware = spanishAwareSimilarity(str1, str2);
  
  // Weighted average favoring Spanish-aware matching
  return (levenshtein * 0.2) + (jaccard * 0.3) + (spanishAware * 0.5);
}
```

#### Evaluation Adjustment for Similar Matches
```typescript
function adjustEvaluationForSimilarity(
  similarResult: SimilarityResult,
  originalTranslation: string
): TranslationEvaluation {
  
  const baseEvaluation = similarResult.cachedEvaluation;
  const similarityPenalty = (1 - similarResult.similarity) * 10; // Max 2 point penalty
  
  return {
    score: Math.max(10, baseEvaluation.evaluationScore * 10 - similarityPenalty),
    isCorrect: similarResult.similarity >= 0.9 && baseEvaluation.evaluationScore >= 8,
    feedback: adjustFeedbackForSimilarity(
      baseEvaluation.feedback, 
      similarResult.adjustmentNote,
      similarResult.confidenceLevel
    ),
    correctTranslations: JSON.parse(baseEvaluation.correctTranslations || '[]'),
    improvements: generateSimilarityImprovements(similarResult),
    cached: true,
    similarity: similarResult.similarity
  };
}

function adjustFeedbackForSimilarity(
  originalFeedback: string,
  adjustmentNote: string,
  confidence: 'high' | 'medium' | 'low'
): string {
  const confidenceMessages = {
    high: "Your translation is very close to a perfect answer. ",
    medium: "Your translation is similar to a good answer. ",
    low: "Your translation has some similarities to correct answers. "
  };
  
  return `${confidenceMessages[confidence]}${adjustmentNote} ${originalFeedback}`;
}
```

### Performance Optimization
```typescript
// Database optimization for similarity queries
CREATE INDEX idx_sentence_evaluations_sentence_normalized 
ON sentence_evaluations(sentenceId, normalizedTranslation);

// Cache similarity calculations for frequently compared pairs
const similarityCache = new Map<string, number>();

function getCachedSimilarity(str1: string, str2: string): number | null {
  const key = [str1, str2].sort().join('||');
  return similarityCache.get(key) || null;
}
```

### Expected Results
- **Cache Hit Rate**: Increases from 40-60% to 75-85%
- **Cost Reduction**: Improves from 85-90% to 95-98%
- **Response Time**: Similar cache performance (~1-10ms for similarity matches)
- **Quality**: Maintains high feedback quality with appropriate adjustments

#### 2. Common Error Templates
```typescript
const ERROR_TEMPLATES = {
  ACCENT_MISSING: {
    pattern: /cafe|papa|mama|tu|el/i,
    feedback: "Remember to add accent marks to words like '{word}' → '{corrected}'",
    deduction: 5
  },
  GENDER_MISMATCH: {
    pattern: /\b(el|la|un|una)\s+\w+/i,
    feedback: "Check the gender agreement: '{error}' should be '{correction}'",
    deduction: 10
  },
  VERB_CONJUGATION: {
    pattern: /\w+(ar|er|ir)\b/i,
    feedback: "The verb '{verb}' should be conjugated as '{conjugated}'",
    deduction: 15
  }
};

function generateTemplateResponse(
  errorType: string, 
  details: ErrorDetails
): TranslationEvaluation {
  const template = ERROR_TEMPLATES[errorType];
  return {
    score: 100 - template.deduction,
    isCorrect: false,
    feedback: interpolateTemplate(template.feedback, details),
    correctTranslations: details.correctTranslations,
    grammarExplanation: getGrammarExplanation(errorType),
    improvements: [template.feedback]
  };
}
```

#### 3. Batch Processing
```typescript
// Process multiple evaluations in a single API call
async function batchEvaluateTranslations(
  evaluations: Array<{ sentence: string; translation: string }>
): Promise<TranslationEvaluation[]> {
  if (evaluations.length === 0) return [];
  
  const prompt = createBatchEvaluationPrompt(evaluations);
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });
  
  return parseBatchResponse(response);
}
```

## Error Handling and Fallbacks

### Comprehensive Error Handling
```typescript
async function evaluateTranslation(
  userTranslation: string,
  correctTranslations: string[],
  sentenceId: number
): Promise<TranslationEvaluation> {
  try {
    // Try cache first
    const cached = await getCachedEvaluation(sentenceId, userTranslation);
    if (cached) return cached;
    
    // Try templates
    const template = tryTemplateEvaluation(userTranslation, correctTranslations);
    if (template) return template;
    
    // Call AI with timeout
    const aiResult = await Promise.race([
      callOpenAI(userTranslation, correctTranslations),
      timeoutPromise(10000) // 10 second timeout
    ]);
    
    // Cache successful result
    await cacheEvaluation(sentenceId, userTranslation, aiResult);
    return aiResult;
    
  } catch (error) {
    console.error('AI evaluation failed:', error);
    
    // Fallback to basic evaluation
    return basicEvaluation(userTranslation, correctTranslations);
  }
}
```

### Basic Evaluation Fallback
```typescript
function basicEvaluation(
  userTranslation: string,
  correctTranslations: string[]
): TranslationEvaluation {
  const normalized = normalizeText(userTranslation);
  const isExactMatch = correctTranslations.some(
    correct => normalizeText(correct) === normalized
  );
  
  if (isExactMatch) {
    return {
      score: 100,
      isCorrect: true,
      feedback: "¡Perfecto! Your translation is correct.",
      correctTranslations,
      improvements: []
    };
  }
  
  // Calculate similarity score
  const similarities = correctTranslations.map(
    correct => calculateSimilarity(normalized, normalizeText(correct))
  );
  const bestScore = Math.max(...similarities);
  
  return {
    score: Math.round(bestScore * 100),
    isCorrect: bestScore >= 0.9,
    feedback: bestScore >= 0.7 
      ? "Close! Your translation is almost correct." 
      : "Keep practicing. Review the correct translations.",
    correctTranslations,
    improvements: ["Review verb conjugations", "Check word order"]
  };
}
```

## Prompt Engineering

### Effective Prompt Structure
```typescript
function createEvaluationPrompt(
  userTranslation: string,
  correctTranslations: string[],
  context: EvaluationContext
): string {
  return `
You are an expert Spanish language tutor evaluating a student's translation.

CONTEXT:
- Student Level: ${context.userLevel}
- Sentence Difficulty: ${context.difficulty}
- Primary Grammar Focus: ${context.grammarFocus}

STUDENT TRANSLATION: "${userTranslation}"
CORRECT TRANSLATIONS: ${JSON.stringify(correctTranslations)}

Evaluate the translation and provide a JSON response with:
{
  "score": 0-100 based on accuracy,
  "isCorrect": boolean,
  "feedback": "Constructive feedback in encouraging tone",
  "grammarExplanation": "Brief explanation of any grammar issues",
  "improvements": ["Specific suggestions for improvement"],
  "errorTypes": ["accent_error", "verb_conjugation", etc.]
}

Focus on:
1. Semantic accuracy (meaning preserved)
2. Grammar correctness
3. Natural Spanish usage
4. Common learner mistakes

Be encouraging but precise. Use simple language appropriate for language learners.
`;
}
```

### Content Generation Prompts
```typescript
function createSentenceGenerationPrompt(
  topic: string,
  difficulty: number,
  tense: string,
  count: number
): string {
  return `
Generate ${count} Spanish learning sentences for the topic "${topic}".

Requirements:
- Difficulty Level: ${difficulty}/9
- Primary Tense: ${tense}
- Include 2-3 valid Spanish translations for each English sentence
- Add word-level hints for challenging vocabulary
- Ensure cultural appropriateness
- Mix sentence structures (simple, compound, complex)

Format as JSON:
{
  "sentences": [{
    "english": "English sentence",
    "spanish": ["Translation 1", "Translation 2"],
    "hints": { "word": "hint" },
    "grammarNotes": "Key grammar points",
    "difficulty": ${difficulty}
  }]
}

Make sentences practical and relevant to daily life.
`;
}
```

## Performance Optimization

### Response Time Optimization
```typescript
// Implement streaming for long responses
async function streamAIResponse(prompt: string): Promise<string> {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    stream: true,
    temperature: 0.3
  });
  
  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullResponse += content;
    // Could emit partial results here for UI updates
  }
  
  return fullResponse;
}
```

### Concurrent Processing
```typescript
// Process multiple independent AI calls concurrently
async function evaluateMultipleSentences(
  evaluations: EvaluationRequest[]
): Promise<TranslationEvaluation[]> {
  // Split into batches to avoid rate limits
  const batchSize = 5;
  const batches = chunk(evaluations, batchSize);
  
  const results = [];
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(eval => evaluateTranslation(
        eval.translation,
        eval.correctAnswers,
        eval.sentenceId
      ))
    );
    results.push(...batchResults);
    
    // Rate limiting pause between batches
    await sleep(1000);
  }
  
  return results;
}
```

## Monitoring and Analytics

### AI Usage Tracking
```typescript
interface AIUsageMetrics {
  totalCalls: number;
  cacheHitRate: number;
  averageResponseTime: number;
  errorRate: number;
  costEstimate: number;
}

async function trackAIUsage(
  endpoint: string,
  cached: boolean,
  responseTime: number,
  tokensUsed?: number
): Promise<void> {
  await db.insert(aiUsageLogs).values({
    endpoint,
    cached,
    responseTime,
    tokensUsed,
    estimatedCost: calculateCost(tokensUsed),
    timestamp: new Date()
  });
}
```

### Quality Monitoring
```typescript
// Track AI response quality
async function monitorResponseQuality(
  evaluation: TranslationEvaluation,
  userFeedback?: UserFeedback
): Promise<void> {
  const qualityScore = calculateQualityScore(evaluation, userFeedback);
  
  if (qualityScore < 0.7) {
    // Flag for human review
    await flagForReview(evaluation, "Low quality score");
  }
  
  // Update statistics
  await updateQualityMetrics(qualityScore);
}
```

## Security Considerations

### API Key Management
```typescript
// Never expose API keys in client code
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required');
}

// Validate API key format
if (!OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Invalid OpenAI API key format');
}
```

### Input Sanitization
```typescript
function sanitizeUserInput(input: string): string {
  // Remove potential prompt injection attempts
  let sanitized = input
    .replace(/system:|assistant:|user:/gi, '') // Remove role markers
    .replace(/```/g, '') // Remove code blocks
    .slice(0, 1000); // Limit length
    
  // Additional validation
  if (containsSuspiciousPatterns(sanitized)) {
    throw new Error('Invalid input detected');
  }
  
  return sanitized;
}
```

## Testing AI Features

### Unit Testing
```typescript
describe('AI Service', () => {
  it('should return cached evaluation when available', async () => {
    const mockCache = jest.fn().mockResolvedValue(mockEvaluation);
    const result = await evaluateTranslation('test', ['test'], 1);
    expect(mockCache).toHaveBeenCalled();
    expect(result).toEqual(mockEvaluation);
  });
  
  it('should fallback to basic evaluation on AI error', async () => {
    jest.spyOn(openai, 'create').mockRejectedValue(new Error('API Error'));
    const result = await evaluateTranslation('test', ['test'], 1);
    expect(result.feedback).toContain('Keep practicing');
  });
});
```

### Integration Testing
```typescript
describe('AI Integration', () => {
  it('should evaluate translation within timeout', async () => {
    const start = Date.now();
    const result = await evaluateTranslation(
      'Yo bebo café', 
      ['Bebo café', 'Tomo café'],
      1
    );
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(10000); // 10 second max
    expect(result.score).toBeGreaterThan(0);
  });
});
```

## Future Enhancements

### Advanced Features
1. **Voice Recognition**: Integrate speech-to-text for pronunciation practice
2. **Contextual Understanding**: Multi-turn conversations for complex grammar
3. **Personalized Learning Paths**: AI-driven curriculum generation
4. **Real-time Collaboration**: AI-assisted peer learning

### Optimization Opportunities
1. **Edge Caching**: CDN-level response caching
2. **Model Fine-tuning**: Custom model for Spanish education
3. **Federated Learning**: Privacy-preserving personalization
4. **Predictive Caching**: Pre-generate likely user responses

## Best Practices Summary

1. **Always cache AI responses** to reduce costs
2. **Implement comprehensive error handling** with fallbacks
3. **Use templates for common patterns** before calling AI
4. **Monitor usage and quality** continuously
5. **Sanitize all inputs** to prevent prompt injection
6. **Test thoroughly** including timeout and error scenarios
7. **Document prompts** for consistency and maintenance
8. **Track costs** and optimize based on usage patterns

---

*This guide is a living document. Update it as new AI features are implemented or optimization strategies are discovered.*