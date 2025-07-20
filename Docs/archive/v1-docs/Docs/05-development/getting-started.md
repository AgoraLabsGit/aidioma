# Getting Started with AIdioma Development
## Complete Setup Guide for New Developers

---

## 🎯 **Quick Start (5 Minutes)**

### **Prerequisites**
- Node.js 18+ installed
- Git configured
- Text editor (VS Code recommended)
- Terminal access

### **Essential Commands**
```bash
# Clone and setup
git clone [repository-url]
cd AIdioma.V1

# Install dependencies
npm install

# Start development
npm run dev

# Type check (run before debugging)
npx tsc --noEmit --skipLibCheck
```

---

## 📋 **Project Structure Overview**

### **Key Directories**
```
AIdioma.V1/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities
├── server/                # Node.js backend
│   ├── services/          # Business logic modules
│   ├── routes.ts          # API endpoints
│   └── storage.ts         # Database interface
├── shared/                # Shared types and schemas
│   └── schema.ts          # Single source of truth for types
└── docs/                  # This documentation system
```

### **Technology Stack**
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (local) / PostgreSQL (production)
- **AI Integration**: OpenAI GPT-4o with caching
- **State Management**: TanStack Query + React hooks

---

## 🔧 **Development Environment Setup**

### **Step 1: Local Database Setup**
```bash
# Initialize SQLite database
npm run db:setup

# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### **Step 2: Environment Configuration**
Create `.env.local` file:
```env
# Development settings
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="file:./dev.db"

# AI Integration (optional for local dev)
OPENAI_API_KEY="your-api-key-here"

# Authentication (stubbed in development)
AUTH_ENABLED=false
```

### **Step 3: Verify Setup**
```bash
# Check TypeScript compilation
npx tsc --noEmit --skipLibCheck

# Run tests
npm test

# Start development server
npm run dev
```

Visit `http://localhost:3000` - you should see the AIdioma interface.

---

## 📚 **Essential Reading for New Developers**

### **Architecture Understanding**
1. **[MVP Architecture](../03-architecture/mvp-architecture.md)** - Complete system design
2. **[Modular System](../03-architecture/modular-system.md)** - How modules work together
3. **[Implementation Roadmap](../02-planning/implementation-roadmap.md)** - Development phases

### **Development Standards**
1. **[Framework Compliance](../04-protocols/framework-compliance.md)** - Code quality requirements
2. **[TypeScript Standards](../04-protocols/development-standards.md)** - Type safety rules
3. **[Module Development](./module-development.md)** - How to build new modules

### **Key Concepts**
- **Single Source of Truth**: All types defined in `shared/schema.ts`
- **IStorage Interface**: All database operations go through this abstraction
- **Environment Awareness**: Different behavior for development vs production
- **Module Reusability**: Same modules power multiple pages

---

## 🎯 **Development Workflow**

### **Before Starting Any Work**
```bash
# Always check TypeScript first
npx tsc --noEmit --skipLibCheck

# Pull latest changes
git pull origin main

# Install any new dependencies
npm install
```

### **Creating New Features**
1. **Plan the module** - Which pages will use it?
2. **Update shared/schema.ts** - Add any new types
3. **Implement the service** - Business logic in `server/services/`
4. **Create API endpoints** - RESTful routes in `server/routes.ts`
5. **Build UI components** - React components in `client/src/components/`
6. **Test integration** - Verify everything works together

### **Quality Checklist (Before Committing)**
- [ ] TypeScript compilation clean: `npx tsc --noEmit --skipLibCheck`
- [ ] All tests passing: `npm test`
- [ ] No console errors in browser
- [ ] Mobile responsiveness checked
- [ ] API responses follow standard format: `{ success, data?, error? }`

---

## 🔍 **Debugging Common Issues**

### **TypeScript Errors**
```bash
# Check for compilation errors
npx tsc --noEmit --skipLibCheck

# Common fixes:
# 1. Add proper type definitions
# 2. Handle undefined/null values with conditionals
# 3. Use proper Drizzle types from shared/schema.ts
```

### **Database Issues**
```bash
# Reset database
rm dev.db
npm run db:setup
npm run db:migrate

# Check database connection
npm run db:check
```

### **Module Integration Issues**
1. **Verify IStorage interface** - All database ops go through storage layer
2. **Check shared/schema.ts** - Ensure types are defined and exported
3. **Validate API format** - Responses should follow `{ success, data, error }` pattern

### **AI Integration Issues**
```bash
# Check API key configuration
echo $OPENAI_API_KEY

# Test AI service
npm run test:ai

# Check caching strategy
npm run cache:status
```

---

## 🚀 **Next Steps**

### **For Frontend Developers**
1. Review **[Component Library](../06-design-system/component-library.md)**
2. Study **[UI/UX Guidelines](../06-design-system/ui-patterns.md)**
3. Understand **[State Management Patterns](./frontend-patterns.md)**

### **For Backend Developers**
1. Study **[Module Development Guide](./module-development.md)**
2. Review **[API Standards](../04-protocols/api-standards.md)**
3. Understand **[Database Architecture](./database-patterns.md)**

### **For AI Engineers**
1. Review **[AI Integration Patterns](../08-ai-integration/)**
2. Study **[Cost Optimization Strategy](../08-ai-integration/cost-optimization.md)**
3. Understand **[Caching Implementation](../08-ai-integration/caching-strategy.md)**

---

## 💬 **Getting Help**

### **Common Questions**
- **"How do I add a new page?"** - See [Page Development Guide](./page-development.md)
- **"How do I create a new module?"** - See [Module Development Guide](./module-development.md)
- **"How do I integrate with AI?"** - See [AI Integration Guide](../08-ai-integration/patterns/)

### **Resources**
- **Documentation Index**: [README.md](../README.md)
- **Architecture Overview**: [MVP Architecture](../03-architecture/mvp-architecture.md)
- **Implementation Roadmap**: [Roadmap](../02-planning/implementation-roadmap.md)

---

Welcome to AIdioma development! This guide should get you up and running quickly. For detailed implementation guidance, refer to the specific documentation sections above.