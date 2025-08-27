# AIdioma Cursor AI - Quick Reference
*Essential guidelines for rapid development reference*

## 🚨 CRITICAL RED LINES
- **NO `any` types** - All TypeScript strictly typed
- **NO AI calls without caching** - Every AI call needs cache + timeout
- **NO >50KB bundle additions** without justification
- **NO custom solutions** when existing stack works
- **NO security vulnerabilities** - Zero tolerance

## ⚡ PERFORMANCE LIMITS
- AI Evaluation: **<2000ms** (hard timeout)
- UI Interactions: **<100ms** 
- Bundle Additions: **<10KB** preferred
- Cache Hit Rate: **>80%** required

## 📚 APPROVED STACK (Enhance, Don't Replace)
```typescript
✅ USE THESE:
- React 18 + TypeScript
- TanStack Query + useState
- shadcn/ui + Tailwind
- wouter (routing)
- react-hook-form + zod
- Drizzle ORM
- openai + anthropic-ai

❌ AVOID THESE:
- redux, react-router, styled-components
- formik, axios, lodash, moment
```

## 🔧 LIBRARY RESEARCH (MANDATORY)
Before adding ANY dependency:

1. **Check existing**: `grep -r "package-name" package.json`
2. **Score 1-5**: Technical (40%) + Ecosystem (30%) + Security (20%) + Fit (10%)
3. **Decision**: >4.0 = Adopt, 3.0-4.0 = POC, <3.0 = Build Custom
4. **Document**: Create Library Decision Record
5. **Justify**: 2-hour integration vs 2-week custom development

## 🏗️ MODULE STANDARDS
```typescript
// ✅ CORRECT: Reusable module pattern
interface ModuleInterface {
  initialize(config: Config): Promise<void>
  cleanup(): Promise<void>
  [coreMethod](input: Input): Promise<Result>
  getState(): State
  getMetrics(): Metrics
}

// ❌ WRONG: Page-specific implementation
function practicePageOnlyFunction() { ... }
```

## 🎨 DESIGN SYSTEM
```typescript
// ✅ USE: Design tokens only
className="bg-background text-foreground border-border"

// ❌ FORBIDDEN: Custom colors
style={{ backgroundColor: '#123456' }}
```

## 🧪 TESTING REQUIREMENTS
- **>90% coverage** for all modules
- **Performance tests** for critical paths
- **E2E tests** for user journeys
- **Mock AI services** in tests

## 📋 PRE-COMMIT CHECKLIST
```bash
# MUST PASS:
npm run lint          # Zero warnings
npm run type-check    # Zero errors  
npm run test          # >90% coverage
npm run build         # Bundle analysis

# VERIFY:
□ Module reusability across pages?
□ TypeScript strict (no any)?
□ AI caching implemented?
□ Design system compliance?
□ Documentation updated?
□ Performance within limits?
```

## 🎯 AI INTEGRATION PATTERN
```typescript
// ✅ REQUIRED PATTERN:
async function aiServiceCall(input: Input): Promise<Result> {
  // 1. Check cache
  const cached = await cache.get(key)
  if (cached) return { ...cached, cached: true }
  
  try {
    // 2. AI call with timeout (2000ms)
    const result = await Promise.race([
      aiService.call(input),
      timeoutPromise(2000)
    ])
    
    // 3. Cache result
    await cache.set(key, result)
    return { ...result, cached: false }
    
  } catch (error) {
    // 4. Fallback + log
    logger.error('AI failed', { error, input })
    return generateFallback(input)
  }
}
```

## 📝 COMMIT FORMAT
```bash
git commit -m "feat(module): descriptive message

- Specific change 1
- Specific change 2
- Performance impact: <measurement>
- Module reusability: <assessment>
- Bundle size: <measurement>
- Test coverage: <percentage>"
```

## 🎯 SUCCESS METRICS
- Development Velocity: Features per sprint
- Code Quality: >90% coverage, zero lint errors
- Performance: AI <2000ms, UI <100ms  
- Cost: AI cost <$0.10 per session
- UX: <1% error rate, >80% cache hit
- Reusability: 64% average across pages

---
*Keep this handy during development - these are the non-negotiables!* 