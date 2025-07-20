# Progress Bar Standards - AIdioma v2

## Overview

This document defines the standardized progress bar implementation used across all AIdioma v2 pages. The progress bar provides consistent visual feedback for user progress through learning content.

---

## Standard Progress Bar

### **Base Implementation**
Based on the MemorizePage implementation, this is the mandatory pattern for all progress indicators:

```tsx
{/* Standard Progress Section */}
<div className="mt-6 p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground">Session Progress</span>
    <span className="text-sm text-muted-foreground">
      {current} of {total} items
    </span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${(current / total) * 100}%` }}
    />
  </div>
</div>
```

---

## Styling Standards

### **Container Styles**
- **Wrapper**: `mt-6 p-4 bg-muted rounded-lg`
- **Spacing**: Always `mt-6` from previous content, `p-4` internal padding
- **Background**: Consistent `bg-muted` for container visibility

### **Header Section**
- **Layout**: `flex items-center justify-between mb-2`
- **Title**: `text-sm text-foreground` for primary label
- **Counter**: `text-sm text-muted-foreground` for progress indicator
- **Margin**: `mb-2` below header section

### **Progress Track**
- **Container**: `w-full bg-background rounded-full h-2`
- **Width**: Always full width of parent container
- **Height**: Consistent `h-2` (8px) for all progress bars
- **Background**: `bg-background` for track visibility
- **Border radius**: `rounded-full` for smooth appearance

### **Progress Fill**
- **Bar**: `bg-primary h-2 rounded-full transition-all duration-300`
- **Color**: Always use `bg-primary` for consistent brand theming
- **Height**: Must match track height `h-2`
- **Animation**: `transition-all duration-300` for smooth progress updates
- **Border radius**: `rounded-full` to match track

---

## Implementation by Page

### **MemorizePage (Reference Standard)**
```tsx
<div className="mt-6 p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground">Session Progress</span>
    <span className="text-sm text-muted-foreground">
      {currentCardIndex + 1} of {flashCards.length} cards
    </span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${((currentCardIndex + 1) / flashCards.length) * 100}%` }}
    />
  </div>
</div>
```

### **ReadingPage (Updated to Standard)**
```tsx
<div className="mt-6 p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground">Session Progress</span>
    <span className="text-sm text-muted-foreground">
      {currentParagraph + 1} of {content.length} sentences
    </span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${((currentParagraph + 1) / content.length) * 100}%` }}
    />
  </div>
</div>
```

### **PracticePage (Updated to Standard)**
```tsx
<div className="mt-6 p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground">Session Progress</span>
    <span className="text-sm text-muted-foreground">
      {sessionStats.currentSentence} of {sessionStats.totalSentences} sentences
    </span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${(sessionStats.currentSentence / sessionStats.totalSentences) * 100}%` }}
    />
  </div>
</div>
```

### **ConversationsPage (Updated to Standard)**
```tsx
<div className="mt-6 p-4 bg-muted rounded-lg">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm text-foreground">Session Progress</span>
    <span className="text-sm text-muted-foreground">
      {conversationStats.messagesCount} messages exchanged
    </span>
  </div>
  <div className="w-full bg-background rounded-full h-2">
    <div
      className="bg-primary h-2 rounded-full transition-all duration-300"
      style={{ width: `${Math.min((conversationStats.messagesCount / 50) * 100, 100)}%` }}
    />
  </div>
</div>
```

---

## Usage Guidelines

### **Positioning**
- Always position at the **bottom** of main content sections
- Use `mt-6` spacing from previous content
- Place within the main content container, not as a separate section

### **Content Guidelines**
- **Title**: Always use "Session Progress" for consistency
- **Counter**: Show current/total format when applicable
- **Progress calculation**: Ensure percentage is clamped between 0-100%

### **Animation Guidelines**
- Use `transition-all duration-300` for smooth progress updates
- Update progress immediately when state changes
- Avoid jarring animations or rapid changes

### **Accessibility**
- Ensure sufficient color contrast between track and fill
- Consider adding `aria-label` and `aria-valuenow` attributes for screen readers
- Progress should be visually clear in both light and dark modes

---

## Deprecated Patterns

### **❌ Old ReadingPage Progress (Before Standardization)**
```tsx
/* DON'T USE - Inconsistent styling */
<div className="p-4 card-ghost border-t border-border/30">
  <div className="flex items-center justify-between mb-3">
    <span className="text-xs text-muted-foreground font-medium">Reading Progress</span>
    <span className="text-xs text-muted-foreground">
      {currentParagraph + 1} of {content.length} sentences
    </span>
  </div>
  <div className="w-full bg-muted/30 rounded-full h-1">
    <div
      className="bg-muted-foreground/60 h-1 rounded-full transition-all duration-500"
      style={{ width: `${((currentParagraph + 1) / content.length) * 100}%` }}
    />
  </div>
</div>
```

**Issues with old pattern**:
- Inconsistent height (`h-1` vs standard `h-2`)
- Different background colors (`bg-muted/30` vs standard `bg-background`)
- Inconsistent spacing (`mb-3` vs standard `mb-2`)
- Different transition duration (`duration-500` vs standard `duration-300`)
- Wrong text sizes (`text-xs` vs standard `text-sm`)

---

## Quality Checklist

When implementing progress bars, ensure:

- ✅ Uses standard `mt-6 p-4 bg-muted rounded-lg` container
- ✅ Header uses `text-sm text-foreground` and `text-sm text-muted-foreground`
- ✅ Track uses `w-full bg-background rounded-full h-2`
- ✅ Fill uses `bg-primary h-2 rounded-full transition-all duration-300`
- ✅ Progress calculation is accurate and clamped 0-100%
- ✅ Positioned at bottom of content with `mt-6` spacing
- ✅ Uses "Session Progress" as standard title
- ✅ Shows meaningful current/total information

This ensures all progress indicators across AIdioma v2 provide a consistent and professional user experience.
