# Module API Reference
## Comprehensive Interface Documentation for AIdioma's 12 Modules

*This section provides detailed API documentation for all modules, including TypeScript interfaces, method signatures, usage examples, and integration patterns.*

---

## 📚 **API Reference Overview**

### **Documentation Structure**
Each module API reference includes:
- **Core Interface**: Primary service interface with all methods
- **Type Definitions**: Complete TypeScript types and interfaces
- **Method Documentation**: Detailed parameter and return type information
- **Usage Examples**: Practical implementation examples
- **Error Handling**: Error types and handling strategies
- **Performance Notes**: Performance characteristics and optimization tips

### **Available Module APIs**

| Category | Module | Complexity | API Maturity |
|----------|--------|------------|--------------|
| **Language/AI** | [Translation Evaluation](#translation-evaluation-api) | **High** | ✅ Complete |
| **Language/AI** | [Progressive Hints](#progressive-hints-api) | **Medium** | ✅ Complete |
| **Language/AI** | [AI Cost Optimization](#ai-cost-optimization-api) | **High** | ✅ Complete |
| **Language/AI** | [Conversation Suite](#conversation-suite-api) | **Medium** | 🚧 Planned |
| **Language/AI** | [Content Processing](#content-processing-api) | **Medium** | 🚧 Planned |
| **User Experience** | [Gamification](#gamification-api) | **Medium** | ✅ Complete |
| **User Experience** | [Progress Tracking](#progress-tracking-api) | **Medium** | ✅ Complete |
| **UI Interface** | [Practice Interface](#practice-interface-api) | **Medium** | ✅ Complete |
| **UI Interface** | [Action Buttons](#action-buttons-api) | **Low** | ✅ Complete |
| **UI Interface** | [Session Stats](#session-stats-api) | **Low** | ✅ Complete |
| **UI Interface** | [Page Layout](#page-layout-api) | **Low** | ✅ Complete |
| **UI Interface** | [Reading Interface](#reading-interface-api) | **Medium** | 🚧 Planned |

---

## 🧠 **Translation Evaluation API**

### **Core Interface**
```typescript
interface TranslationEvaluationService {
  // Lifecycle methods
  initialize(config: EvaluationConfig): Promise<void>
  cleanup(): Promise<void>
  
  // Core evaluation
  evaluate(input: EvaluationInput): Promise<EvaluationResult>
  evaluateBatch(inputs: EvaluationInput[]): Promise<EvaluationResult[]>
  
  // Configuration
  updateConfig(config: Partial<EvaluationConfig>): Promise<void>
  getConfig(): EvaluationConfig
  
  // State management
  getState(): EvaluationState
  onError(handler: (error: EvaluationError) => void): void
  
  // Performance monitoring
  getMetrics(): EvaluationMetrics
  clearMetrics(): void
}
```

### **Type Definitions**
```typescript
interface EvaluationConfig {
  // AI service configuration
  aiProvider: 'openai' | 'anthropic' | 'local'
  apiKey: string
  model: string
  maxTokens: number
  temperature: number
  
  // Evaluation parameters
  strictnessLevel: 'lenient' | 'standard' | 'strict'
  culturalContext: 'neutral' | 'mexican' | 'argentinian' | 'spanish'
  includeGrammarAnalysis: boolean
  includeCulturalNotes: boolean
  
  // Performance settings
  timeout: number
  retryAttempts: number
  cacheEnabled: boolean
  batchSize: number
}

interface EvaluationInput {
  // Required fields
  sentenceId: number
  userTranslation: string
  correctAnswers: string[]
  
  // Context information
  context: {
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    topic: string
    tense: string
    previousAttempts?: string[]
    hintsUsed?: number
    timeSpent?: number
  }
  
  // Optional parameters
  customInstructions?: string
  skipCache?: boolean
  priority?: 'low' | 'normal' | 'high'
}

interface EvaluationResult {
  // Core evaluation
  score: number                    // 0-100
  grade: 'F' | 'D' | 'C' | 'B' | 'A' | 'A+'
  correctness: 'incorrect' | 'partially_correct' | 'mostly_correct' | 'perfect'
  
  // Detailed feedback
  feedback: string
  explanations: string[]
  suggestions: string[]
  
  // Grammar analysis
  grammarErrors: GrammarError[]
  grammarScore: number
  
  // Cultural notes
  culturalNotes?: string[]
  formalityLevel?: 'informal' | 'neutral' | 'formal'
  
  // Performance metadata
  evaluationTime: number
  cached: boolean
  cacheType?: 'exact' | 'similarity' | 'template'
  confidence: number
  
  // Learning insights
  strengths: string[]
  weaknesses: string[]
  recommendedPractice: string[]
}

interface GrammarError {
  type: 'gender' | 'number' | 'tense' | 'mood' | 'spelling' | 'word_order' | 'vocabulary'
  severity: 'minor' | 'moderate' | 'major'
  position: { start: number; end: number }
  incorrect: string
  correct: string[]
  explanation: string
}

interface EvaluationError {
  code: 'NETWORK_ERROR' | 'API_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'CACHE_ERROR'
  message: string
  retryable: boolean
  details?: {
    originalError?: Error
    request?: EvaluationInput
    timestamp: Date
    attemptNumber: number
  }
}

interface EvaluationMetrics {
  totalEvaluations: number
  averageResponseTime: number
  cacheHitRate: number
  errorRate: number
  averageScore: number
  
  performance: {
    fastest: number
    slowest: number
    p95ResponseTime: number
  }
  
  caching: {
    exactMatches: number
    similarityMatches: number
    templateMatches: number
    aiEvaluations: number
  }
  
  errors: {
    networkErrors: number
    apiErrors: number
    timeoutErrors: number
    validationErrors: number
  }
}

interface EvaluationState {
  status: 'initializing' | 'ready' | 'evaluating' | 'error'
  isHealthy: boolean
  lastError?: EvaluationError
  activeEvaluations: number
  queuedEvaluations: number
  
  config: EvaluationConfig
  metrics: EvaluationMetrics
  
  cache: {
    enabled: boolean
    size: number
    hitRate: number
    lastCleanup: Date
  }
}
```

### **Usage Examples**

#### **Basic Evaluation**
```typescript
// Initialize the service
const evaluationService = new TranslationEvaluationService()
await evaluationService.initialize({
  aiProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
  strictnessLevel: 'standard',
  culturalContext: 'neutral',
  includeGrammarAnalysis: true,
  cacheEnabled: true
})

// Evaluate a translation
const result = await evaluationService.evaluate({
  sentenceId: 123,
  userTranslation: 'Hola, ¿como estas?',
  correctAnswers: ['Hello, how are you?', 'Hi, how are you?'],
  context: {
    difficulty: 'beginner',
    topic: 'greetings',
    tense: 'present'
  }
})

console.log(`Score: ${result.score}/100`)
console.log(`Grade: ${result.grade}`)
console.log(`Feedback: ${result.feedback}`)

if (result.grammarErrors.length > 0) {
  console.log('Grammar errors found:')
  result.grammarErrors.forEach(error => {
    console.log(`- ${error.type}: "${error.incorrect}" → "${error.correct.join(', ')}"`)
  })
}
```

#### **Batch Evaluation**
```typescript
// Evaluate multiple translations efficiently
const inputs: EvaluationInput[] = [
  {
    sentenceId: 1,
    userTranslation: 'Me gusta la música',
    correctAnswers: ['I like music'],
    context: { difficulty: 'beginner', topic: 'preferences', tense: 'present' }
  },
  {
    sentenceId: 2,
    userTranslation: 'Estoy aprendiendo español',
    correctAnswers: ['I am learning Spanish'],
    context: { difficulty: 'intermediate', topic: 'education', tense: 'present_continuous' }
  }
]

const results = await evaluationService.evaluateBatch(inputs)
results.forEach((result, index) => {
  console.log(`Translation ${index + 1}: ${result.score}/100 (${result.grade})`)
})
```

#### **Error Handling**
```typescript
// Robust error handling with fallbacks
evaluationService.onError(async (error) => {
  console.error(`Evaluation error: ${error.message}`)
  
  if (error.retryable && error.details?.attemptNumber < 3) {
    // Automatic retry for transient errors
    console.log('Retrying evaluation...')
    return
  }
  
  // Log error for monitoring
  await errorReporting.logError({
    service: 'translation-evaluation',
    error,
    context: error.details
  })
  
  // Fallback to cached or template response
  if (error.code === 'API_ERROR' || error.code === 'TIMEOUT_ERROR') {
    return await fallbackEvaluationService.evaluate(error.details?.request)
  }
})

try {
  const result = await evaluationService.evaluate(input)
  // Handle successful evaluation
} catch (error) {
  // Handle non-retryable errors
  console.error('Evaluation failed:', error.message)
  // Provide user-friendly error message
  return {
    score: 0,
    feedback: 'Unable to evaluate translation at this time. Please try again.',
    error: true
  }
}
```

#### **Performance Monitoring**
```typescript
// Monitor evaluation performance
setInterval(async () => {
  const metrics = evaluationService.getMetrics()
  const state = evaluationService.getState()
  
  console.log('Evaluation Service Health Check:')
  console.log(`- Status: ${state.status}`)
  console.log(`- Healthy: ${state.isHealthy}`)
  console.log(`- Cache Hit Rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`)
  console.log(`- Average Response Time: ${metrics.averageResponseTime.toFixed(0)}ms`)
  console.log(`- Error Rate: ${(metrics.errorRate * 100).toFixed(2)}%`)
  
  // Alert if performance degrades
  if (metrics.errorRate > 0.05) {
    await alerting.sendAlert({
      severity: 'warning',
      service: 'translation-evaluation',
      message: `High error rate: ${(metrics.errorRate * 100).toFixed(2)}%`,
      metrics
    })
  }
  
  if (metrics.averageResponseTime > 3000) {
    await alerting.sendAlert({
      severity: 'warning',
      service: 'translation-evaluation',
      message: `Slow response time: ${metrics.averageResponseTime.toFixed(0)}ms`,
      metrics
    })
  }
}, 60000) // Check every minute
```

### **Integration Patterns**

#### **With Gamification Module**
```typescript
// Coordinate evaluation with points system
class PracticeWorkflow {
  constructor(
    private evaluation: TranslationEvaluationService,
    private gamification: GamificationService
  ) {}
  
  async handleTranslation(input: EvaluationInput): Promise<WorkflowResult> {
    // 1. Evaluate translation
    const evaluation = await this.evaluation.evaluate(input)
    
    // 2. Award points based on evaluation
    const pointsResult = await this.gamification.awardPoints('translation', {
      accuracy: evaluation.score / 100,
      hintsUsed: input.context.hintsUsed || 0,
      difficulty: this.mapDifficultyToNumber(input.context.difficulty),
      timeSpent: input.context.timeSpent || 0,
      grammarAccuracy: evaluation.grammarScore / 100
    })
    
    // 3. Return combined result
    return {
      evaluation,
      points: pointsResult,
      achievements: pointsResult.achievements || []
    }
  }
}
```

#### **With Progressive Hints Module**
```typescript
// Coordinate evaluation with hints
class HintAwareEvaluation {
  constructor(
    private evaluation: TranslationEvaluationService,
    private hints: ProgressiveHintsService
  ) {}
  
  async evaluateWithHintContext(
    input: EvaluationInput,
    hintsUsed: HintData[]
  ): Promise<EvaluationResult> {
    // Adjust evaluation based on hints used
    const adjustedInput = {
      ...input,
      customInstructions: this.generateHintAwareInstructions(hintsUsed),
      context: {
        ...input.context,
        hintsUsed: hintsUsed.length,
        hintTypes: hintsUsed.map(h => h.type)
      }
    }
    
    const result = await this.evaluation.evaluate(adjustedInput)
    
    // Adjust score based on hint usage
    const adjustedScore = this.adjustScoreForHints(result.score, hintsUsed)
    
    return {
      ...result,
      score: adjustedScore,
      feedback: this.enhanceFeedbackWithHints(result.feedback, hintsUsed)
    }
  }
}
```

---

## 💡 **Progressive Hints API**

### **Core Interface**
```typescript
interface ProgressiveHintsService {
  // Lifecycle
  initialize(config: HintsConfig): Promise<void>
  cleanup(): Promise<void>
  
  // Hint generation
  generateHint(request: HintRequest): Promise<HintResult>
  generateHintSequence(request: HintSequenceRequest): Promise<HintResult[]>
  
  // Hint management
  getAvailableHints(sentenceId: number): Promise<AvailableHints>
  resetHints(sentenceId: number, userId: string): Promise<void>
  
  // Analytics
  trackHintUsage(usage: HintUsage): Promise<void>
  getHintAnalytics(filters: HintAnalyticsFilters): Promise<HintAnalytics>
  
  // Configuration
  updateConfig(config: Partial<HintsConfig>): Promise<void>
  getConfig(): HintsConfig
  
  // State
  getState(): HintsState
  getMetrics(): HintsMetrics
}
```

### **Type Definitions**
```typescript
interface HintsConfig {
  // AI configuration
  aiProvider: 'openai' | 'anthropic' | 'local'
  apiKey: string
  model: string
  
  // Hint behavior
  maxHintsPerSentence: number
  hintDelayMs: number
  adaptiveHints: boolean
  personalizedHints: boolean
  
  // Hint types enabled
  enabledHintTypes: HintType[]
  
  // Performance
  cacheEnabled: boolean
  timeout: number
}

type HintType = 
  | 'word_definition'      // Define difficult words
  | 'grammar_explanation'  // Explain grammar concepts
  | 'structure_guide'      // Show sentence structure
  | 'partial_translation'  // Reveal part of translation
  | 'similar_example'      // Provide similar example
  | 'cultural_context'     // Cultural/contextual information
  | 'pronunciation_guide'  // Pronunciation help
  | 'verb_conjugation'     // Verb form help

interface HintRequest {
  sentenceId: number
  userId: string
  currentLevel: number              // 1-based hint level
  userAttempts: string[]           // Previous translation attempts
  timeSpent: number                // Seconds spent on sentence
  
  // Context
  sentence: {
    english: string
    spanish: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    topic: string
    grammar: string[]
  }
  
  // User context
  userProfile: {
    level: number
    weakAreas: string[]
    preferredHintTypes: HintType[]
    hintsUsedToday: number
  }
  
  // Request options
  preferredType?: HintType
  excludeTypes?: HintType[]
  maxRevealLevel?: number
}

interface HintResult {
  id: string
  type: HintType
  level: number                    // 1-based level
  content: string
  revealLevel: number              // How much is revealed (1-5)
  
  // Metadata
  confidence: number               // AI confidence in hint quality
  estimatedHelpfulness: number     // Predicted helpfulness (1-10)
  targetAudience: 'beginner' | 'intermediate' | 'advanced'
  
  // Usage data
  costPoints: number               // Gamification cost
  maxUsagePerDay?: number
  
  // Related hints
  followUpHints?: string[]         // IDs of logical next hints
  relatedConcepts: string[]
  
  // Analytics
  generated: Date
  generationTime: number
  cached: boolean
}

interface HintSequenceRequest {
  sentenceId: number
  userId: string
  targetHintCount: number          // How many hints to generate
  progressiveRevealing: boolean    // Each hint reveals more
  request: Omit<HintRequest, 'currentLevel'>
}

interface AvailableHints {
  sentenceId: number
  totalHintsAvailable: number
  hintsByType: Record<HintType, number>
  recommendedSequence: HintType[]
  userSpecificHints: number        // Personalized hints available
}

interface HintUsage {
  hintId: string
  userId: string
  sentenceId: number
  usedAt: Date
  helpful: boolean | null          // User feedback
  timeToUse: number               // Time from generation to use
  resultedInCorrectAnswer: boolean
}

interface HintAnalytics {
  totalHintsGenerated: number
  totalHintsUsed: number
  usageRate: number                // hintsUsed / hintsGenerated
  
  helpfulnessRating: number        // Average user rating
  effectivenessRate: number        // % that led to correct answers
  
  popularHintTypes: Array<{
    type: HintType
    usage: number
    effectiveness: number
  }>
  
  userPatterns: {
    averageHintsPerSentence: number
    mostCommonSequence: HintType[]
    timeToFirstHint: number
  }
}

interface HintsState {
  status: 'initializing' | 'ready' | 'generating' | 'error'
  activeGenerations: number
  queuedRequests: number
  lastError?: Error
  
  cache: {
    enabled: boolean
    size: number
    hitRate: number
  }
}

interface HintsMetrics {
  totalRequests: number
  averageGenerationTime: number
  cacheHitRate: number
  errorRate: number
  
  hintTypeDistribution: Record<HintType, number>
  levelDistribution: Record<number, number>
  
  performance: {
    fastest: number
    slowest: number
    p95GenerationTime: number
  }
}
```

### **Usage Examples**

#### **Basic Hint Generation**
```typescript
// Initialize hints service
const hintsService = new ProgressiveHintsService()
await hintsService.initialize({
  aiProvider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  maxHintsPerSentence: 5,
  adaptiveHints: true,
  enabledHintTypes: [
    'word_definition',
    'grammar_explanation', 
    'structure_guide',
    'partial_translation'
  ]
})

// Generate first hint
const hintResult = await hintsService.generateHint({
  sentenceId: 123,
  userId: 'user-456',
  currentLevel: 1,
  userAttempts: ['Como te llamas'],
  timeSpent: 45,
  sentence: {
    english: 'What is your name?',
    spanish: ['¿Cómo te llamas?', '¿Cuál es tu nombre?'],
    difficulty: 'beginner',
    topic: 'introductions',
    grammar: ['interrogative', 'reflexive_pronouns']
  },
  userProfile: {
    level: 2,
    weakAreas: ['interrogatives', 'pronouns'],
    preferredHintTypes: ['word_definition', 'structure_guide'],
    hintsUsedToday: 3
  }
})

console.log(`Hint: ${hintResult.content}`)
console.log(`Type: ${hintResult.type}`)
console.log(`Helpfulness: ${hintResult.estimatedHelpfulness}/10`)
```

#### **Progressive Hint Sequence**
```typescript
// Generate a sequence of progressive hints
const hintSequence = await hintsService.generateHintSequence({
  sentenceId: 123,
  userId: 'user-456',
  targetHintCount: 3,
  progressiveRevealing: true,
  request: {
    userAttempts: ['Como te llamas', 'Que es tu nombre'],
    timeSpent: 120,
    sentence: /* ... */,
    userProfile: /* ... */
  }
})

// Display hints progressively
hintSequence.forEach((hint, index) => {
  console.log(`Hint ${index + 1} (${hint.type}): ${hint.content}`)
  console.log(`Reveals: Level ${hint.revealLevel}/5`)
})

// Example output:
// Hint 1 (word_definition): "¿Cómo?" means "How?" in English
// Hint 2 (structure_guide): Spanish questions start with ¿ and end with ?
// Hint 3 (partial_translation): "¿Cómo te ____?" = "How do you ____?"
```

#### **Adaptive Hints Based on User Performance**
```typescript
class AdaptiveHintManager {
  constructor(private hintsService: ProgressiveHintsService) {}
  
  async generatePersonalizedHint(
    request: HintRequest,
    userHistory: UserLearningHistory
  ): Promise<HintResult> {
    // Analyze user's learning patterns
    const weakAreas = this.analyzeWeakAreas(userHistory)
    const preferredHintTypes = this.analyzeHintPreferences(userHistory)
    
    // Adjust hint request based on analysis
    const personalizedRequest = {
      ...request,
      userProfile: {
        ...request.userProfile,
        weakAreas: [...weakAreas],
        preferredHintTypes: [...preferredHintTypes]
      },
      // Prefer hint types that have helped this user before
      preferredType: preferredHintTypes[0],
      // Exclude types that haven't been helpful
      excludeTypes: this.getUnhelpfulHintTypes(userHistory)
    }
    
    return await this.hintsService.generateHint(personalizedRequest)
  }
  
  private analyzeWeakAreas(history: UserLearningHistory): string[] {
    // Analyze where user struggles most
    return history.sessions
      .filter(session => session.accuracy < 0.7)
      .flatMap(session => session.grammarTopics)
      .reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      .entries()
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic)
  }
}
```

### **Integration with Evaluation Module**
```typescript
// Coordinate hints with evaluation
class HintAwarePracticeSession {
  constructor(
    private hints: ProgressiveHintsService,
    private evaluation: TranslationEvaluationService
  ) {}
  
  async handleHintRequest(
    sentenceId: number,
    userId: string,
    currentAttempts: string[]
  ): Promise<HintWithContext> {
    // Generate hint
    const hint = await this.hints.generateHint({
      sentenceId,
      userId,
      currentLevel: this.getNextHintLevel(sentenceId, userId),
      userAttempts: currentAttempts,
      /* ... other context */
    })
    
    // Track hint usage for analytics
    await this.hints.trackHintUsage({
      hintId: hint.id,
      userId,
      sentenceId,
      usedAt: new Date(),
      helpful: null, // Will be updated based on user feedback
      timeToUse: 0,  // Immediate use
      resultedInCorrectAnswer: false // Will be updated after next attempt
    })
    
    return {
      hint,
      context: {
        hintsUsedSoFar: await this.getHintsUsedCount(sentenceId, userId),
        nextHintAvailable: await this.checkNextHintAvailable(sentenceId, userId),
        pointsCost: hint.costPoints
      }
    }
  }
}
```

---

This comprehensive API documentation provides developers with detailed interfaces, usage examples, and integration patterns for AIdioma's most critical modules. The documentation emphasizes TypeScript-first development, comprehensive error handling, and performance monitoring.

*Continue reading for additional module APIs including Gamification, Progress Tracking, and UI Interface modules...* 