# AIdioma Design System Guide v2.0

## Table of Contents
1. [Overview](#overview)
2. [Spacing & Layout Standards](#spacing--layout-standards)
3. [Button Design System](#button-design-system)
4. [Color Palette](#color-palette)
5. [Typography](#typography)
6. [Component Standards](#component-standards)
7. [Layout Architecture](#layout-architecture)
8. [Interactive Elements](#interactive-elements)
9. [Icon System](#icon-system)
10. [Responsive Design](#responsive-design)

---

## Overview

This design system establishes the standardized UI/UX patterns for AIdioma v2.0, based on the refined Practice Page design. All new pages and components MUST follow these standards to ensure consistency and maintainability.

**Key Principles:**
- **Consistency:** One design source of truth
- **Accessibility:** WCAG AA compliance with 44px minimum touch targets
- **Performance:** Optimized spacing and layout patterns
- **Modularity:** Reusable components across all pages

---

## Spacing & Layout Standards

### Primary Spacing Scale
```css
/* Standard Vertical Spacing Pattern */
.spacing-xs { margin-bottom: 0.5rem; }    /* mb-2 - 8px */
.spacing-sm { margin-bottom: 1rem; }      /* mb-4 - 16px */
.spacing-md { margin-bottom: 1.5rem; }    /* mb-6 - 24px */
.spacing-lg { margin-bottom: 2rem; }      /* mb-8 - 32px */
.spacing-xl { margin-bottom: 3rem; }      /* mb-12 - 48px */
```

### Header & Navigation Spacing
```css
/* Fixed Header Offset */
.header-offset { padding-top: 4rem; }     /* pt-16 - 64px */

/* Filter Box Spacing */
.filter-spacing { padding-top: 2rem; }    /* pt-8 - 32px */

/* Sidebar Navigation Spacing */
.sidebar-spacing { padding-top: 3rem; }   /* pt-12 - 48px */
```

### Content Container Standards
```css
/* Standard Content Width */
.content-container {
  max-width: 64rem;        /* max-w-4xl - 1024px */
  margin: 0 auto;          /* mx-auto */
  width: 100%;             /* w-full */
}

/* Main Content Padding */
.main-padding {
  padding: 1rem;           /* p-4 mobile */
  padding: 1.5rem;         /* p-6 desktop */
}
```

---

## Button Design System

### Primary Action Buttons

#### Check/Submit Button
```tsx
// Primary action button - GREEN CIRCLE
<Button className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white">
  <Check className="w-6 h-6" />
</Button>
```

#### Navigation Arrow Buttons
```tsx
// Previous/Next buttons - TRANSPARENT WITH LARGE ICONS
<Button 
  variant="ghost" 
  size="sm" 
  className="flex items-center justify-center p-3 h-14 w-14"
>
  <ChevronUp className="w-11 h-11" />
</Button>
```

#### Secondary Action Buttons
```tsx
// Hint/Skip/Save buttons - MUTED BACKGROUND
<Button 
  variant="ghost" 
  size="sm" 
  className="flex items-center gap-1 px-3 py-2 text-sm h-9 bg-muted hover:bg-muted/80"
>
  <Lightbulb className="w-4 h-4" />
  Hint
</Button>
```

### Button Spacing Standards
```css
/* Button Row Spacing */
.primary-button-row { gap: 1.25rem; }     /* gap-5 - 20px */
.secondary-button-row { gap: 0.75rem; }   /* gap-3 - 12px */
.button-group-vertical { gap: 1rem; }     /* space-y-4 - 16px */
```

### Button Layout Pattern
```tsx
<div className="space-y-4 w-full max-w-lg mx-auto">
  {/* Primary Action Row */}
  <div className="flex items-center justify-center gap-5 w-full">
    {/* Navigation buttons + Main action */}
  </div>
  
  {/* Secondary Action Row */}
  <div className="flex items-center justify-center gap-3">
    {/* Secondary buttons */}
  </div>
</div>
```

---

## Color Palette

### Primary Colors
```css
/* Action Colors */
--green-primary: #16a34a;      /* bg-green-600 */
--green-hover: #15803d;        /* bg-green-700 */

/* Background Colors */
--muted-bg: hsl(var(--muted));           /* bg-muted */
--muted-hover: hsl(var(--muted) / 0.8);  /* bg-muted/80 */
--background: hsl(var(--background));    /* bg-background */

/* Border Colors */
--border: hsl(var(--border));            /* border-border */
--input-border: hsl(var(--border));      /* input borders */
```

### Interactive State Colors
```css
/* Word Evaluation States */
--correct: #16a34a;           /* text-green-600, bg-green-50, border-green-200 */
--close: #ea580c;             /* text-orange-600, bg-orange-50, border-orange-200 */
--wrong: #dc2626;             /* text-red-600, bg-red-50, border-red-200 */
--neutral: hsl(var(--muted)); /* text-foreground, hover:bg-muted/50 */
```

### Progress Bar Colors
```css
/* Progress Indicators */
--progress-excellent: #16a34a;  /* bg-green-600 */
--progress-good: #ea580c;       /* bg-orange-500 */
--progress-poor: #dc2626;       /* bg-red-600 */
--progress-primary: hsl(var(--primary)); /* bg-primary */
```

---

## Typography

### Font System
```css
/* Font Family */
font-family: ui-sans-serif, system-ui, sans-serif; /* System fonts */

/* Header Hierarchy */
.page-title {
  font-size: 1.5rem;          /* text-2xl mobile */
  font-size: 1.875rem;        /* text-3xl desktop */
  font-weight: 600;           /* font-semibold */
  letter-spacing: -0.025em;   /* tracking-tight */
}

.section-title {
  font-size: 1.125rem;        /* text-lg */
  font-weight: 500;           /* font-medium */
}

/* Body Text */
.body-text {
  font-size: 0.875rem;        /* text-sm */
  line-height: 1.5;           /* leading-6 */
}

/* Interactive Text */
.button-text {
  font-size: 0.875rem;        /* text-sm */
  font-weight: 500;           /* font-medium */
}
```

---

## Component Standards

### Logo Component
```tsx
interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

// Usage Examples:
<Logo size="sm" showText={true} />   // Mobile header
<Logo size="md" showText={true} />   // Desktop header  
<Logo size="lg" showText={false} />  // Large display
```

### ActionButtons Component
```tsx
interface ActionButtonsProps {
  isEvaluated: boolean
  userTranslation: string
  onSubmit: () => void
  onSkip: () => void
  onNext: () => void
  onHint: () => void
  onBookmark: () => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  showHint: boolean
  currentSentence: number
  totalSentences: number
  className?: string
}
```

### Progress Components
```tsx
// Health Bar - Clean progress without text
<div className="p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs text-foreground">Translation Health</span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div className="h-2 rounded-full transition-all duration-300 bg-green-600" 
         style={{ width: `${percentage}%` }} />
  </div>
</div>
```

### Interactive Sentence Display
```tsx
// Clickable words with evaluation feedback
const getWordColor = (status?: string) => {
  switch (status) {
    case 'correct': return 'text-green-600 bg-green-50 border-green-200'
    case 'close': return 'text-orange-600 bg-orange-50 border-orange-200' 
    case 'wrong': return 'text-red-600 bg-red-50 border-red-200'
    default: return 'text-foreground hover:bg-muted/50'
  }
}
```

---

## Layout Architecture

### Fixed Header Pattern
```tsx
<header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
  {/* Logo Section - 64px width */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-start">
    <Logo size="md" showText={true} />
  </div>
  
  {/* Header Content */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      Page Title
    </h1>
  </div>
  
  {/* Header Actions */}
  <div className="px-4 md:px-6 py-4 flex items-center">
    {/* Progress wheels or other header actions */}
  </div>
</header>
```

### Main Content Structure
```tsx
<div className="flex flex-1 pt-16">
  {/* Sidebar */}
  <SharedSidebar currentUser={currentUser} />
  
  {/* Main Content */}
  <main className="flex-1 flex flex-col md:ml-64">
    <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
      
      {/* Filters - pt-8 spacing */}
      <div className="pt-8 mb-4 max-w-4xl mx-auto w-full">
        <PracticeFilters />
      </div>
      
      {/* Main Content */}
      <div className="mb-4 max-w-4xl mx-auto w-full">
        <div className="bg-muted border border-border rounded-lg p-6 md:p-8 space-y-8">
          {/* Content */}
        </div>
      </div>
      
      {/* Progress Cards - mb-4 spacing */}
      <div className="mb-4 max-w-4xl mx-auto w-full">
        {/* Individual progress cards */}
      </div>
    </div>
  </main>
</div>
```

### Sidebar Standards
```tsx
<aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col fixed left-0 top-16 bottom-0 z-40">
  {/* Navigation - pt-12 to align with filter box */}
  <nav className="flex-1 p-4 pt-12">
    <ul className="space-y-2">
      {/* Navigation items */}
    </ul>
  </nav>
</aside>
```

---

## Interactive Elements

### Input Fields
```tsx
<textarea
  className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
  placeholder="Type your Spanish translation here..."
/>
```

### Clickable Words
```tsx
<span 
  className={`
    inline-flex items-center px-1 py-0.5 rounded cursor-pointer 
    transition-all duration-200 hover:scale-105 border border-transparent
    ${getWordColor(evaluation?.status)}
  `}
  onClick={() => handleWordClick(word)}
>
  {word}
  {evaluation && getStatusIcon(evaluation.status)}
</span>
```

### Hint Popups
```tsx
{activeHint && (
  <div className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-10 max-w-xs">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground">HINT</span>
      <button onClick={() => setActiveHint(null)}>
        <X className="w-3 h-3" />
      </button>
    </div>
    <p className="text-sm text-popover-foreground">{activeHint.content}</p>
  </div>
)}
```

---

## Icon System

### Icon Library
**Source:** `lucide-react`

### Standard Icon Sizes
```css
/* Icon Size Standards */
.icon-xs { width: 0.75rem; height: 0.75rem; }  /* w-3 h-3 */
.icon-sm { width: 1rem; height: 1rem; }        /* w-4 h-4 */
.icon-md { width: 1.5rem; height: 1.5rem; }    /* w-6 h-6 */
.icon-lg { width: 2.75rem; height: 2.75rem; }  /* w-11 h-11 */
```

### Required Icons
```tsx
// Primary Actions
import { Check, ChevronUp, ChevronDown } from 'lucide-react'

// Secondary Actions  
import { Lightbulb, RotateCcw, BookmarkPlus } from 'lucide-react'

// Status Icons
import { CheckCircle, AlertCircle, X } from 'lucide-react'

// Navigation
import { BookOpen, Book, Brain, MessageCircle, TrendingUp, Award, Settings } from 'lucide-react'

// UI Elements
import { Filter, Target, Clock, Zap } from 'lucide-react'
```

---

## Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
.base-mobile { /* Default: mobile styles */ }

@media (min-width: 768px) {
  .md-tablet { /* Tablet and up */ }
}

@media (min-width: 1024px) {
  .lg-desktop { /* Desktop and up */ }
}
```

### Responsive Layout Pattern
```tsx
<div className="
  /* Mobile */
  p-4 text-xl
  
  /* Tablet+ */
  md:p-6 md:text-2xl md:ml-64
  
  /* Desktop+ */
  lg:p-8 lg:text-3xl
">
```

### Responsive Component Examples
```tsx
// Logo responsiveness
<div className="md:hidden px-4 py-4">
  <Logo size="sm" showText={true} />
</div>
<div className="hidden md:flex px-6 py-4">
  <Logo size="md" showText={true} />
</div>

// Content responsiveness
<div className="bg-muted rounded-lg p-6 md:p-8">
  <h1 className="text-xl md:text-2xl font-semibold">
    Content Title
  </h1>
</div>
```

---

## Implementation Checklist

### For New Pages
- [ ] Use fixed header with correct spacing (`top-0 z-50`)
- [ ] Implement logo left-alignment 
- [ ] Apply filter box spacing (`pt-8`)
- [ ] Use sidebar spacing (`pt-12`)
- [ ] Apply content max-width (`max-w-4xl mx-auto`)
- [ ] Implement standard button patterns
- [ ] Use correct color palette
- [ ] Apply responsive breakpoints
- [ ] Include proper accessibility attributes

### For New Components
- [ ] Follow ActionButtons pattern for button groups
- [ ] Use standard spacing scale (mb-4, mb-6, mb-8)
- [ ] Implement proper icon sizes
- [ ] Apply consistent hover states
- [ ] Include error handling
- [ ] Support keyboard navigation
- [ ] Meet 44px minimum touch targets

### Quality Assurance
- [ ] Test on mobile, tablet, desktop
- [ ] Verify color contrast ratios
- [ ] Check keyboard navigation
- [ ] Validate HTML semantics
- [ ] Test with screen readers
- [ ] Measure performance impact
- [ ] Review against design system

---

## Migration Guide

### Updating Existing Pages
1. **Header:** Update to fixed positioning with left-aligned logo
2. **Spacing:** Replace custom padding with standard spacing scale
3. **Buttons:** Migrate to ActionButtons component pattern
4. **Colors:** Update to new color palette
5. **Layout:** Apply max-width and proper sidebar spacing
6. **Icons:** Replace custom icons with lucide-react
7. **Responsiveness:** Add mobile-first responsive classes

### Breaking Changes
- Logo alignment changed from center to left
- Button spacing increased (30% more horizontal space)
- Color system updated (muted backgrounds instead of custom colors)
- Icon library changed to lucide-react
- Fixed header positioning requires pt-16 on main content

This design system is the single source of truth for AIdioma UI/UX. All development must follow these standards to ensure consistency and maintainability across the platform. 