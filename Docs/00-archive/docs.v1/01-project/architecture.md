# Technical Architecture

## System Overview

AIdioma is built as a modern full-stack web application with a React frontend and Node.js backend, designed for scalability and maintainability.

## Frontend Architecture

### Core Technologies
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized production builds
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **Tailwind CSS** with Strike-inspired dark theme

### State Management
- **Server State**: TanStack Query with automatic caching and invalidation
- **Client State**: React hooks and context for local component state
- **Form State**: React Hook Form with Zod validation

### Component Structure
```
client/src/
├── components/
│   ├── ui/                    # Reusable UI components (shadcn/ui)
│   ├── layout/                # Navigation and layout components
│   ├── practice/              # Translation practice components
│   ├── reading/               # Text reading and content components
│   ├── conversation/          # AI conversation interface
│   ├── content/               # Content upload and management
│   └── progress/              # Progress tracking components
├── pages/                     # Route components
│   ├── practice/              # Practice mode pages
│   ├── text/                  # Reading interface pages  
│   ├── conversations/         # Conversation pages
│   └── content/               # Content management pages
├── hooks/                     # Custom React hooks
├── lib/                       # Utility functions and configurations
└── types/                     # TypeScript type definitions
```

## Backend Architecture

### Core Technologies
- **Node.js** with Express framework
- **TypeScript** with ESM modules for modern JavaScript
- **SQLite (local) / PostgreSQL (production)** with Drizzle ORM
- **OpenAI GPT-4o** with 3-tier intelligent caching system

### Service Architecture
```
server/
├── index.ts                   # Application entry point
├── routes.ts                  # API route definitions
├── storage.ts                 # Database abstraction layer
├── services/                  # Business logic services
│   ├── aiService.ts          # OpenAI integration with caching
│   ├── contentService.ts     # Content processing and management
│   ├── conversationService.ts # AI conversation management
│   └── processingService.ts  # Text analysis and extraction
│   └── sentenceService.ts    # Content management
├── db.ts                     # Database connection and configuration
└── auth.ts                   # Authentication middleware
```

## Database Schema

### Current Implementation
- **users**: Authentication and profile data
- **sentences**: Practice content with metadata
- **userProgress**: Individual progress tracking
- **practiceSessions**: Session-based analytics
- **sessions**: Authentication session storage

### Future Architecture
The database will be enhanced with:
- **topics**: Hierarchical topic categorization
- **ai_generation_sessions**: AI content tracking
- **word_analysis**: Word-level learning data
- **user_topic_progress**: Multi-dimensional progress tracking

### Relationships
- Users have many UserProgress records
- Sentences have many UserProgress records
- Users have many PracticeSessions
- Enhanced relationships for topic-based learning
- Enforced referential integrity with foreign keys

*See [Comprehensive Database Architecture](../02-development/comprehensive-database-architecture.md) for complete future schema.*

## Authentication System

### Environment-Aware Authentication
- **Local Development**: Stubbed authentication for development ease
- **Production**: Full authentication system implementation
- **Session management** with database store
- **Token-based authentication** for API security
- **Role-based access control** for future admin features

### Security Features
- **HTTPS-only cookies** for secure session management
- **CSRF protection** with proper token validation
- **Input validation** using Zod schemas
- **SQL injection prevention** through parameterized queries

## AI Integration

### OpenAI GPT-4o
- **Translation evaluation** with semantic analysis
- **Grammar assessment** and improvement suggestions
- **Contextual feedback** for learning enhancement
- **Structured JSON responses** for consistent data parsing

### Evaluation Pipeline
1. User submits translation
2. AI service processes with OpenAI
3. Structured response with score and feedback
4. Database update with results
5. Real-time UI update with feedback

## Data Flow

### Translation Practice Flow
```
User Input → Frontend Validation → API Request → AI Processing → Database Update → Response → UI Update
```

### Authentication Flow
```
Login Request → Auth Service → Token Exchange → Session Creation → Database Storage → User Context
```

## Performance Optimizations

### Frontend
- **Code splitting** with Vite for optimal loading
- **React Query caching** for reduced API calls
- **Lazy loading** for non-critical components
- **Optimistic updates** for better user experience

### Backend
- **Database connection pooling** for efficient resource usage
- **Response caching** for frequently accessed data
- **Async/await patterns** for non-blocking operations
- **Error handling** with proper HTTP status codes

## Deployment Architecture

### Development Environment
- **Vite dev server** for frontend with HMR
- **Express server** for backend API
- **Database system** (SQLite local / PostgreSQL production)
- **Environment variables** for configuration

### Production Considerations
- **Static asset optimization** with Vite build
- **Server-side rendering** preparation for SEO
- **CDN integration** for global content delivery
- **Monitoring and logging** for production debugging

## Scalability Considerations

### Horizontal Scaling
- **Stateless server design** for load balancing
- **Session store externalization** with PostgreSQL
- **API rate limiting** for resource protection
- **Database connection pooling** for concurrent users

### Vertical Scaling
- **Efficient database queries** with proper indexing
- **Caching strategies** for frequently accessed data
- **Resource monitoring** for performance optimization
- **Database query optimization** with Drizzle ORM

## Security Architecture

### Data Protection
- **Encrypted database connections** with SSL/TLS
- **Environment variable management** for secrets
- **Input sanitization** and validation
- **Error message sanitization** to prevent information leakage

### Access Control
- **Authentication middleware** for protected routes
- **User session validation** for API requests
- **Role-based permissions** for future admin features
- **API endpoint protection** with proper authorization

## Technology Stack Summary

### Frontend Stack
- React 18 + TypeScript
- Vite + Tailwind CSS
- TanStack Query + Wouter
- React Hook Form + Zod

### Backend Stack
- Node.js + Express + TypeScript
- Drizzle ORM + Database (SQLite/PostgreSQL)
- OpenAI GPT-4o + Environment-aware Auth
- Flexible Database Architecture

### Development Tools
- ESLint + Prettier
- Drizzle Kit for migrations
- TypeScript for type safety
- Git for version control

This architecture provides a solid foundation for a scalable, maintainable, and performant Spanish learning application.