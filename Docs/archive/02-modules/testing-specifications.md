# Module Testing Specifications
## Comprehensive Testing Strategy for AIdioma's 12 Modules

*This document provides detailed testing specifications for all modules, including test patterns, coverage requirements, performance benchmarks, and integration testing strategies.*

---

## 🧪 **Testing Philosophy**

### **Module Testing Principles**
- **Test Pyramid**: 70% unit tests, 20% integration tests, 10% e2e tests
- **Module Isolation**: Each module tested independently with mocked dependencies
- **Contract Testing**: API contracts verified between modules
- **Performance Testing**: Response time and throughput requirements
- **Error Scenario Coverage**: Comprehensive error condition testing

### **Testing Standards**
- **Coverage Requirement**: >90% code coverage for all modules
- **TypeScript Compliance**: All tests written in TypeScript with strict typing
- **Test Data Management**: Standardized test fixtures and mocking strategies
- **Performance Benchmarks**: Automated performance regression detection
- **Documentation**: Test cases serve as living documentation

---

## 📊 **Module Testing Matrix**

| Module | Unit Tests | Integration Tests | Performance Tests | E2E Tests | Priority |
|--------|------------|-------------------|-------------------|-----------|----------|
| **Translation Evaluation** | ✅ 95% | ✅ Complex | ✅ Critical | ✅ Core Flow | **P0** |
| **AI Cost Optimization** | ✅ 92% | ✅ Caching | ✅ Critical | - | **P0** |
| **Progressive Hints** | ✅ 88% | ✅ Medium | ✅ Important | ✅ Hint Flow | **P1** |
| **Gamification** | ✅ 90% | ✅ Simple | ✅ Important | ✅ Points Flow | **P1** |
| **Progress Tracking** | ✅ 85% | ✅ Simple | ✅ Standard | - | **P1** |
| **Page Layout** | ✅ 95% | ✅ Simple | ✅ Standard | ✅ Navigation | **P1** |
| **Practice Interface** | ✅ 88% | ✅ Medium | ✅ Standard | ✅ Practice Flow | **P2** |
| **Action Buttons** | ✅ 92% | ✅ Simple | ✅ Standard | ✅ User Actions | **P2** |
| **Session Stats** | ✅ 90% | ✅ Simple | ✅ Standard | - | **P2** |
| **Reading Interface** | ✅ 85% | ✅ Medium | ✅ Standard | ✅ Reading Flow | **P2** |
| **Conversation Suite** | 🚧 In Progress | 🚧 Planned | 🚧 Planned | 🚧 Planned | **P3** |
| **Content Processing** | 🚧 In Progress | 🚧 Planned | 🚧 Planned | - | **P3** |

---

## 🧪 **Translation Evaluation Module Testing**

### **Unit Test Specifications**

#### **Test Structure**
```typescript
describe('TranslationEvaluationService', () => {
  let service: TranslationEvaluationService
  let mockAIService: jest.Mocked<AIService>
  let mockCache: jest.Mocked<CacheService>
  
  beforeEach(async () => {
    mockAIService = createMockAIService()
    mockCache = createMockCacheService()
    
    service = new TranslationEvaluationService({
      aiService: mockAIService,
      cache: mockCache,
      config: testConfig
    })
    
    await service.initialize()
  })

  afterEach(async () => {
    await service.cleanup()
    jest.clearAllMocks()
  })

  describe('Core Evaluation', () => {
    it('should evaluate correct translation with high score', async () => {
      // Test implementation
    })
    
    it('should evaluate incorrect translation with appropriate feedback', async () => {
      // Test implementation
    })
    
    it('should handle partial translations appropriately', async () => {
      // Test implementation
    })
  })

  describe('Grammar Analysis', () => {
    it('should identify gender agreement errors', async () => {
      // Test implementation
    })
    
    it('should identify verb tense errors', async () => {
      // Test implementation
    })
    
    it('should identify word order issues', async () => {
      // Test implementation
    })
  })

  describe('Cultural Context', () => {
    it('should provide appropriate formality feedback', async () => {
      // Test implementation
    })
    
    it('should identify regional variations', async () => {
      // Test implementation
    })
  })

  describe('Error Handling', () => {
    it('should handle AI service timeout gracefully', async () => {
      // Test implementation
    })
    
    it('should retry on transient failures', async () => {
      // Test implementation
    })
    
    it('should fallback to cache on API failure', async () => {
      // Test implementation
    })
  })

  describe('Performance', () => {
    it('should complete evaluation within time limit', async () => {
      // Test implementation
    })
    
    it('should handle batch evaluations efficiently', async () => {
      // Test implementation
    })
  })
})
```

#### **Detailed Test Cases**

**1. Core Evaluation Tests**
```typescript
describe('evaluate method', () => {
  it('should evaluate perfect translation correctly', async () => {
    // Arrange
    const input: EvaluationInput = {
      sentenceId: 1,
      userTranslation: '¿Cómo te llamas?',
      correctAnswers: ['What is your name?', 'What are you called?'],
      context: {
        difficulty: 'beginner',
        topic: 'introductions',
        tense: 'present'
      }
    }

    mockAIService.evaluate.mockResolvedValue({
      score: 95,
      feedback: 'Perfect translation!',
      grammarErrors: [],
      confidence: 0.98
    })

    // Act
    const result = await service.evaluate(input)

    // Assert
    expect(result.score).toBe(95)
    expect(result.grade).toBe('A')
    expect(result.correctness).toBe('perfect')
    expect(result.feedback).toContain('Perfect')
    expect(result.grammarErrors).toHaveLength(0)
    expect(result.confidence).toBeGreaterThan(0.9)
    expect(result.evaluationTime).toBeLessThan(2000)
    
    // Verify AI service was called correctly
    expect(mockAIService.evaluate).toHaveBeenCalledWith(
      expect.objectContaining({
        userTranslation: input.userTranslation,
        correctAnswers: input.correctAnswers,
        context: input.context
      })
    )
  })

  it('should identify grammar errors correctly', async () => {
    // Arrange
    const input: EvaluationInput = {
      sentenceId: 2,
      userTranslation: 'El agua está frio', // Gender error: frio should be fría
      correctAnswers: ['The water is cold'],
      context: {
        difficulty: 'intermediate',
        topic: 'weather',
        tense: 'present'
      }
    }

    mockAIService.evaluate.mockResolvedValue({
      score: 75,
      feedback: 'Good attempt, but check the adjective agreement',
      grammarErrors: [{
        type: 'gender',
        severity: 'moderate',
        position: { start: 14, end: 18 },
        incorrect: 'frio',
        correct: ['fría'],
        explanation: 'Adjectives must agree in gender with the noun. "Agua" is feminine, so use "fría".'
      }],
      confidence: 0.92
    })

    // Act
    const result = await service.evaluate(input)

    // Assert
    expect(result.score).toBe(75)
    expect(result.grade).toBe('B')
    expect(result.correctness).toBe('mostly_correct')
    expect(result.grammarErrors).toHaveLength(1)
    
    const grammarError = result.grammarErrors[0]
    expect(grammarError.type).toBe('gender')
    expect(grammarError.severity).toBe('moderate')
    expect(grammarError.incorrect).toBe('frio')
    expect(grammarError.correct).toContain('fría')
    expect(grammarError.explanation).toContain('gender')
  })

  it('should handle AI service timeout with fallback', async () => {
    // Arrange
    const input: EvaluationInput = {
      sentenceId: 3,
      userTranslation: 'Hola mundo',
      correctAnswers: ['Hello world'],
      context: { difficulty: 'beginner', topic: 'greetings', tense: 'present' }
    }

    mockAIService.evaluate.mockRejectedValue(new Error('Request timeout'))
    
    // Mock cache fallback
    mockCache.get.mockResolvedValue({
      score: 80,
      feedback: 'Good translation (cached response)',
      cached: true,
      cacheType: 'similarity'
    })

    // Act
    const result = await service.evaluate(input)

    // Assert
    expect(result.score).toBe(80)
    expect(result.cached).toBe(true)
    expect(result.cacheType).toBe('similarity')
    expect(result.feedback).toContain('cached')
    
    // Verify fallback was used
    expect(mockCache.get).toHaveBeenCalled()
    
    // Verify error was logged
    expect(service.getMetrics().errorRate).toBeGreaterThan(0)
  })
})
```

**2. Performance Tests**
```typescript
describe('Performance Tests', () => {
  it('should meet response time requirements', async () => {
    // Arrange
    const inputs = generateTestInputs(10) // 10 diverse test cases
    
    // Act & Assert
    const startTime = Date.now()
    const results = await Promise.all(
      inputs.map(input => service.evaluate(input))
    )
    const totalTime = Date.now() - startTime
    
    // Individual evaluation time requirements
    results.forEach(result => {
      expect(result.evaluationTime).toBeLessThan(2000) // 2 second max
    })
    
    // Average time requirement
    const averageTime = totalTime / inputs.length
    expect(averageTime).toBeLessThan(1000) // 1 second average
    
    // Parallel processing efficiency
    expect(totalTime).toBeLessThan(5000) // Should process 10 in under 5 seconds
  })

  it('should handle high load without degradation', async () => {
    // Arrange
    const concurrentRequests = 50
    const inputs = generateTestInputs(concurrentRequests)
    
    // Act
    const startTime = Date.now()
    const results = await Promise.all(
      inputs.map(input => service.evaluate(input))
    )
    const totalTime = Date.now() - startTime
    
    // Assert
    expect(results).toHaveLength(concurrentRequests)
    
    // All requests should complete successfully
    results.forEach(result => {
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.feedback).toBeDefined()
    })
    
    // Performance under load
    const averageTime = totalTime / concurrentRequests
    expect(averageTime).toBeLessThan(2000) // 2 second average under load
    
    // Error rate should remain low
    const metrics = service.getMetrics()
    expect(metrics.errorRate).toBeLessThan(0.05) // Less than 5% error rate
  })

  it('should efficiently utilize cache', async () => {
    // Arrange
    const baseInput: EvaluationInput = {
      sentenceId: 1,
      userTranslation: 'Hola mundo',
      correctAnswers: ['Hello world'],
      context: { difficulty: 'beginner', topic: 'greetings', tense: 'present' }
    }
    
    // First evaluation (cache miss)
    await service.evaluate(baseInput)
    
    // Act - Multiple identical evaluations (should hit cache)
    const startTime = Date.now()
    const results = await Promise.all([
      service.evaluate(baseInput),
      service.evaluate(baseInput),
      service.evaluate(baseInput),
      service.evaluate(baseInput),
      service.evaluate(baseInput)
    ])
    const totalTime = Date.now() - startTime
    
    // Assert
    expect(results).toHaveLength(5)
    
    // All should be cached after first
    results.forEach(result => {
      expect(result.cached).toBe(true)
    })
    
    // Cache hits should be very fast
    expect(totalTime).toBeLessThan(500) // 5 cache hits in under 500ms
    
    // Verify cache hit rate
    const metrics = service.getMetrics()
    expect(metrics.cacheHitRate).toBeGreaterThan(0.8) // Over 80% hit rate
  })
})
```

### **Integration Test Specifications**

#### **Module Integration Tests**
```typescript
describe('Translation Evaluation Integration', () => {
  let translationEval: TranslationEvaluationService
  let aiOptimization: AICostOptimizationService
  let gamification: GamificationService
  let progressTracking: ProgressTrackingService

  beforeEach(async () => {
    // Initialize all related modules
    aiOptimization = new AICostOptimizationService()
    translationEval = new TranslationEvaluationService({ aiOptimization })
    gamification = new GamificationService()
    progressTracking = new ProgressTrackingService()

    await Promise.all([
      aiOptimization.initialize(testConfig.ai),
      translationEval.initialize(testConfig.evaluation),
      gamification.initialize(testConfig.gamification),
      progressTracking.initialize(testConfig.progress)
    ])
  })

  it('should integrate evaluation with gamification correctly', async () => {
    // Arrange
    const input: EvaluationInput = {
      sentenceId: 1,
      userTranslation: 'Buenos días',
      correctAnswers: ['Good morning'],
      context: { difficulty: 'beginner', topic: 'greetings', tense: 'present' }
    }

    // Act
    const evaluation = await translationEval.evaluate(input)
    const pointsResult = await gamification.awardPoints('translation', {
      accuracy: evaluation.score / 100,
      hintsUsed: 0,
      difficulty: 1,
      timeSpent: 30
    })

    await progressTracking.recordActivity({
      type: 'translation_practice',
      sentenceId: input.sentenceId,
      userInput: input.userTranslation,
      evaluation,
      pointsEarned: pointsResult.totalPoints,
      timestamp: new Date()
    })

    // Assert
    expect(evaluation.score).toBeGreaterThan(0)
    expect(pointsResult.totalPoints).toBeGreaterThan(0)
    
    // Verify integration
    if (evaluation.score >= 80) {
      expect(pointsResult.totalPoints).toBeGreaterThan(5) // Good score = good points
    }
    
    // Verify progress tracking recorded everything
    const progressData = await progressTracking.getUserProgress('test-user')
    expect(progressData.totalActivities).toBeGreaterThan(0)
    expect(progressData.totalPoints).toBe(pointsResult.totalPoints)
  })

  it('should handle AI cost optimization integration', async () => {
    // Arrange
    const input: EvaluationInput = {
      sentenceId: 1,
      userTranslation: 'Hola',
      correctAnswers: ['Hello', 'Hi'],
      context: { difficulty: 'beginner', topic: 'greetings', tense: 'present' }
    }

    // Act - First evaluation (should use AI)
    const result1 = await translationEval.evaluate(input)
    
    // Act - Second identical evaluation (should use cache)
    const result2 = await translationEval.evaluate(input)

    // Assert
    expect(result1.score).toBe(result2.score)
    expect(result1.cached).toBe(false) // First call uses AI
    expect(result2.cached).toBe(true)  // Second call uses cache
    
    // Verify cost optimization
    const optimizationMetrics = aiOptimization.getMetrics()
    expect(optimizationMetrics.cacheHitRate).toBeGreaterThan(0)
    expect(optimizationMetrics.costSavings).toBeGreaterThan(0)
  })
})
```

### **End-to-End Test Specifications**

#### **Complete Translation Workflow**
```typescript
describe('Translation Practice E2E', () => {
  it('should complete full translation practice workflow', async () => {
    // This test simulates a complete user session
    const page = await browser.newPage()
    
    try {
      // 1. Navigate to practice page
      await page.goto('/practice')
      await page.waitForLoadState('networkidle')

      // 2. Start practice session
      await page.click('[data-testid="start-practice"]')
      await page.waitForSelector('[data-testid="sentence-display"]')

      // 3. Attempt incorrect translation first
      await page.fill('[data-testid="translation-input"]', 'Como estas')
      await page.click('[data-testid="check-button"]')

      // 4. Verify evaluation feedback
      await page.waitForSelector('[data-testid="evaluation-result"]')
      const score = await page.textContent('[data-testid="evaluation-score"]')
      expect(parseInt(score!)).toBeLessThan(80) // Should be marked incorrect

      // 5. Request hint
      await page.click('[data-testid="hint-button"]')
      await page.waitForSelector('[data-testid="hint-content"]')
      const hintText = await page.textContent('[data-testid="hint-content"]')
      expect(hintText).toBeDefined()

      // 6. Submit corrected translation
      await page.fill('[data-testid="translation-input"]', '¿Cómo estás?')
      await page.click('[data-testid="check-button"]')

      // 7. Verify improved evaluation
      await page.waitForSelector('[data-testid="evaluation-result"]')
      const improvedScore = await page.textContent('[data-testid="evaluation-score"]')
      expect(parseInt(improvedScore!)).toBeGreaterThan(parseInt(score!))

      // 8. Verify points were awarded
      await page.waitForSelector('[data-testid="points-earned"]')
      const pointsText = await page.textContent('[data-testid="points-earned"]')
      expect(pointsText).toMatch(/\d+ points/)

      // 9. Continue to next sentence
      await page.click('[data-testid="next-button"]')
      await page.waitForSelector('[data-testid="sentence-display"]')

      // 10. Verify session progress updated
      const progressText = await page.textContent('[data-testid="session-progress"]')
      expect(progressText).toContain('2 of') // Should show progression

    } finally {
      await page.close()
    }
  })
})
```

---

## 💡 **Progressive Hints Module Testing**

### **Unit Test Structure**
```typescript
describe('ProgressiveHintsService', () => {
  let service: ProgressiveHintsService
  let mockAIService: jest.Mocked<AIService>
  let mockAnalytics: jest.Mocked<AnalyticsService>

  beforeEach(async () => {
    mockAIService = createMockAIService()
    mockAnalytics = createMockAnalyticsService()
    
    service = new ProgressiveHintsService({
      aiService: mockAIService,
      analytics: mockAnalytics,
      config: testHintsConfig
    })
    
    await service.initialize()
  })

  describe('Hint Generation', () => {
    it('should generate appropriate first hint', async () => {
      // Arrange
      const request: HintRequest = {
        sentenceId: 1,
        userId: 'user-123',
        currentLevel: 1,
        userAttempts: ['Como te llamas'],
        timeSpent: 30,
        sentence: {
          english: 'What is your name?',
          spanish: ['¿Cómo te llamas?'],
          difficulty: 'beginner',
          topic: 'introductions',
          grammar: ['interrogative', 'pronouns']
        },
        userProfile: {
          level: 2,
          weakAreas: ['interrogatives'],
          preferredHintTypes: ['word_definition'],
          hintsUsedToday: 2
        }
      }

      mockAIService.generateHint.mockResolvedValue({
        content: 'In Spanish, "¿Cómo?" means "What?" or "How?"',
        type: 'word_definition',
        confidence: 0.95
      })

      // Act
      const result = await service.generateHint(request)

      // Assert
      expect(result.type).toBe('word_definition')
      expect(result.level).toBe(1)
      expect(result.content).toContain('Cómo')
      expect(result.confidence).toBeGreaterThan(0.9)
      expect(result.revealLevel).toBeLessThanOrEqual(2) // First hint shouldn't reveal too much
      
      // Verify analytics tracking
      expect(mockAnalytics.trackEvent).toHaveBeenCalledWith('hint_generated', {
        sentenceId: 1,
        userId: 'user-123',
        hintType: 'word_definition',
        level: 1
      })
    })

    it('should provide more revealing hints at higher levels', async () => {
      // Test progression from basic to more revealing hints
      const baseRequest: HintRequest = {
        sentenceId: 1,
        userId: 'user-123',
        userAttempts: ['Como te llamas', 'Que es tu nombre'],
        timeSpent: 90,
        sentence: {
          english: 'What is your name?',
          spanish: ['¿Cómo te llamas?'],
          difficulty: 'beginner',
          topic: 'introductions',
          grammar: ['interrogative', 'pronouns']
        },
        userProfile: {
          level: 2,
          weakAreas: ['interrogatives'],
          preferredHintTypes: ['structure_guide'],
          hintsUsedToday: 5
        }
      }

      // Test level 1 hint (subtle)
      const hint1 = await service.generateHint({ ...baseRequest, currentLevel: 1 })
      expect(hint1.revealLevel).toBeLessThanOrEqual(2)

      // Test level 3 hint (more revealing)
      const hint3 = await service.generateHint({ ...baseRequest, currentLevel: 3 })
      expect(hint3.revealLevel).toBeGreaterThan(hint1.revealLevel)
      expect(hint3.revealLevel).toBeLessThanOrEqual(4)

      // Test level 5 hint (very revealing)
      const hint5 = await service.generateHint({ ...baseRequest, currentLevel: 5 })
      expect(hint5.revealLevel).toBeGreaterThan(hint3.revealLevel)
    })

    it('should adapt hints based on user weak areas', async () => {
      // Test with user weak in grammar
      const grammarWeakRequest: HintRequest = {
        sentenceId: 1,
        userId: 'grammar-weak-user',
        currentLevel: 1,
        userAttempts: ['El agua esta frio'],
        timeSpent: 45,
        sentence: {
          english: 'The water is cold',
          spanish: ['El agua está fría'],
          difficulty: 'intermediate',
          topic: 'weather',
          grammar: ['gender_agreement', 'ser_estar']
        },
        userProfile: {
          level: 3,
          weakAreas: ['gender_agreement', 'adjective_agreement'],
          preferredHintTypes: ['grammar_explanation'],
          hintsUsedToday: 1
        }
      }

      mockAIService.generateHint.mockResolvedValue({
        content: 'Remember: adjectives must agree in gender with nouns. "Agua" is feminine.',
        type: 'grammar_explanation',
        confidence: 0.92
      })

      const result = await service.generateHint(grammarWeakRequest)

      expect(result.type).toBe('grammar_explanation')
      expect(result.content).toContain('gender')
      expect(result.content.toLowerCase()).toContain('feminine')
    })
  })

  describe('Hint Sequence Generation', () => {
    it('should generate progressive hint sequence', async () => {
      const sequenceRequest: HintSequenceRequest = {
        sentenceId: 1,
        userId: 'user-123',
        targetHintCount: 3,
        progressiveRevealing: true,
        request: {
          userAttempts: ['Como estas'],
          timeSpent: 60,
          sentence: {
            english: 'How are you?',
            spanish: ['¿Cómo estás?'],
            difficulty: 'beginner',
            topic: 'greetings',
            grammar: ['interrogative', 'accents']
          },
          userProfile: {
            level: 1,
            weakAreas: ['accents'],
            preferredHintTypes: ['word_definition', 'structure_guide', 'partial_translation'],
            hintsUsedToday: 0
          }
        }
      }

      const sequence = await service.generateHintSequence(sequenceRequest)

      expect(sequence).toHaveLength(3)
      
      // Check progression
      expect(sequence[0].level).toBe(1)
      expect(sequence[1].level).toBe(2)
      expect(sequence[2].level).toBe(3)
      
      // Check reveal progression
      expect(sequence[0].revealLevel).toBeLessThan(sequence[1].revealLevel)
      expect(sequence[1].revealLevel).toBeLessThan(sequence[2].revealLevel)
      
      // Check hint types are different
      const hintTypes = sequence.map(h => h.type)
      expect(new Set(hintTypes).size).toBeGreaterThan(1) // Should have variety
    })
  })

  describe('Performance Tests', () => {
    it('should generate hints within time limit', async () => {
      const request = createTestHintRequest()
      
      const startTime = Date.now()
      const result = await service.generateHint(request)
      const generationTime = Date.now() - startTime
      
      expect(result).toBeDefined()
      expect(generationTime).toBeLessThan(1500) // 1.5 second limit
      expect(result.generationTime).toBeLessThan(1500)
    })

    it('should handle concurrent hint requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, () => createTestHintRequest())
      
      const startTime = Date.now()
      const results = await Promise.all(
        requests.map(request => service.generateHint(request))
      )
      const totalTime = Date.now() - startTime
      
      expect(results).toHaveLength(10)
      expect(totalTime).toBeLessThan(5000) // 10 hints in under 5 seconds
      
      // All results should be valid
      results.forEach(result => {
        expect(result.content).toBeDefined()
        expect(result.type).toBeDefined()
        expect(result.level).toBeGreaterThan(0)
      })
    })
  })
})
```

---

## 🎮 **Gamification Module Testing**

### **Points System Testing**
```typescript
describe('GamificationService', () => {
  let service: GamificationService
  let mockDatabase: jest.Mocked<DatabaseService>
  let mockAnalytics: jest.Mocked<AnalyticsService>

  beforeEach(async () => {
    mockDatabase = createMockDatabaseService()
    mockAnalytics = createMockAnalyticsService()
    
    service = new GamificationService({
      database: mockDatabase,
      analytics: mockAnalytics,
      config: testGamificationConfig
    })
    
    await service.initialize()
  })

  describe('Points Calculation', () => {
    it('should calculate points correctly for perfect translation', async () => {
      const pointsResult = await service.awardPoints('translation', {
        accuracy: 1.0,      // Perfect accuracy
        hintsUsed: 0,       // No hints
        timeSpent: 30,      // Quick response
        difficulty: 3       // Medium difficulty
      })

      expect(pointsResult.basePoints).toBe(10)     // Base points for translation
      expect(pointsResult.bonusPoints).toBeGreaterThan(0) // Bonus for perfection
      expect(pointsResult.penaltyPoints).toBe(0)   // No penalties
      expect(pointsResult.totalPoints).toBeGreaterThan(10)
      
      // Verify multipliers applied
      expect(pointsResult.multipliers).toContain(
        expect.objectContaining({ type: 'accuracy', multiplier: 1.5 })
      )
      expect(pointsResult.multipliers).toContain(
        expect.objectContaining({ type: 'speed', multiplier: 1.2 })
      )
    })

    it('should apply penalties for hint usage', async () => {
      const pointsResult = await service.awardPoints('translation', {
        accuracy: 0.8,      // Good accuracy
        hintsUsed: 2,       // Used hints
        timeSpent: 120,     // Slow response
        difficulty: 2       // Easy difficulty
      })

      expect(pointsResult.penaltyPoints).toBeGreaterThan(0) // Penalty for hints
      expect(pointsResult.totalPoints).toBeLessThan(pointsResult.basePoints) // Net penalty
      
      // Verify penalty multipliers
      expect(pointsResult.multipliers).toContain(
        expect.objectContaining({ type: 'hints_penalty', multiplier: expect.any(Number) })
      )
    })

    it('should handle streak bonuses correctly', async () => {
      // Simulate building a streak
      await service.updateStreak('user-123', new Date(), true) // Day 1
      await service.updateStreak('user-123', new Date(Date.now() + 86400000), true) // Day 2
      await service.updateStreak('user-123', new Date(Date.now() + 172800000), true) // Day 3

      const pointsResult = await service.awardPoints('translation', {
        accuracy: 0.9,
        hintsUsed: 0,
        timeSpent: 45,
        difficulty: 2,
        userId: 'user-123'
      })

      expect(pointsResult.streakBonus).toBeGreaterThan(0)
      expect(pointsResult.currentStreak).toBe(3)
      
      // Verify streak multiplier applied
      expect(pointsResult.multipliers).toContain(
        expect.objectContaining({ type: 'streak', multiplier: expect.any(Number) })
      )
    })
  })

  describe('Achievement System', () => {
    it('should unlock achievement for first perfect translation', async () => {
      mockDatabase.getUserAchievements.mockResolvedValue([]) // No previous achievements
      
      const achievements = await service.checkAchievements('user-123', {
        type: 'translation',
        score: 100,
        consecutiveCorrect: 1,
        totalCorrect: 1
      })

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'first_perfect',
          name: 'Perfect Start',
          description: 'Get your first perfect translation',
          pointsAwarded: 50
        })
      )
      
      // Verify database update
      expect(mockDatabase.awardAchievement).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ id: 'first_perfect' })
      )
    })

    it('should unlock streak achievement', async () => {
      mockDatabase.getUserStreak.mockResolvedValue({ count: 7, lastDate: new Date() })
      
      const achievements = await service.checkAchievements('user-123', {
        type: 'streak',
        streakCount: 7
      })

      expect(achievements).toContainEqual(
        expect.objectContaining({
          id: 'week_streak',
          name: 'Week Warrior',
          description: 'Practice for 7 consecutive days'
        })
      )
    })
  })

  describe('Level Progression', () => {
    it('should calculate level up correctly', async () => {
      mockDatabase.getUserPoints.mockResolvedValue(980) // Close to level up (1000)
      
      const levelResult = await service.checkLevelUp('user-123')
      
      expect(levelResult.shouldLevelUp).toBe(false)
      expect(levelResult.currentLevel).toBe(1)
      expect(levelResult.pointsToNextLevel).toBe(20)
      
      // Simulate earning more points
      await service.awardPoints('translation', {
        accuracy: 1.0,
        hintsUsed: 0,
        timeSpent: 30,
        difficulty: 3,
        userId: 'user-123'
      })
      
      const updatedLevelResult = await service.checkLevelUp('user-123')
      expect(updatedLevelResult.shouldLevelUp).toBe(true)
      expect(updatedLevelResult.newLevel).toBe(2)
    })
  })
})
```

---

## 🔄 **Integration Testing Patterns**

### **Cross-Module Integration**
```typescript
describe('Module Integration Patterns', () => {
  let moduleRegistry: ModuleRegistry
  let eventBus: EventBus

  beforeEach(async () => {
    eventBus = new EventBus()
    moduleRegistry = new ModuleRegistry(eventBus)
    
    // Register all modules
    await moduleRegistry.registerModule('translation-evaluation', new TranslationEvaluationService())
    await moduleRegistry.registerModule('progressive-hints', new ProgressiveHintsService())
    await moduleRegistry.registerModule('gamification', new GamificationService())
    await moduleRegistry.registerModule('progress-tracking', new ProgressTrackingService())
    
    await moduleRegistry.initializeAll()
  })

  it('should coordinate evaluation → gamification → progress flow', async () => {
    const eventSpy = jest.fn()
    eventBus.subscribe('*', eventSpy) // Listen to all events
    
    // Trigger evaluation
    const translationEval = moduleRegistry.getModule('translation-evaluation')
    const evaluation = await translationEval.evaluate(testEvaluationInput)
    
    // Wait for event propagation
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Verify event chain
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'evaluation.completed' })
    )
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'points.awarded' })
    )
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'progress.updated' })
    )
    
    // Verify final state consistency
    const gamification = moduleRegistry.getModule('gamification')
    const progress = moduleRegistry.getModule('progress-tracking')
    
    const userPoints = await gamification.getUserPoints('test-user')
    const userProgress = await progress.getUserProgress('test-user')
    
    expect(userProgress.totalPoints).toBe(userPoints)
  })

  it('should handle module failure gracefully', async () => {
    // Simulate gamification module failure
    const gamification = moduleRegistry.getModule('gamification')
    jest.spyOn(gamification, 'awardPoints').mockRejectedValue(new Error('Service unavailable'))
    
    // Evaluation should still work
    const translationEval = moduleRegistry.getModule('translation-evaluation')
    const evaluation = await translationEval.evaluate(testEvaluationInput)
    
    expect(evaluation).toBeDefined()
    expect(evaluation.score).toBeGreaterThanOrEqual(0)
    
    // Progress tracking should still work with fallback
    const progress = moduleRegistry.getModule('progress-tracking')
    const userProgress = await progress.getUserProgress('test-user')
    
    expect(userProgress).toBeDefined()
    // Points might be 0 due to gamification failure, but tracking should continue
  })
})
```

---

## 📈 **Performance Testing Framework**

### **Performance Benchmarks**
```typescript
describe('Performance Benchmarks', () => {
  const performanceThresholds = {
    translationEvaluation: {
      maxResponseTime: 2000,
      averageResponseTime: 1000,
      throughput: 10 // evaluations per second
    },
    progressiveHints: {
      maxResponseTime: 1500,
      averageResponseTime: 800,
      throughput: 15 // hints per second
    },
    gamification: {
      maxResponseTime: 500,
      averageResponseTime: 200,
      throughput: 50 // point calculations per second
    }
  }

  it('should meet translation evaluation performance requirements', async () => {
    const service = new TranslationEvaluationService()
    await service.initialize(testConfig)
    
    const testInputs = generateTestInputs(100) // 100 diverse test cases
    
    // Measure performance
    const startTime = Date.now()
    const results = await Promise.all(
      testInputs.map(input => service.evaluate(input))
    )
    const totalTime = Date.now() - startTime
    
    // Verify results
    expect(results).toHaveLength(100)
    results.forEach(result => {
      expect(result.evaluationTime).toBeLessThan(
        performanceThresholds.translationEvaluation.maxResponseTime
      )
    })
    
    // Verify throughput
    const throughput = (results.length / totalTime) * 1000 // per second
    expect(throughput).toBeGreaterThan(
      performanceThresholds.translationEvaluation.throughput
    )
    
    // Verify average response time
    const averageTime = results.reduce((sum, r) => sum + r.evaluationTime, 0) / results.length
    expect(averageTime).toBeLessThan(
      performanceThresholds.translationEvaluation.averageResponseTime
    )
  })

  it('should handle memory usage efficiently', async () => {
    const initialMemory = process.memoryUsage().heapUsed
    
    // Run intensive operations
    const service = new TranslationEvaluationService()
    await service.initialize(testConfig)
    
    const testInputs = generateTestInputs(1000)
    await Promise.all(testInputs.map(input => service.evaluate(input)))
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be reasonable (less than 100MB)
    expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024)
    
    await service.cleanup()
  })
})
```

---

## ✅ **Testing Quality Assurance**

### **Coverage Requirements**
- **Unit Test Coverage**: >90% line coverage for all modules
- **Integration Test Coverage**: All module interactions tested
- **E2E Test Coverage**: All critical user journeys covered
- **Performance Test Coverage**: All performance-critical modules benchmarked

### **Test Maintenance**
- **Automated Test Runs**: All tests run on every commit
- **Performance Regression Detection**: Automated performance benchmarking
- **Test Data Management**: Standardized test fixtures and factories
- **Flaky Test Detection**: Automated detection and reporting of unstable tests

### **Quality Metrics**
- **Test Execution Time**: Full test suite under 10 minutes
- **Test Reliability**: <1% flaky test rate
- **Test Coverage Trends**: Coverage must not decrease
- **Performance Trends**: No performance regressions allowed

---

*This comprehensive testing specification ensures AIdioma's 12 modules maintain high quality, performance, and reliability through thorough automated testing at all levels.* 