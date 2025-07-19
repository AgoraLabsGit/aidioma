# Spanish Learning App - UI/UX Styling Guidelines

## Overview
This document establishes the standard styling and layout patterns for the Spanish Learning Application to ensure consistency, optimal learning experience, and modern aesthetic across the entire application. Adapted from Strike's minimal dark aesthetic for educational use.

---

## Strike-Inspired Minimal Dark Theme Foundation

### Color System
The Spanish Learning App follows Strike's ultra-dark minimal aesthetic with our finalized color values:

```css
/* Current Color Palette - HSL Format */
--background: 220 13% 8%;            /* Deep black/dark main content area */
--foreground: 220 8% 95%;            /* White text */
--card: 220 8% 15%;                  /* Dark charcoal grey cards */
--card-foreground: 220 8% 95%;       /* White text on cards */
--muted: 220 8% 9%;                  /* Nearly black muted (sidebar/header) */
--muted-foreground: 220 8% 85%;      /* Light grey text on dark muted */
--border: 220 13% 25%;               /* Subtle dark grey borders */
--input: 220 8% 12%;                 /* Very dark input backgrounds */
--primary: 220 8% 40%;               /* Blue-grey primary buttons */
--primary-foreground: 220 8% 95%;    /* White text on primary */
--secondary: 220 8% 25%;             /* Dark grey secondary buttons */
--secondary-foreground: 220 8% 95%;  /* White text on secondary */
--accent: 220 8% 75%;                /* Medium grey accent (selected state) */
--accent-foreground: 220 8% 20%;     /* Dark text on accent */
--destructive: 0 84% 60%;            /* Red for errors */
--destructive-foreground: 210 40% 98%; /* Light text on red */

/* Legacy Color Variables (for reference) */
--background-primary: #0A0A0B;        /* Almost black main background */
--background-surface: #111113;        /* Card backgrounds */
--background-elevated: #1A1A1C;       /* Elevated elements */
--background-interactive: #1F1F23;    /* Interactive hover states */
--border-subtle: #1F1F23;             /* Subtle borders */
--border-default: #374151;            /* Default borders */
--border-emphasis: #4B5563;           /* Emphasized borders */
--text-primary: #E5E7EB;              /* Light grey text instead of white */
--text-secondary: #A1A1AA;            /* Gray secondary */
--text-muted: #6B7280;                /* Muted gray */
--text-disabled: #4B5563;             /* Disabled text */
--success: #10B981;                   /* Green for positive only */
--success-bg: #064E3B;                /* Success background */
--warning: #F59E0B;                   /* Amber warnings */
--warning-bg: #78350F;                /* Warning background */
--error: #EF4444;                     /* Red for errors */
--error-bg: #7F1D1D;                  /* Error background */
--neutral: #6B7280;                   /* Neutral gray */
```

### Typography
- **Font Family**: System fonts (system-ui, -apple-system, BlinkMacSystemFont)
- **Weight Hierarchy**: Light (300) for large displays, Normal (400) for body text
- **Color Hierarchy**: White primary, minimal gray hierarchy
- **Monospace**: JetBrains Mono for translation inputs

### Visual Principles
- **Ultra-Minimal**: Strike's approach - almost no color accent except functional states
- **Clean Backgrounds**: Ultra-dark with very subtle surface variations
- **Subtle Borders**: Minimal contrast borders (#1F1F23)
- **No Decorative Color**: Reserve color only for success/error states
- **Light Typography**: Strike's characteristic light font weights

---

## Established Layout Patterns (From PracticePage Implementation)

### Unified Header Pattern
**MANDATORY for all pages - exact implementation:**

```tsx
// Standard header structure
<header className="flex border-b border-border bg-muted">
  {/* Desktop Logo - exactly w-64 */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <BookOpen className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Mobile Logo */}
  <div className="md:hidden px-4 py-4 flex items-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Page Title - must use flex-1 */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      [Page Title]
    </h1>
  </div>
  
  {/* Actions/Stats */}
  <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
    {/* Page-specific content */}
  </div>
</header>
```

### Content Width Alignment Standards
**CRITICAL: All components must use these exact patterns:**

```css
/* Filter/Control Components - Full aligned width */
.filter-container {
  @apply mb-6 max-w-4xl mx-auto w-full;
}

/* Main Content Container - NO left padding */
.main-content-container {
  @apply max-w-4xl mx-auto w-full;
}

/* Session Stats - Responsive layout */
.session-stats {
  @apply flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0;
}

/* Content Cards - Consistent padding */
.content-card {
  @apply w-full card p-4 md:p-8;
}
```

### Responsive Sidebar Pattern
**Standard sidebar implementation:**

```tsx
<aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">
  {/* Navigation content */}
  <nav className="flex-1 p-4 pt-8">
    {/* Navigation items */}
  </nav>
  
  {/* User profile at bottom */}
  <div className="p-4 border-t border-border">
    {/* User content */}
  </div>
</aside>
```

### Mobile-First Responsive Patterns
**Standard responsive implementations:**

```css
/* Main content area responsive padding */
.main-content {
  @apply flex-1 flex flex-col p-4 md:p-6 bg-background;
}

/* Responsive typography */
.page-title {
  @apply text-xl md:text-2xl font-semibold text-foreground tracking-tight;
}

/* Responsive button spacing */
.action-buttons {
  @apply flex justify-center gap-4 mb-8;
}

/* Responsive stats layout */
.stats-container {
  @apply flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0;
}
```

---

## Core Layout Principles

### 1. **Content-First Layout**
- **Rule**: Center main learning content with optimal reading width
- **Implementation**: Use responsive max-width containers for practice area
- **Reading Zones**: 
  - Practice content: `max-w-4xl mx-auto` (optimal for sentence reading)
  - Dashboard content: `max-w-6xl mx-auto` (data visualization needs)
  - Navigation: Full width for accessibility

### 2. **Learning Flow Optimization**
- **Vertical Flow**: Top-to-bottom learning progression
- **Clear Hierarchy**: Visual separation between instruction, input, and feedback
- **Consistent Spacing**: Predictable gaps between learning elements
- **Mobile-First**: Touch-friendly interface design

---

## Established UI Framework Standards

### **Coherent UI System Requirements**
- **Design System Integrity**: All UI changes must be applied across ALL relevant pages to maintain coherence
- **Identical Styling Frameworks**: Components should have consistent interfaces and styling patterns across all pages
- **Cross-Page Consistency**: ActionButtons, headers, navigation, and other shared components must be identical

### **Button Framework Standards**
**Uniform Button Sizing:**
- **Standard size**: `px-6 py-3` for all buttons across the application
- **Icon spacing**: `gap-2` between icon and text
- **Button spacing**: `gap-3` between buttons in button groups
- **Standard styling**: `rounded-lg`, `font-medium`, `transition-colors`

**Color Scheme Guidelines:**
- **Primary text color**: `text-gray-400` for most buttons and secondary text
- **Accent text**: `text-white` for primary actions (Next button only in ActionButtons)
- **Hover states**: `hover:text-gray-300` for gray text, `hover:text-white` for white text
- **Background colors**: `bg-muted` for buttons, `hover:bg-accent` for hover states
- **AVOID**: Never use `text-muted-foreground` class (does not apply properly with current Tailwind setup)

**Button State Management:**
- **Disabled states**: `disabled:opacity-50 disabled:cursor-not-allowed`
- **Conditional rendering**: Check/Try Again and Skip/Next Sentence buttons swap based on `isEvaluated` state
- **Navigation constraints**: Previous/Next buttons disabled at content boundaries

### **ActionButtons Component Standard**
**Fixed Button Order (left to right):**
1. **Previous** - Navigation to previous content
2. **Check** - Validate user input (or "Try Again" when evaluated)  
3. **Next** - Primary action with white text, navigation to next content
4. **Hint** - Toggle hint display
5. **Skip** - Skip current exercise (or "Next Sentence" when evaluated)
6. **Bookmark** - Save content for later review

**Implementation Requirements:**
- Must be identical across ReadingPage and PracticePage
- Only Next button uses `text-white`, all others use `text-gray-400`
- All buttons use `px-6 py-3` sizing and `gap-3` spacing
- Icons are `w-4 h-4` size for all buttons

### **Layout Framework Standards**

**Fixed Header/Sidebar System:**
- **Header**: `fixed top-0 left-0 right-0 z-50` with border and muted background
- **Sidebar**: `fixed left-0 top-16 bottom-0 z-40` (desktop only, hidden on mobile)
- **Content spacing**: `pt-16` for header clearance, `ml-64` for sidebar clearance (desktop)
- **Z-index hierarchy**: Header (50), Sidebar (40), Content (default)

**Responsive Design Standards:**
- **Desktop-first approach** with mobile adaptations using `hidden md:flex` patterns
- **Sidebar behavior**: Hidden on mobile, full navigation on desktop
- **Content width**: `max-w-4xl mx-auto w-full` for main content containers
- **Grid systems**: Responsive grids for stats and filters using `grid-cols-2 md:grid-cols-4`

### **Typography Guidelines**
- **Headings**: Consistent font weights and tracking (`font-semibold tracking-tight`)
- **Body text**: Clear hierarchy with `text-foreground` for primary, `text-muted-foreground` for secondary
- **Button text**: `font-medium` for all buttons
- **Input typography**: `font-mono` for translation inputs and user text areas

### **Component-Specific Standards**

**TranslationInput Component:**
- **Consistent styling**: `w-full h-20 px-4 py-3 bg-input border border-border rounded-lg`
- **Typography**: `font-mono` for user input areas
- **Focus states**: Ring focus with offset and background consideration
- **Disabled handling**: Proper disabled prop implementation (NOT disabled={isEvaluated})

**Navigation Components:**
- **Active state styling**: `bg-accent text-accent-foreground font-medium`
- **Inactive state**: `text-muted-foreground hover:text-foreground hover:bg-accent/50`
- **Icon consistency**: `w-5 h-5` for navigation icons, `w-4 h-4` for button icons

---

## Component Styling Standards

### Practice Interface Components

#### Sentence Display
```css
.sentence-display {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 1.5rem;           /* 24px */
  font-weight: 300;            /* Light for readability */
  line-height: 1.6;            /* Generous line spacing */
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 0.01em;      /* Subtle letter spacing */
}

@media (min-width: 768px) {
  .sentence-display {
    font-size: 1.875rem;        /* 30px on larger screens */
  }
}
```

#### Translation Input
```css
.translation-input {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.125rem;         /* 18px */
  font-weight: 400;
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--background-surface);
  border: 2px solid var(--border-default);
  border-radius: 0.75rem;      /* 12px */
  padding: 1rem 1.25rem;       /* 16px 20px */
  resize: none;
  transition: all 0.2s ease;
}

.translation-input:focus {
  outline: none;
  border-color: var(--progress-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: var(--background-elevated);
}

.translation-input::placeholder {
  color: var(--text-muted);
  font-style: italic;
}
```

#### Hint System
```css
.hint-word {
  position: relative;
  display: inline-block;
  padding: 0.125rem 0.25rem;   /* 2px 4px */
  margin: 0 0.125rem;          /* 2px horizontal spacing */
  border-radius: 0.375rem;     /* 6px */
  cursor: pointer;
  transition: all 0.2s ease;
}

.hint-word:hover {
  background: var(--background-interactive);
  color: var(--text-primary);
}

.hint-tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;          /* 8px gap */
  padding: 0.5rem 0.75rem;     /* 8px 12px */
  background: var(--background-elevated);
  border: 1px solid var(--border-emphasis);
  border-radius: 0.5rem;       /* 8px */
  font-size: 0.875rem;         /* 14px */
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  z-index: 50;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### Feedback Components

#### Success Feedback
```css
.feedback-success {
  background: var(--success-bg);
  border: 1px solid var(--success);
  border-radius: 0.75rem;      /* 12px */
  padding: 1rem 1.25rem;       /* 16px 20px */
  color: var(--success);
}

.feedback-success .icon {
  color: var(--success);
}

.feedback-success .message {
  color: var(--text-primary);
  font-weight: 500;
}
```

#### Error Feedback
```css
.feedback-error {
  background: var(--error-bg);
  border: 1px solid var(--error);
  border-radius: 0.75rem;
  padding: 1rem 1.25rem;
  color: var(--error);
}

.feedback-error .explanation {
  color: var(--text-secondary);
  font-size: 0.875rem;         /* 14px */
  margin-top: 0.5rem;          /* 8px */
  line-height: 1.5;
}
```

### Navigation Components

#### Sidebar Navigation
```css
.sidebar {
  background: linear-gradient(180deg, var(--background-surface) 0%, var(--background-primary) 100%);
  border-right: 1px solid var(--border-subtle);
  width: 16rem;                /* 256px */
}

.sidebar-nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;       /* 12px 16px */
  color: var(--text-secondary);
  font-weight: 400;
  transition: all 0.2s ease;
  border-radius: 0.5rem;       /* 8px */
  margin: 0.125rem 0.5rem;     /* 2px 8px */
}

.sidebar-nav-item:hover {
  background: var(--background-interactive);
  color: var(--text-primary);
}

.sidebar-nav-item.active {
  background: var(--primary);
  color: white;
  font-weight: 500;
}

.sidebar-nav-item .icon {
  width: 1.25rem;              /* 20px */
  height: 1.25rem;
  margin-right: 0.75rem;       /* 12px */
}
```

### Button Components

#### Primary Action Buttons (Strike Minimal Style)
```css
.btn-primary {
  background: var(--primary);          /* #374151 dark gray */
  color: white;
  font-weight: 400;                    /* Normal weight like Strike */
  padding: 0.75rem 1.5rem;             /* 12px 24px */
  border-radius: 0.75rem;              /* 12px */
  border: 1px solid var(--border-default);
  font-size: 1rem;                     /* 16px */
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: var(--primary-hover);    /* #4B5563 */
  border-color: var(--border-emphasis);
}

.btn-primary:disabled {
  background: var(--background-interactive);
  color: var(--text-muted);
  cursor: not-allowed;
}
```

#### Secondary Buttons (Strike Gray System)
```css
.btn-secondary {
  background: #1F2937;                 /* Strike's secondary gray */
  color: var(--text-secondary);
  font-weight: 400;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid var(--border-default);
  font-size: 1rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: var(--primary);
  color: white;
  border-color: var(--border-emphasis);
}
```

### Card Components

#### Practice Cards
```css
.practice-card {
  background: var(--background-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 1rem;         /* 16px */
  padding: 2rem;               /* 32px */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

@media (min-width: 768px) {
  .practice-card {
    padding: 2.5rem;           /* 40px */
  }
}
```

#### Stats Cards
```css
.stats-card {
  background: var(--background-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;      /* 12px */
  padding: 1.5rem;             /* 24px */
  transition: all 0.2s ease;
}

.stats-card:hover {
  border-color: var(--border-emphasis);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stats-value {
  font-size: 2rem;             /* 32px */
  font-weight: 300;            /* Light for large numbers */
  color: var(--text-primary);
  line-height: 1.2;
}

.stats-label {
  font-size: 0.875rem;         /* 14px */
  color: var(--text-muted);
  font-weight: 400;
  margin-bottom: 0.5rem;       /* 8px */
}
```

---

## Implementation Guidelines

### CSS Custom Properties Setup (Strike Minimal)
```css
:root {
  /* Color System - Strike Ultra-Dark */
  --background-primary: #0A0A0B;       /* Almost black */
  --background-surface: #111113;       /* Cards */
  --background-elevated: #1A1A1C;      /* Elevated elements */
  --background-interactive: #1F1F23;   /* Interactive hover */
  
  --border-subtle: #1F1F23;            /* Subtle borders */
  --border-default: #374151;           /* Default borders */
  --border-emphasis: #4B5563;          /* Emphasis borders */
  
  --text-primary: #FFFFFF;             /* White text */
  --text-secondary: #A1A1AA;           /* Gray secondary */
  --text-muted: #6B7280;               /* Muted gray */
  --text-disabled: #4B5563;            /* Disabled gray */
  
  /* Functional Colors - Minimal like Strike */
  --primary: #374151;                  /* Dark gray (no blue) */
  --primary-hover: #4B5563;            /* Gray hover */
  --success: #10B981;                  /* Green for positive only */
  --success-bg: #064E3B;               /* Success background */
  --warning: #F59E0B;                  /* Amber warnings */
  --warning-bg: #78350F;               /* Warning background */
  --error: #EF4444;                    /* Red for errors */
  --error-bg: #7F1D1D;                 /* Error background */
  --neutral: #6B7280;                  /* Neutral gray */
  
  /* Typography - Strike System Fonts */
  --font-primary: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;
  
  /* Spacing */
  --spacing-xs: 0.25rem;               /* 4px */
  --spacing-sm: 0.5rem;                /* 8px */
  --spacing-md: 1rem;                  /* 16px */
  --spacing-lg: 1.5rem;                /* 24px */
  --spacing-xl: 2rem;                  /* 32px */
  --spacing-2xl: 3rem;                 /* 48px */
  
  /* Border Radius */
  --radius-sm: 0.375rem;               /* 6px */
  --radius-md: 0.5rem;                 /* 8px */
  --radius-lg: 0.75rem;                /* 12px */
  --radius-xl: 1rem;                   /* 16px */
  
  /* Shadows - Minimal like Strike */
  --shadow-subtle: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-default: 0 4px 12px rgba(0, 0, 0, 0.2);
  --shadow-emphasis: 0 8px 24px rgba(0, 0, 0, 0.3);
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease;
}
```

---

## Best Practices

### Performance Optimization
- **CSS Custom Properties**: Use for consistent theming and easy dark mode toggles
- **Component Isolation**: Scope styles to prevent cascading issues  
- **Minimal Animations**: Only animate essential user feedback
- **Efficient Selectors**: Avoid deep nesting and complex selectors

### Maintainability
- **Design Tokens**: Use custom properties for all design values
- **Component Variants**: Create reusable component patterns
- **Consistent Naming**: Follow BEM or utility-first naming conventions
- **Documentation**: Comment complex styling decisions

### User Experience
- **Loading States**: Always provide feedback during async operations
- **Error Handling**: Clear, actionable error messages with appropriate styling
- **Progressive Enhancement**: Ensure functionality without JavaScript

---

## Implementation Guidelines

### CSS Variable Usage
```css
/* ✅ Always use CSS variables for colors */
background: hsl(var(--card));
color: hsl(var(--card-foreground));

/* ❌ Never use hardcoded values */
background: #111113;
color: #ffffff;
```

### Layout Best Practices
```css
/* ✅ Consistent container pattern */
.practice-container {
  width: 100%;
  max-width: 64rem; /* max-w-4xl */
  margin: 0 auto;
  padding: 1.5rem;
}

/* ✅ Use spacing variables */
.component-spacing {
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}
```

### Component Architecture
```tsx
/* ✅ Proper component structure */
<div className="w-full max-w-4xl mx-auto space-y-6">
  <FilterComponent className="bg-card border border-border rounded-lg" />
  <PracticeBox className="bg-card border border-border rounded-lg" />
  <ActionButtons className="flex justify-between" />
</div>
```

---

## Common Issues & Solutions

### Color System Issues
- **Problem**: Inconsistent color application
- **Solution**: Always use HSL CSS variables
- **Example**: `background: hsl(var(--muted))` instead of hex values

### Layout Problems
- **Problem**: Filter positioning conflicts
- **Solution**: Use inline flow with consistent container widths
- **Example**: Avoid fixed positioning, use flex/grid layouts

### Border Issues
- **Problem**: Unwanted white borders
- **Solution**: Explicitly remove borders or use theme colors
- **Example**: `border: none` or `border-color: hsl(var(--border))`

---

This styling guide ensures consistent, maintainable, and accessible UI across all AIdioma v2 interfaces.
- **Keyboard Navigation**: Support all interactions via keyboard

---

**Document Version**: 1.0  
**Created**: 2025-07-18  
**Status**: Active Standard  
**Target Application**: Spanish Learning AI Platform
