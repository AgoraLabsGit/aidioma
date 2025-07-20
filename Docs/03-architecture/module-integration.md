# Module Integration Architecture
## How 12 Modules Power 6 Pages

---

## 🧩 **Integration Overview**

AIdioma's **module-first architecture** enables 64% component reusability through standardized APIs and integration patterns. Each module is designed for cross-page usage with consistent interfaces.

### **Integration Principles**
- **Standardized APIs**: All modules implement common interface patterns
- **Event-Driven Communication**: Decoupled module interactions
- **Shared State Management**: TanStack Query for cross-module state
- **Type Safety**: Strict TypeScript interfaces for all integrations

---

## 📊 **Module Integration Matrix**

### **Universal Modules** (Used by 5+ pages)
| Module | Practice | Reading | Conversation | Memorize | Progress | Settings | Usage Pattern |
|--------|----------|---------|--------------|----------|----------|----------|---------------|
| **Page Layout** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Consistent wrapper |
| **Progress Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Analytics collection |
| **Gamification** | ✅ | ✅ | ✅ | ✅ | ✅ | - | Points & achievements |

### **High-Reuse Modules** (Used by 3-4 pages)
| Module | Practice | Reading | Conversation | Memorize | Progress | Settings | Usage Pattern |
|--------|----------|---------|--------------|----------|----------|----------|---------------|
| **Progressive Hints** | ✅ | ✅ | ✅ | ✅ | - | - | Learning assistance |
| **Action Buttons** | ✅ | ✅ | ✅ | ✅ | - | - | UI interactions |
| **Session Stats** | ✅ | ✅ | ✅ | ✅ | ✅ | - | Performance display |

### **Specialized Modules** (Used by 1-2 pages)
| Module | Practice | Reading | Conversation | Memorize | Progress | Settings | Usage Pattern |
|--------|----------|---------|--------------|----------|----------|----------|---------------|
| **Translation Eval** | ✅ | ✅ | ✅ | - | - | - | AI evaluation |
| **Content Processing** | - | ✅ | ✅ | ✅ | - | - | Text analysis |
| **Conversation Suite** | - | - | ✅ | - | - | - | AI chat |

---

## 🔄 **Integration Patterns**

### **1. Standard Module Interface**
```typescript
interface ModuleService<TConfig, TInput, TOutput, TState> {
  // Lifecycle management
  initialize(config: TConfig): Promise<void>
  cleanup(): Promise<void>
  
  // Core functionality
  process(input: TInput): Promise<TOutput>
  
  // State management
  getState(): TState
  setState(state: Partial<TState>): void
  
  // Performance monitoring
  getMetrics(): ModuleMetrics
}
```

### **2. Event-Driven Communication**
```typescript
// Module publishes events
interface ModuleEventBus {
  emit<T>(event: string, data: T): void
  subscribe<T>(event: string, callback: (data: T) => void): () => void
}

// Example: Translation Evaluation publishes score
translationEval.emit('evaluation:completed', {
  score: 85,
  feedback: "Good translation with minor grammar issues",
  userId: "user123"
})

// Gamification module subscribes to score events
gamification.subscribe('evaluation:completed', (data) => {
  const points = calculatePoints(data.score)
  gamification.awardPoints(data.userId, points)
})
```

### **3. Shared State Integration**
```typescript
// TanStack Query for cross-module state
const useModuleState = <T>(moduleId: string, key: string) => {
  return useQuery({
    queryKey: ['module', moduleId, key],
    queryFn: () => moduleRegistry.getState(moduleId, key)
  })
}

// Usage across modules
const { data: userProgress } = useModuleState('progress-tracking', 'current-user')
const { data: gamificationData } = useModuleState('gamification', 'user-points')
```

---

## 📱 **Page-Specific Integration**

### **Practice Page Integration**
```typescript
const PracticePage = () => {
  // Core modules for practice functionality
  const translationEval = useModule('translation-evaluation')
  const progressiveHints = useModule('progressive-hints')
  const gamification = useModule('gamification')
  const progressTracking = useModule('progress-tracking')
  
  // Practice workflow orchestration
  const handleTranslationSubmit = async (translation: string) => {
    // 1. Evaluate translation
    const evaluation = await translationEval.evaluate({
      userTranslation: translation,
      sentenceId: currentSentence.id
    })
    
    // 2. Award points
    const points = await gamification.calculatePoints({
      score: evaluation.score,
      hintsUsed: hintsUsed
    })
    
    // 3. Track progress
    await progressTracking.recordActivity({
      type: 'translation',
      score: evaluation.score,
      points
    })
    
    return { evaluation, points }
  }
}
```

### **Reading Page Integration**
```typescript
const ReadingPage = () => {
  // Modules for reading functionality
  const contentProcessing = useModule('content-processing')
  const readingInterface = useModule('reading-interface')
  const progressiveHints = useModule('progressive-hints')
  
  // Text processing and display
  const processTextContent = async (rawText: string) => {
    // 1. Process and analyze text
    const processedContent = await contentProcessing.analyzeText({
      text: rawText,
      options: { extractVocabulary: true, assessDifficulty: true }
    })
    
    // 2. Setup interactive reading
    readingInterface.initializeContent({
      sentences: processedContent.sentences,
      vocabulary: processedContent.vocabulary
    })
    
    // 3. Enable word-level hints
    progressiveHints.configureForReading({
      vocabularyList: processedContent.vocabulary
    })
  }
}
```

### **Cross-Page Module Sharing**
```typescript
// Module registry for sharing instances
class ModuleRegistry {
  private modules = new Map<string, ModuleService>()
  
  register<T extends ModuleService>(id: string, module: T): void {
    this.modules.set(id, module)
  }
  
  get<T extends ModuleService>(id: string): T {
    return this.modules.get(id) as T
  }
  
  // Shared modules available across all pages
  getSharedModules() {
    return {
      pageLayout: this.get('page-layout'),
      progressTracking: this.get('progress-tracking'),
      gamification: this.get('gamification'),
      sessionStats: this.get('session-stats')
    }
  }
}
```

---

## 🔗 **Module Dependencies**

### **Dependency Graph**
```typescript
const moduleDependencies = {
  'translation-evaluation': [], // No dependencies
  'ai-cost-optimization': [], // No dependencies
  'gamification': ['translation-evaluation'], // Needs scores
  'progress-tracking': ['translation-evaluation', 'gamification'], // Needs data
  'progressive-hints': ['translation-evaluation'], // Shares AI infrastructure
  'content-processing': ['ai-cost-optimization'], // Uses AI caching
  'conversation-suite': ['ai-cost-optimization'], // Uses AI caching
}
```

### **Module Loading Strategy**
```typescript
// Dependency injection container
class ModuleDI {
  private loaded = new Set<string>()
  
  async loadModule(moduleId: string): Promise<ModuleService> {
    // Load dependencies first
    const deps = moduleDependencies[moduleId] || []
    for (const dep of deps) {
      if (!this.loaded.has(dep)) {
        await this.loadModule(dep)
      }
    }
    
    // Initialize module with injected dependencies
    const module = await this.createModule(moduleId, deps)
    this.loaded.add(moduleId)
    return module
  }
}
```

---

## ⚡ **Performance Optimization**

### **Module Lazy Loading**
```typescript
// Lazy load modules only when needed
const useModule = (moduleId: string) => {
  return useMemo(async () => {
    if (!moduleRegistry.has(moduleId)) {
      const module = await import(`../modules/${moduleId}`)
      moduleRegistry.register(moduleId, module.default)
    }
    return moduleRegistry.get(moduleId)
  }, [moduleId])
}
```

### **Shared Resource Management**
```typescript
// AI modules share caching infrastructure
const aiResourceManager = {
  openaiClient: null as OpenAI | null,
  cacheLayer: null as CacheService | null,
  
  initialize() {
    this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    this.cacheLayer = new CacheService()
  },
  
  // Shared by all AI modules
  getSharedResources() {
    return {
      ai: this.openaiClient,
      cache: this.cacheLayer
    }
  }
}
```

### **Module Performance Monitoring**
```typescript
interface ModuleMetrics {
  moduleId: string
  initTime: number
  avgProcessingTime: number
  errorRate: number
  memoryUsage: number
  cacheHitRate?: number
}

const moduleMonitor = {
  track(moduleId: string, operation: string, duration: number) {
    metrics.histogram(`module.${moduleId}.${operation}.duration`, duration)
    metrics.increment(`module.${moduleId}.${operation}.count`)
  },
  
  getModuleHealth(moduleId: string): ModuleMetrics {
    return {
      moduleId,
      initTime: metrics.get(`module.${moduleId}.init.duration`),
      avgProcessingTime: metrics.get(`module.${moduleId}.process.avg`),
      errorRate: metrics.get(`module.${moduleId}.errors.rate`),
      memoryUsage: process.memoryUsage().heapUsed
    }
  }
}
``` 