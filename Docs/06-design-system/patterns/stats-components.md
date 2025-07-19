# Stats Components - AIdioma v2

## Overview

Statistics boxes are a core UI pattern used across all practice pages to display real-time learning metrics. These components follow a consistent design system for visual hierarchy and user experience.

---

## Standard Stats Box Pattern

### **Implementation Structure**
```tsx
<div className="flex justify-center">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
    {/* Individual stat boxes */}
    <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
      <Icon className="w-6 h-6 text-{color}" />
      <div>
        <div className="text-base md:text-lg font-semibold text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
</div>
```

### **Icon Specifications**

**Size Standards**:
- **Current Size**: `w-6 h-6` (24px)
- **Previous Size**: `w-4 h-4` (16px) 
- **Size Increase**: 50% larger for enhanced visual prominence
- **Rationale**: Improved icon visibility and better visual hierarchy within stat boxes

**Color Palette**:
- `text-blue-500` - Primary metrics (progress, counts)
- `text-green-500` - Positive metrics (correct answers, completed items)
- `text-purple-500` - Engagement metrics (streaks, reviews)
- `text-orange-500` - Performance metrics (accuracy, fluency)
- `text-yellow-500` - Achievement metrics (mastered items, stars)

**Layout Properties**:
- **Container**: Flexbox with `items-center` alignment
- **Icon Spacing**: `gap-3` (12px) from text content - 50% increase for better visual breathing room
- **Icon Position**: Left-aligned within container
- **Responsive**: Same size across all breakpoints

---

## Implementation by Page

### **PracticePage Stats**
```tsx
<BookOpen className="w-6 h-6 text-blue-500" />      // Sentences progress
<CheckCircle className="w-6 h-6 text-green-500" />   // Correct answers
<TrendingUp className="w-6 h-6 text-purple-500" />   // Current streak
<Award className="w-6 h-6 text-orange-500" />        // Accuracy percentage
```

### **ReadingPage Stats**
```tsx
<ScrollText className="w-6 h-6 text-blue-500" />     // Paragraphs progress  
<Clock className="w-6 h-6 text-green-500" />         // Reading time
<Target className="w-6 h-6 text-purple-500" />       // Comprehension score
```

### **MemorizePage Stats**
```tsx
<Brain className="w-6 h-6 text-purple-500" />        // Card progress
<Clock className="w-6 h-6 text-blue-500" />          // Reviews today
<Star className="w-6 h-6 text-yellow-500" />         // Mastered words
<Target className="w-6 h-6 text-green-500" />        // Overall progress
```

### **ConversationsPage Stats**
```tsx
<MessageCircle className="w-6 h-6 text-blue-500" />  // Messages count
<BookmarkPlus className="w-6 h-6 text-green-500" />  // New vocabulary
<RefreshCw className="w-6 h-6 text-purple-500" />    // Chat time
<TrendingUp className="w-6 h-6 text-orange-500" />   // Fluency score
```

---

## Design Guidelines

### **Visual Hierarchy**
1. **Icons** (`w-6 h-6`) - Primary visual anchor
2. **Values** (`text-base md:text-lg font-semibold`) - Main data display
3. **Labels** (`text-xs text-muted-foreground`) - Context description

### **Container Standards**
- **Background**: `bg-muted` for subtle contrast
- **Border Radius**: `rounded-lg` for consistent styling
- **Padding**: `p-2 md:p-3` for responsive spacing
- **Grid Layout**: `grid-cols-2 md:grid-cols-4` for mobile/desktop

### **Responsive Behavior**
- **Mobile**: 2 columns, compact padding (`p-2`)
- **Desktop**: 4 columns, standard padding (`p-3`)
- **Icons**: Same size across all breakpoints for consistency

---

## Icon Selection Criteria

### **Semantic Meaning**
- **Progress Icons**: BookOpen, ScrollText, Brain (content-specific)
- **Performance Icons**: Target, Award, TrendingUp (achievement-focused)
- **Time Icons**: Clock, RefreshCw (temporal metrics)
- **Interaction Icons**: MessageCircle, CheckCircle (activity-based)

### **Visual Consistency**
- **Stroke Weight**: Consistent line thickness across icon family
- **Style**: Outline icons preferred for clarity at small sizes
- **Recognition**: Universally recognizable symbols for intuitive understanding

---

## Quality Assurance

### **Pre-Deployment Checklist**
- [ ] All icons use `w-6 h-6` sizing
- [ ] Semantic color assignment follows pattern
- [ ] Grid layout maintains 2/4 column responsive pattern
- [ ] Icon meanings align with displayed metrics
- [ ] Padding and spacing consistent across all pages

### **Cross-Page Consistency**
- [ ] PracticePage stats updated
- [ ] ReadingPage stats updated  
- [ ] MemorizePage stats updated
- [ ] ConversationsPage stats updated
- [ ] Documentation reflects current implementation

---

## Future Considerations

### **Enhancement Opportunities**
- **Animation**: Subtle hover effects for interactive feedback
- **Accessibility**: ARIA labels for screen reader support
- **Themes**: Icon color customization for user preferences
- **Performance**: Icon component optimization for bundle size

### **Maintenance Notes**
- Icon sizes standardized at `w-6 h-6` (24px) as of current implementation
- Any future icon size changes must be applied consistently across all four practice pages
- Color assignments should maintain semantic meaning for user recognition
