# System Requirements and Dependencies

## Prerequisites
- Node.js 18+ with npm
- SQLite (local development) / PostgreSQL (production)
- OpenAI API key
- Local development environment with preferred IDE

## Environment Variables
```bash
DATABASE_URL=./database.db               # SQLite for local dev
OPENAI_API_KEY=sk-...                   # Your OpenAI API key
SESSION_SECRET=your-session-secret       # Session encryption
NODE_ENV=development                     # Environment setting
```

## Technology Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: SQLite (local) / PostgreSQL (production) with Drizzle ORM
- AI: OpenAI GPT-4o
- Auth: Environment-aware authentication system

## Development Dependencies
See package.json for complete list.