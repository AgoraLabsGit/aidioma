# AIdioma System Architecture
## Module-First Spanish Learning Platform

---

## 🏗️ **System Overview**

AIdioma is built on a **module-first architecture** where **12 reusable modules** power **6 core pages**, enabling 64% component reusability and rapid feature development.

### **Core Architecture Principles**
- **Module-First**: Single responsibility modules used across multiple pages
- **TypeScript-First**: Zero `any` usage with strict typing
- **Performance-Critical**: AI evaluation <2000ms, UI interactions <100ms
- **Cost-Optimized**: 85-90% AI cost reduction through intelligent caching

---

## 📱 **Page Architecture**

| Page | Primary Modules | Purpose |
|------|----------------|---------|
| **Practice** | Translation Evaluation, Progressive Hints, Gamification | Core sentence translation practice |
| **Reading** | Content Processing, Reading Interface, Progressive Hints | Interactive text reading with practice |
| **Conversation** | Conversation Suite, Translation Evaluation, Gamification | Real-time AI chat practice |
| **Memorize** | Flash Cards, Spaced Repetition, Progress Tracking | Vocabulary review with intelligent scheduling |
| **Progress** | Progress Tracking, Gamification, Analytics | Learning analytics and achievements |
| **Settings** | User Preferences, Progress Tracking | Configuration and account management |

---

## 🧩 **12-Module Ecosystem**

### **🤖 Language/AI Modules** (5)
- **Translation Evaluation** - Multi-criteria AI scoring with caching
- **Progressive Hints** - 3-level hint system with penalty tracking
- **Conversation Suite** - Real-time AI chat with personas
- **Content Processing** - Text analysis and difficulty assessment
- **AI Cost Optimization** - 3-tier caching system (universal)

### **👤 User Experience Modules** (2)
- **Gamification** - Points, streaks, achievements across all pages
- **Progress Tracking** - Learning analytics and performance metrics

### **🎨 UI Interface Modules** (5)
- **Practice Interface** - Translation practice orchestration
- **Reading Interface** - Interactive text display and navigation
- **Action Buttons** - Reusable button components across pages
- **Session Stats** - Performance indicators for all pages
- **Page Layout** - Consistent layout wrapper for all pages

---

## 🔄 **Module Integration Matrix**

| Module | Practice | Reading | Conversation | Memorize | Progress | Settings | Reuse % |
|--------|----------|---------|--------------|----------|----------|----------|---------|
| **Page Layout** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| **Gamification** | ✅ | ✅ | ✅ | ✅ | ✅ | - | **83%** |
| **Progress Tracking** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | **100%** |
| **Translation Eval** | ✅ | ✅ | ✅ | - | - | - | **50%** |
| **Progressive Hints** | ✅ | ✅ | ✅ | ✅ | - | - | **67%** |

**Average Module Reusability: 64%** - Excellent for scalable architecture

---

## 🛠 **Technology Stack**

### **Frontend**
```typescript
const frontend = {
  framework: "React 18 + TypeScript",
  ui: "shadcn/ui + Tailwind CSS", 
  state: "TanStack Query + React hooks",
  animations: "Framer Motion",
  routing: "wouter",
  forms: "react-hook-form + zod"
}
```

### **Backend**
```typescript
const backend = {
  runtime: "Node.js + Express",
  database: "Drizzle ORM + PostgreSQL",
  validation: "Zod schemas",
  ai: "OpenAI + Anthropic with caching",
  testing: "Vitest + Playwright"
}
```

---

## 📊 **Performance Architecture**

### **AI Optimization**
- **3-Tier Caching**: Memory → Database → AI Service
- **Target**: 85-90% cache hit rate
- **Timeout**: 2000ms hard limit with fallbacks
- **Cost Reduction**: 85-90% of AI costs eliminated

### **Module Performance**
- **Bundle Size**: <10KB per module preferred
- **Response Time**: <100ms for UI interactions
- **Reusability**: Modules designed for cross-page usage
- **Testing**: >90% coverage for all modules

---

## 🔗 **Integration Patterns**

### **Standard Module API**
```typescript
interface ModuleService<TConfig, TState> {
  initialize(config: TConfig): Promise<void>
  cleanup(): Promise<void>
  getState(): TState
  getMetrics(): ModuleMetrics
}
```

### **Page Composition Pattern**
```typescript
<PageLayout pageTitle="Practice" pageIcon={Play}>
  <SessionStats {...statsProps} />
  <PracticeFilters {...filterProps} />
  <div className="max-w-4xl mx-auto w-full">
    <PageSpecificContent />
    <ActionButtons {...buttonProps} />
  </div>
</PageLayout>
```

### **Cross-Module Communication**
- **Event Bus**: Decoupled module communication
- **Shared State**: TanStack Query for cross-component state
- **Type Safety**: Strict TypeScript interfaces for all interactions

---

## 🎯 **Scalability Benefits**

### **Development Velocity**
- **Faster Features**: Compose existing modules into new pages
- **Parallel Development**: Teams can work on independent modules
- **Consistent UX**: Same modules provide same experience everywhere
- **Quality Assurance**: Well-tested modules reduce bugs

### **Maintenance Efficiency**
- **Single Source Updates**: Change module behavior once, applies everywhere
- **Clear Boundaries**: Module responsibilities clearly defined
- **Independent Testing**: Modules tested in isolation
- **Performance Monitoring**: Per-module metrics and optimization 