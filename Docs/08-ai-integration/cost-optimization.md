# AI Cost Optimization
## 3-Tier Caching Strategy for 85-90% Cost Reduction

---

## 🎯 **System Overview**

Intelligent caching system that reduces OpenAI API costs by 85-90% through a three-tier architecture: cache lookup, template matching, and AI calls as last resort.

### **Target Metrics**
- **Tier 1 (Cache)**: 85% hit rate - Instant responses, $0 cost
- **Tier 2 (Templates)**: 10% hit rate - Pattern matching, $0 cost  
- **Tier 3 (AI API)**: 5% hit rate - Full AI evaluation, standard cost

### **Core API**
```typescript
interface AIOptimizationService {
  evaluateWithOptimization(input: EvaluationInput): Promise<EvaluationResult>
  getCacheStats(): Promise<CacheStatistics>
  preloadCommonPatterns(): Promise<void>
  clearExpiredCache(): Promise<void>
}
```

---

## 🔧 **Tier 1: Response Caching Implementation**

### **Cache Key Generation**
```typescript
function generateCacheKey(userInput: string, correctAnswers: string[], context: EvaluationContext): string {
  // Normalize input for consistent caching
  const normalizedInput = userInput.toLowerCase().trim().replace(/[¿¡]/g, '')
  const contextKey = `${context.sentenceId}_${context.difficultyLevel}`
  const answersKey = correctAnswers.join('|').toLowerCase()
  
  // Create deterministic hash
  return crypto
    .createHash('md5')
    .update(`${normalizedInput}:${answersKey}:${contextKey}`)
    .digest('hex')
}
```

### **Cache Storage and Retrieval**
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
  private redis: Redis
  private database: IStorage
  
  async get(cacheKey: string): Promise<EvaluationResult | null> {
    // Try Redis first (fast memory cache)
    const redisResult = await this.redis.get(`eval:${cacheKey}`)
    if (redisResult) {
      await this.updateHitCount(cacheKey)
      return JSON.parse(redisResult)
    }
    
    // Fallback to database cache
    const dbResult = await this.database.getCachedEvaluation(cacheKey)
    if (dbResult && dbResult.expiresAt > new Date()) {
      // Promote to Redis for faster access
      await this.redis.setex(`eval:${cacheKey}`, 3600, JSON.stringify(dbResult.evaluationResult))
      await this.updateHitCount(cacheKey)
      return dbResult.evaluationResult
    }
    
    return null
  }
  
  async set(cacheKey: string, userInput: string, result: EvaluationResult): Promise<void> {
    const cached: CachedEvaluation = {
      id: generateId(),
      cacheKey,
      userInput,
      evaluationResult: result,
      hitCount: 0,
      firstCached: new Date(),
      lastUsed: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
    
    // Store in both Redis and database
    await Promise.all([
      this.redis.setex(`eval:${cacheKey}`, 3600, JSON.stringify(result)),
      this.database.setCachedEvaluation(cached)
    ])
  }
}
```

---

## 🎨 **Tier 2: Template Matching System**

### **Response Template Definitions**
```typescript
interface ResponseTemplate {
  id: string
  pattern: RegExp
  conditions: TemplateCondition[]
  response: TemplateResponse
  priority: number
  usageCount: number
}

interface TemplateCondition {
  type: 'accuracy' | 'word_match' | 'grammar_error' | 'length_difference'
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains'
  value: any
}

interface TemplateResponse {
  score: number
  feedback: string
  grammarAccuracy: number
  naturalness: number
  completeness: number
}

const EVALUATION_TEMPLATES: ResponseTemplate[] = [
  {
    id: 'perfect_match',
    pattern: /^exact_match$/,
    conditions: [
      { type: 'accuracy', operator: 'equals', value: 1.0 }
    ],
    response: {
      score: 10,
      feedback: "¡Perfecto! Your translation is exactly correct.",
      grammarAccuracy: 1.0,
      naturalness: 1.0,
      completeness: 1.0
    },
    priority: 1,
    usageCount: 0
  },
  {
    id: 'minor_article_error',
    pattern: /^(el|la|los|las)\s+(.+)$/,
    conditions: [
      { type: 'word_match', operator: 'greater_than', value: 0.8 },
      { type: 'grammar_error', operator: 'equals', value: 'article_agreement' }
    ],
    response: {
      score: 8,
      feedback: "Good translation! Check the article gender agreement (el/la).",
      grammarAccuracy: 0.8,
      naturalness: 0.9,
      completeness: 1.0
    },
    priority: 2,
    usageCount: 0
  }
]
```

### **Template Matching Engine**
```typescript
class TemplateMatchingEngine {
  private templates: ResponseTemplate[]
  
  async findMatch(userInput: string, correctAnswers: string[], context: EvaluationContext): Promise<EvaluationResult | null> {
    const normalizedInput = this.normalizeInput(userInput)
    const inputAnalysis = this.analyzeInput(userInput, correctAnswers)
    
    // Sort templates by priority and usage success rate
    const sortedTemplates = this.templates.sort((a, b) => {
      const aSuccessRate = a.usageCount > 0 ? a.usageCount : 1
      const bSuccessRate = b.usageCount > 0 ? b.usageCount : 1
      return (b.priority * bSuccessRate) - (a.priority * aSuccessRate)
    })
    
    for (const template of sortedTemplates) {
      if (this.matchesTemplate(template, normalizedInput, inputAnalysis)) {
        await this.incrementTemplateUsage(template.id)
        return this.generateTemplateResponse(template, inputAnalysis)
      }
    }
    
    return null
  }
  
  private matchesTemplate(template: ResponseTemplate, input: string, analysis: InputAnalysis): boolean {
    // Check pattern match
    if (!template.pattern.test(input)) return false
    
    // Check all conditions
    return template.conditions.every(condition => {
      switch (condition.type) {
        case 'accuracy':
          return this.evaluateCondition(analysis.accuracy, condition.operator, condition.value)
        case 'word_match':
          return this.evaluateCondition(analysis.wordMatchRatio, condition.operator, condition.value)
        case 'grammar_error':
          return analysis.grammarErrors.includes(condition.value)
        case 'length_difference':
          return this.evaluateCondition(analysis.lengthRatio, condition.operator, condition.value)
        default:
          return false
      }
    })
  }
}
```

---

## 🤖 **Tier 3: Optimized AI Integration**

### **AI Service with Fallback and Optimization**
```typescript
class OptimizedAIService {
  private openai: OpenAI
  private cache: EvaluationCache
  private templateEngine: TemplateMatchingEngine
  
  async evaluateTranslation(userInput: string, correctAnswers: string[], context: EvaluationContext): Promise<EvaluationResult> {
    // Tier 1: Check cache first
    const cacheKey = generateCacheKey(userInput, correctAnswers, context)
    const cachedResult = await this.cache.get(cacheKey)
    if (cachedResult) {
      this.logCacheHit('tier1', cacheKey)
      return cachedResult
    }
    
    // Tier 2: Try template matching
    const templateResult = await this.templateEngine.findMatch(userInput, correctAnswers, context)
    if (templateResult) {
      this.logCacheHit('tier2', cacheKey)
      await this.cache.set(cacheKey, userInput, templateResult)
      return templateResult
    }
    
    // Tier 3: Make AI API call
    this.logCacheHit('tier3', cacheKey)
    const aiResult = await this.callOpenAI(userInput, correctAnswers, context)
    await this.cache.set(cacheKey, userInput, aiResult)
    
    // Learn from AI response to improve templates
    await this.updateTemplatesFromAI(userInput, correctAnswers, aiResult)
    
    return aiResult
  }
  
  private async callOpenAI(userInput: string, correctAnswers: string[], context: EvaluationContext): Promise<EvaluationResult> {
    const prompt = this.buildOptimizedPrompt(userInput, correctAnswers, context)
    
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
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for consistent responses
        max_tokens: 300,
        timeout: 10000 // 10 second timeout
      })
      
      return this.parseAIResponse(response.choices[0].message.content)
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        // Implement exponential backoff
        await this.waitAndRetry(error)
        return this.callOpenAI(userInput, correctAnswers, context)
      }
      throw error
    }
  }
}
```

### **Optimized Prompt Engineering**
```typescript
function buildOptimizedPrompt(userInput: string, correctAnswers: string[], context: EvaluationContext): string {
  return `
Evaluate this Spanish translation:

Input: "${userInput}"
Correct answers: ${correctAnswers.join(' OR ')}
Difficulty: ${context.difficultyLevel}/9
Grammar focus: ${context.grammarConcepts?.join(', ') || 'general'}

Return JSON only:
{
  "score": number (0-10),
  "feedback": "specific feedback string",
  "grammarAccuracy": number (0.0-1.0),
  "naturalness": number (0.0-1.0), 
  "completeness": number (0.0-1.0),
  "errors": ["specific error descriptions"],
  "suggestions": ["improvement suggestions"]
}

Focus on practical learning feedback. Be encouraging but accurate.`
}
```

---

## 📊 **Cost Monitoring and Analytics**

### **Cost Tracking Implementation**
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
    
    // Cost calculation (approximate)
    const costs = { tier1: 0, tier2: 0, tier3: 0.002 } // $0.002 per AI call
    this.metrics.actualCost += costs[tier]
    
    if (tier !== 'tier3') {
      this.metrics.costSaved += 0.002 // Would have cost this much
    }
    
    // Update averages
    this.updateAverages(responseTime)
  }
  
  getCostReport(): CostReport {
    const totalHits = this.metrics.cacheHits.tier1 + this.metrics.cacheHits.tier2 + this.metrics.cacheHits.tier3
    const nonAIHits = this.metrics.cacheHits.tier1 + this.metrics.cacheHits.tier2
    
    return {
      hitRate: totalHits > 0 ? (nonAIHits / totalHits) * 100 : 0,
      costReduction: this.metrics.costSaved > 0 ? (this.metrics.costSaved / (this.metrics.costSaved + this.metrics.actualCost)) * 100 : 0,
      totalSaved: this.metrics.costSaved,
      averageResponseTime: this.metrics.averageResponseTime,
      tier1Rate: (this.metrics.cacheHits.tier1 / totalHits) * 100,
      tier2Rate: (this.metrics.cacheHits.tier2 / totalHits) * 100,
      tier3Rate: (this.metrics.cacheHits.tier3 / totalHits) * 100
    }
  }
}
```

### **Cache Maintenance and Optimization**
```typescript
class CacheOptimizer {
  async optimizeCache(): Promise<void> {
    // Remove expired entries
    await this.cleanExpiredEntries()
    
    // Promote frequently accessed items to Redis
    await this.promoteHotEntries()
    
    // Analyze patterns to improve templates
    await this.analyzeUsagePatterns()
    
    // Preload common patterns
    await this.preloadCommonPatterns()
  }
  
  private async preloadCommonPatterns(): Promise<void> {
    const commonSentences = await this.database.getMostPracticedSentences(100)
    
    for (const sentence of commonSentences) {
      const variations = this.generateCommonVariations(sentence)
      for (const variation of variations) {
        const cacheKey = generateCacheKey(variation.input, variation.correct, variation.context)
        if (!await this.cache.get(cacheKey)) {
          // Pre-generate template response
          const templateResult = await this.templateEngine.findMatch(variation.input, variation.correct, variation.context)
          if (templateResult) {
            await this.cache.set(cacheKey, variation.input, templateResult)
          }
        }
      }
    }
  }
}
```

---

## 📈 **Implementation Strategy**

### **Phase 1: Basic Caching (Week 1)**
```typescript
// Implement simple cache-first approach
async function basicCaching(input: string, correct: string[]): Promise<EvaluationResult> {
  const cacheKey = generateSimpleCacheKey(input, correct)
  let result = await cache.get(cacheKey)
  
  if (!result) {
    result = await openai.evaluate(input, correct)
    await cache.set(cacheKey, result, 3600) // 1 hour TTL
  }
  
  return result
}
```

### **Phase 2: Template System (Week 2)**
```typescript
// Add template matching before AI calls
async function templateCaching(input: string, correct: string[]): Promise<EvaluationResult> {
  // Try cache first
  let result = await cache.get(cacheKey)
  if (result) return result
  
  // Try templates
  result = await templateEngine.findMatch(input, correct)
  if (result) {
    await cache.set(cacheKey, result)
    return result
  }
  
  // Fallback to AI
  result = await openai.evaluate(input, correct)
  await cache.set(cacheKey, result)
  return result
}
```

### **Phase 3: Full Optimization (Week 3)**
Implement complete 3-tier system with monitoring, analytics, and automatic optimization.

---

This optimization system dramatically reduces AI costs while maintaining response quality and speed, creating a sustainable and scalable evaluation system for AIdioma.