# Spanish Learning App - UI/UX Styling Guidelines

## Overview
This document establishes the standard styling and layout patterns for the Spanish Learning Application to ensure consistency, optimal learning experience, and modern aesthetic across the entire application. Adapted from Strike's minimal dark aesthetic for educational use.

## Strike-Inspired Minimal Dark Theme Foundation

### Color System
The Spanish Learning App now follows Strike's ultra-dark minimal aesthetic:

```css
/* Strike-Inspired Color Palette */
--background-primary: #0A0A0B;        /* Almost black main background */
--background-surface: #111113;        /* Card backgrounds */
--background-elevated: #1A1A1C;       /* Elevated elements */
--background-interactive: #1F1F23;    /* Interactive hover states */

--border-subtle: #1F1F23;             /* Subtle borders */
--border-default: #374151;            /* Default borders */
--border-emphasis: #4B5563;           /* Emphasized borders */

--text-primary: #FFFFFF;              /* Primary white text */
--text-secondary: #A1A1AA;            /* Secondary gray text */
--text-muted: #6B7280;                /* Muted text for labels */
--text-disabled: #4B5563;             /* Disabled text */

/* Learning-Specific Colors (Minimal like Strike) */
--primary: #374151;                   /* Dark gray instead of blue */
--primary-hover: #4B5563;             /* Hover states */
--success: #10B981;                   /* Green for correct answers only */
--success-bg: #064E3B;                /* Success background */
--warning: #F59E0B;                   /* Amber for warnings */
--warning-bg: #78350F;                /* Warning background */
--error: #EF4444;                     /* Red for errors */
--error-bg: #7F1D1D;                  /* Error background */

/* Neutral System (Strike's approach) */
--neutral: #6B7280;                   /* Gray for neutral actions */
--neutral-hover: #9CA3AF;             /* Neutral hover states */
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
  background: var(--progress-primary);
  color: white;
  font-weight: 500;
}

.sidebar-nav-item .icon {
  width: 1.25rem;              /* 20px */
  height: 1.25rem;
  margin-right: 0.75rem;       /* 12px */
}
```

#### Top Navigation
```css
.top-nav {
  background: var(--background-surface);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
  height: 4rem;                /* 64px */
}

@media (min-width: 640px) {
  .top-nav {
    height: 5rem;              /* 80px */
  }
}

.top-nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .top-nav-content {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .top-nav-content {
    padding: 0 2rem;
  }
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

### Filter Components

#### Collapsible Filter Bar
```css
.filter-container {
  background: var(--background-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 0.75rem;      /* 12px */
  margin-bottom: 1.5rem;       /* 24px */
  overflow: hidden;
}

.filter-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;       /* 16px 20px */
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-toggle:hover {
  background: var(--background-elevated);
}

.filter-content {
  padding: 0 1.25rem 1rem;     /* 0 20px 16px */
  border-top: 1px solid var(--border-subtle);
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;                   /* 16px */
  padding-top: 1rem;           /* 16px */
}

.filter-select {
  background: var(--background-elevated);
  border: 1px solid var(--border-default);
  border-radius: 0.5rem;       /* 8px */
  padding: 0.5rem 0.75rem;     /* 8px 12px */
  color: var(--text-primary);
  font-size: 0.875rem;         /* 14px */
  min-width: 8rem;             /* 128px */
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--progress-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}
```

### Progress Components

#### Progress Indicators
```css
.progress-bar {
  background: var(--background-elevated);
  border-radius: 9999px;       /* Full rounded */
  height: 0.5rem;              /* 8px */
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(90deg, var(--success) 0%, var(--progress-primary) 100%);
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.level-indicator {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;    /* 4px 12px */
  background: var(--progress-bg);
  color: var(--progress-primary);
  border-radius: 9999px;
  font-size: 0.75rem;          /* 12px */
  font-weight: 600;
}
```

#### Streak Counter
```css
.streak-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;                 /* 8px */
  padding: 0.5rem 1rem;        /* 8px 16px */
  background: var(--warning-bg);
  border: 1px solid var(--warning);
  border-radius: 0.5rem;       /* 8px */
  color: var(--warning);
  font-weight: 500;
}

.streak-icon {
  width: 1rem;                 /* 16px */
  height: 1rem;
}
```

## Responsive Design Patterns

### Mobile-First Approach
```css
/* Base (Mobile) Styles */
.container {
  padding: 1rem;               /* 16px */
  max-width: 100%;
}

.text-practice {
  font-size: 1.25rem;          /* 20px */
  line-height: 1.6;
}

/* Tablet Styles */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;           /* 24px */
  }
  
  .text-practice {
    font-size: 1.5rem;         /* 24px */
  }
}

/* Desktop Styles */
@media (min-width: 1024px) {
  .container {
    padding: 2rem;             /* 32px */
    max-width: 64rem;          /* 1024px */
    margin: 0 auto;
  }
  
  .text-practice {
    font-size: 1.875rem;       /* 30px */
  }
}
```

### Touch-Friendly Interface
```css
.touch-target {
  min-height: 44px;            /* iOS minimum touch target */
  min-width: 44px;
  padding: 0.75rem;            /* 12px */
}

.interactive-element {
  user-select: none;           /* Prevent text selection on touch */
  -webkit-tap-highlight-color: transparent; /* Remove iOS tap highlight */
}
```

## Accessibility Standards

### Focus Indicators
```css
.focusable:focus {
  outline: 2px solid var(--progress-primary);
  outline-offset: 2px;
  border-radius: 0.25rem;      /* 4px */
}

.focusable:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --border-default: #FFFFFF;
    --text-muted: #E5E7EB;
    --background-surface: #000000;
  }
}
```

## Animation & Transitions

### Micro-Interactions
```css
.animate-feedback {
  animation: feedback-pulse 0.6s ease-out;
}

@keyframes feedback-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.02);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-success {
  animation: success-bounce 0.5s ease-out;
}

@keyframes success-bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}
```

### Loading States
```css
.skeleton {
  background: linear-gradient(90deg, var(--background-elevated) 25%, var(--background-interactive) 50%, var(--background-elevated) 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

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

### Component Structure Template
```jsx
// React Component with consistent styling
const PracticeComponent = ({ children, className = '', variant = 'default', ...props }) => {
  const baseClasses = 'font-primary text-text-primary bg-background-surface border border-border-subtle rounded-lg transition-transition-normal';
  const variantClasses = {
    default: 'p-spacing-md',
    compact: 'p-spacing-sm',
    spacious: 'p-spacing-lg'
  };
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div className={combinedClasses} {...props}>
      {children}
    </div>
  );
};
```

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
- **Keyboard Navigation**: Support all interactions via keyboard

---

**Document Version**: 1.0  
**Created**: 2025-01-15  
**Status**: Active Standard  
**Target Application**: Spanish Learning AI Platform