# Backend Services

## Service Architecture

### Core Services
- **aiService**: OpenAI integration for translation evaluation
- **sentenceService**: Content management and initialization
- **authService**: Environment-aware authentication integration
- **storageService**: Database abstraction layer

### API Layer
- **routes.ts**: RESTful API endpoints
- **middleware**: Authentication and validation
- **error handling**: Consistent error responses

### Data Layer
- **storage.ts**: Database operations interface
- **schema.ts**: Drizzle ORM schema definitions
- **db.ts**: Database connection management

## Service Implementation

### AI Service
- Translation evaluation using GPT-4o
- Structured response parsing
- Error handling and fallbacks
- Performance optimization

### Storage Service
- User management operations
- Sentence CRUD operations
- Progress tracking
- Session management

## Integration Patterns
- Service composition for complex operations
- Async/await for non-blocking operations
- Proper error propagation
- Transaction management

*Service implementation details in server/services/*