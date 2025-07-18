# Development Best Practices & Protocols

## Overview

This document establishes strict development rules and coding standards to ensure high-quality, maintainable code that aligns with the project's comprehensive architecture. These practices are designed to prevent errors, maintain consistency, and support our advanced AI-powered learning system.

**Updated for Local Development**: This document has been updated to reflect our migration from Replit cloud environment to local development, incorporating lessons learned and new best practices for local/production environments.

## 1. Code Architecture Principles

### 1.1 Type Safety First
- **Mandatory**: All code must be TypeScript with strict type checking
- **Schema-Driven**: Use `shared/schema.ts` as the single source of truth for data models
- **Type Inference**: Leverage Drizzle's type inference for database operations
- **Validation**: Always validate API inputs using Zod schemas derived from Drizzle models

```typescript
// ✅ GOOD: Type-safe database operations
const [user] = await db.select().from(users).where(eq(users.id, userId));

// ❌ BAD: Untyped operations
const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### 1.2 Shared Types Architecture
- **Single Source**: All interfaces defined in `shared/schema.ts`
- **Export Pattern**: Use consistent export patterns for Insert/Select types
- **Client Types**: Keep `client/src/types/index.ts` synchronized with shared schema
- **Validation**: Use `createInsertSchema` for all insert operations
- **Type Naming**: Use `NewSentence` instead of `InsertSentence` (Drizzle v0.29+ convention)

```typescript
// ✅ GOOD: Updated schema pattern (post-migration)
export type NewSentence = typeof sentences.$inferInsert;
export type Sentence = typeof sentences.$inferSelect;
export const insertSentenceSchema = createInsertSchema(sentences);

// ❌ OLD: Deprecated naming convention
export type InsertSentence = typeof sentences.$inferInsert;
```

### 1.4 TypeScript Error Prevention
- **Strict Compilation**: Use `npx tsc --noEmit --skipLibCheck` for error checking
- **Type Guards**: Implement proper type guards for optional values
- **Date Handling**: Consistent date type handling across database layers
- **JSON Fields**: Proper typing for JSON string fields in database schemas
- **Null Safety**: Handle null/undefined values explicitly

```typescript
// ✅ GOOD: Proper optional value handling
{currentSentence && (
  <SentenceDisplay 
    sentence={currentSentence} 
    onHintUsed={handleHintUsed}
  />
)}

// ✅ GOOD: Proper JSON field handling
const hints = JSON.parse(sentence.hints) as Record<string, string>;
const translations = JSON.parse(sentence.spanishTranslations) as string[];

// ❌ BAD: Assuming non-null values
<SentenceDisplay sentence={currentSentence} /> // currentSentence might be undefined
```

### 1.5 Database Layer Abstraction
- **Interface First**: All database operations must go through `IStorage` interface
- **Implementation Hiding**: Controllers should never directly import database models
- **Type Safety**: Storage methods must return proper Drizzle-inferred types
- **Error Handling**: Consistent error handling across all storage methods

## 2. Frontend Development Standards

### 2.1 Component Structure
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: Always define TypeScript interfaces for component props
- **Export Pattern**: Use named exports, not default exports
- **File Organization**: Group related components in feature folders

```typescript
// ✅ GOOD: Well-defined component structure
interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  onSubmit: () => void;
}

export function TranslationInput({ value, onChange, disabled, onSubmit }: TranslationInputProps) {
  // Component implementation
}
```

### 2.2 Data Fetching Patterns
- **TanStack Query**: Use exclusively for server state management
- **Typed Queries**: Always type query results with shared schema types
- **Error Handling**: Implement consistent error boundaries
- **Loading States**: Show loading states for all async operations

```typescript
// ✅ GOOD: Properly typed query
const { data: sentences, isLoading, error } = useQuery({
  queryKey: ['/api/sentences', filters],
  queryFn: getQueryFn<Sentence[]>({ on401: 'throw' }),
});
```

### 2.3 UI/UX Consistency
- **Design System**: Follow Strike-inspired minimal dark theme
- **Component Library**: Use shadcn/ui components exclusively
- **Responsive Design**: Mobile-first approach with consistent breakpoints
- **Accessibility**: ARIA labels and keyboard navigation support

## 3. Backend Development Standards

### 3.1 API Route Structure
- **Thin Controllers**: Business logic belongs in services, not routes
- **Validation**: All request bodies validated with Zod schemas
- **Error Handling**: Consistent error response format
- **Authentication**: Proper authentication middleware on protected routes

```typescript
// ✅ GOOD: Proper API route structure
app.post('/api/sentences', isAuthenticated, async (req, res) => {
  try {
    const validated = insertSentenceSchema.parse(req.body);
    const sentence = await storage.createSentence(validated);
    res.json(sentence);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 3.2 Service Layer Organization
- **Business Logic**: Core application logic in dedicated service classes
- **Dependency Injection**: Services receive dependencies through constructors
- **Interface Contracts**: All services implement clear interfaces
- **Error Propagation**: Proper error handling and logging

### 3.3 Database Operations
- **Drizzle ORM**: Use Drizzle exclusively for database operations
- **Migration Strategy**: Use `drizzle-kit generate` and `drizzle-kit migrate` for schema changes
- **Local Development**: SQLite for local development, PostgreSQL for production
- **Query Optimization**: Use appropriate indexes and query patterns
- **Transaction Management**: Wrap complex operations in transactions
- **Date Handling**: Use Unix timestamps (integers) for SQLite compatibility

```typescript
// ✅ GOOD: Proper date handling for SQLite
const lastAttempted = Math.floor(Date.now() / 1000);

// ✅ GOOD: JSON field handling for SQLite
spanishTranslations: JSON.stringify(["Translation 1", "Translation 2"]),
hints: JSON.stringify({ word: "translation" }),

// ❌ BAD: Direct Date objects (incompatible with SQLite)
lastAttempted: new Date(),
```

## 4. AI Integration Standards

### 4.1 OpenAI Service Pattern
- **Rate Limiting**: Implement proper rate limiting for API calls
- **Error Handling**: Fallback to basic evaluation when AI fails
- **Prompt Engineering**: Maintain consistent prompt templates
- **Response Validation**: Validate AI responses before using

```typescript
// ✅ GOOD: Proper AI service structure
class AIService {
  async evaluateTranslation(userTranslation: string, correctTranslations: string[]): Promise<TranslationEvaluation> {
    try {
      // AI evaluation logic
    } catch (error) {
      // Fallback to basic evaluation
      return this.basicEvaluation(userTranslation, correctTranslations);
    }
  }
}
```

### 4.2 Content Generation Guidelines
- **Quality Control**: All AI-generated content requires validation
- **Batch Processing**: Generate content in batches to optimize API usage
- **Metadata Tracking**: Track generation sessions and quality metrics
- **Human Review**: Implement review queue for AI-generated content

## 5. Local Development Standards

### 5.1 Environment Setup
- **Node.js**: Use Node.js 18+ for local development
- **Package Manager**: Use npm (consistent with project setup)
- **Environment Variables**: Use `.env` file for local configuration
- **Port Management**: Handle port conflicts gracefully (default 5001 if 5000 occupied)
- **Database**: SQLite for local development (file: ./database.db)

```typescript
// ✅ GOOD: Flexible port configuration
const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
server.listen(port, "localhost", () => {
  log(`serving on port ${port}`);
});
```

### 5.2 Development Workflow
- **Hot Reload**: Vite for frontend, tsx for backend hot reloading
- **Database Reset**: Safe to delete `database.db` for clean state
- **Migration**: Always run migrations after schema changes
- **TypeScript**: Use `npx tsc --noEmit --skipLibCheck` for type checking
- **Error Handling**: Graceful degradation when services are unavailable

### 5.3 Cross-Platform Compatibility
- **File Paths**: Use platform-agnostic path handling
- **Line Endings**: Configure Git for consistent line endings
- **Case Sensitivity**: Be aware of case-sensitive vs case-insensitive filesystems
- **Shell Commands**: Use Node.js APIs instead of shell commands when possible

## 6. Testing Standards

### 5.1 Testing Strategy
- **Unit Tests**: All utility functions and business logic
- **Integration Tests**: API endpoints and database operations
- **Component Tests**: React components with React Testing Library
- **E2E Tests**: Critical user flows with Playwright
- **Type Safety**: Include TypeScript compilation as part of test suite

### 5.2 Test Organization
- **Co-location**: Tests next to the code they test
- **Naming Convention**: `*.test.ts` or `*.spec.ts`
- **Mock Strategy**: Mock external dependencies, not internal modules
- **Test Data**: Use factories for consistent test data

### 6.2 Debugging & Troubleshooting
- **TypeScript First**: Always run `npx tsc --noEmit --skipLibCheck` to catch type errors
- **Database Issues**: Check table existence, column names, and data types
- **Port Conflicts**: Handle gracefully with fallback ports (5000 → 5001)
- **JSON Fields**: Verify JSON string format in database fields
- **Date Fields**: Ensure Unix timestamp format for SQLite compatibility
- **Migration State**: Verify database schema matches code expectations

```bash
# ✅ GOOD: Debugging workflow
# 1. Check TypeScript errors
npx tsc --noEmit --skipLibCheck

# 2. Reset database if needed
rm database.db
npx drizzle-kit generate
npx drizzle-kit migrate

# 3. Test API endpoints
curl http://localhost:5001/api/auth/user
curl http://localhost:5001/api/sentences
```

## 7. Performance Standards

### 7.1 Frontend Performance
- **Bundle Optimization**: Use Vite's built-in optimizations
- **Code Splitting**: Lazy load non-critical components
- **Caching Strategy**: Implement proper cache invalidation
- **Image Optimization**: Use appropriate image formats and sizes

### 7.2 Backend Performance
- **Database Indexing**: Proper indexes on frequently queried columns
- **Query Optimization**: Avoid N+1 queries and unnecessary joins
- **Caching Layer**: Implement Redis for frequently accessed data
- **API Response**: Consistent response times under 200ms

## 8. Security Standards

### 8.1 Authentication & Authorization
- **Local Development**: Stubbed authentication for development environment
- **Production**: Implement proper authentication system (to be determined)
- **Session Management**: Secure session storage appropriate to environment
- **Route Protection**: Authenticate all user-specific endpoints
- **Input Validation**: Sanitize all user inputs
- **Environment Detection**: Different auth strategies for development vs production

```typescript
// ✅ GOOD: Environment-aware authentication
const isAuthenticated = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    // Stub auth for local development
    next();
  } else {
    // Production authentication logic
    // TODO: Implement production auth system
  }
};
```

### 8.2 Data Protection
- **Environment Variables**: Never commit secrets to version control
- **SQL Injection**: Use parameterized queries exclusively
- **XSS Prevention**: Properly escape user-generated content
- **CORS Configuration**: Restrict origins in production

## 9. Documentation Standards

### 9.1 Code Documentation
- **JSDoc Comments**: Document all public functions and classes
- **README Updates**: Keep README.md current with setup instructions
- **API Documentation**: Maintain OpenAPI/Swagger documentation
- **Architecture Decisions**: Document significant architectural changes

### 9.2 Git Workflow
- **Commit Messages**: Use conventional commit format
- **Branch Strategy**: Feature branches with descriptive names
- **Pull Requests**: Require code review for all changes
- **Version Tags**: Tag releases with semantic versioning

## 10. Error Handling Protocols

### 10.1 Frontend Error Handling
- **Error Boundaries**: Catch React component errors
- **User Feedback**: Show meaningful error messages to users
- **Logging**: Log errors to monitoring service
- **Graceful Degradation**: Provide fallback UI for failures

### 10.2 Backend Error Handling
- **Consistent Format**: Standardized error response structure
- **Status Codes**: Appropriate HTTP status codes
- **Error Logging**: Structured logging with context
- **Monitoring**: Alert on critical errors

## 11. Code Quality Enforcement

### 11.1 Linting & Formatting
- **ESLint**: Enforce coding standards automatically
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking enabled
- **Pre-commit Hooks**: Run linting and tests before commits

### 11.2 Code Review Checklist
- [ ] Type safety maintained
- [ ] Error handling implemented
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] Performance considerations addressed
- [ ] Security implications reviewed

## 12. Deployment Standards

### 12.1 Build Process
- **Environment-Specific**: Different builds for development/production
- **Asset Optimization**: Minification and compression
- **Health Checks**: Implement proper health check endpoints
- **Rollback Strategy**: Quick rollback mechanism for failed deployments
- **Database Migrations**: Automated migration execution in deployment pipeline
- **Environment Variables**: Secure environment variable management across environments

### 12.2 Monitoring & Observability
- **Application Metrics**: Track key performance indicators
- **Error Tracking**: Comprehensive error monitoring
- **User Analytics**: Track user engagement and learning progress
- **Performance Monitoring**: Response times and resource usage

## 13. Migration & Platform Independence

### 13.1 Lessons from Replit Migration
- **Platform Dependency**: Avoid platform-specific dependencies (e.g., Replit Auth, Neon DB)
- **Environment Variables**: Use consistent environment variable patterns across platforms
- **Database Portability**: Design schemas that work across different database engines
- **Service Abstractions**: Use interface-based service design for easy swapping
- **Configuration**: Externalize all platform-specific configuration

### 13.2 Cross-Platform Best Practices
- **Database Engines**: Support both SQLite (local) and PostgreSQL (production)
- **Authentication**: Implement pluggable authentication strategies
- **File Storage**: Abstract file operations for different storage backends
- **Service Integration**: Use dependency injection for external service integrations
- **Environment Detection**: Graceful handling of different deployment environments

```typescript
// ✅ GOOD: Platform-agnostic service design
interface IAuthService {
  authenticate(req: Request): Promise<User | null>;
  getUser(id: string): Promise<User | undefined>;
}

class LocalAuthService implements IAuthService {
  // Local development implementation
}

class ProductionAuthService implements IAuthService {
  // Production authentication implementation
}
```

## 14. Compliance & Maintenance

### 12.1 Regular Maintenance
- **Dependency Updates**: Regular security updates
- **Performance Audits**: Monthly performance reviews
- **Code Quality Reviews**: Quarterly code quality assessments
- **Database Optimization**: Regular query performance analysis
- **TypeScript Updates**: Keep TypeScript and type definitions current
- **Platform Compatibility**: Regular testing across different environments

### 12.2 Compliance Requirements
- **Data Privacy**: GDPR/CCPA compliance for user data
- **Accessibility**: WCAG 2.1 AA compliance
- **Browser Support**: Modern browser compatibility
- **Mobile Responsiveness**: Consistent experience across devices

---

## Enforcement

These standards are **mandatory** for all development work. Code that doesn't meet these standards will be rejected during code review. When in doubt, prioritize:

1. **Type Safety** - Prevent runtime errors
2. **User Experience** - Smooth, accessible interface
3. **Performance** - Fast, responsive application
4. **Maintainability** - Clean, documented code
5. **Security** - Protected user data

## Questions & Updates

For questions about these standards or suggestions for improvements, create an issue in the project repository. This document will be updated as the project evolves.