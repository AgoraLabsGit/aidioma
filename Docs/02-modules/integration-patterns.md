# Module Integration Patterns
## How AIdioma's 12 Modules Work Together

*This document explains the patterns, protocols, and best practices for integrating AIdioma's modules to create seamless page experiences.*

---

## 🔄 **Integration Philosophy**

### **Core Integration Principles**
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **Event-Driven Architecture**: Modules react to events from other modules
- **Dependency Injection**: Modules declare their dependencies explicitly
- **Stateless Design**: Modules don't maintain internal state between requests
- **Fail-Safe Operation**: Modules degrade gracefully when dependencies fail

### **Communication Patterns**
- **Direct API Calls**: For synchronous, request-response interactions
- **Event Streaming**: For asynchronous, fire-and-forget notifications
- **Shared State**: For data that multiple modules need to access
- **Message Queues**: For reliable, ordered processing of operations

---

## 📊 **Module Dependency Map**

### **High-Level Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                     Page Layer                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐│
│  │Practice │ │Reading  │ │Converse │ │Memorize │ │Progress ││
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘│
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Module Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Language/AI  │  │   User Exp   │  │ UI Interface │      │
│  │  Modules     │  │   Modules    │  │   Modules    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Database  │ │AI Service│ │  Cache   │ │Analytics │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### **Module Dependencies**
```typescript
// Language/AI Modules
const translationEvaluation = {
  dependencies: ['aiCostOptimization', 'database', 'analytics'],
  provides: ['evaluation', 'scoring', 'feedback']
}

const progressiveHints = {
  dependencies: ['database', 'analytics'],
  provides: ['hints', 'guidance', 'learning-support']
}

const conversationSuite = {
  dependencies: ['aiService', 'analytics', 'gamification'],
  provides: ['chat', 'personas', 'conversation-flow']
}

// User Experience Modules
const gamification = {
  dependencies: ['database', 'analytics'],
  provides: ['points', 'streaks', 'achievements', 'levels']
}

const progressTracking = {
  dependencies: ['database', 'analytics', 'gamification'],
  provides: ['insights', 'trends', 'performance-metrics']
}
```

---

## 🎯 **Page Composition Patterns**

### **Practice Page Integration**
```typescript
// Practice page orchestrates multiple modules
class PracticePageController {
  constructor(
    private translationEval: TranslationEvaluationModule,
    private hints: ProgressiveHintsModule,
    private gamification: GamificationModule,
    private progress: ProgressTrackingModule,
    private practiceUI: PracticeInterfaceModule
  ) {}

  async handleTranslationSubmission(input: TranslationInput): Promise<PracticeResult> {
    // 1. Evaluate translation
    const evaluation = await this.translationEval.evaluate({
      sentenceId: input.sentenceId,
      userTranslation: input.translation,
      hintsUsed: input.hintsUsed
    })

    // 2. Award points based on evaluation
    const pointsResult = await this.gamification.awardPoints('translation', {
      accuracy: evaluation.score / 100,
      hintsUsed: input.hintsUsed,
      difficulty: input.difficulty
    })

    // 3. Track progress analytics
    await this.progress.recordActivity({
      type: 'translation',
      result: evaluation,
      points: pointsResult,
      timestamp: new Date()
    })

    // 4. Check for level up or achievements
    const achievements = await this.gamification.checkAchievements(input.userId, {
      type: 'translation',
      score: evaluation.score,
      consecutiveCorrect: pointsResult.streakCount
    })

    return {
      evaluation,
      pointsResult,
      achievements,
      newLevel: pointsResult.levelUp
    }
  }
}
```

### **Reading Page Integration**
```typescript
// Reading page combines content processing with practice
class ReadingPageController {
  constructor(
    private contentProcessing: ContentProcessingModule,
    private readingUI: ReadingInterfaceModule,
    private hints: ProgressiveHintsModule,
    private translationEval: TranslationEvaluationModule,
    private gamification: GamificationModule
  ) {}

  async loadText(textId: string): Promise<ReadingSession> {
    // 1. Process text content
    const processedContent = await this.contentProcessing.processText({
      textId,
      includeHints: true,
      analyzeDifficulty: true
    })

    // 2. Create interactive reading interface
    const readingInterface = await this.readingUI.createInterface({
      content: processedContent,
      onWordClick: this.handleWordHint.bind(this),
      onSentencePractice: this.handleSentencePractice.bind(this)
    })

    return {
      content: processedContent,
      interface: readingInterface,
      sessionId: generateSessionId()
    }
  }

  private async handleWordHint(word: string, context: string): Promise<HintResult> {
    return await this.hints.getWordHint({
      word,
      context,
      level: 'basic' // Start with basic hint
    })
  }

  private async handleSentencePractice(sentence: string): Promise<PracticeResult> {
    // Delegate to translation evaluation for in-reading practice
    return await this.translationEval.evaluate({
      originalSentence: sentence,
      context: 'reading',
      difficulty: 'adaptive'
    })
  }
}
```

---

## 🔌 **Inter-Module Communication**

### **Event-Driven Integration**
```typescript
// Central event bus for module communication
interface ModuleEvent {
  type: string
  payload: any
  source: string
  timestamp: Date
  correlationId: string
}

class EventBus {
  private subscribers: Map<string, Array<(event: ModuleEvent) => void>> = new Map()

  subscribe(eventType: string, handler: (event: ModuleEvent) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, [])
    }
    this.subscribers.get(eventType)!.push(handler)
  }

  publish(event: ModuleEvent): void {
    const handlers = this.subscribers.get(event.type) || []
    handlers.forEach(handler => {
      try {
        handler(event)
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error)
      }
    })
  }
}

// Example: Gamification reacts to evaluation events
class GamificationModule {
  constructor(private eventBus: EventBus) {
    this.eventBus.subscribe('evaluation.completed', this.handleEvaluationCompleted.bind(this))
    this.eventBus.subscribe('hint.used', this.handleHintUsed.bind(this))
    this.eventBus.subscribe('session.completed', this.handleSessionCompleted.bind(this))
  }

  private async handleEvaluationCompleted(event: ModuleEvent): Promise<void> {
    const { userId, score, difficulty, activity } = event.payload
    
    const pointsResult = await this.awardPoints(activity, {
      accuracy: score / 100,
      difficulty,
      timestamp: event.timestamp
    })

    // Publish points awarded event
    this.eventBus.publish({
      type: 'points.awarded',
      payload: { userId, pointsResult },
      source: 'gamification',
      timestamp: new Date(),
      correlationId: event.correlationId
    })
  }
}
```

### **Shared State Management**
```typescript
// Shared state for data that multiple modules need
interface SharedState {
  user: {
    id: string
    level: number
    totalPoints: number
    currentStreak: number
    preferences: UserPreferences
  }
  session: {
    id: string
    startTime: Date
    currentPage: string
    activity: ActivityType
    metrics: SessionMetrics
  }
  learning: {
    hintsUsedToday: number
    practiceGoal: number
    practiceCompleted: number
    weakAreas: string[]
    strongAreas: string[]
  }
}

class StateManager {
  private state: SharedState
  private listeners: Map<string, Array<(newValue: any, oldValue: any) => void>> = new Map()

  get<K extends keyof SharedState>(key: K): SharedState[K] {
    return this.state[key]
  }

  set<K extends keyof SharedState>(key: K, value: SharedState[K]): void {
    const oldValue = this.state[key]
    this.state[key] = value
    
    // Notify listeners
    const keyListeners = this.listeners.get(key) || []
    keyListeners.forEach(listener => listener(value, oldValue))
  }

  subscribe<K extends keyof SharedState>(
    key: K,
    listener: (newValue: SharedState[K], oldValue: SharedState[K]) => void
  ): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(listener)
  }
}
```

---

## 🎨 **UI Module Integration**

### **Component Composition Pattern**
```typescript
// UI modules provide composable components
interface UIModule {
  createComponent(props: ComponentProps): React.ComponentType
  updateComponent(id: string, newProps: Partial<ComponentProps>): void
  destroyComponent(id: string): void
}

// Practice Interface Module
class PracticeInterfaceModule implements UIModule {
  createComponent(props: PracticeProps): React.ComponentType {
    return function PracticeInterface() {
      const [userInput, setUserInput] = useState('')
      const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
      const [hints, setHints] = useState<HintData[]>([])

      const handleSubmit = async () => {
        // Integrate with translation evaluation module
        const result = await props.onEvaluate({
          userTranslation: userInput,
          sentenceId: props.sentenceId
        })
        setEvaluation(result)
      }

      const handleHintRequest = async () => {
        // Integrate with hints module
        const hint = await props.onHintRequest({
          sentenceId: props.sentenceId,
          currentLevel: hints.length
        })
        setHints(prev => [...prev, hint])
      }

      return (
        <div className="practice-interface">
          <SentenceDisplay sentence={props.sentence} />
          <TranslationInput 
            value={userInput}
            onChange={setUserInput}
            onSubmit={handleSubmit}
          />
          <HintDisplay hints={hints} onRequestHint={handleHintRequest} />
          {evaluation && <EvaluationDisplay result={evaluation} />}
        </div>
      )
    }
  }
}
```

### **Cross-Module UI State Synchronization**
```typescript
// Synchronize UI state across modules
class UIStateSync {
  constructor(
    private stateManager: StateManager,
    private eventBus: EventBus
  ) {
    this.setupSynchronization()
  }

  private setupSynchronization(): void {
    // Sync gamification updates to UI
    this.eventBus.subscribe('points.awarded', (event) => {
      this.updatePointsDisplay(event.payload.pointsResult)
    })

    // Sync progress updates to UI
    this.eventBus.subscribe('progress.updated', (event) => {
      this.updateProgressBars(event.payload.progressData)
    })

    // Sync level up notifications
    this.eventBus.subscribe('level.increased', (event) => {
      this.showLevelUpAnimation(event.payload.newLevel)
    })
  }

  private updatePointsDisplay(pointsResult: PointsResult): void {
    // Update all UI components that display points
    const currentUser = this.stateManager.get('user')
    this.stateManager.set('user', {
      ...currentUser,
      totalPoints: currentUser.totalPoints + pointsResult.totalPoints,
      currentStreak: pointsResult.streakCount
    })
  }
}
```

---

## 🔄 **Error Handling & Resilience**

### **Circuit Breaker Pattern**
```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime: Date | null = null
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN'
      } else {
        throw new Error('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = new Date()
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN'
    }
  }

  private shouldAttemptReset(): boolean {
    return this.lastFailureTime && 
           (Date.now() - this.lastFailureTime.getTime()) > this.timeout
  }
}

// Apply circuit breaker to AI-dependent modules
class TranslationEvaluationModule {
  private circuitBreaker = new CircuitBreaker(5, 30000)

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    try {
      return await this.circuitBreaker.execute(async () => {
        return await this.aiService.evaluate(input)
      })
    } catch (error) {
      // Fallback to cached or template response
      return await this.getFallbackEvaluation(input)
    }
  }
}
```

### **Graceful Degradation**
```typescript
// Modules provide fallback functionality when dependencies fail
interface FallbackStrategy {
  canHandle(error: Error): boolean
  execute(originalInput: any, error: Error): Promise<any>
}

class ModuleWithFallback {
  constructor(
    private primaryService: any,
    private fallbackStrategies: FallbackStrategy[]
  ) {}

  async execute(input: any): Promise<any> {
    try {
      return await this.primaryService.execute(input)
    } catch (error) {
      for (const strategy of this.fallbackStrategies) {
        if (strategy.canHandle(error)) {
          return await strategy.execute(input, error)
        }
      }
      throw error
    }
  }
}

// Example: Hints module with offline fallback
class ProgressiveHintsModule extends ModuleWithFallback {
  constructor() {
    super(
      new AIHintsService(),
      [
        new CachedHintsFallback(),
        new StaticHintsFallback(),
        new NoHintsFallback()
      ]
    )
  }
}
```

---

## 📊 **Performance Optimization**

### **Module Caching Coordination**
```typescript
// Coordinate caching strategies across modules
class CacheCoordinator {
  private caches = new Map<string, CacheStrategy>()

  registerModule(moduleName: string, cacheStrategy: CacheStrategy): void {
    this.caches.set(moduleName, cacheStrategy)
  }

  async warmupCaches(): Promise<void> {
    const warmupPromises = Array.from(this.caches.entries()).map(
      ([moduleName, cache]) => cache.warmup().catch(error => {
        console.error(`Failed to warm up cache for ${moduleName}:`, error)
      })
    )
    
    await Promise.allSettled(warmupPromises)
  }

  async invalidateRelatedCaches(event: ModuleEvent): Promise<void> {
    // Invalidate caches based on event type
    switch (event.type) {
      case 'user.level.changed':
        await this.invalidateUserRelatedCaches(event.payload.userId)
        break
      case 'content.updated':
        await this.invalidateContentRelatedCaches(event.payload.contentId)
        break
    }
  }
}
```

### **Lazy Loading & Code Splitting**
```typescript
// Lazy load modules only when needed
class ModuleLoader {
  private loadedModules = new Map<string, any>()

  async loadModule(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName)
    }

    let module: any
    switch (moduleName) {
      case 'conversation-suite':
        module = await import('./language-ai/conversation-suite')
        break
      case 'spaced-repetition':
        module = await import('./ui-interface/flash-cards')
        break
      // ... other modules
    }

    this.loadedModules.set(moduleName, module)
    return module
  }

  async preloadModules(moduleNames: string[]): Promise<void> {
    const preloadPromises = moduleNames.map(name => this.loadModule(name))
    await Promise.allSettled(preloadPromises)
  }
}
```

---

## ✅ **Integration Testing**

### **Module Integration Test Framework**
```typescript
// Test how modules work together
describe('Module Integration', () => {
  let practiceController: PracticePageController
  let mockModules: {
    translationEval: jest.Mocked<TranslationEvaluationModule>
    hints: jest.Mocked<ProgressiveHintsModule>
    gamification: jest.Mocked<GamificationModule>
  }

  beforeEach(() => {
    mockModules = {
      translationEval: createMockModule('translationEval'),
      hints: createMockModule('hints'),
      gamification: createMockModule('gamification')
    }
    
    practiceController = new PracticePageController(
      mockModules.translationEval,
      mockModules.hints,
      mockModules.gamification
    )
  })

  it('should coordinate translation evaluation with gamification', async () => {
    // Setup
    mockModules.translationEval.evaluate.mockResolvedValue({
      score: 85,
      feedback: 'Good translation!'
    })
    
    mockModules.gamification.awardPoints.mockResolvedValue({
      pointsEarned: 8,
      totalPoints: 108
    })

    // Execute
    const result = await practiceController.handleTranslationSubmission({
      sentenceId: 1,
      translation: 'Hola mundo',
      hintsUsed: 0
    })

    // Verify integration
    expect(mockModules.translationEval.evaluate).toHaveBeenCalledWith({
      sentenceId: 1,
      userTranslation: 'Hola mundo',
      hintsUsed: 0
    })
    
    expect(mockModules.gamification.awardPoints).toHaveBeenCalledWith('translation', {
      accuracy: 0.85,
      hintsUsed: 0,
      difficulty: expect.any(Number)
    })
    
    expect(result).toEqual({
      evaluation: expect.objectContaining({ score: 85 }),
      pointsResult: expect.objectContaining({ pointsEarned: 8 })
    })
  })
})
```

---

*Module integration is what transforms AIdioma from a collection of features into a cohesive, intelligent learning platform. These patterns ensure modules work together seamlessly while maintaining their independence and reusability.* 