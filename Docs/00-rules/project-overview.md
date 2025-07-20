# AIdioma Project Context

AIdioma is a **Spanish-to-English language learning platform** with:
- **12 Reusable Modules** across Language/AI, User Experience, and UI Interface
- **6 Core Pages** with 64% average component reusability
- **Performance-Critical AI Integration** requiring <2000ms response times
- **TypeScript-First Development** with zero `any` usage allowed

## Core Technology Stack
```typescript
// ✅ APPROVED - Enhance these existing tools
const stack = {
  frontend: "React 18 + TypeScript + TanStack Query + shadcn/ui + Tailwind",
  backend: "Node.js + Express + Drizzle ORM + PostgreSQL", 
  ai: "OpenAI + Anthropic with mandatory caching",
  testing: "Vitest + Playwright"
}

// ❌ FORBIDDEN - Avoid these duplicates
const avoid = ["redux", "react-router", "styled-components", "axios", "lodash"]
```

## Critical Performance Requirements
- **AI Evaluation**: <2000ms response time, >80% cache hit rate
- **UI Interactions**: <100ms response time
- **Bundle Size**: <10KB additions preferred, >50KB requires justification
- **Test Coverage**: >90% for all modules

## Module-First Architecture
All components must be reusable across multiple pages using standardized interfaces:
```typescript
interface StandardModule {
  initialize(config: Config): Promise<void>
  cleanup(): Promise<void>
  getState(): State
  getMetrics(): Metrics
}
```
