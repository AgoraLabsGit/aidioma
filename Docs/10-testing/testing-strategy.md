# Testing Strategy
## Comprehensive Testing Framework for AIdioma

---

## 🎯 **Testing Overview**

Comprehensive testing strategy ensuring quality, reliability, and performance across all AIdioma modules and pages.

### **Testing Pyramid**
- **Unit Tests (60%)**: Individual functions and components
- **Integration Tests (30%)**: Module interactions and API endpoints
- **End-to-End Tests (10%)**: Critical user flows and page functionality

### **Coverage Requirements**
- **Minimum Coverage**: 80% overall
- **Critical Modules**: 90% coverage (AI services, gamification, evaluation)
- **UI Components**: 85% coverage
- **API Endpoints**: 100% coverage

---

## 🔧 **Unit Testing Framework**

### **Testing Stack**
```typescript
// Testing dependencies
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'

// Test configuration
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false, cacheTime: 0 },
    mutations: { retry: false }
  }
})

export const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  )
}
```

### **Service Layer Testing**
```typescript
// tests/services/translationEvaluationService.test.ts

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { TranslationEvaluationService } from '../../server/services/translationEvaluationService'
import { MockStorage } from '../mocks/MockStorage'
import { MockAIService } from '../mocks/MockAIService'

describe('TranslationEvaluationService', () => {
  let service: TranslationEvaluationService
  let mockStorage: MockStorage
  let mockAIService: MockAIService
  
  beforeEach(() => {
    mockStorage = new MockStorage()
    mockAIService = new MockAIService()
    service = new TranslationEvaluationService(mockStorage, mockAIService)
  })
  
  describe('evaluateTranslation', () => {
    it('should evaluate a correct translation with high score', async () => {
      const input = {
        userTranslation: 'Hola, ¿cómo estás?',
        correctAnswers: ['Hola, ¿cómo estás?', 'Hola, ¿qué tal?'],
        sentenceId: 1,
        userId: 'test-user',
        context: {
          englishSentence: 'Hello, how are you?',
          difficultyLevel: 2,
          grammarConcepts: ['greetings', 'question_formation'],
          topicCategory: 'daily_life',
          hintsUsed: 0,
          attemptNumber: 1,
          timeSpent: 30
        }
      }
      
      mockAIService.setMockResponse({
        score: 9.5,
        feedback: 'Excellent translation!',
        grammarAccuracy: 0.95,
        vocabularyAccuracy: 1.0,
        naturalness: 0.9,
        completeness: 1.0
      })
      
      const result = await service.evaluateTranslation(input)
      
      expect(result.score).toBe(9.5)
      expect(result.feedback).toContain('Excellent')
      expect(mockStorage.storeEvaluation).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-user',
          sentenceId: 1,
          score: 9.5
        })
      )
    })
    
    it('should apply hint penalties correctly', async () => {
      const input = {
        userTranslation: 'Hola, ¿cómo estás?',
        correctAnswers: ['Hola, ¿cómo estás?'],
        sentenceId: 1,
        userId: 'test-user',
        context: {
          englishSentence: 'Hello, how are you?',
          difficultyLevel: 2,
          grammarConcepts: ['greetings'],
          topicCategory: 'daily_life',
          hintsUsed: 2,           // Should reduce score
          attemptNumber: 1,
          timeSpent: 60
        }
      }
      
      mockAIService.setMockResponse({
        score: 9.0,
        feedback: 'Good translation',
        grammarAccuracy: 0.9,
        vocabularyAccuracy: 0.9,
        naturalness: 0.9,
        completeness: 1.0
      })
      
      const result = await service.evaluateTranslation(input)
      
      // Should be reduced by hint penalties (2 hints * 0.5 = 1.0 point reduction)
      expect(result.score).toBe(8.0)
    })
    
    it('should handle AI service failures gracefully', async () => {
      const input = {
        userTranslation: 'Invalid input',
        correctAnswers: ['Valid answer'],
        sentenceId: 1,
        userId: 'test-user',
        context: {
          englishSentence: 'Test sentence',
          difficultyLevel: 1,
          grammarConcepts: [],
          topicCategory: 'general',
          hintsUsed: 0,
          attemptNumber: 1,
          timeSpent: 30
        }
      }
      
      mockAIService.setError(new Error('AI service unavailable'))
      
      const result = await service.evaluateTranslation(input)
      
      // Should return fallback evaluation
      expect(result.score).toBeDefined()
      expect(result.feedback).toContain('evaluation temporarily unavailable')
    })
  })
})
```

### **React Component Testing**
```typescript
// tests/components/TranslationInput.test.tsx

import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders } from '../test-utils'
import { TranslationInput } from '../../client/src/components/TranslationInput'
import userEvent from '@testing-library/user-event'

describe('TranslationInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    placeholder: 'Type your translation...',
    disabled: false,
    showHintButton: true,
    onHintRequest: vi.fn()
  }
  
  it('should render correctly with default props', () => {
    renderWithProviders(<TranslationInput {...defaultProps} />)
    
    expect(screen.getByPlaceholderText('Type your translation...')).toBeInTheDocument()
    expect(screen.getByText('💡 Hint')).toBeInTheDocument()
    expect(screen.getByText('Check Translation')).toBeInTheDocument()
  })
  
  it('should call onChange when user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    
    renderWithProviders(<TranslationInput {...defaultProps} onChange={onChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'Hola mundo')
    
    expect(onChange).toHaveBeenCalledWith('Hola mundo')
  })
  
  it('should call onSubmit when Enter is pressed', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    renderWithProviders(
      <TranslationInput {...defaultProps} value="Test input" onSubmit={onSubmit} />
    )
    
    const input = screen.getByRole('textbox')
    await user.type(input, '{Enter}')
    
    expect(onSubmit).toHaveBeenCalled()
  })
  
  it('should disable submission when input is empty', () => {
    renderWithProviders(<TranslationInput {...defaultProps} value="" />)
    
    const submitButton = screen.getByText('Check Translation')
    expect(submitButton).toBeDisabled()
  })
  
  it('should call onHintRequest when hint button is clicked', async () => {
    const user = userEvent.setup()
    const onHintRequest = vi.fn()
    
    renderWithProviders(
      <TranslationInput {...defaultProps} onHintRequest={onHintRequest} />
    )
    
    const hintButton = screen.getByText('💡 Hint')
    await user.click(hintButton)
    
    expect(onHintRequest).toHaveBeenCalled()
  })
})
```

---

## 🔗 **Integration Testing**

### **API Endpoint Testing**
```typescript
// tests/integration/api.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { app } from '../../server/index'
import { createTestDatabase, cleanupTestDatabase } from '../test-helpers/database'

describe('API Integration Tests', () => {
  beforeEach(async () => {
    await createTestDatabase()
  })
  
  afterEach(async () => {
    await cleanupTestDatabase()
  })
  
  describe('POST /api/evaluate-translation', () => {
    it('should evaluate a translation successfully', async () => {
      const translationData = {
        userTranslation: 'Hola, ¿cómo estás?',
        sentenceId: 1,
        context: {
          englishSentence: 'Hello, how are you?',
          difficultyLevel: 2,
          grammarConcepts: ['greetings'],
          topicCategory: 'daily_life',
          hintsUsed: 0,
          attemptNumber: 1,
          timeSpent: 30
        }
      }
      
      const response = await request(app)
        .post('/api/evaluate-translation')
        .send(translationData)
        .expect(200)
      
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('score')
      expect(response.body.data).toHaveProperty('feedback')
      expect(response.body.data.score).toBeGreaterThan(0)
      expect(response.body.data.score).toBeLessThanOrEqual(10)
    })
    
    it('should handle missing required fields', async () => {
      const invalidData = {
        userTranslation: 'Hola'
        // Missing sentenceId and context
      }
      
      const response = await request(app)
        .post('/api/evaluate-translation')
        .send(invalidData)
        .expect(400)
      
      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('error')
    })
    
    it('should authenticate requests', async () => {
      const response = await request(app)
        .post('/api/evaluate-translation')
        .send({})
        .expect(401)
      
      expect(response.body).toHaveProperty('success', false)
    })
  })
  
  describe('POST /api/hint-used', () => {
    it('should track hint usage correctly', async () => {
      const hintData = {
        sentenceId: 1,
        wordKey: 'cómo',
        hintLevel: 'basic'
      }
      
      const response = await request(app)
        .post('/api/hint-used')
        .send(hintData)
        .expect(200)
      
      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('penalty')
      expect(response.body.data).toHaveProperty('remainingHints')
    })
  })
})
```

### **Module Integration Testing**
```typescript
// tests/integration/gamification.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { GamificationService } from '../../server/services/gamificationService'
import { TranslationEvaluationService } from '../../server/services/translationEvaluationService'
import { TestStorage } from '../mocks/TestStorage'

describe('Gamification Integration', () => {
  let gamificationService: GamificationService
  let evaluationService: TranslationEvaluationService
  let storage: TestStorage
  
  beforeEach(() => {
    storage = new TestStorage()
    gamificationService = new GamificationService(storage)
    evaluationService = new TranslationEvaluationService(storage, mockAIService)
  })
  
  it('should integrate translation evaluation with points calculation', async () => {
    // Simulate a translation evaluation
    const evaluationResult = await evaluationService.evaluateTranslation({
      userTranslation: 'Hola mundo',
      correctAnswers: ['Hola mundo'],
      sentenceId: 1,
      userId: 'test-user',
      context: {
        englishSentence: 'Hello world',
        difficultyLevel: 3,
        grammarConcepts: ['greetings'],
        topicCategory: 'daily_life',
        hintsUsed: 1,
        attemptNumber: 1,
        timeSpent: 45
      }
    })
    
    // Calculate points based on evaluation
    const pointsResult = await gamificationService.calculatePoints('translation', {
      accuracy: evaluationResult.score / 10,
      hintsUsed: 1,
      timeSpent: 45,
      difficulty: 3
    })
    
    // Verify integration
    expect(pointsResult.totalPoints).toBeGreaterThan(0)
    expect(pointsResult.penaltyPoints).toBeGreaterThan(0) // Due to hint usage
    expect(pointsResult.totalPoints).toBeLessThan(pointsResult.basePoints) // Due to penalty
  })
  
  it('should trigger achievements after successful translations', async () => {
    const userId = 'test-user'
    
    // Simulate first translation
    await evaluationService.evaluateTranslation({
      userTranslation: 'Buenos días',
      correctAnswers: ['Buenos días'],
      sentenceId: 1,
      userId,
      context: {
        englishSentence: 'Good morning',
        difficultyLevel: 2,
        grammarConcepts: ['greetings'],
        topicCategory: 'daily_life',
        hintsUsed: 0,
        attemptNumber: 1,
        timeSpent: 30
      }
    })
    
    // Check for first translation achievement
    const achievements = await gamificationService.triggerAchievements(userId, 'translation', {
      accuracy: 0.9,
      isFirstTranslation: true
    })
    
    expect(achievements).toHaveLength(1)
    expect(achievements[0].id).toBe('first_translation')
  })
})
```

---

## 🎭 **End-to-End Testing**

### **Critical User Flow Tests**
```typescript
// tests/e2e/practice-flow.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Practice Page Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/practice')
    await page.waitForLoadState('networkidle')
  })
  
  test('should complete a full practice session', async ({ page }) => {
    // Wait for sentence to load
    await expect(page.locator('[data-testid="sentence-display"]')).toBeVisible()
    
    // Get the sentence text
    const sentenceText = await page.locator('[data-testid="english-sentence"]').textContent()
    expect(sentenceText).toBeTruthy()
    
    // Type a translation
    await page.fill('[data-testid="translation-input"]', 'Hola, ¿cómo estás?')
    
    // Submit translation
    await page.click('[data-testid="check-translation"]')
    
    // Wait for evaluation
    await expect(page.locator('[data-testid="evaluation-feedback"]')).toBeVisible()
    
    // Verify score is displayed
    await expect(page.locator('[data-testid="score-display"]')).toBeVisible()
    
    // Verify feedback is shown
    await expect(page.locator('[data-testid="feedback-message"]')).toBeVisible()
    
    // Go to next sentence
    await page.click('[data-testid="next-sentence"]')
    
    // Verify new sentence loaded
    await expect(page.locator('[data-testid="sentence-display"]')).toBeVisible()
  })
  
  test('should use hint system correctly', async ({ page }) => {
    // Click hint button
    await page.click('[data-testid="hint-button"]')
    
    // Verify hint appears
    await expect(page.locator('[data-testid="hint-content"]')).toBeVisible()
    
    // Verify penalty warning
    await expect(page.locator('[data-testid="hint-penalty"]')).toContainText('-1.0 pts')
    
    // Use progressive hints
    await page.click('[data-testid="more-hint-button"]')
    await expect(page.locator('[data-testid="hint-penalty"]')).toContainText('-1.5 pts')
    
    // Submit with hints used
    await page.fill('[data-testid="translation-input"]', 'Test translation')
    await page.click('[data-testid="check-translation"]')
    
    // Verify penalty applied to score
    await expect(page.locator('[data-testid="evaluation-feedback"]')).toContainText('hint penalty')
  })
  
  test('should handle streak tracking', async ({ page }) => {
    // Check initial streak display
    const streakDisplay = page.locator('[data-testid="streak-display"]')
    await expect(streakDisplay).toBeVisible()
    
    // Complete several correct translations
    for (let i = 0; i < 3; i++) {
      await page.fill('[data-testid="translation-input"]', 'Correct translation')
      await page.click('[data-testid="check-translation"]')
      await page.waitForSelector('[data-testid="evaluation-feedback"]')
      await page.click('[data-testid="next-sentence"]')
    }
    
    // Verify streak increased
    const updatedStreak = await streakDisplay.textContent()
    expect(updatedStreak).toContain('streak')
  })
})

test.describe('Conversation Page Flow', () => {
  test('should start and maintain a conversation', async ({ page }) => {
    await page.goto('/conversations')
    
    // Select topic and persona
    await page.click('[data-testid="topic-restaurant"]')
    await page.click('[data-testid="persona-maria"]')
    await page.click('[data-testid="start-conversation"]')
    
    // Wait for conversation to start
    await expect(page.locator('[data-testid="conversation-interface"]')).toBeVisible()
    
    // Verify AI greeting
    await expect(page.locator('[data-testid="ai-message"]').first()).toBeVisible()
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Hola, una mesa para dos, por favor')
    await page.click('[data-testid="send-message"]')
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]').last()).toBeVisible()
    
    // Verify turn evaluation appears
    await expect(page.locator('[data-testid="turn-evaluation"]')).toBeVisible()
  })
})
```

---

## 📊 **Performance Testing**

### **Load Testing**
```typescript
// tests/performance/load.test.ts

import { describe, it, expect } from 'vitest'
import { performance } from 'perf_hooks'

describe('Performance Tests', () => {
  it('should evaluate translations within performance budget', async () => {
    const startTime = performance.now()
    
    const result = await translationEvaluationService.evaluateTranslation({
      userTranslation: 'Test translation',
      correctAnswers: ['Test translation'],
      sentenceId: 1,
      userId: 'test-user',
      context: {
        englishSentence: 'Test sentence',
        difficultyLevel: 3,
        grammarConcepts: ['test'],
        topicCategory: 'general',
        hintsUsed: 0,
        attemptNumber: 1,
        timeSpent: 30
      }
    })
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(duration).toBeLessThan(500) // 500ms budget for evaluation
    expect(result).toBeDefined()
  })
  
  it('should handle concurrent evaluations efficiently', async () => {
    const concurrentRequests = 10
    const startTime = performance.now()
    
    const promises = Array.from({ length: concurrentRequests }, (_, i) =>
      translationEvaluationService.evaluateTranslation({
        userTranslation: `Test translation ${i}`,
        correctAnswers: [`Test translation ${i}`],
        sentenceId: i + 1,
        userId: `test-user-${i}`,
        context: {
          englishSentence: `Test sentence ${i}`,
          difficultyLevel: 3,
          grammarConcepts: ['test'],
          topicCategory: 'general',
          hintsUsed: 0,
          attemptNumber: 1,
          timeSpent: 30
        }
      })
    )
    
    const results = await Promise.all(promises)
    const endTime = performance.now()
    const duration = endTime - startTime
    
    expect(results).toHaveLength(concurrentRequests)
    expect(duration).toBeLessThan(2000) // 2s budget for 10 concurrent requests
  })
})
```

---

## 🎯 **Test Organization and Commands**

### **Test Scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:performance": "vitest --config vitest.performance.config.ts",
    "test:all": "npm run test && npm run test:integration && npm run test:e2e"
  }
}
```

### **Test Configuration**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    }
  }
})
```

### **CI/CD Integration**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

This comprehensive testing strategy ensures AIdioma maintains high quality, reliability, and performance across all features while supporting confident development and deployment.