# Design System Standards

Maintain consistent UI using Strike-inspired dark theme and reusable components.

## Color System (MANDATORY)
```typescript
// ✅ CORRECT: Use only established design tokens
<div className="bg-background text-foreground border border-border">
  <Button variant="default" size="md">Submit Translation</Button>
  <Badge variant="secondary">Intermediate</Badge>
</div>

// ❌ FORBIDDEN: Custom colors outside design system
<div style={{ backgroundColor: '#123456', color: '#abcdef' }}> // Not allowed
```

## Component Reusability
```typescript
// ✅ CORRECT: Multi-page reusable component
interface ActionButtonsProps {
  actions: ActionConfig[]
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  onAction: (actionId: string) => void
  className?: string
}

// Usage across pages:
// Practice: Submit/Hint/Skip buttons
// Reading: Continue/Bookmark/Translate buttons
// Conversation: Send/Save/Continue buttons

// ❌ INCORRECT: Page-specific component
function PracticeSubmitButton() {
  // Only works for Practice page - not reusable
}
```

## Responsive Design Pattern
```typescript
// ✅ REQUIRED: Mobile-first responsive approach
<div className="
  w-full max-w-sm mx-auto          // Mobile: constrained width
  sm:max-w-md                      // Small: wider
  lg:max-w-4xl lg:mx-0            // Large: full width
  grid grid-cols-1 gap-4          // Mobile: single column
  lg:grid-cols-3 lg:gap-6         // Large: three columns
">
  <SessionStats className="lg:col-span-3" />
  <PracticeFilters />
  <TranslationInput className="lg:col-span-2" />
</div>
```

## Accessibility Requirements
```typescript
// ✅ REQUIRED: WCAG AA compliance
<Button
  aria-label="Submit translation for evaluation"
  aria-describedby="translation-help"
  className="min-h-[44px]" // Touch target size
  onKeyDown={handleKeyboardNavigation}
>
  Check Answer
</Button>

<div 
  id="translation-help"
  className="text-sm text-muted-foreground"
  role="status"
  aria-live="polite"
>
  Enter your English translation of the Spanish sentence above
</div>
```

## Animation Standards
```typescript
// ✅ CORRECT: Use Framer Motion for animations
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  {content}
</motion.div>

// ❌ AVOID: CSS animations for complex interactions
```

## Layout Patterns
```typescript
// ✅ STANDARD: Page layout composition
<PageLayout pageTitle="Practice" pageIcon={Play}>
  {/* 1. Session Stats - Always first */}
  <SessionStats {...statsProps} />
  
  {/* 2. Filters - Always second */}
  <PracticeFilters {...filterProps} />
  
  {/* 3. Main Content - Always third */}
  <div className="max-w-4xl mx-auto w-full">
    <PageSpecificContent />
    <ActionButtons {...buttonProps} />
  </div>
</PageLayout>
```

## Typography Scale
Use established type classes:
- `text-xs` (12px) - Captions, helper text
- `text-sm` (14px) - Body text, form labels  
- `text-base` (16px) - Default body text
- `text-lg` (18px) - Subheadings
- `text-xl` (20px) - Page headings
- `text-2xl` (24px) - Section titles
- `text-3xl` (30px) - Main headings 