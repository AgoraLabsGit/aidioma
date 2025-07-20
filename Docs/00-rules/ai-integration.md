# AI Integration Standards

**CRITICAL**: ALL AI service calls MUST implement caching, timeouts, and fallbacks.

## Required Pattern
```typescript
// ✅ MANDATORY PATTERN for all AI calls
async function aiServiceCall<T>(
  cacheKey: string,
  aiCall: () => Promise<T>,
  fallback: () => T
): Promise<T & { cached: boolean }> {
  // 1. Check cache first
  const cached = await cache.get(cacheKey)
  if (cached) return { ...cached, cached: true }
  
  try {
    // 2. AI call with 2000ms timeout
    const result = await Promise.race([
      aiCall(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('AI timeout')), 2000)
      )
    ])
    
    // 3. Cache successful result
    await cache.set(cacheKey, result)
    return { ...result, cached: false }
    
  } catch (error) {
    // 4. Log error and use fallback
    logger.error('AI service failed', { error, cacheKey })
    return fallback()
  }
}

// ❌ FORBIDDEN: Direct AI calls without caching
const result = await openai.completions.create({ ... }) // Not allowed
```

## Performance Requirements
- **Response Time**: <2000ms (hard timeout enforced)
- **Cache Hit Rate**: >80% for translation evaluations
- **Error Handling**: Graceful degradation required
- **Cost Optimization**: Minimize unnecessary API calls

## Cache Key Strategy
```typescript
// Use consistent cache key generation
function generateCacheKey(input: EvaluationInput): string {
  return `eval:${input.sentenceId}:${hashString(input.userTranslation)}`
}

// Consider similarity caching for similar translations
function generateSimilarityCacheKey(input: EvaluationInput): string {
  const normalized = normalizeText(input.userTranslation)
  return `sim:${input.sentenceId}:${hashString(normalized)}`
}
```

## Error Categories
```typescript
interface AIError {
  type: 'timeout' | 'api_error' | 'validation' | 'network'
  retryable: boolean
  fallbackUsed: boolean
}

// Implement retry logic for transient errors
async function retryableAICall<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error
      }
      await delay(attempt * 1000) // Exponential backoff
    }
  }
}
```

## Monitoring Requirements
```typescript
// Track AI performance metrics
const metrics = {
  trackCall: (duration: number, cached: boolean, error?: boolean) => {
    metrics.histogram('ai.call.duration', duration)
    metrics.increment('ai.call.cache_hit', cached ? 1 : 0)
    if (error) metrics.increment('ai.call.errors')
  },
  
  alertOnSlowness: (duration: number) => {
    if (duration > 2000) {
      alerting.send('AI call exceeded timeout', { duration })
    }
  }
}
``` 