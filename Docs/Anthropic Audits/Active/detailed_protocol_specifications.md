# Detailed Development Protocol Specifications

## **Protocol Overview**

This document defines the exact tasks, criteria, and deliverables for each phase of the development protocol. Both Cursor AI and Anthropic AI must follow these specifications precisely.

---

## **PHASE 1: PREDEVELOPMENT PLAN**

### **Phase Objective**
Analyze requirements and create a concrete implementation plan without starting any code development.

### **Step 1.i: READ IMPLEMENTATION TASKS & REPORT NEXT TASK**

#### **Cursor AI Instructions:**
```
TASK: Analyze project requirements and identify the next concrete implementation task.

REQUIRED ANALYSIS:
1. Review all available requirements documents
2. Identify the highest priority feature/component to implement
3. Break down into specific, actionable development tasks
4. Estimate complexity and dependencies

OUTPUT REQUIREMENTS:
- Next Task: [Specific feature/component name]
- Implementation Scope: [What will be built]
- Key Components: [List 3-5 main components]
- Dependencies: [External libraries, APIs, services needed]
- Estimated Complexity: [Simple/Medium/Complex with reasoning]
- Success Criteria: [How to know when task is complete]

EXAMPLE OUTPUT:
Next Task: User Authentication System
Implementation Scope: Complete JWT-based authentication with login, registration, and session management
Key Components: 
- User registration endpoint (/auth/register)
- User login endpoint (/auth/login) 
- JWT token generation and validation
- Password hashing with bcrypt
- Rate limiting for auth endpoints
Dependencies: bcrypt, jsonwebtoken, express-rate-limit
Estimated Complexity: Medium - straightforward auth flow but requires security considerations
Success Criteria: Users can register, login, and access protected routes with valid JWT tokens

DO NOT START CODING. LOG ALL FINDINGS IN logs/predevelopment-plan.md
```

#### **Required Log Format: `logs/predevelopment-plan.md`**
```markdown
# Predevelopment Plan Log

## Task Analysis Report
**Date:** [YYYY-MM-DD]  
**Analyst:** Cursor AI  

### Implementation Task Identified
**Task Name:** [Specific task name]  
**Priority:** [High/Medium/Low]  
**Implementation Scope:** [Detailed description]

### Component Breakdown
1. **[Component 1]** - [Description and purpose]
2. **[Component 2]** - [Description and purpose] 
3. **[Component 3]** - [Description and purpose]

### Dependencies Analysis
- **External Libraries:** [List with reasons]
- **APIs/Services:** [List with integration points]
- **Database Requirements:** [Schema needs]
- **Infrastructure Needs:** [Hosting, environment requirements]

### Complexity Assessment
**Estimated Complexity:** [Simple/Medium/Complex]  
**Reasoning:** [Why this complexity level]  
**Risk Factors:** [Potential challenges]  
**Mitigation Strategies:** [How to handle risks]

### Success Criteria
- [ ] [Specific measurable criterion 1]
- [ ] [Specific measurable criterion 2]
- [ ] [Specific measurable criterion 3]

**Status:** Step 1.i COMPLETE - Ready for Step 1.ii
```

### **Step 1.ii: RUN NEXT TASK THROUGH PRE-DEVELOPMENT CHECKLIST**

#### **Cursor AI Instructions:**
```
TASK: Evaluate your identified implementation task against the comprehensive pre-development checklist.

CHECKLIST EVALUATION:
For each item, mark as:
✅ COMPLETE - Requirement fully addressed
⚠️  PARTIAL - Some work done, needs completion  
❌ MISSING - Requirement not addressed
➡️  N/A - Not applicable to this task

PREDEVELOPMENT CHECKLIST:
□ Requirements clearly defined and documented
□ User stories or use cases written
□ API endpoints and data flow documented
□ Database schema designed (if applicable)
□ Security considerations identified and planned
□ Error handling strategy defined
□ Input validation requirements specified
□ Authentication/authorization approach planned
□ Testing strategy outlined (unit, integration, e2e)
□ Performance requirements identified
□ Monitoring and logging approach planned
□ Dependencies and external integrations documented
□ Deployment considerations noted
□ Backup and data recovery plan (if applicable)
□ Compliance requirements checked (GDPR, etc.)

REQUIRED OUTPUT:
- Checklist completion summary
- Detailed explanation for any PARTIAL or MISSING items
- Action plan to address gaps
- Updated complexity assessment based on gaps found

LOG RESULTS IN logs/predevelopment-plan.md (append to existing)
```

#### **Required Checklist Log Format:**
```markdown
## Pre-Development Checklist Review

### Checklist Results
**Review Date:** [YYYY-MM-DD]  
**Completion Rate:** [X/15 items complete]

| Item | Status | Details |
|------|--------|---------|
| Requirements documented | ✅ | User auth requirements fully specified |
| User stories written | ⚠️  | Basic flows documented, edge cases missing |
| API endpoints documented | ❌ | Need to specify request/response formats |
| Database schema designed | ✅ | User table schema complete |
| Security considerations | ⚠️  | Password hashing planned, rate limiting needs detail |
| Error handling strategy | ❌ | No error handling approach defined yet |
| Input validation | ❌ | Validation rules not specified |
| Auth/authz approach | ✅ | JWT-based auth clearly planned |
| Testing strategy | ❌ | No testing approach defined |
| Performance requirements | ➡️  | Not critical for auth system |
| Monitoring/logging | ❌ | No logging strategy defined |
| Dependencies documented | ✅ | All required packages identified |
| Deployment considerations | ❌ | No deployment plan |
| Backup/recovery plan | ➡️  | Not applicable for this task |
| Compliance requirements | ⚠️  | Password policy needs definition |

### Gap Analysis
**Critical Gaps (Must Address):**
1. **API Documentation** - Need complete endpoint specifications
2. **Error Handling** - No strategy for handling auth failures
3. **Input Validation** - Missing validation rules for user inputs
4. **Testing Strategy** - No plan for testing auth flows

**Important Gaps (Should Address):**
1. **Security Details** - Rate limiting implementation needs specifics
2. **Logging Strategy** - Need structured logging for auth events
3. **Deployment Plan** - No consideration for production deployment

**Minor Gaps (Nice to Have):**
1. **User Stories** - Edge cases could be documented better
2. **Compliance** - Password complexity rules need definition

### Action Plan
1. Document complete API endpoint specifications
2. Define comprehensive error handling approach  
3. Specify input validation rules and constraints
4. Create testing strategy for auth workflows
5. Detail security implementation specifics

### Updated Assessment
**Original Complexity:** Medium  
**Updated Complexity:** Medium-High  
**Reasoning:** Security and testing requirements add complexity  
**Estimated Timeline:** +20% due to additional planning requirements

**Status:** Step 1.ii COMPLETE - Ready for Anthropic Audit
```

---

## **PHASE 2: PREDEVELOPMENT DELIVERABLES**

### **Phase Objective**
Create detailed specifications for frontend, backend deliverables and comprehensive testing scripts.

### **Step 2.i: REPORT FRONT END & BACKEND DELIVERABLES**

#### **Cursor AI Instructions:**
```
TASK: Create detailed deliverable specifications for both frontend and backend components.

FRONTEND DELIVERABLES SPECIFICATION:
- User interface components needed
- Pages/screens to be created
- User interaction flows
- Design requirements (responsive, accessibility)
- State management approach
- Integration points with backend

BACKEND DELIVERABLES SPECIFICATION:  
- API endpoints with full specifications
- Database schema and models
- Business logic components
- Authentication/authorization implementation
- Error handling implementation
- Logging and monitoring setup

OUTPUT REQUIREMENTS:
Create two detailed specification files:
1. deliverables/frontend-specs.md
2. deliverables/backend-specs.md

Also create summary in logs/predevelopment-deliverables.md
```

#### **Required Frontend Specs Template: `deliverables/frontend-specs.md`**
```markdown
# Frontend Deliverables Specification

## Overview
**Feature:** [Feature name]  
**Framework:** [React/Vue/Angular/etc]  
**Completion Criteria:** [When frontend is considered done]

## User Interface Components

### 1. [Component Name] - [Page/Component]
**Purpose:** [What this component does]  
**Location:** [Where it appears in app]  
**Props/Data:** [Data it needs]  
**User Actions:** [What users can do]  
**Validation:** [Input validation rules]  
**Error Handling:** [How errors are displayed]

### 2. [Component Name] - [Page/Component]
**Purpose:** [What this component does]  
**Location:** [Where it appears in app]  
**Props/Data:** [Data it needs]  
**User Actions:** [What users can do]  
**Validation:** [Input validation rules]  
**Error Handling:** [How errors are displayed]

## User Flows

### Primary Flow: [Flow Name]
1. User [action] at [component]
2. System [response/validation]  
3. User [next action]
4. System [final response]
**Success Outcome:** [What happens when successful]  
**Error Outcomes:** [What happens when errors occur]

## Technical Specifications

### State Management
**Approach:** [Redux/Context/Zustand/etc]  
**State Structure:** [How data is organized]  
**Actions/Mutations:** [How state changes]

### API Integration  
**Endpoints Used:** [List backend endpoints]  
**Data Flow:** [How data moves from API to UI]  
**Error Handling:** [How API errors are handled]  
**Loading States:** [How loading is indicated]

### Responsive Design
**Breakpoints:** [Mobile/tablet/desktop sizes]  
**Layout Changes:** [How UI adapts to screen size]  
**Touch Interactions:** [Mobile-specific interactions]

### Accessibility Requirements
**WCAG Level:** [A/AA/AAA compliance target]  
**Screen Reader Support:** [Aria labels, semantic HTML]  
**Keyboard Navigation:** [Tab order, shortcuts]  
**Color Contrast:** [Meeting contrast requirements]

## Testing Requirements
**Unit Tests:** [Components to unit test]  
**Integration Tests:** [User flows to test]  
**E2E Tests:** [End-to-end scenarios]  
**Accessibility Tests:** [A11y testing requirements]

## Dependencies
**Required Packages:** [List npm/yarn packages needed]  
**Optional Packages:** [Nice-to-have additions]  
**Version Constraints:** [Specific version requirements]
```

#### **Required Backend Specs Template: `deliverables/backend-specs.md`**
```markdown
# Backend Deliverables Specification

## Overview
**Feature:** [Feature name]  
**Framework:** [Express/FastAPI/Django/etc]  
**Database:** [PostgreSQL/MongoDB/etc]  
**Completion Criteria:** [When backend is considered done]

## API Endpoints

### 1. [HTTP METHOD] /api/[endpoint]
**Purpose:** [What this endpoint does]  
**Authentication:** [Required/Optional/None]  
**Rate Limiting:** [Requests per minute/hour]

**Request:**
```json
{
  "field1": "string",
  "field2": "number", 
  "field3": "boolean"
}
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "field1": "value",
    "field2": 123
  }
}
```

**Error Responses:**
- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Missing/invalid auth token
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server error

**Business Logic:**
1. [Step 1 of processing]
2. [Step 2 of processing] 
3. [Step 3 of processing]

**Validation Rules:**
- field1: Required, string, min 3 chars, max 50 chars
- field2: Required, integer, between 1-100
- field3: Optional, boolean

### 2. [HTTP METHOD] /api/[endpoint]
[Same format as above]

## Database Schema

### Table: [table_name]
**Purpose:** [What this table stores]

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique identifier |
| [field] | VARCHAR(255) | NOT NULL | [Description] |
| [field] | INTEGER | DEFAULT 0 | [Description] |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Update timestamp |

**Indexes:**
- PRIMARY KEY on id
- INDEX on [frequently_queried_field]
- UNIQUE INDEX on [unique_field]

**Relationships:**
- FOREIGN KEY [field] REFERENCES [other_table](id)

## Business Logic Components

### 1. [Service/Module Name]
**Purpose:** [What this component handles]  
**Dependencies:** [Other services/modules it uses]  
**Key Methods:**
- `methodName(params)` - [What it does]
- `anotherMethod(params)` - [What it does]

**Error Handling:**
- [Specific error type] → [How it's handled]
- [Another error type] → [How it's handled]

## Authentication & Authorization

### Authentication Strategy
**Method:** [JWT/Session/OAuth/etc]  
**Token Storage:** [Where tokens are stored]  
**Token Expiration:** [How long tokens last]  
**Refresh Strategy:** [How tokens are refreshed]

### Authorization Rules
**Protected Routes:** [Which endpoints require auth]  
**Role-Based Access:** [If using roles/permissions]  
**Resource Ownership:** [How to check resource ownership]

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Additional context",
    "timestamp": "2025-01-20T15:30:00Z"
  }
}
```

### Error Categories
**Validation Errors (400):** [How input validation errors are handled]  
**Authentication Errors (401):** [How auth failures are handled]  
**Authorization Errors (403):** [How permission errors are handled]  
**Not Found Errors (404):** [How missing resources are handled]  
**Rate Limit Errors (429):** [How rate limiting is handled]  
**Server Errors (500):** [How internal errors are handled]

## Logging & Monitoring

### Log Levels
**ERROR:** [What triggers error logs]  
**WARN:** [What triggers warning logs]  
**INFO:** [What triggers info logs]  
**DEBUG:** [What triggers debug logs]

### Log Format
```json
{
  "timestamp": "2025-01-20T15:30:00Z",
  "level": "INFO",
  "message": "User authentication successful", 
  "userId": "uuid-here",
  "endpoint": "/api/auth/login",
  "duration": 245,
  "userAgent": "Mozilla/5.0..."
}
```

## Performance Requirements
**Response Time:** [Target response times]  
**Throughput:** [Requests per second targets]  
**Memory Usage:** [Memory constraints]  
**Database Connections:** [Connection pooling requirements]

## Testing Requirements
**Unit Tests:** [Services/functions to unit test]  
**Integration Tests:** [API endpoints to test]  
**Load Tests:** [Performance testing requirements]  
**Security Tests:** [Security testing requirements]

## Dependencies
**Required Packages:** [List packages needed]  
**Database Requirements:** [Minimum database version]  
**Environment Variables:** [Required configuration]  
**External Services:** [Third-party integrations]
```

### **Step 2.ii: CREATE TESTING SCRIPTS**

#### **Cursor AI Instructions:**
```
TASK: Create comprehensive testing scripts for both frontend and backend deliverables.

FRONTEND TESTING - Create deliverables/testing-scripts/playwright-tests.js:
- E2E tests for all user flows specified in frontend deliverables
- Form validation testing
- Error handling testing  
- Responsive design testing
- Accessibility testing

BACKEND TESTING - Create deliverables/testing-scripts/backend-tests.js:
- API endpoint testing for all specified endpoints
- Request/response validation
- Error response testing
- Authentication/authorization testing
- Database integration testing
- Rate limiting testing

Both scripts must be executable and include:
- Setup/teardown procedures
- Test data creation
- Comprehensive assertions
- Clear test descriptions
```

#### **Frontend Testing Template: `deliverables/testing-scripts/playwright-tests.js`**
```javascript
// Frontend E2E Testing Script with Playwright
const { test, expect } = require('@playwright/test');

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:8000';

test.describe('User Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app and ensure clean state
    await page.goto(BASE_URL);
  });

  test('User Registration Flow', async ({ page }) => {
    // Test based on frontend-specs.md requirements
    
    // Step 1: Navigate to registration
    await page.click('[data-testid="register-button"]');
    await expect(page).toHaveURL('/register');
    
    // Step 2: Fill registration form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    
    // Step 3: Submit form
    await page.click('[data-testid="submit-registration"]');
    
    // Step 4: Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('Input Validation Testing', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Test email validation
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-registration"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');
    
    // Test password strength validation  
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="submit-registration"]');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
  });

  test('Error Handling Testing', async ({ page }) => {
    // Mock API error response
    await page.route(`${API_URL}/auth/register`, route => {
      route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          error: {
            code: 'EMAIL_EXISTS', 
            message: 'Email already registered'
          }
        })
      });
    });
    
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="submit-registration"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Email already registered');
  });

  test('Responsive Design Testing', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE_URL}/register`);
    
    // Verify mobile-specific elements
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-nav"]')).not.toBeVisible();
    
    // Test form layout on mobile
    const form = page.locator('[data-testid="registration-form"]');
    await expect(form).toHaveCSS('flex-direction', 'column');
  });

  test('Accessibility Testing', async ({ page }) => {
    await page.goto(`${BASE_URL}/register`);
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();
    
    // Test ARIA labels
    await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label', 'Email address');
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label', 'Password');
    
    // Test color contrast (basic check)
    const submitButton = page.locator('[data-testid="submit-registration"]');
    const bgColor = await submitButton.evaluate(el => getComputedStyle(el).backgroundColor);
    const textColor = await submitButton.evaluate(el => getComputedStyle(el).color);
    
    // Note: In real implementation, you'd calculate contrast ratio
    expect(bgColor).not.toBe(textColor); // Basic different color check
  });

  test('Loading States Testing', async ({ page }) => {
    // Mock slow API response
    await page.route(`${API_URL}/auth/register`, route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success', data: { token: 'fake-token' } })
        });
      }, 2000);
    });
    
    await page.goto(`${BASE_URL}/register`);
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePassword123!');
    
    await page.click('[data-testid="submit-registration"]');
    
    // Verify loading indicator appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-registration"]')).toBeDisabled();
    
    // Wait for completion
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({ timeout: 3000 });
  });
});

// Additional test suites would cover other components specified in frontend-specs.md
test.describe('Dashboard Flow', () => {
  // Tests for dashboard functionality
});

test.describe('Profile Management Flow', () => {
  // Tests for profile features  
});
```

#### **Backend Testing Template: `deliverables/testing-scripts/backend-tests.js`**
```javascript
// Backend API Testing Script
const axios = require('axios');
const { expect } = require('chai');

// Test configuration
const API_BASE = process.env.API_URL || 'http://localhost:8000';
const TEST_DB = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost/testdb';

describe('User Authentication API', () => {
  let testUser = {
    email: 'test@example.com',
    password: 'SecurePassword123!'
  };
  let authToken = null;

  before(async () => {
    // Setup test database and seed data
    console.log('Setting up test environment...');
  });

  after(async () => {
    // Cleanup test data
    console.log('Cleaning up test environment...');
  });

  beforeEach(async () => {
    // Reset to clean state before each test
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await axios.post(`${API_BASE}/api/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('success');
      expect(response.data.data).to.have.property('token');
      expect(response.data.data).to.have.property('user');
      expect(response.data.data.user.email).to.equal(testUser.email);
      
      // Store token for later tests
      authToken = response.data.data.token;
    });

    it('should reject registration with invalid email', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/register`, {
          email: 'invalid-email',
          password: testUser.password,
          confirmPassword: testUser.password
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.status).to.equal('error');
        expect(error.response.data.error.code).to.equal('INVALID_EMAIL');
      }
    });

    it('should reject registration with weak password', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/register`, {
          email: 'test2@example.com',
          password: '123',
          confirmPassword: '123'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error.code).to.equal('WEAK_PASSWORD');
      }
    });

    it('should reject registration with mismatched passwords', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/register`, {
          email: 'test3@example.com', 
          password: 'SecurePassword123!',
          confirmPassword: 'DifferentPassword123!'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.error.code).to.equal('PASSWORD_MISMATCH');
      }
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: 'duplicate@example.com',
        password: testUser.password,
        confirmPassword: testUser.password
      });

      // Attempt duplicate
      try {
        await axios.post(`${API_BASE}/api/auth/register`, {
          email: 'duplicate@example.com',
          password: testUser.password,
          confirmPassword: testUser.password  
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(409);
        expect(error.response.data.error.code).to.equal('EMAIL_EXISTS');
      }
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Ensure test user exists
      await axios.post(`${API_BASE}/api/auth/register`, {
        email: testUser.email,
        password: testUser.password,
        confirmPassword: testUser.password
      }).catch(() => {}); // Ignore if already exists
    });

    it('should login with valid credentials', async () => {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('success');
      expect(response.data.data).to.have.property('token');
      expect(response.data.data).to.have.property('user');
      
      authToken = response.data.data.token;
    });

    it('should reject login with invalid credentials', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/login`, {
          email: testUser.email,
          password: 'WrongPassword123!'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data.error.code).to.equal('INVALID_CREDENTIALS');
      }
    });

    it('should reject login with non-existent user', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/login`, {
          email: 'nonexistent@example.com',
          password: testUser.password
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data.error.code).to.equal('INVALID_CREDENTIALS');
      }
    });
  });

  describe('Authentication Middleware', () => {
    it('should protect routes requiring authentication', async () => {
      try {
        await axios.get(`${API_BASE}/api/user/profile`);
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data.error.code).to.equal('TOKEN_MISSING');
      }
    });

    it('should allow access with valid token', async () => {
      const response = await axios.get(`${API_BASE}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      expect(response.status).to.equal(200);
      expect(response.data.status).to.equal('success');
    });

    it('should reject invalid tokens', async () => {
      try {
        await axios.get(`${API_BASE}/api/user/profile`, {
          headers: {
            'Authorization': 'Bearer invalid-token'
          }
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.response.status).to.equal(401);
        expect(error.response.data.error.code).to.equal('TOKEN_INVALID');
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits on auth endpoints', async () => {
      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(
          axios.post(`${API_BASE}/api/auth/login`, {
            email: 'test@example.com',
            password: 'wrong-password'
          }).catch(err => err.response)
        );
      }

      const responses = await Promise.all(promises);
      
      // Should have at least one rate limit response
      const rateLimited = responses.find(r => r.status === 429);
      expect(rateLimited).to.not.be.undefined;
      expect(rateLimited.data.error.code).to.equal('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Database Integration', () => {
    it('should persist user data correctly', async () => {
      const newUser = {
        email: 'dbtest@example.com',
        password: 'TestPassword123!'
      };

      // Register user
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, {
        email: newUser.email,
        password: newUser.password,
        confirmPassword: newUser.password
      });

      expect(registerResponse.status).to.equal(200);

      // Login to verify persistence
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: newUser.email,
        password: newUser.password
      });

      expect(loginResponse.status).to.equal(200);
      expect(loginResponse.data.data.user.email).to.equal(newUser.email);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format', async () => {
      try {
        await axios.post(`${API_BASE}/api/auth/login`, {
          email: 'invalid-email',
          password: 'password'
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        const errorData = error.response.data;
        
        expect(errorData).to.have.property('status', 'error');
        expect(errorData).to.have.property('error');
        expect(errorData.error).to.have.property('code');
        expect(errorData.error).to.have.property('message');
        expect(errorData.error).to.have.property('timestamp');
      }
    });
  });
});

// Performance testing
describe('Performance Tests', () => {
  it('should respond to auth requests within acceptable time', async () => {
    const startTime = Date.now();
    
    await axios.post(`${API_BASE}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    const duration = Date.now() - startTime;
    expect(duration).to.be.below(1000); // Should respond within 1 second
  });
});
```

---

## **PHASE 3: AUDIT PRE-DEVELOPMENT LOG**

### **Phase Objective**  
Anthropic AI audits all predevelopment work for completeness, technical soundness, and implementation readiness.

### **Anthropic AI Audit Criteria:**

#### **Audit Checklist:**
```
COMPLETENESS REVIEW:
□ Implementation task clearly identified and scoped
□ All predevelopment checklist items addressed
□ Frontend deliverables fully specified  
□ Backend deliverables fully specified
□ Testing scripts comprehensive and executable

TECHNICAL SOUNDNESS REVIEW:
□ Proposed architecture is sound
□ Security considerations are adequate
□ Database design is appropriate
□ API design follows best practices
□ Error handling strategy is comprehensive
□ Performance considerations addressed

IMPLEMENTATION READINESS REVIEW:
□ Specifications are detailed enough for implementation
□ Dependencies are clearly identified
□ Testing approach covers all scenarios  
□ Deliverables are measurable and testable
□ No critical gaps or assumptions

RISK ASSESSMENT:
□ Technical risks identified and mitigated
□ Complexity assessment is realistic
□ Timeline estimates are reasonable  
□ Dependencies have fallback plans
```

#### **Anthropic Audit Response Format:**
```markdown
# ANTHROPIC AUDIT RESPONSE - PREDEVELOPMENT PHASE

**Audit Date:** [YYYY-MM-DD HH:MM:SS]  
**Phase:** Pre-Development Complete Review  
**Reviewer:** Anthropic AI  

## Executive Summary
[Overall assessment of predevelopment quality]

## Completeness Analysis
**Score: [X/5] - [Excellent/Good/Fair/Poor]**

✅ **Complete Items:**
- [List items that are fully complete and well-documented]

⚠️ **Partially Complete Items:**  
- [List items that need minor improvements]

❌ **Missing Items:**
- [List critical missing components]

## Technical Soundness Analysis  
**Score: [X/5] - [Excellent/Good/Fair/Poor]**

### Architecture Review
- **Database Design:** [Assessment and feedback]
- **API Design:** [Assessment and feedback]  
- **Security Approach:** [Assessment and feedback]
- **Error Handling:** [Assessment and feedback]

### Technical Concerns
- **High Priority:** [Critical technical issues]
- **Medium Priority:** [Important but not blocking issues]
- **Low Priority:** [Nice-to-have improvements]

## Implementation Readiness Analysis
**Score: [X/5] - [Excellent/Good/Fair/Poor]**

- **Specification Detail:** [Are specs detailed enough?]
- **Testing Coverage:** [Are testing scripts comprehensive?]  
- **Dependency Management:** [Are dependencies well managed?]
- **Risk Mitigation:** [Are risks adequately addressed?]

## Detailed Feedback

### Critical Issues (Must Fix)
1. **[Issue Category]:** [Specific issue description]
   - **Problem:** [What's wrong]
   - **Impact:** [Why it matters]  
   - **Solution:** [How to fix it]

### Important Improvements (Should Fix)  
1. **[Issue Category]:** [Specific issue description]
   - **Recommendation:** [What to improve]
   - **Benefit:** [Why it's worth doing]

### Optional Enhancements (Nice to Have)
1. **[Enhancement Category]:** [Suggestion]

## Approval Decision

**DECISION: [APPROVED / NEEDS IMPROVEMENT]**

### If APPROVED:
**Rationale:** [Why this is ready for development]  
**Confidence Level:** [High/Medium/Low]  
**Next Phase:** DEVELOPMENT LOG  

### If NEEDS IMPROVEMENT:  
**Required Actions:**
1. [Specific action required]
2. [Specific action required]  
3. [Specific action required]

**Return Instructions:** GO BACK TO [SPECIFIC STEP] (LOOP [NUMBER])

**@CURSOR** - [APPROVED to proceed] OR [Implement above improvements and resubmit]

---
```

This gives both AIs **exact specifications** for what to do at each phase, with detailed templates, criteria, and formats. The system now knows precisely what "Pre-Development Protocol" means in concrete, actionable terms!