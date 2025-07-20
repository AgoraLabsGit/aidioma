# Cursor AI Setup for AIdioma
## Concise Development Rules Following Best Practices

*This document explains AIdioma's Cursor AI setup using a concise `.cursorrules` file following [Cursor's best practices](https://docs.cursor.com/context/rules#best-practices) and [examples](https://docs.cursor.com/context/rules#examples).*

---

## Cursor Rules Structure

Following [Cursor's documentation](https://docs.cursor.com/context/rules#examples), we use a single concise rules file:

```
├── .cursorrules                 # Main rules file (196 lines, concise)
└── Docs/00-rules/              # Detailed guidelines (reference)
    ├── README.md               # Rules organization guide
    ├── quick-reference.md      # Developer quick lookup
    ├── development-standards.md # Comprehensive practices
    ├── framework-compliance.md # Framework requirements
    └── [specialized rules].mdc # Detailed patterns
```

## Primary Rules File

The `.cursorrules` file contains focused, actionable guidance in 196 lines covering:

### Core Standards
- **Project Context**: AIdioma's 12-module architecture
- **Technology Stack**: Approved libraries and forbidden duplicates
- **Performance Requirements**: AI <2000ms, UI <100ms, >80% cache hit rate
- **TypeScript Standards**: Zero `any` usage with strict typing

### Essential Patterns
```typescript
// AI Integration (mandatory caching and timeout)
async function aiServiceCall<T>(cacheKey: string, aiCall: () => Promise<T>, fallback: () => T)

// Component Reusability (multi-page interfaces)
interface ActionButtonsProps { actions: ActionConfig[]; onAction: (id: string) => void }

// Module Interface (standardized pattern)
interface StandardModule<TConfig, TInput, TResult, TState>
```

### Critical Guidelines
- **Library Research Protocol**: Score 1-5, >4.0 = Adopt, 3.0-4.0 = POC, <3.0 = Custom
- **Pre-Commit Checklist**: lint, type-check, test, build analysis
- **Red Lines**: Zero tolerance for any types, uncached AI calls, >50KB bundles
- **Design System**: Use tokens only, no custom colors

## Benefits of Concise Approach

### Performance Optimized
- **Fast AI responses** with minimal context overhead
- **Focused guidance** specific to AIdioma's needs
- **No unnecessary information** cluttering AI prompts
- **Actionable rules** that AI can directly apply

### Developer Friendly
- **Quick reference** for essential patterns
- **Clear constraints** and requirements
- **Practical examples** for common scenarios
- **Immediate applicability** without information overload

### Maintenance Simplified
- **Single source of truth** for AI guidance
- **Easy updates** when standards change
- **Version controlled** development rules
- **Clear separation** between AI rules and documentation

## How Cursor AI Uses the Rules

The concise `.cursorrules` file provides Cursor AI with:

### Immediate Context
- Project architecture and technology stack
- Performance requirements and constraints
- Essential code patterns and interfaces
- Critical guidelines and red lines

### Practical Patterns
- AI integration with caching and timeouts
- Component reusability across pages
- TypeScript strict typing requirements
- Design system token usage

### Decision Framework
- Library evaluation criteria and thresholds
- Quality gates for code changes
- Error handling and fallback patterns
- Commit standards and documentation requirements

## Reference Documentation

For comprehensive guidelines, developers can reference:

### Core Standards (`Docs/00-rules/`)
- **development-standards.md** - Complete development practices
- **framework-compliance.md** - Framework integration requirements
- **typescript-standards.mdc** - Detailed TypeScript patterns

### Specialized Guidelines
- **ai-integration.mdc** - AI service patterns and caching strategies
- **design-system.mdc** - UI components and design tokens
- **library-research.mdc** - Dependency evaluation framework
- **final-review.mdc** - Quality assurance checklist

### Quick Access
- **quick-reference.md** - Essential patterns and constraints
- **project-overview.mdc** - Architecture and module context

## Implementation Example

When working with Cursor AI, the concise rules provide immediate guidance:

```typescript
// AI automatically suggests this pattern based on .cursorrules
async function evaluateTranslation(input: EvaluationInput): Promise<EvaluationResult> {
  const cacheKey = `eval:${input.sentenceId}:${hashString(input.userTranslation)}`
  
  return aiServiceCall(
    cacheKey,
    () => openai.completions.create({ ... }),
    () => generateFallbackEvaluation(input)
  )
}

// AI enforces component reusability patterns
interface ActionButtonsProps {
  actions: ActionConfig[]
  onAction: (actionId: string) => void
  className?: string
}

// AI suggests design token usage only
<div className="bg-background text-foreground border-border">
  <Button variant="default">Submit Translation</Button>
</div>
```

## Migration Benefits

### Before: Multiple Complex Rules
- Multiple .mdc files with metadata complexity
- 542 total lines across 6 files
- Context-aware loading with glob patterns
- Complex rule hierarchy and dependencies

### After: Single Concise Rule
- One focused `.cursorrules` file
- 196 lines of essential guidance
- Immediate loading and application
- Clear, actionable patterns

### Result: Optimal Performance
- Faster AI responses with minimal context
- More relevant suggestions through focused rules
- Better developer experience with clear guidance
- Maintained quality through essential constraints

## Best Practices Alignment

Our approach follows [Cursor's recommendations](https://docs.cursor.com/context/rules#best-practices):

- **Under 500 lines** (196 lines)
- **Focused and actionable** guidance
- **Concrete examples** with code patterns
- **Clear internal documentation** style
- **Avoids vague guidance** through specific constraints

The concise `.cursorrules` file ensures optimal AI performance while maintaining AIdioma's high development standards through focused, practical guidance that Cursor AI can immediately apply.

---

*This streamlined approach provides the best of both worlds: fast AI assistance with comprehensive documentation available when needed.* 