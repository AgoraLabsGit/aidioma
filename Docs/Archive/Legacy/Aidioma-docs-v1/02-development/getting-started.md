# Quick Start Guide

## Prerequisites

Before starting development, ensure you have:
- **Node.js** (v18 or higher) and **npm** installed
- **Local development environment** with your preferred IDE
- **OpenAI API key** for translation evaluation
- **Basic understanding** of React, Node.js, and TypeScript

## Initial Setup

### 1. Environment Configuration
```bash
# Required environment variables (.env file)
DATABASE_URL=./database.db                 # SQLite for local development
OPENAI_API_KEY=sk-...                      # Your OpenAI API key
SESSION_SECRET=your-secret-key             # Session encryption key
NODE_ENV=development                       # Development environment
```

### 2. Database Setup
```bash
# Generate and apply migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Initialize sample sentences
# (Automatic on first run)
```

### 3. Start Development Server
```bash
# Install dependencies
npm install

# Start both frontend and backend
npm run dev

# Server will be available at http://localhost:5001
```

## Project Structure Overview

```
project/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Route components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities
│   └── index.html           # Entry point
├── server/                   # Node.js backend
│   ├── index.ts             # Server entry
│   ├── routes.ts            # API routes
│   ├── storage.ts           # Database layer
│   └── services/            # Business logic
├── shared/                   # Shared types and schemas
│   └── schema.ts            # Database schema
└── docs/                    # Documentation
```

## Key Development Commands

### Database Operations
```bash
# Generate migrations
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# View database studio
npx drizzle-kit studio

# Reset local database (safe for development)
rm database.db && npx drizzle-kit migrate
```

### Development Workflow
```bash
# Start development server
npm run dev

# Type checking
npx tsc --noEmit --skipLibCheck

# Build for production
npm run build
```

## First Steps

### 1. Explore the Application
- Navigate to http://localhost:5001
- Test the authentication system (stubbed for development)
- Try the translation practice interface
- Check the progress tracking features

### 2. Understand the Code Structure
- Review `shared/schema.ts` for database structure
- Check `server/routes.ts` for API endpoints
- Explore `client/src/components/` for UI components

### 3. Make Your First Change
- Modify a UI component in `client/src/components/`
- Update an API endpoint in `server/routes.ts`
- Add a new database field in `shared/schema.ts`

## Common Development Tasks

### Adding a New Feature
1. **Define the database schema** in `shared/schema.ts`
2. **Create API endpoints** in `server/routes.ts`
3. **Build UI components** in `client/src/components/`
4. **Add navigation** in `client/src/App.tsx`

### Debugging Issues
1. **Check server logs** in your terminal console
2. **Review browser console** for frontend errors
3. **Use database studio** to inspect data with `npx drizzle-kit studio`
4. **Test API endpoints** directly with curl or Postman

### Testing Changes
1. **Manual testing** in the local development environment
2. **Check different user flows** (authentication, practice, progress)
3. **Test responsive design** on different screen sizes
4. **Verify database operations** work correctly

## Development Best Practices

### Code Style
- Use **TypeScript** for all new code
- Follow **React hooks** patterns
- Implement **proper error handling**
- Write **clear, descriptive names**

### Database Operations
- Always use **Drizzle ORM** for queries
- Implement **proper validation** with Zod schemas
- Use **transactions** for related operations
- Add **proper indexes** for performance
- Use **SQLite** for local development, **PostgreSQL** for production

### API Design
- Follow **RESTful conventions**
- Use **proper HTTP status codes**
- Implement **request validation**
- Add **comprehensive error handling**

## Getting Help

### Documentation
- Check this `/docs` directory for detailed guides
- Review the `README.md` for project overview
- Reference the API documentation

### Troubleshooting
- Check the troubleshooting guide in `/docs/06-operations/`
- Review common issues and solutions
- Use online development communities and resources

### Development Resources
- **Local setup guide**: See `02-development/getting-started.md`
- **API documentation**: See `02-development/api-documentation.md`
- **Database schema**: See `02-development/database-schema.md`

## Next Steps

After completing the initial setup:
1. **Review the architecture** in `01-project/architecture.md`
2. **Study the learning system** in `04-learning-system/`
3. **Explore implementation details** in `05-implementation/`
4. **Check deployment procedures** in `06-operations/`

You're now ready to contribute to the AIdioma Spanish learning application!