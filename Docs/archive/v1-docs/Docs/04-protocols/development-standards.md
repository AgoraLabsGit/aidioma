# Development Standards - AIdioma v2

## Overview

This document establishes the development standards for AIdioma v2, ensuring consistency, quality, and maintainability across all development work.

---

## 🎯 **Core Development Principles**

### **1. TypeScript-First Development**
- **Zero `any` types** - All code must be properly typed
- TypeScript strict mode enabled
- Interfaces defined for all component props and API responses
- Conditional rendering for optional values: `{value && <Component />}`

### **2. Component Architecture**
- **Named exports only** - No default exports for consistency
- Single responsibility principle for components
- Props interfaces properly defined with TypeScript
- Reusable components documented in design system

### **3. State Management Strategy**
- **Decision tree**: useState → Context → External state
- TanStack Query for server state management
- Local state properly scoped to components
- Immutable updates (no state mutations)

### **4. Documentation Maintenance Protocol**
- **Continuous Updates**: Documentation must be updated alongside code changes
- **Real-time Sync**: All component changes require corresponding documentation updates
- **Design System Updates**: UI/UX pattern changes trigger immediate documentation revision
- **Implementation Validation**: All new features validated against existing documentation

### **5. Development Compliance Protocol**
- **Pre-development Review**: Check existing documentation before implementing features
- **Architecture Alignment**: Validate all development against established patterns
- **Design Principle Adherence**: Ensure all UI follows documented design principles
- **Functionality Consistency**: Maintain consistency with documented system behaviors

---

## 🎨 **UI/UX Standards**

### **Design System Compliance**
- **CSS Variables Only** - Use `hsl(var(--variable))` format
- **No Hardcoded Colors** - Always reference design tokens
- **HSL Color System** - Follow lightness scale (8% → 9% → 15% → 25% → 85% → 95%)
- **Consistent Spacing** - Use spacing variables from design system

### **Layout Patterns**
```tsx
// ✅ Correct container pattern
<div className="w-full max-w-4xl mx-auto space-y-6">
  <Component />
</div>

// ❌ Avoid fixed positioning
<div className="fixed top-0 left-0">
```

### **Color Implementation**
```css
/* ✅ Always use CSS variables */
background: hsl(var(--card));
color: hsl(var(--card-foreground));

/* ❌ Never use hardcoded values */
background: #111113;
color: #ffffff;
```

---

## 🔧 **Code Quality Standards**

### **File Organization**
```
client/src/
├── components/ui/          # Reusable UI components
├── pages/                  # Page components
├── lib/                    # Utilities and helpers
├── hooks/                  # Custom React hooks
└── types/                  # TypeScript type definitions
```

### **Import/Export Patterns**
```tsx
// ✅ Named exports
export function Button() { }
export interface ButtonProps { }

// ✅ Consistent imports
import { Button, Input } from '@/components/ui'
```

### **Error Handling**
```tsx
// ✅ Proper error boundaries
function Component() {
  try {
    // risky operation
  } catch (error) {
    console.error('Operation failed:', error)
    // handle gracefully
  }
}
```

---

## 📱 **Responsive Design Standards**

### **Mobile-First Approach**
```css
/* ✅ Mobile-first breakpoints */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Desktop styles */
  }
}
```

### **Touch-Friendly Design**
- Minimum touch targets: 44px × 44px
- Adequate spacing between interactive elements
- Swipe gestures for mobile navigation

---

## 🔒 **Security Standards**

### **Input Validation**
- All user inputs validated on both client and server
- Zod schemas for type-safe validation
- Sanitization of user-generated content

### **Authentication**
- Environment-aware authentication
- Secure session management
- Proper CORS configuration

---

## 🚀 **Performance Standards**

### **Bundle Optimization**
- Bundle size target: <200KB gzipped
- Code splitting for route-based loading
- Tree shaking for unused code elimination

### **Response Times**
- Page load: <2 seconds
- API responses: <200ms (non-AI)
- AI responses: <500ms (with caching)

---

## 🧪 **Testing Standards**

### **Test Coverage Requirements**
- Unit tests: >80% coverage for business logic
- Component tests: All interactive components
- Integration tests: Critical user flows
- E2E tests: Main application workflows

### **Testing Patterns**
```tsx
// ✅ Component testing
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

test('renders button with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button')).toHaveTextContent('Click me')
})
```

---

## 📚 **Documentation Standards**

### **Code Documentation**
- JSDoc comments for complex functions
- README files for each major module
- API documentation maintained in parallel with code

### **Documentation Patterns**
```tsx
/**
 * Renders a practice session with translation input
 * @param sentence - The Spanish sentence to translate
 * @param onSubmit - Callback when translation is submitted
 * @returns JSX element for practice interface
 */
export function PracticeSession({ sentence, onSubmit }: PracticeSessionProps) {
```

---

## ⚙️ **Development Workflow**

### **Pre-Development Checklist**
- [ ] TypeScript check: `npx tsc --noEmit --skipLibCheck`
- [ ] Tests passing: `npm test`
- [ ] Development server running
- [ ] Design system reference available

### **Development Session Flow**
1. **Start**: Pull latest, install dependencies, run type check
2. **Develop**: Follow standards, write tests, maintain documentation
3. **Test**: Local testing, type checking, linting
4. **Commit**: Descriptive messages, clean commits

### **Code Review Requirements**
- TypeScript compilation clean
- All tests passing
- Design system compliance
- Performance considerations addressed
- Documentation updated

---

## 🐛 **Common Issues & Solutions**

### **UI/UX Issues**
- **Color inconsistencies**: Always use CSS variables
- **Layout problems**: Use established container patterns  
- **Border issues**: Explicitly set border properties
- **Font inconsistencies**: Reference typography variables

### **TypeScript Issues**
- **`any` types**: Define proper interfaces
- **Optional chaining**: Use `value?.property` for safety
- **Type assertions**: Avoid unless absolutely necessary

### **Performance Issues**
- **Bundle size**: Code split large dependencies
- **Re-renders**: Optimize with useMemo/useCallback
- **Memory leaks**: Clean up effects and subscriptions

---

## 📊 **Quality Metrics**

### **Automated Checks**
- TypeScript compilation: 0 errors
- ESLint: 0 errors, minimal warnings
- Test coverage: >80% for critical paths
- Bundle analysis: Track size changes

### **Manual Reviews**
- Design system compliance
- Accessibility standards (WCAG 2.1 AA)
- Cross-browser compatibility
- Mobile responsiveness

---

## 🎯 **Success Criteria**

### **Development Quality**
- All code passes TypeScript strict mode
- Design system consistently applied
- Performance budgets maintained
- Security standards met

### **User Experience**
- Responsive design across devices
- Accessible to all users
- Fast loading and smooth interactions
- Consistent visual language

---

These standards ensure AIdioma v2 maintains high quality while enabling efficient development and long-term maintainability.
