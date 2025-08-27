# Final Review Protocol

**MANDATORY**: Complete this checklist before every commit.

## 1. Code Quality Verification
```bash
npm run lint                    # ESLint + Prettier (zero warnings)
npm run type-check             # TypeScript compilation (zero errors)
npm run test                   # Unit/integration tests (>90% coverage)
npm run test:e2e              # E2E tests for affected features
```

## 2. Performance Impact Assessment
```bash
npm run build                  # Production build
npm run analyze               # Bundle size analysis
```
**Verify**: 
- No >50KB bundle additions without justification
- AI evaluation endpoints still <2000ms
- UI interactions still <100ms

## 3. Architecture Compliance Checklist
- [ ] **Reusability**: Can this code be used across multiple pages?
- [ ] **TypeScript**: Zero `any` usage, all interfaces properly defined?
- [ ] **AI Integration**: All AI calls implement caching and timeout?
- [ ] **Module Interface**: Follows standardized module APIs?
- [ ] **Error Handling**: Graceful degradation for service failures?

## 4. Design System Compliance
- [ ] **Color Tokens**: Only design system colors used (no custom hex)?
- [ ] **Components**: shadcn/ui components used where possible?
- [ ] **Responsive**: Mobile-first with proper breakpoints?
- [ ] **Accessibility**: ARIA labels, keyboard navigation, WCAG AA?
- [ ] **Animation**: Framer Motion used consistently?

## 5. Documentation Updates (Choose Applicable)
- [ ] `Docs/02-modules/[affected-module]/*.md`
- [ ] `Docs/04-pages/[affected-page].md`
- [ ] `Docs/05-development/API-Documentation.md`
- [ ] `Docs/06-design/component-library.md`
- [ ] Create Library Decision Record (if new dependency)

## 6. Integration Verification
- [ ] **Module Integration**: All affected modules work together?
- [ ] **Cross-Page Consistency**: Changes maintain UX consistency?
- [ ] **Performance**: No regression in critical metrics?
- [ ] **AI Cost**: No increase in unnecessary AI API calls?
- [ ] **Cache Efficiency**: >80% hit rate maintained?

## 7. Commit Standards
```bash
git commit -m "feat(module): descriptive message

- Specific change 1
- Specific change 2
- Performance impact: [measurement]
- Module reusability: [assessment]
- Bundle size impact: [measurement]
- Test coverage: [percentage]"
```

## Red Lines (Zero Tolerance)
1. **No `any` types** - All TypeScript must be properly typed
2. **No AI calls without caching** - Every AI interaction requires caching strategy
3. **No >50KB bundle additions** without performance justification
4. **No custom solutions** when existing stack provides functionality
5. **No security vulnerabilities** - Zero tolerance for known CVEs
6. **No accessibility regressions** - WCAG AA compliance required
