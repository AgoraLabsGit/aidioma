# Spacing Standards - AIdioma v2

## Overview

This document defines the standardized spacing and padding rules for all AIdioma v2 pages. Consistent spacing creates visual harmony and improves user experience across all learning interfaces.

---

## Main Content Container Spacing

### **Standard Container Padding (MANDATORY)**

All practice pages must use this exact padding pattern:

```tsx
<main className="flex-1 flex flex-col md:ml-64">
  <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
    {/* Page content */}
  </div>
</main>
```

### **Padding Breakdown**

| Screen Size | Sides & Bottom | Top | Purpose |
|------------|----------------|-----|---------|
| **Mobile** | `p-4` (16px) | `pt-6` (24px) | Breathing room above stats |
| **Desktop** | `md:p-6` (24px) | `md:pt-8` (32px) | Enhanced visual hierarchy |

### **Visual Balance Rationale**
- **Extra top padding** prevents stats from feeling cramped against header
- **Consistent side/bottom padding** maintains content boundaries
- **Progressive enhancement** provides better spacing on larger screens

---

## Section Spacing Standards

### **Major Section Spacing**

All major page sections use consistent 24px spacing:

```tsx
{/* 1. Stats Section */}
<div className="mb-6">
  <PageStats />
</div>

{/* 2. Filters Section */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <PageFilters />
</div>

{/* 3. Content Section */}
<div className="max-w-4xl mx-auto w-full">
  <ContentContainer />
</div>
```

### **Spacing Rules**
- **Between sections**: Always `mb-6` (24px)
- **No top margins**: Only bottom margins for consistent flow
- **Visual rhythm**: Equal spacing creates predictable layout

---

## Content Container Spacing

### **Card Padding Standards**

Content cards use responsive padding for optimal reading:

```tsx
<div className="w-full card p-4 md:p-8">
  <MainContent />
  
  {/* Progress bar with standard top margin */}
  <div className="mt-6 p-4 bg-muted rounded-lg">
    <ProgressBar />
  </div>
</div>
```

### **Card Spacing Breakdown**
- **Card padding**: `p-4 md:p-8` (16px mobile, 32px desktop)
- **Progress margin**: `mt-6` (24px) from content
- **Progress padding**: `p-4` (16px) internal spacing

---

## Width Constraints & Alignment

### **Content Width Standards**

Different content types use specific width constraints:

```tsx
{/* Stats: Full width with internal centering */}
<div className="mb-6">
  <div className="flex justify-center">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
      <StatsCards />
    </div>
  </div>
</div>

{/* Filters & Content: Consistent max-width */}
<div className="mb-6 max-w-4xl mx-auto w-full">
  <FilterComponent />
</div>

<div className="max-w-4xl mx-auto w-full">
  <ContentComponent />
</div>
```

### **Width Rules**
- **Stats**: `max-w-2xl` for stats grid, centered
- **Filters**: `max-w-4xl mx-auto w-full` for form controls
- **Content**: `max-w-4xl mx-auto w-full` matching filters
- **Alignment**: All content sections align visually

---

## Implementation Examples

### **✅ PracticePage (Perfect Spacing)**
```tsx
<main className="flex-1 flex flex-col md:ml-64">
  <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
    {/* 1. Stats - 24px top breathing room */}
    <div className="mb-6">
      <PracticeStats />
    </div>

    {/* 2. Filters - 24px from stats */}
    <div className="mb-6 max-w-4xl mx-auto w-full">
      <PracticeFilters />
    </div>

    {/* 3. Content - 24px from filters */}
    <div className="max-w-4xl mx-auto w-full">
      <div className="w-full card p-4 md:p-8">
        <PracticeContent />
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <ProgressBar />
        </div>
      </div>
    </div>
  </div>
</main>
```

### **✅ All Other Pages**
ReadingPage, MemorizePage, and ConversationsPage follow identical spacing patterns.

---

## Responsive Behavior

### **Mobile Spacing (< 768px)**
- **Top padding**: 24px above stats
- **Side padding**: 16px around content
- **Section gaps**: 24px between sections
- **Card padding**: 16px internal

### **Desktop Spacing (≥ 768px)**
- **Top padding**: 32px above stats  
- **Side padding**: 24px around content
- **Section gaps**: 24px between sections (unchanged)
- **Card padding**: 32px internal

### **Responsive Philosophy**
- **Consistent gaps**: Section spacing remains constant
- **Enhanced padding**: More breathing room on larger screens
- **Proportional scaling**: Maintains visual hierarchy

---

## Common Spacing Mistakes

### **❌ Insufficient Top Padding**
```tsx
{/* DON'T DO THIS */}
<div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
  {/* Stats feel cramped against header */}
```

### **❌ Inconsistent Section Spacing**
```tsx
{/* DON'T DO THIS */}
<div className="mb-4">  {/* Wrong: Should be mb-6 */}
  <PageStats />
</div>
<div className="mb-8 mt-2">  {/* Wrong: Inconsistent margins */}
  <PageFilters />
</div>
```

### **❌ Misaligned Content Widths**
```tsx
{/* DON'T DO THIS */}
<div className="mb-6 max-w-6xl mx-auto w-full">  {/* Wrong: Should be max-w-4xl */}
  <PageFilters />
</div>
<div className="max-w-3xl mx-auto w-full">  {/* Wrong: Doesn't match filters */}
  <PageContent />
</div>
```

---

## Quality Checklist

When implementing page spacing, verify:

- ✅ Main container uses `p-4 md:p-6 pt-6 md:pt-8`
- ✅ All major sections have `mb-6` bottom margin
- ✅ Stats section has proper top breathing room
- ✅ Filters and content use `max-w-4xl mx-auto w-full`
- ✅ Content cards use `p-4 md:p-8` padding
- ✅ Progress bars have `mt-6` from content
- ✅ No inconsistent margin/padding combinations
- ✅ Layout looks balanced on both mobile and desktop

This spacing system ensures all AIdioma v2 pages feel cohesive and professionally designed while providing optimal reading and interaction experiences across all device sizes.
