# AI Cost Optimization
## 3-Tier Caching Strategy for 85-90% Cost Reduction

*Strategic AI cost reduction through intelligent caching while maintaining professional-quality evaluation.*

---

## 🎯 **System Overview**

Intelligent caching system that reduces OpenAI API costs by 85-90% through a three-tier architecture: cache lookup, similarity matching, and AI calls as last resort.

### **Performance Targets**
- **Tier 1 (Exact Cache)**: 40-50% hit rate - Instant responses, $0 cost
- **Tier 2 (Similarity)**: 30-40% hit rate - Pattern matching, $0 cost  
- **Tier 3 (AI API)**: 10-20% hit rate - Full AI evaluation, standard cost
- **Total Cost Reduction**: 85-90% of AI evaluation costs

### **Core Architecture**
```typescript
interface AIOptimizationService {
  evaluateWithOptimization(input: EvaluationInput): Promise<EvaluationResult>
  getCacheStats(): Promise<CacheStatistics>
  preloadCommonPatterns(): Promise<void>
  clearExpiredCache(): Promise<void>
}
```

---

## 🔧 **Tier 1: Exact Match Caching**

### **Cache Key Generation**
```typescript
function generateCacheKey(
  userInput: string, 
  correctAnswers: string[], 
  context: EvaluationContext
): string {
  // Normalize input for consistent caching
  const normalizedInput = userInput
    .toLowerCase()
    .trim()
    .replace(/[¿¡]/g, '')
    .replace(/\s+/g, ' ')
  
  const contextKey = `${context.sentenceId}_${context.difficultyLevel}`
  const answersKey = correctAnswers.join('|').toLowerCase()
  
  // Create deterministic hash
  return crypto
    .createHash('md5')
    .update(`${normalizedInput}:${answersKey}:${contextKey}`)
    .digest('hex')
}
```

### **Cache Storage Implementation**
```typescript
interface CachedEvaluation {
  id: string
  cacheKey: string
  userInput: string
  evaluationResult: EvaluationResult
  hitCount: number
  firstCached: Date
  lastUsed: Date
  expiresAt: Date
}

class EvaluationCache {
  private cache: Map<string, CachedEvaluation> = new Map()
  
  async get(cacheKey: string): Promise<EvaluationResult | null> {
    const cached = this.cache.get(cacheKey)
    if (!cached || cached.expiresAt < new Date()) {
      return null
    }
    
    // Update usage stats
    cached.hitCount++
    cached.lastUsed = new Date()
    
    return cached.evaluationResult
  }
  
  async set(
    cacheKey: string, 
    userInput: string, 
    result: EvaluationResult
  ): Promise<void> {
    const now = new Date()
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
    
    this.cache.set(cacheKey, {
      id: crypto.randomUUID(),
      cacheKey,
      userInput,
      evaluationResult: result,
      hitCount: 0,
      firstCached: now,
      lastUsed: now,
      expiresAt: expiry
    })
  }
}
```

---

## 🧠 **Tier 2: Similarity Matching**

### **Spanish-Aware Similarity Algorithm**
```typescript
interface SimilarityConfig {
  threshold: number        // 0.85 = 85% similarity required
  spanishWeights: {
    exactMatch: number     // 1.0 = perfect match
    stemMatch: number      // 0.8 = stem equivalence  
    synonymMatch: number   // 0.7 = synonym equivalence
    orderVariation: number // 0.9 = word order variation
  }
}

class SpanishSimilarityEngine {
  private spanishStems: Map<string, string> = new Map()
  private spanishSynonyms: Map<string, string[]> = new Map()
  
  async calculateSimilarity(
    input1: string, 
    input2: string,
    config: SimilarityConfig = DEFAULT_CONFIG
  ): Promise<number> {
    const tokens1 = this.tokenizeSpanish(input1)
    const tokens2 = this.tokenizeSpanish(input2)
    
    let totalScore = 0
    let maxPossibleScore = 0
    
    for (const token1 of tokens1) {
      maxPossibleScore += config.spanishWeights.exactMatch
      
      let bestMatch = 0
      for (const token2 of tokens2) {
        const score = this.compareTokens(token1, token2, config)
        bestMatch = Math.max(bestMatch, score)
      }
      totalScore += bestMatch
    }
    
    return maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0
  }
  
  private compareTokens(
    token1: string, 
    token2: string, 
    config: SimilarityConfig
  ): number {
    // Exact match
    if (token1 === token2) {
      return config.spanishWeights.exactMatch
    }
    
    // Stem match (e.g., "hablo" vs "hablar")
    if (this.haveSameStem(token1, token2)) {
      return config.spanishWeights.stemMatch
    }
    
    // Synonym match (e.g., "auto" vs "coche")
    if (this.areSynonyms(token1, token2)) {
      return config.spanishWeights.synonymMatch
    }
    
    return 0
  }
}
```

### **Similarity Cache Integration**
```typescript
class SimilarityCache {
  private similarityEngine: SpanishSimilarityEngine
  private cache: EvaluationCache
  
  async findSimilarEvaluation(
    userInput: string,
    correctAnswers: string[],
    context: EvaluationContext,
    threshold: number = 0.85
  ): Promise<EvaluationResult | null> {
    // Get all cached evaluations for this sentence
    const candidates = await this.getCandidateEvaluations(context.sentenceId)
    
    for (const candidate of candidates) {
      const similarity = await this.similarityEngine.calculateSimilarity(
        userInput,
        candidate.userInput
      )
      
      if (similarity >= threshold) {
        // Adjust score based on similarity confidence
        const adjustedResult = this.adjustForSimilarity(
          candidate.evaluationResult,
          similarity
        )
        
        // Add adjustment note
        adjustedResult.feedback += ` (Similar pattern matched with ${(similarity * 100).toFixed(1)}% confidence)`
        
        return adjustedResult
      }
    }
    
    return null
  }
  
  private adjustForSimilarity(
    result: EvaluationResult,
    similarity: number
  ): EvaluationResult {
    // Slightly adjust score based on similarity confidence
    const confidenceAdjustment = (similarity - 0.85) * 2 // -0.3 to +0.3 points
    
    return {
      ...result,
      score: Math.max(0, Math.min(10, result.score + confidenceAdjustment))
    }
  }
}
```

---

## 🤖 **Tier 3: Optimized AI Integration**

### **AI Service with Comprehensive Fallback**
```typescript
class OptimizedAIService {
  private openai: OpenAI
  private exactCache: EvaluationCache
  private similarityCache: SimilarityCache
  private costMonitor: CostMonitor
  
  async evaluateTranslation(
    userInput: string,
    correctAnswers: string[],
    context: EvaluationContext
  ): Promise<EvaluationResult> {
    const startTime = Date.now()
    
    try {
      // Tier 1: Check exact match cache
      const cacheKey = generateCacheKey(userInput, correctAnswers, context)
      const cachedResult = await this.exactCache.get(cacheKey)
      
      if (cachedResult) {
        this.costMonitor.logRequest('tier1', Date.now() - startTime)
        return cachedResult
      }
      
      // Tier 2: Check similarity cache
      const similarResult = await this.similarityCache.findSimilarEvaluation(
        userInput,
        correctAnswers,
        context
      )
      
      if (similarResult) {
        this.costMonitor.logRequest('tier2', Date.now() - startTime)
        await this.exactCache.set(cacheKey, userInput, similarResult)
        return similarResult
      }
      
      // Tier 3: Make AI API call
      const aiResult = await this.callOpenAIWithRetry(
        userInput,
        correctAnswers,
        context
      )
      
      this.costMonitor.logRequest('tier3', Date.now() - startTime)
      await this.exactCache.set(cacheKey, userInput, aiResult)
      
      return aiResult
      
    } catch (error) {
      // Fallback: Return basic evaluation
      return this.generateFallbackEvaluation(userInput, correctAnswers)
    }
  }
  
  private async callOpenAIWithRetry(
    userInput: string,
    correctAnswers: string[],
    context: EvaluationContext,
    maxRetries: number = 3
  ): Promise<EvaluationResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a Spanish teacher evaluating student translations. Return JSON only."
            },
            {
              role: "user",
              content: this.buildOptimizedPrompt(userInput, correctAnswers, context)
            }
          ],
          temperature: 0.1,
          max_tokens: 300,
          timeout: 10000
        })
        
        return this.parseAIResponse(response.choices[0].message.content)
        
      } catch (error) {
        if (attempt === maxRetries) throw error
        
        // Exponential backoff
        await this.delay(Math.pow(2, attempt) * 1000)
      }
    }
    
    throw new Error('All AI retry attempts failed')
  }
}
```

---

## 📊 **Cost Monitoring and ROI Analysis**

### **Real-time Cost Tracking**
```typescript
interface CostMetrics {
  totalRequests: number
  cacheHits: { tier1: number, tier2: number, tier3: number }
  costSaved: number
  actualCost: number
  averageResponseTime: number
  hitRatePercentage: number
}

class CostMonitor {
  private metrics: CostMetrics = {
    totalRequests: 0,
    cacheHits: { tier1: 0, tier2: 0, tier3: 0 },
    costSaved: 0,
    actualCost: 0,
    averageResponseTime: 0,
    hitRatePercentage: 0
  }
  
  logRequest(tier: 'tier1' | 'tier2' | 'tier3', responseTime: number): void {
    this.metrics.totalRequests++
    this.metrics.cacheHits[tier]++
    
    // Cost calculation (OpenAI GPT-4o pricing)
    const costs = { tier1: 0, tier2: 0, tier3: 0.002 }
    this.metrics.actualCost += costs[tier]
    
    if (tier !== 'tier3') {
      this.metrics.costSaved += 0.002 // Would have cost this much
    }
    
    this.updateAverages(responseTime)
  }
  
  getCostReport(): CostReport {
    const totalHits = Object.values(this.metrics.cacheHits).reduce((a, b) => a + b, 0)
    const nonAIHits = this.metrics.cacheHits.tier1 + this.metrics.cacheHits.tier2
    
    return {
      hitRate: totalHits > 0 ? (nonAIHits / totalHits) * 100 : 0,
      costReduction: this.metrics.costSaved > 0 
        ? (this.metrics.costSaved / (this.metrics.costSaved + this.metrics.actualCost)) * 100 
        : 0,
      totalSaved: this.metrics.costSaved,
      averageResponseTime: this.metrics.averageResponseTime,
      tier1Rate: (this.metrics.cacheHits.tier1 / totalHits) * 100,
      tier2Rate: (this.metrics.cacheHits.tier2 / totalHits) * 100,
      tier3Rate: (this.metrics.cacheHits.tier3 / totalHits) * 100,
      projectedMonthlySavings: this.metrics.costSaved * 30
    }
  }
}
```

### **ROI Analysis Dashboard**
```typescript
interface ROIAnalysis {
  dailyStats: {
    evaluations: number
    costWithoutCache: number
    costWithCache: number
    savings: number
    hitRate: number
  }
  monthlyProjection: {
    evaluations: number
    potentialCost: number
    actualCost: number
    projectedSavings: number
  }
  performanceMetrics: {
    averageResponseTime: number
    cacheEfficiency: number
    systemReliability: number
  }
}
```

---

## 🚀 **Implementation Strategy**

### **Phase 1: Basic Exact Caching (Week 1)**
- Implement cache key generation and storage
- Add exact match lookup before AI calls
- Monitor initial hit rates (target: 40-50%)

### **Phase 2: Similarity Matching (Week 2)**  
- Implement Spanish-aware similarity engine
- Add similarity cache tier
- Achieve 70-80% total cache hit rate

### **Phase 3: Optimization & Monitoring (Week 3)**
- Add comprehensive cost monitoring
- Implement cache optimization strategies
- Achieve target 85-90% cost reduction

### **Success Metrics**
- **Cost Reduction**: 85-90% of AI evaluation costs
- **Response Time**: <50ms for cached, <2000ms for AI
- **Quality**: >95% user satisfaction with cached results
- **Reliability**: 99.9% uptime for caching system

---

## 🔧 **Development Integration**

### **Module Interface**
```typescript
// Standard module interface for AI cost optimization
interface AIModuleService extends ModuleService<AIConfig, AIState> {
  evaluateWithOptimization(input: EvaluationInput): Promise<EvaluationResult>
  getCachePerformance(): Promise<CacheMetrics>
  optimizeCache(): Promise<void>
}
```

### **Framework Compliance**
- **TypeScript-First**: Zero `any` usage with strict typing
- **Performance**: AI evaluation <2000ms, cache <100ms  
- **Error Handling**: Graceful fallbacks for all failure scenarios
- **Testing**: >90% coverage with comprehensive AI mocking

This AI cost optimization system ensures sustainable, scalable AI evaluation while maintaining the quality standards required for effective language learning. 