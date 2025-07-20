# Development Guide
## Module-First Development Workflow for AIdioma

*This guide provides the complete development workflow for building, testing, and deploying AIdioma's 12-module architecture, emphasizing modular development practices and consistent code quality.*

---

## 🏗️ **Development Philosophy**

### **Module-First Development**
AIdioma's development approach centers on **12 reusable modules** that compose into 6 pages. This modular architecture enables:

- **Independent Development**: Modules can be developed and tested in isolation
- **Reusable Components**: Modules serve multiple pages with consistent APIs
- **Scalable Codebase**: New features built as modules integrate seamlessly
- **Maintainable Code**: Clear boundaries between modules reduce complexity

### **Development Principles**
- **TypeScript-First**: Strict typing with zero `any` usage
- **Test-Driven Development**: Comprehensive testing for all modules
- **API-Driven Design**: Well-defined interfaces between modules
- **Performance-Focused**: Optimized for fast loading and smooth interactions
- **Component-Based UI**: Reusable components across all pages

---

## 📚 **Development Resources**

### **Core Documentation**
| Document | Purpose | Priority |
|----------|---------|----------|
| **[getting-started.md](./getting-started.md)** | Project setup and first-time development | **High** |
| **[development-standards.md](./development-standards.md)** | Code quality standards and conventions | **High** |
| **[API-Documentation.md](./API-Documentation.md)** | Complete API reference and integration | **High** |
| **[testing-strategy.md](./testing-strategy.md)** | Testing approaches for modules and integration | **High** |
| **[framework-compliance.md](./framework-compliance.md)** | Framework standards and compliance | **Medium** |

### **Related Resources**
- **[Module Development Guide](../02-modules/module-development-guide.md)** - Module architecture and APIs
- **[Integration Patterns](../02-modules/integration-patterns.md)** - How modules work together
- **[Component Library](../06-design/component-library.md)** - Reusable UI components

---

## 🚀 **Quick Start Development Workflow**

### **1. Environment Setup**
```bash
# Clone and setup project
git clone [repository-url]
cd AIdioma.V1
npm install

# Setup development environment
npm run dev:setup
npm run db:migrate
npm run dev

# Verify setup
npm run test
npm run lint
```

### **2. Module Development Cycle**
```typescript
// 1. Create module structure
mkdir src/modules/[module-name]
cd src/modules/[module-name]

// 2. Implement core files
touch index.ts          // Main export
touch types.ts          // TypeScript interfaces  
touch service.ts        // Business logic
touch hooks.ts          // React hooks (if UI module)
touch [module].test.ts  // Test suite

// 3. Follow module API pattern
export interface ModuleService {
  initialize(): Promise<void>
  process(input: ModuleInput): Promise<ModuleOutput>
  getState(): ModuleState
  cleanup(): Promise<void>
}
```

### **3. Integration & Testing**
```bash
# Test module in isolation
npm run test:module [module-name]

# Test module integration
npm run test:integration [module-name]

# Lint and format
npm run lint:fix
npm run format

# Build and validate
npm run build
npm run type-check
```

---

## 🎯 **Module Development Standards**

### **Module Architecture Requirements**

#### **1. Standardized Module API**
```typescript
// Every module must implement this interface
interface ModuleService {
  // Lifecycle methods
  initialize(config: ModuleConfig): Promise<void>
  process(input: any): Promise<any>
  getState(): ModuleState
  cleanup(): Promise<void>
  
  // Error handling
  onError(error: Error): void
  
  // Performance monitoring
  getMetrics(): ModuleMetrics
}

// Example implementation
export class TranslationEvaluationModule implements ModuleService {
  async initialize(config: EvaluationConfig): Promise<void> {
    this.aiService = new AIService(config.apiKey)
    this.cache = new CacheService(config.cacheConfig)
    await this.aiService.connect()
  }
  
  async process(input: EvaluationInput): Promise<EvaluationResult> {
    // Implementation with error handling and caching
    try {
      return await this.evaluateWithOptimization(input)
    } catch (error) {
      this.onError(error)
      return this.getFallbackEvaluation(input)
    }
  }
}
```

#### **2. TypeScript Standards**
```typescript
// ✅ Strict typing - zero any usage
interface EvaluationInput {
  sentenceId: number
  userTranslation: string
  correctAnswers: string[]
  context: EvaluationContext
}

// ✅ Comprehensive error types
type ModuleError = 
  | { type: 'NETWORK_ERROR'; message: string; retryable: boolean }
  | { type: 'VALIDATION_ERROR'; field: string; constraint: string }
  | { type: 'BUSINESS_LOGIC_ERROR'; code: string; details: unknown }

// ✅ State management types
interface ModuleState {
  status: 'initializing' | 'ready' | 'processing' | 'error'
  lastError?: ModuleError
  metrics: ModuleMetrics
  config: ModuleConfig
}
```

#### **3. Testing Requirements**
```typescript
// ✅ Unit tests for core functionality
describe('TranslationEvaluationModule', () => {
  it('should evaluate translation accuracy', async () => {
    const module = new TranslationEvaluationModule()
    await module.initialize(testConfig)
    
    const result = await module.process({
      sentenceId: 1,
      userTranslation: 'Hola mundo',
      correctAnswers: ['Hello world', 'Hello, world'],
      context: { difficulty: 'beginner' }
    })
    
    expect(result.score).toBeGreaterThan(0)
    expect(result.feedback).toBeDefined()
  })
})

// ✅ Integration tests for module interaction
describe('Module Integration', () => {
  it('should integrate evaluation with gamification', async () => {
    const evaluation = new TranslationEvaluationModule()
    const gamification = new GamificationModule()
    
    // Test module communication through event bus
    const result = await evaluation.process(testInput)
    const pointsResult = await gamification.awardPoints('translation', {
      accuracy: result.score / 100
    })
    
    expect(pointsResult.pointsEarned).toBeGreaterThan(0)
  })
})
```

---

## 🔧 **API Development Standards**

### **REST API Design Principles**

#### **1. Consistent Endpoint Structure**
```typescript
// ✅ RESTful resource naming
GET    /api/v1/sentences                    // List sentences
GET    /api/v1/sentences/:id               // Get specific sentence
POST   /api/v1/sentences/:id/evaluate      // Evaluate translation
GET    /api/v1/users/:id/progress          // Get user progress
POST   /api/v1/users/:id/achievements      // Award achievement

// ✅ Consistent response format
interface APIResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}
```

#### **2. Authentication & Authorization**
```typescript
// ✅ JWT-based authentication
interface AuthenticatedRequest extends Request {
  user: {
    id: string
    email: string
    role: 'student' | 'instructor' | 'admin'
    permissions: string[]
  }
}

// ✅ Role-based authorization middleware
const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Access denied' }
      })
    }
    next()
  }
}
```

#### **3. Error Handling Standards**
```typescript
// ✅ Standardized error responses
class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message)
  }
}

// ✅ Global error handler
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    })
  }
  
  // Log unexpected errors
  logger.error('Unexpected error:', error)
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  })
}
```

---

## 🎨 **UI Development Standards**

### **Component Development Workflow**

#### **1. Component Architecture**
```typescript
// ✅ Props interface with clear documentation
interface PracticeSessionProps {
  // Data props
  sentence: Sentence
  userProgress: UserProgress
  
  // Event handlers
  onTranslationSubmit: (translation: string) => Promise<EvaluationResult>
  onHintRequest: () => Promise<HintData>
  onSessionComplete: (results: SessionResults) => void
  
  // Configuration
  showHints?: boolean
  allowSkip?: boolean
  autoAdvance?: boolean
}

// ✅ Component with proper TypeScript and error handling
export function PracticeSession({
  sentence,
  userProgress,
  onTranslationSubmit,
  onHintRequest,
  onSessionComplete,
  showHints = true,
  allowSkip = true,
  autoAdvance = false
}: PracticeSessionProps) {
  const [state, setState] = useState<SessionState>('ready')
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (translation: string) => {
    try {
      setState('evaluating')
      setError(null)
      
      const result = await onTranslationSubmit(translation)
      setEvaluation(result)
      setState('evaluated')
      
      if (autoAdvance && result.score >= 80) {
        setTimeout(() => handleNext(), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed')
      setState('error')
    }
  }
  
  return (
    <div className="practice-session">
      {/* Component implementation with error states */}
    </div>
  )
}
```

#### **2. State Management Patterns**
```typescript
// ✅ Custom hooks for complex state logic
function usePracticeSession(sessionConfig: SessionConfig) {
  const [session, setSession] = useState<SessionState>(initialState)
  const [metrics, setMetrics] = useState<SessionMetrics>({})
  
  const evaluateTranslation = useCallback(async (translation: string) => {
    const result = await evaluationService.evaluate({
      sentenceId: session.currentSentence.id,
      userTranslation: translation,
      context: session.context
    })
    
    // Update session state
    setSession(prev => ({
      ...prev,
      evaluations: [...prev.evaluations, result],
      currentIndex: prev.currentIndex + 1
    }))
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      correctCount: result.score >= 80 ? prev.correctCount + 1 : prev.correctCount
    }))
    
    return result
  }, [session.currentSentence.id, session.context])
  
  return {
    session,
    metrics,
    evaluateTranslation,
    resetSession: () => setSession(initialState),
    getSessionSummary: () => generateSummary(session, metrics)
  }
}
```

---

## 🧪 **Testing Strategy Implementation**

### **Testing Pyramid for Modules**

#### **1. Unit Tests (70%)**
```typescript
// ✅ Module unit tests
describe('ProgressiveHintsModule', () => {
  let hintsModule: ProgressiveHintsModule
  
  beforeEach(() => {
    hintsModule = new ProgressiveHintsModule()
  })
  
  describe('generateHint', () => {
    it('should provide basic hint for level 1', async () => {
      const hint = await hintsModule.generateHint({
        sentenceId: 1,
        level: 1,
        userAttempts: ['wrong answer']
      })
      
      expect(hint.type).toBe('basic')
      expect(hint.content).toContain('Try thinking about')
      expect(hint.revealLevel).toBe(1)
    })
    
    it('should provide more specific hint for level 2', async () => {
      const hint = await hintsModule.generateHint({
        sentenceId: 1,
        level: 2,
        userAttempts: ['wrong answer', 'still wrong']
      })
      
      expect(hint.type).toBe('specific')
      expect(hint.revealLevel).toBe(2)
    })
  })
})
```

#### **2. Integration Tests (20%)**
```typescript
// ✅ Module integration tests
describe('Practice Page Integration', () => {
  it('should coordinate evaluation, hints, and gamification', async () => {
    const practiceController = new PracticePageController({
      evaluation: new TranslationEvaluationModule(),
      hints: new ProgressiveHintsModule(),
      gamification: new GamificationModule()
    })
    
    await practiceController.initialize()
    
    // Submit incorrect translation
    const result1 = await practiceController.handleSubmission({
      translation: 'incorrect answer',
      sentenceId: 1
    })
    
    expect(result1.evaluation.score).toBeLessThan(50)
    expect(result1.hintsAvailable).toBe(true)
    
    // Request hint
    const hint = await practiceController.requestHint()
    expect(hint.level).toBe(1)
    
    // Submit correct translation after hint
    const result2 = await practiceController.handleSubmission({
      translation: 'correct answer',
      sentenceId: 1,
      hintsUsed: 1
    })
    
    expect(result2.evaluation.score).toBeGreaterThan(80)
    expect(result2.pointsAwarded).toBeGreaterThan(0)
    expect(result2.pointsAwarded).toBeLessThan(10) // Reduced due to hint usage
  })
})
```

#### **3. End-to-End Tests (10%)**
```typescript
// ✅ Critical user journeys
describe('Complete Practice Session E2E', () => {
  it('should allow user to complete practice session', async () => {
    // Setup test user and session
    await testUtils.createTestUser('student@test.com')
    await testUtils.loginUser('student@test.com')
    
    // Navigate to practice page
    await page.goto('/practice')
    await page.waitForLoadState('networkidle')
    
    // Select difficulty and start session
    await page.selectOption('[data-testid="difficulty-filter"]', 'beginner')
    await page.click('[data-testid="start-practice"]')
    
    // Complete first sentence
    await page.fill('[data-testid="translation-input"]', 'Hello world')
    await page.click('[data-testid="check-button"]')
    
    // Verify evaluation feedback
    await expect(page.locator('[data-testid="evaluation-score"]')).toContainText('85%')
    await expect(page.locator('[data-testid="feedback"]')).toContainText('Good translation!')
    
    // Continue to next sentence
    await page.click('[data-testid="next-button"]')
    
    // Verify session progress
    await expect(page.locator('[data-testid="progress-indicator"]')).toContainText('2 of 10')
  })
})
```

---

## 📊 **Performance & Monitoring**

### **Development Performance Standards**

#### **1. Module Performance Requirements**
```typescript
// ✅ Performance monitoring for modules
class PerformanceMonitor {
  static async measureModuleExecution<T>(
    moduleName: string,
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    const startMemory = process.memoryUsage()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      const memoryDelta = process.memoryUsage().heapUsed - startMemory.heapUsed
      
      // Log performance metrics
      logger.info('Module Performance', {
        module: moduleName,
        operation,
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta: `${(memoryDelta / 1024 / 1024).toFixed(2)}MB`
      })
      
      // Alert if performance thresholds exceeded
      if (duration > 1000) { // 1 second threshold
        logger.warn('Slow module operation detected', {
          module: moduleName,
          operation,
          duration
        })
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logger.error('Module operation failed', {
        module: moduleName,
        operation,
        duration,
        error: error.message
      })
      throw error
    }
  }
}

// ✅ Usage in modules
export class TranslationEvaluationModule {
  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    return PerformanceMonitor.measureModuleExecution(
      'TranslationEvaluation',
      'evaluate',
      () => this.performEvaluation(input)
    )
  }
}
```

#### **2. Build Performance Optimization**
```typescript
// ✅ Webpack optimization for development
const developmentConfig = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        modules: {
          test: /[\\/]src[\\/]modules[\\/]/,
          name: 'modules',
          chunks: 'all',
        }
      }
    }
  },
  
  // Fast refresh for development
  devServer: {
    hot: true,
    historyApiFallback: true,
    compress: true
  }
}
```

---

## 🔄 **Development Workflows**

### **Git Workflow for Module Development**

#### **1. Branch Strategy**
```bash
# Feature development
git checkout -b feature/[module-name]-[feature-name]
git commit -m "feat(translation-eval): add similarity caching"

# Bug fixes
git checkout -b fix/[module-name]-[issue-description]
git commit -m "fix(hints): resolve hint level progression bug"

# Module updates
git checkout -b module/[module-name]-enhancement
git commit -m "refactor(gamification): improve points calculation algorithm"
```

#### **2. Code Review Process**
```typescript
// ✅ PR template requirements
/*
## Module Changes
- [ ] Module API unchanged (breaking changes noted)
- [ ] Unit tests updated/added
- [ ] Integration tests verify module interaction
- [ ] Performance impact assessed
- [ ] Documentation updated

## Testing Checklist
- [ ] All existing tests pass
- [ ] New functionality has test coverage >90%
- [ ] Manual testing completed
- [ ] Edge cases considered

## Integration Impact
- [ ] No breaking changes to dependent modules
- [ ] Event bus interactions verified
- [ ] Shared state modifications documented
- [ ] Component library usage consistent
*/
```

#### **3. Deployment Pipeline**
```yaml
# ✅ CI/CD pipeline for module development
name: Module Development Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Build application
        run: npm run build
      
      - name: Upload test coverage
        uses: codecov/codecov-action@v3
```

---

## 📋 **Development Checklist**

### **Module Development Checklist**
- [ ] **Setup**
  - [ ] Module directory structure created
  - [ ] TypeScript interfaces defined
  - [ ] Dependencies declared in package.json
  
- [ ] **Implementation**
  - [ ] Core module API implemented
  - [ ] Error handling with graceful degradation
  - [ ] Performance monitoring integrated
  - [ ] Logging and debugging support
  
- [ ] **Testing**
  - [ ] Unit tests cover >90% of code
  - [ ] Integration tests verify module interactions
  - [ ] Performance tests validate response times
  - [ ] Error scenarios tested
  
- [ ] **Documentation**
  - [ ] Module API documented
  - [ ] Usage examples provided
  - [ ] Integration patterns documented
  - [ ] Performance characteristics noted
  
- [ ] **Integration**
  - [ ] Module registered with dependency injection
  - [ ] Event bus integration implemented
  - [ ] Shared state interactions defined
  - [ ] Component library components used

### **UI Development Checklist**
- [ ] **Component Development**
  - [ ] Component follows design system standards
  - [ ] Props interface clearly defined
  - [ ] Error states handled gracefully
  - [ ] Loading states implemented
  
- [ ] **Accessibility**
  - [ ] WCAG 2.1 AA compliance verified
  - [ ] Keyboard navigation functional
  - [ ] Screen reader support tested
  - [ ] Color contrast ratios validated
  
- [ ] **Responsive Design**
  - [ ] Mobile-first implementation
  - [ ] Tablet layout tested
  - [ ] Desktop layout optimized
  - [ ] Touch targets appropriate size
  
- [ ] **Performance**
  - [ ] Component renders efficiently
  - [ ] Unnecessary re-renders avoided
  - [ ] Bundle size impact minimal
  - [ ] Images optimized and lazy-loaded

---

## 🎯 **Success Metrics**

### **Development Quality Metrics**
- **Code Coverage**: >90% for all modules
- **TypeScript Compliance**: Zero `any` types, strict mode enabled
- **Performance**: Module operations <500ms average
- **Test Suite**: <30 seconds total execution time
- **Bundle Size**: <500KB per page after compression

### **Development Velocity Metrics**
- **Feature Development**: New modules deployable within 1-2 sprints
- **Bug Resolution**: Critical bugs fixed within 24 hours
- **Code Review**: PRs reviewed within 24 hours
- **Deployment**: Automated deployment with zero downtime

---

*This development guide ensures consistent, high-quality module development that supports AIdioma's scalable, maintainable architecture while delivering excellent user experiences.* 