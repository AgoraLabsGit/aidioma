# AIdioma Design System v2.0 - Single Source of Truth

## Overview

This design system establishes the standardized UI/UX patterns for AIdioma v2.0, based on comprehensive refinements made to the Practice Page. These standards are **MANDATORY** across all pages and components to ensure consistency, accessibility, and maintainability.

**NO MORE CHANGING THINGS ONE BY ONE.** This is the definitive design standard for all development.

---

## 📋 Quick Reference

### Essential Standards
- **Header:** Fixed at top-0 z-50, logo LEFT-ALIGNED (not centered)
- **Spacing:** pt-8 for filters, pt-12 for sidebar, mb-4 between sections
- **Buttons:** Two-row layout, gap-5 primary, gap-3 secondary, green circular main action
- **Colors:** Green (bg-green-600) for primary, muted (bg-muted) for secondary
- **Layout:** max-w-4xl mx-auto for content containers
- **Icons:** lucide-react library exclusively

### Breaking Changes from v1.0
- Logo alignment changed from center to LEFT
- Button spacing increased by 30%
- Individual progress cards instead of combined bars
- Fixed header positioning requires pt-16 on main content
- Icon library changed to lucide-react

---

## 📁 Documentation Structure

### 1. [Design System Guide](./design-system-guide.md)
**Complete technical specifications:**
- Spacing & Layout Standards
- Button Design System  
- Color Palette
- Typography Standards
- Component Architecture
- Responsive Design Rules

### 2. [UI Patterns](./ui-patterns.md)
**Mandatory implementation patterns:**
- Header Pattern (Fixed, Left-aligned)
- Sidebar Pattern (pt-12 alignment)
- Button Patterns (ActionButtons component)
- Progress Card Pattern (Individual cards)
- Interactive Elements (Clickable words, hints)
- Input Field Patterns

### 3. [Component Library](./component-library.md)
**Reusable component specifications:**
- ActionButtons Component
- Logo Component
- Progress Components
- Interactive Elements
- Form Components

### 4. [Dynamic Translation UI](./dynamic-translation-ui.md) **NEW**
**Enhanced interactive learning experience:**
- Real-time Translation Health Bar
- Dynamic Word Color Coding  
- Intelligent Auto-Hint System
- Space-bar Optimized API Calls
- Enhanced Manual Help Modals

---

## 🎯 Implementation Requirements

### For ALL New Pages
✅ **MUST IMPLEMENT:**
1. Fixed header with left-aligned logo
2. pt-8 spacing for filter section
3. pt-12 spacing for sidebar navigation  
4. ActionButtons two-row layout with correct spacing
5. Individual progress cards with clean bars
6. max-w-4xl centered content containers
7. Muted backgrounds for secondary elements
8. lucide-react icons exclusively

❌ **FORBIDDEN:**
1. Centered logo placement
2. Custom button spacing patterns
3. Combined progress bars
4. Hardcoded colors outside design system
5. Mixed icon libraries
6. Custom spacing values

### Code Quality Standards
- **TypeScript strict mode** - Zero `any` types allowed
- **Component reusability** - 64% component reuse target
- **Performance limits** - <100ms UI interactions, <2000ms AI responses
- **Accessibility** - WCAG AA compliance, 44px minimum touch targets
- **Bundle size** - <10KB additions preferred, >50KB requires justification

---

## 🔧 Standard Implementation Pattern

### Page Structure Template
```tsx
<div className="min-h-screen bg-background flex flex-col">
  {/* FIXED HEADER - Logo LEFT-aligned */}
  <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
    <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-start">
      <Logo size="md" showText={true} />
    </div>
    <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
      <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
        {pageTitle}
      </h1>
    </div>
    <div className="px-4 md:px-6 py-4 flex items-center">
      <ProgressWheels />
    </div>
  </header>

  {/* CONTENT AREA */}
  <div className="flex flex-1 pt-16">
    {/* SIDEBAR - pt-12 to align with filters */}
    <SharedSidebar currentUser={currentUser} />
    
    {/* MAIN CONTENT */}
    <main className="flex-1 flex flex-col md:ml-64">
      <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
        
        {/* FILTERS - pt-8 spacing */}
        <div className="pt-8 mb-4 max-w-4xl mx-auto w-full">
          <PageFilters />
        </div>

        {/* MAIN CONTENT - Standard container */}
        <div className="mb-4 max-w-4xl mx-auto w-full">
          <div className="bg-muted border border-border rounded-lg p-6 md:p-8 space-y-8">
            {/* Page content */}
          </div>
        </div>

        {/* PROGRESS CARDS - Individual cards */}
        <div className="mb-4 max-w-4xl mx-auto w-full">
          <ProgressCard title="Section Progress" value={percentage} />
        </div>
      </div>
    </main>
  </div>
</div>
```

### ActionButtons Standard
```tsx
<div className="space-y-4 w-full max-w-lg mx-auto">
  {/* PRIMARY ROW - gap-5 spacing */}
  <div className="flex items-center justify-center gap-5 w-full">
    <Button variant="ghost" size="sm" className="h-14 w-14">
      <ChevronUp className="w-11 h-11" />
    </Button>
    <Button className="min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white">
      <Check className="w-6 h-6" />
    </Button>
    <Button variant="ghost" size="sm" className="h-14 w-14">
      <ChevronDown className="w-11 h-11" />
    </Button>
  </div>
  
  {/* SECONDARY ROW - gap-3 spacing */}
  <div className="flex items-center justify-center gap-3">
    <Button variant="ghost" size="sm" className="h-9 bg-muted hover:bg-muted/80">
      <Lightbulb className="w-4 h-4" />
      Hint
    </Button>
    <Button variant="ghost" size="sm" className="h-9 bg-muted hover:bg-muted/80">
      <RotateCcw className="w-4 h-4" />
      Skip
    </Button>
    <Button variant="ghost" size="sm" className="h-9 bg-muted hover:bg-muted/80">
      <BookmarkPlus className="w-4 h-4" />
      Save
    </Button>
  </div>
</div>
```

---

## 🎨 Design Tokens

### Colors
```css
/* Primary Actions */
--green-600: #16a34a;      /* Main action buttons */
--green-700: #15803d;      /* Hover states */

/* Backgrounds */
--muted: hsl(var(--muted));           /* Secondary elements */
--background: hsl(var(--background)); /* Main content */
--input: hsl(var(--input));           /* Form elements */

/* Interactive States */
--correct: #16a34a;    /* text-green-600 */
--close: #ea580c;      /* text-orange-600 */
--wrong: #dc2626;      /* text-red-600 */
```

### Spacing
```css
/* Layout Offsets */
--header-offset: 4rem;      /* pt-16 - 64px */
--filter-spacing: 2rem;     /* pt-8 - 32px */
--sidebar-spacing: 3rem;    /* pt-12 - 48px */

/* Component Spacing */
--section-spacing: 1rem;    /* mb-4 - 16px */
--large-spacing: 2rem;      /* mb-8 - 32px */
--button-primary-gap: 1.25rem;  /* gap-5 - 20px */
--button-secondary-gap: 0.75rem; /* gap-3 - 12px */
```

### Typography
```css
/* Page Titles */
--title-size-mobile: 1.5rem;    /* text-2xl */
--title-size-desktop: 1.875rem; /* text-3xl */
--title-weight: 600;             /* font-semibold */

/* Body Text */
--body-size: 0.875rem;          /* text-sm */
--body-weight: 400;             /* font-normal */
```

---

## 📊 Performance Standards

### Required Metrics
- **UI Interactions:** <100ms response time
- **AI Evaluations:** <2000ms with >80% cache hit rate
- **Bundle Size:** <10KB additions preferred
- **Test Coverage:** >90% for all modules
- **Component Reuse:** 64% target across 6 pages/12 modules

### Monitoring
- Bundle analyzer reports for size tracking
- Performance monitoring for interaction times
- Component usage analysis for reusability metrics
- Accessibility testing with automated tools

---

## ✅ Pre-Commit Checklist

Before ANY commit, verify:
- [ ] Uses design system colors (no hardcoded values)
- [ ] Follows spacing standards (pt-8, pt-12, mb-4 pattern)
- [ ] Implements ActionButtons pattern correctly
- [ ] Uses lucide-react icons exclusively  
- [ ] Applies responsive breakpoints (mobile-first)
- [ ] Meets accessibility requirements (44px targets)
- [ ] Passes TypeScript strict checks (zero any types)
- [ ] Maintains component reusability patterns

---

## 🚀 Migration Guide

### From v1.0 to v2.0
1. **Update headers:** Fix positioning, left-align logo
2. **Adjust spacing:** Apply new pt-8/pt-12 patterns
3. **Migrate buttons:** Replace with ActionButtons component
4. **Update icons:** Switch to lucide-react
5. **Fix containers:** Apply max-w-4xl mx-auto pattern
6. **Separate progress:** Convert to individual cards

### Automated Migration Tools
- ESLint rules for design system compliance
- Component analysis scripts for reusability tracking
- Bundle size monitoring for performance regression
- Accessibility testing integration

---

## 📞 Support & Governance

### Design System Updates
- All changes require team approval
- Updates must maintain backward compatibility where possible
- Breaking changes require migration documentation
- Performance impact assessment for all modifications

### Questions & Issues
- Design system violations should be caught in code review
- Performance regressions trigger immediate investigation
- Accessibility issues have zero tolerance policy
- Component reusability tracked in quarterly reviews

---

**This design system is the single source of truth for AIdioma UI/UX. All development must follow these standards to ensure consistency, performance, and maintainability across the platform.**

**Updated:** Based on Practice Page refinements
**Version:** 2.0
**Status:** Production Ready
