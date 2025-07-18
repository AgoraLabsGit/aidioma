# Testing Guidelines - AIdioma Spanish Learning App

## Overview

This document establishes comprehensive testing strategies and procedures for maintaining high code quality throughout the Spanish learning application development. Following these guidelines ensures reliability, performance, and maintainability.

## Testing Philosophy

### Core Principles
1. **Test-Driven Development (TDD)**: Write tests before implementation when possible
2. **Coverage Goals**: Aim for 80%+ code coverage, 100% for critical paths
3. **Testing Pyramid**: Many unit tests, some integration tests, few E2E tests
4. **Fast Feedback**: Tests should run quickly to encourage frequent execution
5. **Isolation**: Tests should not depend on external services or other tests

## Testing Stack

### Tools and Frameworks
- **Unit Testing**: Jest with TypeScript support
- **React Testing**: React Testing Library (@testing-library/react)
- **Integration Testing**: Supertest for API endpoints
- **E2E Testing**: Playwright for browser automation
- **Mocking**: Jest mocks and MSW (Mock Service Worker)
- **Coverage**: Jest coverage reports with Istanbul

### Configuration Files
```json
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Unit Testing

### Testing Pure Functions
```typescript
// src/utils/textNormalization.test.ts
import { normalizeText, calculateSimilarity } from './textNormalization';

describe('Text Normalization', () => {
  describe('normalizeText', () => {
    it('should convert to lowercase', () => {
      expect(normalizeText('HELLO')).toBe('hello');
    });
    
    it('should trim whitespace', () => {
      expect(normalizeText('  hello  ')).toBe('hello');
    });
    
    it('should remove multiple spaces', () => {
      expect(normalizeText('hello  world')).toBe('hello world');
    });
    
    it('should handle Spanish characters', () => {
      expect(normalizeText('Café')).toBe('café');
    });
  });
  
  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(1);
    });
    
    it('should return 0 for completely different strings', () => {
      expect(calculateSimilarity('hello', 'xyz')).toBe(0);
    });
    
    it('should calculate partial similarity', () => {
      const similarity = calculateSimilarity('hello', 'helo');
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThan(1);
    });
  });
});
```

### Testing Services
```typescript
// server/services/aiService.test.ts
import { AIService } from './aiService';
import { OpenAI } from 'openai';

jest.mock('openai');

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: jest.Mocked<OpenAI>;
  
  beforeEach(() => {
    mockOpenAI = new OpenAI() as jest.Mocked<OpenAI>;
    aiService = new AIService(mockOpenAI);
    jest.clearAllMocks();
  });
  
  describe('evaluateTranslation', () => {
    it('should return cached evaluation when available', async () => {
      const mockCache = {
        score: 95,
        isCorrect: true,
        feedback: 'Cached response'
      };
      
      jest.spyOn(aiService, 'getCachedEvaluation')
        .mockResolvedValue(mockCache);
      
      const result = await aiService.evaluateTranslation(
        'Bebo café',
        ['Bebo café', 'Tomo café']
      );
      
      expect(result).toEqual(mockCache);
      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
    });
    
    it('should fall back to basic evaluation on error', async () => {
      jest.spyOn(aiService, 'getCachedEvaluation')
        .mockResolvedValue(null);
      
      mockOpenAI.chat.completions.create
        .mockRejectedValue(new Error('API Error'));
      
      const result = await aiService.evaluateTranslation(
        'Invalid translation',
        ['Correct translation']
      );
      
      expect(result.score).toBeLessThan(50);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Keep practicing');
    });
  });
});
```

### Testing Database Operations
```typescript
// server/storage.test.ts
import { DatabaseStorage } from './storage';
import { db } from './db';
import { users, sentences } from '@shared/schema';

// Mock the database
jest.mock('./db');

describe('DatabaseStorage', () => {
  let storage: DatabaseStorage;
  
  beforeEach(() => {
    storage = new DatabaseStorage();
    jest.clearAllMocks();
  });
  
  describe('getUser', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        currentLevel: 1
      };
      
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([mockUser])
        })
      });
      
      const result = await storage.getUser('123');
      expect(result).toEqual(mockUser);
    });
    
    it('should return undefined when user not found', async () => {
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([])
        })
      });
      
      const result = await storage.getUser('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
```

## React Component Testing

### Component Testing Best Practices
```typescript
// client/src/components/practice/TranslationInput.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TranslationInput } from './TranslationInput';

describe('TranslationInput', () => {
  const mockOnChange = jest.fn();
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should render input field', () => {
    render(
      <TranslationInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByPlaceholderText(/type your translation/i);
    expect(input).toBeInTheDocument();
  });
  
  it('should call onChange when typing', async () => {
    const user = userEvent.setup();
    
    render(
      <TranslationInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByPlaceholderText(/type your translation/i);
    await user.type(input, 'Hola');
    
    expect(mockOnChange).toHaveBeenCalledWith('H');
    expect(mockOnChange).toHaveBeenCalledWith('Ho');
    expect(mockOnChange).toHaveBeenCalledWith('Hol');
    expect(mockOnChange).toHaveBeenCalledWith('Hola');
  });
  
  it('should submit on Enter key', async () => {
    const user = userEvent.setup();
    
    render(
      <TranslationInput
        value="Bebo café"
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
      />
    );
    
    const input = screen.getByPlaceholderText(/type your translation/i);
    await user.type(input, '{Enter}');
    
    expect(mockOnSubmit).toHaveBeenCalled();
  });
  
  it('should be disabled when disabled prop is true', () => {
    render(
      <TranslationInput
        value=""
        onChange={mockOnChange}
        onSubmit={mockOnSubmit}
        disabled={true}
      />
    );
    
    const input = screen.getByPlaceholderText(/type your translation/i);
    expect(input).toBeDisabled();
  });
});
```

### Testing Hooks
```typescript
// client/src/hooks/useTranslationPractice.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslationPractice } from './useTranslationPractice';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useTranslationPractice', () => {
  it('should load initial sentence', async () => {
    const { result } = renderHook(
      () => useTranslationPractice(),
      { wrapper: createWrapper() }
    );
    
    expect(result.current.isLoading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.currentSentence).toBeDefined();
    expect(result.current.currentSentence?.englishText).toBeTruthy();
  });
  
  it('should submit translation', async () => {
    const { result } = renderHook(
      () => useTranslationPractice(),
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(result.current.currentSentence).toBeDefined();
    });
    
    act(() => {
      result.current.submitTranslation('Bebo café');
    });
    
    await waitFor(() => {
      expect(result.current.evaluation).toBeDefined();
    });
    
    expect(result.current.evaluation?.score).toBeGreaterThan(0);
  });
});
```

## Integration Testing

### API Endpoint Testing
```typescript
// tests/integration/api/sentences.test.ts
import request from 'supertest';
import { app } from '../../../server';
import { db } from '../../../server/db';

describe('Sentences API', () => {
  beforeAll(async () => {
    // Setup test database
    await db.migrate.latest();
    await db.seed.run();
  });
  
  afterAll(async () => {
    // Cleanup
    await db.destroy();
  });
  
  describe('GET /api/sentences', () => {
    it('should return sentences for authenticated user', async () => {
      const response = await request(app)
        .get('/api/sentences')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('englishText');
      expect(response.body[0]).toHaveProperty('spanishTranslations');
    });
    
    it('should filter by difficulty', async () => {
      const response = await request(app)
        .get('/api/sentences?difficulty=1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);
      
      response.body.forEach((sentence: any) => {
        expect(sentence.difficultyLevel).toBe(1);
      });
    });
    
    it('should return 401 for unauthenticated requests', async () => {
      await request(app)
        .get('/api/sentences')
        .expect(401);
    });
  });
  
  describe('POST /api/evaluate', () => {
    it('should evaluate translation', async () => {
      const response = await request(app)
        .post('/api/evaluate')
        .set('Authorization', 'Bearer test-token')
        .send({
          sentenceId: 1,
          userTranslation: 'Bebo café'
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('isCorrect');
      expect(response.body).toHaveProperty('feedback');
      expect(response.body.score).toBeGreaterThanOrEqual(0);
      expect(response.body.score).toBeLessThanOrEqual(100);
    });
    
    it('should handle invalid input', async () => {
      const response = await request(app)
        .post('/api/evaluate')
        .set('Authorization', 'Bearer test-token')
        .send({
          sentenceId: 'invalid',
          userTranslation: ''
        })
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

### Database Integration Testing
```typescript
// tests/integration/database/userProgress.test.ts
import { db } from '../../../server/db';
import { storage } from '../../../server/storage';
import { users, sentences, userProgress } from '@shared/schema';

describe('User Progress Integration', () => {
  let testUserId: string;
  let testSentenceId: number;
  
  beforeAll(async () => {
    // Create test user
    const user = await storage.upsertUser({
      id: 'test-user-123',
      email: 'test@example.com'
    });
    testUserId = user.id;
    
    // Create test sentence
    const sentence = await storage.createSentence({
      englishText: 'I drink coffee',
      spanishTranslations: ['Bebo café', 'Tomo café'],
      difficultyLevel: 1,
      tenseType: 'present',
      topicCategory: 'daily_life',
      wordCount: 3
    });
    testSentenceId = sentence.id;
  });
  
  afterAll(async () => {
    // Cleanup test data
    await db.delete(userProgress)
      .where(eq(userProgress.userId, testUserId));
    await db.delete(sentences)
      .where(eq(sentences.id, testSentenceId));
    await db.delete(users)
      .where(eq(users.id, testUserId));
  });
  
  it('should track user progress correctly', async () => {
    // First attempt
    const progress1 = await storage.upsertUserProgress({
      userId: testUserId,
      sentenceId: testSentenceId,
      attempts: 1,
      bestScore: 85,
      hintsUsed: 1,
      isCorrect: true
    });
    
    expect(progress1.attempts).toBe(1);
    expect(progress1.bestScore).toBe(85);
    
    // Second attempt with better score
    const progress2 = await storage.upsertUserProgress({
      userId: testUserId,
      sentenceId: testSentenceId,
      attempts: 2,
      bestScore: 95,
      hintsUsed: 0,
      isCorrect: true
    });
    
    expect(progress2.attempts).toBe(2);
    expect(progress2.bestScore).toBe(95);
    
    // Verify stats calculation
    const stats = await storage.getUserStats(testUserId);
    expect(stats.totalSentences).toBe(1);
    expect(stats.correctAnswers).toBe(1);
    expect(stats.accuracy).toBe(100);
  });
});
```

## End-to-End Testing

### E2E Test Structure
```typescript
// tests/e2e/translation-practice.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Translation Practice Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('/practice');
  });
  
  test('should complete a translation successfully', async ({ page }) => {
    // Wait for sentence to load
    await expect(page.locator('.sentence-display')).toBeVisible();
    
    // Get the English sentence
    const englishText = await page
      .locator('.english-sentence')
      .textContent();
    
    expect(englishText).toBeTruthy();
    
    // Type translation
    await page.fill('.translation-input', 'Bebo café');
    
    // Submit translation
    await page.click('button:has-text("Submit")');
    
    // Wait for evaluation
    await expect(page.locator('.feedback-display')).toBeVisible();
    
    // Check feedback
    const feedback = await page.locator('.feedback-display').textContent();
    expect(feedback).toBeTruthy();
    
    // Check score display
    const score = await page.locator('.score-display').textContent();
    expect(score).toMatch(/\d+\/10/);
  });
  
  test('should use hints correctly', async ({ page }) => {
    // Click on a hint word
    await page.click('.hint-word:first-child');
    
    // Check hint popup appears
    await expect(page.locator('.hint-popup')).toBeVisible();
    
    // Verify score deduction warning
    await expect(page.locator('.hint-warning')).toContainText('-1.0 points');
    
    // Confirm hint usage
    await page.click('button:has-text("Use Hint")');
    
    // Verify hint content
    await expect(page.locator('.hint-content')).toBeVisible();
  });
  
  test('should filter sentences by difficulty', async ({ page }) => {
    // Open filters
    await page.click('button:has-text("Filters")');
    
    // Select beginner difficulty
    await page.click('input[value="1"]');
    
    // Apply filters
    await page.click('button:has-text("Apply")');
    
    // Verify URL updated
    await expect(page).toHaveURL(/difficulty=1/);
    
    // Verify sentence difficulty
    const difficulty = await page
      .locator('[data-difficulty]')
      .getAttribute('data-difficulty');
    
    expect(difficulty).toBe('1');
  });
});
```

### Visual Regression Testing
```typescript
// tests/e2e/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression', () => {
  test('practice page should match snapshot', async ({ page }) => {
    await page.goto('/practice');
    await page.waitForLoadState('networkidle');
    
    // Hide dynamic content
    await page.evaluate(() => {
      document.querySelectorAll('.timestamp').forEach(el => {
        el.textContent = '2024-01-01';
      });
    });
    
    await expect(page).toHaveScreenshot('practice-page.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
  
  test('dark theme should render correctly', async ({ page }) => {
    await page.goto('/practice');
    
    // Verify dark theme is active
    const backgroundColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    
    expect(backgroundColor).toBe('rgb(15, 23, 42)'); // Deep slate
    
    await expect(page).toHaveScreenshot('dark-theme.png');
  });
});
```

## Testing Best Practices

### Test Organization
```
tests/
├── unit/                    # Unit tests
│   ├── utils/              # Utility function tests
│   ├── services/           # Service tests
│   └── components/         # Component tests
├── integration/            # Integration tests
│   ├── api/               # API endpoint tests
│   └── database/          # Database integration tests
├── e2e/                   # End-to-end tests
│   ├── flows/             # User flow tests
│   └── visual/            # Visual regression tests
└── fixtures/              # Test data and mocks
    ├── users.json         # Test user data
    ├── sentences.json     # Test sentence data
    └── mocks/             # Mock implementations
```

### Writing Good Tests
1. **Descriptive Names**: Test names should clearly describe what is being tested
2. **AAA Pattern**: Arrange, Act, Assert structure for clarity
3. **Single Responsibility**: Each test should verify one behavior
4. **Independent**: Tests should not depend on execution order
5. **Fast**: Use mocks and stubs to keep tests fast

### Mock Strategies
```typescript
// Mock external services
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: { content: JSON.stringify({ score: 95 }) }
          }]
        })
      }
    }
  }))
}));

// Mock database for unit tests
jest.mock('./db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock fetch for API calls
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ data: 'mocked' })
});
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests (SQLite)
        run: npm run test:unit
        env:
          DATABASE_URL: ./test.db
      
      - name: Run integration tests (PostgreSQL)
        run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
      
      - name: Run E2E tests
        run: npm run test:e2e
        if: github.event_name == 'pull_request'
```

## Performance Testing

### Load Testing
```typescript
// tests/performance/load-test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
  },
};

export default function () {
  // Test translation evaluation endpoint
  const payload = JSON.stringify({
    sentenceId: 1,
    userTranslation: 'Bebo café',
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token',
    },
  };
  
  const response = http.post(
    'http://localhost:5000/api/evaluate',
    payload,
    params
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has evaluation': (r) => JSON.parse(r.body).score !== undefined,
  });
}
```

## Debugging Tests

### Common Issues and Solutions

1. **Flaky Tests**
   - Add explicit waits for async operations
   - Use `waitFor` instead of fixed timeouts
   - Ensure proper test isolation

2. **Database State**
   - Use transactions for test isolation
   - Reset database between tests
   - Use dedicated test database

3. **Mock Issues**
   - Clear mocks between tests
   - Verify mock setup in beforeEach
   - Use `jest.resetModules()` when needed

### Debugging Tools
```typescript
// Add debug logging
test('debug example', async () => {
  console.log('Current state:', component.debug());
  
  // Use screen.debug() for React Testing Library
  screen.debug();
  
  // Use page.screenshot() for Playwright
  await page.screenshot({ path: 'debug.png' });
  
  // Use debugger statement
  debugger; // Pause execution when running in debug mode
});
```

## Test Maintenance

### Regular Tasks
1. **Update Snapshots**: Review and update visual snapshots monthly
2. **Remove Obsolete Tests**: Delete tests for removed features
3. **Refactor Test Code**: Apply DRY principles to test utilities
4. **Monitor Coverage**: Ensure coverage doesn't drop below thresholds
5. **Update Dependencies**: Keep testing libraries up to date

### Test Documentation
- Document complex test setups
- Explain non-obvious assertions
- Link tests to requirements/tickets
- Maintain test data documentation

---

*This testing guide is a living document. Update it as new testing patterns emerge or tools are adopted.*