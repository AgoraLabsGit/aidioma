# Design System Index - AIdioma v2

## Quick Reference Guide

This document provides a quick overview of all established styling, UI, and UX guidelines for AIdioma v2.

---

## 📚 **Document Structure**

### **Core Documents**
- **[design-principles.md](./design-principles.md)** - Fundamental design philosophy and principles
- **[component-library.md](./component-library.md)** - Reusable React components with code examples
- **[styling-guide.md](./styling-guide.md)** - Comprehensive styling rules and CSS guidelines
- **[ui-patterns.md](./ui-patterns.md)** - Common UI patterns and implementation examples
- **[ui-ux-overview.md](./ui-ux-overview.md)** - High-level UI/UX system overview
- **[ux-interaction-patterns.md](./ux-interaction-patterns.md)** - User interaction flows and behaviors

---

## ⚡ **Quick Implementation Rules**

### **Mandatory Consistency Requirements**
- ✅ **Coherent UI System**: All UI changes must be applied across ALL relevant pages
- ✅ **Identical Components**: ActionButtons, headers, navigation must be identical across pages
- ✅ **Design System Integrity**: Maintain visual and functional consistency throughout

### **Button Standards (Critical)**
- **Size**: `px-6 py-3` for ALL buttons
- **Spacing**: `gap-3` between buttons, `gap-2` for icon-text
- **Colors**: `text-gray-400` for most buttons, `text-white` ONLY for Next button
- **Hover**: `hover:text-gray-300` and `hover:text-white` with `hover:bg-accent`
- **Icons**: `w-4 h-4` for button icons

### **ActionButtons Order (Fixed)**
1. **Previous** → 2. **Check** → 3. **Next** → 4. **Hint** → 5. **Skip** → 6. **Bookmark**

### **Layout Framework**
- **Header**: `fixed top-0 left-0 right-0 z-50`
- **Sidebar**: `fixed left-0 top-16 bottom-0 z-40`
- **Content**: `pt-16` and `ml-64` for clearance
- **Width**: `max-w-4xl mx-auto w-full` for main content

### **Color Guidelines**
- **Use**: `text-gray-400`, `text-white`, `bg-muted`, `bg-input`
- **Avoid**: `text-muted-foreground` (doesn't apply properly)
- **Primary Action**: Only Next button gets white text treatment

---

## 🎨 **Core Color System**

```css
/* HSL Color Palette */
--background: 220 13% 8%;      /* Main content area */
--muted: 220 8% 9%;           /* Sidebar/header */
--card: 220 8% 15%;           /* Components */
--border: 220 13% 25%;        /* Borders */
--foreground: 220 8% 95%;     /* Primary text */
--muted-foreground: 220 8% 85%; /* Secondary text */
```

### **Functional Colors**
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Amber)
- **Error**: `#EF4444` (Red)

---

## 🔧 **Component Quick Reference**

### **ActionButtons Implementation**
```tsx
// Must be identical on ReadingPage and PracticePage
<div className="flex items-center justify-center gap-3">
  <button className="px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors">
    {/* All buttons except Next */}
  </button>
  <button className="px-6 py-3 bg-muted text-white hover:text-white hover:bg-accent rounded-lg font-medium transition-colors">
    {/* Next button ONLY */}
  </button>
</div>
```

### **TranslationInput Standard**
```tsx
<textarea className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono" />
```

### **Fixed Header/Sidebar Structure**
```tsx
<div className="min-h-screen bg-background flex flex-col">
  <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
    {/* Header content */}
  </header>
  <div className="flex flex-1 pt-16">
    <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col fixed left-0 top-16 bottom-0 z-40">
      {/* Sidebar navigation */}
    </aside>
    <main className="flex-1 flex flex-col md:ml-64">
      {/* Main content */}
    </main>
  </div>
</div>
```

---

## 📋 **Implementation Checklist**

### **Before Creating/Editing Components**
- [ ] Check if component exists in component-library.md
- [ ] Verify color classes use explicit Tailwind classes (`text-gray-400` not `text-muted-foreground`)
- [ ] Ensure button sizing follows `px-6 py-3` standard
- [ ] Confirm ActionButtons order: Previous, Check, Next, Hint, Skip, Bookmark
- [ ] Validate that changes apply to ALL relevant pages

### **Cross-Page Consistency Check**
- [ ] ActionButtons identical on ReadingPage and PracticePage
- [ ] Header structure consistent across pages
- [ ] Navigation styling uniform across components
- [ ] Button colors follow established hierarchy (gray vs white)
- [ ] Layout framework matches established patterns

### **Accessibility & UX Validation**
- [ ] Touch targets meet 44px minimum (`px-6 py-3` ensures this)
- [ ] Hover states provide clear feedback
- [ ] Disabled states are visually distinct
- [ ] Keyboard navigation works properly
- [ ] Focus states are clearly visible

---

## 🚨 **Common Mistakes to Avoid**

### **Styling Errors**
- ❌ Using `text-muted-foreground` (use `text-gray-400` instead)
- ❌ Inconsistent button sizing (always use `px-6 py-3`)
- ❌ Multiple white text buttons (only Next button should be white)
- ❌ Wrong ActionButtons order (must follow established sequence)

### **Implementation Errors**
- ❌ Making changes to only one page (must apply to all relevant pages)
- ❌ Using `disabled={isEvaluated}` on TranslationInput (use separate disabled prop)
- ❌ Inconsistent spacing (use `gap-3` for buttons, `gap-2` for icon-text)
- ❌ Wrong icon sizes (`w-4 h-4` for buttons, `w-5 h-5` for navigation)

### **Component Errors**
- ❌ Different ActionButtons implementations across pages
- ❌ Inconsistent header/sidebar structure
- ❌ Variable content widths (use `max-w-4xl mx-auto w-full`)
- ❌ Missing hover states or transitions

---

## 📖 **Learning Resources**

### **For New Developers**
1. Start with [design-principles.md](./design-principles.md) for philosophy
2. Review [component-library.md](./component-library.md) for implementation examples
3. Study [ui-patterns.md](./ui-patterns.md) for common patterns
4. Reference [styling-guide.md](./styling-guide.md) for detailed CSS rules

### **For Code Reviews**
- Use this index as a checklist for consistency
- Cross-reference component implementations with established patterns
- Verify color usage against established guidelines
- Ensure cross-page consistency for shared components

### **For Design Updates**
- All design changes must update relevant documentation
- New patterns require addition to ui-patterns.md
- Component changes must update component-library.md
- UX changes require update to ux-interaction-patterns.md

---

## 🔄 **Maintenance Guidelines**

### **Documentation Updates**
- Update this index when adding new patterns
- Maintain consistency across all design system documents
- Regular review of established patterns for optimization
- Version control for design system changes

### **Component Evolution**
- New components must follow established patterns
- Breaking changes require documentation of migration path
- Deprecated patterns must be clearly marked
- Testing requirements for all component changes

---

*This index provides quick reference to our established design system. For detailed implementation guidance, refer to the specific documents linked above.*
