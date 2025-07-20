# Page Specifications
## How 12 Modules Compose Into 6 Pages

*This section documents how AIdioma's 12 reusable modules combine to create 6 distinct page experiences, demonstrating the power of modular architecture and component reusability.*

---

## 🏗️ **Modular Page Architecture**

### **Architecture Overview**
AIdioma uses a **composition-based architecture** where pages are built by combining multiple modules rather than being monolithic implementations. This approach provides:

- **Code Reusability**: Modules serve multiple pages
- **Consistent UX**: Shared modules ensure uniform behavior
- **Maintainability**: Updates to modules propagate across all pages
- **Scalability**: New pages can be built by recombining existing modules

### **Module Distribution Across Pages**

```
┌─────────────────────────────────────────────────────────────────┐
│                        6 AIdioma Pages                         │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│   Practice  │   Reading   │Conversation │  Memorize   │Progress│
│    Page     │    Page     │    Page     │    Page     │  Page  │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     12 Reusable Modules                        │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Language/AI   │  User Experience │      UI Interface           │
│    Modules      │     Modules     │        Modules              │
│                 │                 │                             │
│ • Translation   │ • Gamification  │ • Practice Interface        │
│   Evaluation    │ • Progress      │ • Reading Interface         │
│ • Progressive   │   Tracking      │ • Action Buttons            │
│   Hints         │ • User Profile  │ • Session Stats             │
│ • Conversation  │ • Session       │ • Page Layout               │
│   Suite         │   Management    │                             │
│ • Content       │                 │                             │
│   Processing    │                 │                             │
│ • AI Cost       │                 │                             │
│   Optimization  │                 │                             │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

---

## 📊 **Module Reusability Matrix**

| Module | Practice | Reading | Conversation | Memorize | Progress | Settings | Reusability |
|--------|----------|---------|--------------|----------|----------|----------|-------------|
| **Page Layout** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| **Gamification** | ✅ | ✅ | ✅ | ✅ | ✅ | - | **83%** |
| **Progress Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| **Translation Evaluation** | ✅ | ✅ | ✅ | - | - | - | **50%** |
| **Progressive Hints** | ✅ | ✅ | ✅ | ✅ | - | - | **67%** |
| **Action Buttons** | ✅ | ✅ | ✅ | ✅ | - | - | **67%** |
| **Session Stats** | ✅ | ✅ | ✅ | ✅ | ✅ | - | **83%** |
| **Practice Interface** | ✅ | ✅ | - | ✅ | - | - | **50%** |
| **Reading Interface** | - | ✅ | - | - | - | - | **17%** |
| **Conversation Suite** | - | - | ✅ | - | - | - | **17%** |
| **Content Processing** | - | ✅ | - | ✅ | - | - | **33%** |
| **AI Cost Optimization** | ✅ | ✅ | ✅ | - | - | - | **50%** |

### **Reusability Insights**
- **Universal Modules** (100% reuse): Page Layout, Progress Tracking
- **High Reuse Modules** (80%+): Gamification, Session Stats  
- **Specialized Modules** (50% or less): Reading Interface, Conversation Suite
- **Average Reusability**: **64%** - excellent for modular architecture

---

## 📄 **Page Specifications**

### **Page Documentation Structure**
Each page specification includes:
- **Module Composition**: Which modules power the page
- **Integration Patterns**: How modules communicate
- **Unique Features**: Page-specific functionality
- **Component Hierarchy**: UI component structure
- **Data Flow**: How data moves between modules

### **Available Page Specifications**

| Page | Purpose | Modules Used | Complexity |
|------|---------|--------------|------------|
| **[practice-page.md](./practice-page.md)** | Core translation practice | 8 modules | **High** |
| **[reading-page.md](./reading-page.md)** | Interactive text reading | 7 modules | **High** |
| **[conversation-page.md](./conversation-page.md)** | AI conversation practice | 6 modules | **Medium** |
| **[memorize-page.md](./memorize-page.md)** | Spaced repetition flashcards | 6 modules | **Medium** |
| **[progress-page.md](./progress-page.md)** | Learning analytics dashboard | 4 modules | **Low** |
| **[settings-page.md](./settings-page.md)** | User preferences and configuration | 3 modules | **Low** |

---

## 🎯 **Module Integration Patterns**

### **Common Integration Patterns**

#### **1. Evaluation → Gamification → Progress**
```typescript
// Pattern used by: Practice, Reading, Conversation
const handleUserAction = async (userInput: string) => {
  // 1. Evaluate user input
  const evaluation = await translationEvaluation.evaluate({
    userInput,
    context: currentContext
  })
  
  // 2. Award points based on evaluation
  const pointsResult = await gamification.awardPoints('translation', {
    accuracy: evaluation.score / 100,
    hintsUsed: session.hintsUsed
  })
  
  // 3. Track progress
  await progressTracking.recordActivity({
    type: 'translation',
    result: evaluation,
    points: pointsResult
  })
  
  // 4. Update UI
  sessionStats.updateStats({
    evaluation,
    pointsResult,
    progressData: await progressTracking.getCurrentProgress()
  })
}
```

#### **2. Content → Processing → Interface**
```typescript
// Pattern used by: Reading, Memorize
const loadContent = async (contentId: string) => {
  // 1. Load raw content
  const rawContent = await contentService.getContent(contentId)
  
  // 2. Process for learning
  const processedContent = await contentProcessing.processText({
    content: rawContent,
    difficulty: user.level,
    includeHints: true
  })
  
  // 3. Render in appropriate interface
  if (pageType === 'reading') {
    readingInterface.displayContent(processedContent)
  } else {
    practiceInterface.createFlashcards(processedContent)
  }
}
```

#### **3. Universal Layout → Stats → Filters → Content**
```typescript
// Pattern used by: All practice pages
const StandardPageStructure = () => (
  <PageLayout pageTitle="Practice" pageIcon={Play}>
    {/* 1. Session Stats - Always first */}
    <SessionStats 
      currentItem={session.currentItem}
      totalItems={session.totalItems}
      correctCount={session.correctCount}
      incorrectCount={session.incorrectCount}
    />
    
    {/* 2. Filters - Always second */}
    <PracticeFilters 
      isOpen={filtersOpen}
      onToggle={() => setFiltersOpen(!filtersOpen)}
      // Page-specific filter configuration
    />
    
    {/* 3. Main Content - Always third */}
    <div className="max-w-4xl mx-auto w-full">
      {/* Page-specific content modules */}
      <PageSpecificContent />
      
      {/* Action buttons at bottom */}
      <ActionButtons {...actionButtonProps} />
    </div>
  </PageLayout>
)
```

---

## 🔄 **Cross-Page Module Communication**

### **Event Bus Integration**
```typescript
// Modules communicate across pages through event bus
interface PageEventBus {
  // Evaluation events
  'evaluation.completed': { userId: string; result: EvaluationResult }
  'evaluation.failed': { userId: string; error: string }
  
  // Gamification events  
  'points.awarded': { userId: string; points: number; reason: string }
  'level.increased': { userId: string; newLevel: number }
  'achievement.unlocked': { userId: string; achievement: Achievement }
  
  // Progress events
  'progress.updated': { userId: string; progressData: ProgressData }
  'session.completed': { userId: string; sessionResults: SessionResults }
  
  // Navigation events
  'page.changed': { from: string; to: string; userId: string }
  'module.loaded': { moduleName: string; pageContext: string }
}

// Example: Progress tracking reacts to events from any page
progressTracking.subscribe('evaluation.completed', (event) => {
  updateUserProgress(event.userId, event.result)
})

progressTracking.subscribe('points.awarded', (event) => {
  updatePointsHistory(event.userId, event.points, event.reason)
})
```

### **Shared State Management**
```typescript
// State shared across all pages
interface GlobalAppState {
  user: UserState
  session: SessionState
  progress: ProgressState
  preferences: UserPreferences
}

// State management with persistence
class StateManager {
  private state: GlobalAppState
  private listeners: Map<string, Function[]> = new Map()
  
  // Subscribe to state changes
  subscribe<K extends keyof GlobalAppState>(
    key: K, 
    callback: (newValue: GlobalAppState[K]) => void
  ) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, [])
    }
    this.listeners.get(key)!.push(callback)
  }
  
  // Update state with persistence
  setState<K extends keyof GlobalAppState>(
    key: K, 
    value: GlobalAppState[K]
  ) {
    this.state[key] = value
    
    // Persist to localStorage
    localStorage.setItem(`aiidioma-${key}`, JSON.stringify(value))
    
    // Notify listeners
    const callbacks = this.listeners.get(key) || []
    callbacks.forEach(callback => callback(value))
  }
}
```

---

## 📈 **Performance Optimization Patterns**

### **Module Loading Strategies**

#### **1. Lazy Loading by Page**
```typescript
// Load only necessary modules per page
const pageModuleMap = {
  practice: [
    'translation-evaluation',
    'progressive-hints', 
    'gamification',
    'practice-interface'
  ],
  reading: [
    'content-processing',
    'reading-interface',
    'translation-evaluation',
    'progressive-hints'
  ],
  conversation: [
    'conversation-suite',
    'translation-evaluation',
    'gamification'
  ]
}

// Dynamic module loading
const loadPageModules = async (pageName: string) => {
  const moduleNames = pageModuleMap[pageName] || []
  
  const modules = await Promise.all(
    moduleNames.map(name => import(`./modules/${name}`))
  )
  
  return modules.reduce((acc, module, index) => {
    acc[moduleNames[index]] = module.default
    return acc
  }, {})
}
```

#### **2. Module Caching & Preloading**
```typescript
// Cache frequently used modules
class ModuleCache {
  private cache = new Map<string, any>()
  private preloadQueue: string[] = []
  
  async getModule(name: string): Promise<any> {
    if (this.cache.has(name)) {
      return this.cache.get(name)
    }
    
    const module = await import(`./modules/${name}`)
    this.cache.set(name, module.default)
    return module.default
  }
  
  // Preload likely next modules
  preloadModules(moduleNames: string[]) {
    moduleNames.forEach(name => {
      if (!this.cache.has(name) && !this.preloadQueue.includes(name)) {
        this.preloadQueue.push(name)
        // Preload in background
        this.getModule(name).catch(() => {}) // Silent fail for preloading
      }
    })
  }
}
```

---

## 🎯 **Development Workflow for Pages**

### **Adding a New Page**

#### **1. Page Planning**
```typescript
// 1. Define page requirements
interface NewPageRequirements {
  purpose: string
  targetUsers: string[]
  keyFeatures: string[]
  moduleNeeds: {
    required: string[]      // Must have these modules
    optional: string[]      // Nice to have modules
    new: string[]          // Modules that need to be created
  }
  integrationPatterns: string[]  // Which patterns from existing pages
}

// 2. Module composition planning
const planPageComposition = (requirements: NewPageRequirements) => {
  return {
    layout: 'PageLayout',           // Always required
    coreModules: requirements.moduleNeeds.required,
    optionalModules: requirements.moduleNeeds.optional,
    newModules: requirements.moduleNeeds.new,
    estimatedReusability: calculateReusability(requirements.moduleNeeds)
  }
}
```

#### **2. Implementation Steps**
1. **Create page specification document**
2. **Implement any new modules needed**
3. **Create page controller that coordinates modules**
4. **Build page-specific UI components**
5. **Integrate with routing and navigation**
6. **Add comprehensive tests**
7. **Update documentation**

### **Modifying Existing Pages**

#### **1. Impact Assessment**
```typescript
// Assess impact of changes on shared modules
const assessModuleChange = (moduleName: string, changeType: string) => {
  const affectedPages = getPagesByModule(moduleName)
  const riskLevel = calculateRiskLevel(changeType, affectedPages.length)
  
  return {
    affectedPages,
    riskLevel,
    testingRequired: affectedPages.map(page => ({
      page,
      testTypes: ['unit', 'integration', 'e2e']
    })),
    rollbackPlan: generateRollbackPlan(moduleName, changeType)
  }
}
```

#### **2. Safe Update Process**
1. **Create feature branch**
2. **Update module with backward compatibility**
3. **Test all affected pages**
4. **Update page specifications if needed**
5. **Deploy with feature flags**
6. **Monitor performance and errors**
7. **Gradually roll out to all users**

---

## ✅ **Quality Assurance**

### **Page Quality Checklist**
- [ ] **Module Integration**
  - [ ] All required modules properly initialized
  - [ ] Module communication through event bus working
  - [ ] Shared state properly managed
  - [ ] Error handling for module failures
  
- [ ] **User Experience**
  - [ ] Consistent with design system
  - [ ] Responsive across all device sizes
  - [ ] Accessibility standards met
  - [ ] Performance within acceptable limits
  
- [ ] **Code Quality**
  - [ ] TypeScript strict mode compliance
  - [ ] Comprehensive test coverage
  - [ ] Documentation up to date
  - [ ] No code duplication across pages

### **Performance Standards**
- **Initial Load**: <3 seconds on 3G connection
- **Module Loading**: <500ms per module
- **Page Transitions**: <200ms between pages
- **Memory Usage**: <50MB per page session
- **Bundle Size**: <500KB per page after compression

---

*This page specification system demonstrates how AIdioma's modular architecture enables building complex, feature-rich pages through intelligent composition of reusable modules, resulting in maintainable, scalable, and consistent user experiences.* 