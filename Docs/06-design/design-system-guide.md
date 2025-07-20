# AIdioma Design System Guide
## Comprehensive Design Standards & Implementation Guide

*This guide consolidates all design principles, color systems, UI patterns, and interaction standards for AIdioma's Strike-inspired minimal dark theme.*

---

## 🎨 **Design Philosophy**

### **Core Design Principles**

#### **1. Learning-First Design**
- **Minimize Cognitive Load**: Reduce visual distractions to maintain focus on language learning
- **Content Hierarchy**: Clear visual separation between instruction, practice, and feedback
- **Reading Optimization**: Typography and spacing optimized for language comprehension

#### **2. Ultra-Dark Minimalism**
- **Strike-Inspired Aesthetic**: Deep black backgrounds with subtle surface variations
- **Minimal Color Palette**: Reserve color only for functional states (success, error, warning)
- **Subtle Contrasts**: Use lightness variations in HSL rather than different hues

#### **3. Accessibility & Inclusivity**
- **High Contrast**: WCAG AAA compliance with 21:1 contrast ratios
- **Keyboard Navigation**: Full keyboard accessibility for all interactions
- **Screen Reader Support**: Semantic HTML and proper ARIA attributes
- **Touch-Friendly**: Mobile-first design with appropriate touch targets

#### **4. Consistency & Predictability**
- **Design System**: All components follow established patterns
- **Cross-Page Coherence**: Identical styling frameworks across all pages
- **Component Standardization**: UI changes must be applied to ALL relevant pages

---

## 🎨 **Color System**

### **HSL Color Palette**
```css
/* Primary Color Variables */
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

/* Functional Colors */
--destructive: 0 84% 60%;            /* Red for errors */
--destructive-foreground: 210 40% 98%; /* Light text on red */
--warning: 38 92% 50%;               /* Amber warnings */
--warning-foreground: 48 96% 89%;    /* Dark text on warning */
--success: 142 76% 36%;              /* Green for positive feedback */
--success-foreground: 355 100% 97%; /* Light text on success */
```

### **Color Usage Guidelines**
```css
/* ✅ Always use CSS variables */
background: hsl(var(--card));
color: hsl(var(--card-foreground));

/* ❌ Never use hardcoded values */
background: #111113;
color: #ffffff;

/* ✅ Explicit color classes for text */
.text-gray-400    /* Secondary actions */
.text-white       /* Primary actions only */
.text-gray-300    /* Hover states */

/* ❌ Avoid problematic classes */
.text-muted-foreground    /* Doesn't apply properly */
```

### **Lightness Scale Hierarchy**
```
8% → 9% → 15% → 25% → 40% → 75% → 85% → 95%
│    │     │     │     │     │     │     └─ Primary text
│    │     │     │     │     │     └─ Secondary text  
│    │     │     │     │     └─ Accent states
│    │     │     │     └─ Interactive elements
│    │     │     └─ Secondary buttons
│    │     └─ Card backgrounds
│    └─ Sidebar/header backgrounds
└─ Main content backgrounds
```

---

## 📝 **Typography System**

### **Font Stack**
```css
/* Primary font family */
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

/* Monospace for code/translation inputs */
font-family: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", monospace;
```

### **Typography Scale**
```css
/* Heading hierarchy */
.text-3xl    /* Page titles (30px) */
.text-2xl    /* Section headers (24px) */
.text-xl     /* Subsection headers (20px) */
.text-lg     /* Large body text (18px) */
.text-base   /* Default body text (16px) */
.text-sm     /* Small text (14px) */
.text-xs     /* Helper text (12px) */
```

### **Font Weight Standards**
```css
.font-light      /* 300 - Large displays only */
.font-normal     /* 400 - Body text default */
.font-medium     /* 500 - Emphasized text */
.font-semibold   /* 600 - Section headers */
.font-bold       /* 700 - Page titles only */
```

---

## 🏗️ **Layout Patterns**

### **Unified Header (MANDATORY)**
```tsx
// Exact implementation required across all pages
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
  
  {/* Page Title - must use flex-1 */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      {pageTitle}
    </h1>
  </div>
</header>
```

### **Sidebar Pattern**
```tsx
// Standard sidebar implementation
<aside className="w-64 bg-muted border-r border-border fixed left-0 top-16 bottom-0 z-40">
  <nav className="p-6 space-y-2">
    <SidebarItem href="/practice" icon={Play} label="Practice" />
    <SidebarItem href="/reading" icon={Book} label="Reading" />
    {/* ... other navigation items */}
  </nav>
</aside>
```

### **Content Container**
```tsx
// Standard content layout
<main className="pt-16 ml-64"> {/* Account for header and sidebar */}
  <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
    {/* Page content */}
  </div>
</main>
```

---

## 🎛️ **Component Standards**

### **Button Design Standards**
```css
/* Standard button sizing */
.btn-standard {
  @apply px-6 py-3 rounded-lg font-medium transition-colors;
}

/* Color hierarchy */
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/90;
}

.btn-ghost {
  @apply text-gray-400 hover:text-gray-300 hover:bg-accent;
}

/* Icon standards */
.btn-icon {
  @apply w-4 h-4;
}

.btn-icon-text {
  @apply gap-2; /* Between icon and text */
}
```

### **ActionButtons Component (Fixed Order)**
```tsx
// Mandatory button order across all pages
<div className="flex items-center gap-3">
  <Button variant="ghost">Previous</Button>     {/* 1 */}
  <Button variant="default">Check</Button>     {/* 2 */}
  <Button variant="default">Next</Button>      {/* 3 - primary action */}
  <Button variant="ghost">Hint</Button>        {/* 4 */}
  <Button variant="ghost">Skip</Button>        {/* 5 */}
  <Button variant="ghost">Bookmark</Button>    {/* 6 */}
</div>
```

### **Input Standards**
```tsx
// Standard input styling
<input className="w-full px-4 py-3 bg-input border border-border rounded-lg 
                  text-foreground placeholder:text-muted-foreground
                  focus:border-accent focus:ring-1 focus:ring-accent" />
```

### **Card Patterns**
```tsx
// Standard card component
<div className="bg-card border border-border rounded-lg p-6">
  <h3 className="text-lg font-semibold text-card-foreground mb-4">
    Card Title
  </h3>
  <div className="text-card-foreground">
    Card content
  </div>
</div>
```

---

## 🎯 **UX Interaction Patterns**

### **Core UX Principles**

#### **1. Learning-First Interactions**
- **Minimal Cognitive Load**: Reduce interface complexity to focus on learning
- **Clear Feedback**: Immediate visual confirmation for all user actions
- **Progressive Disclosure**: Reveal information and options as needed
- **Error Prevention**: Design patterns that prevent common user mistakes

#### **2. Consistent Behavior Patterns**
- **Predictable Navigation**: Same interaction patterns across all pages
- **State Persistence**: Maintain user context when moving between sections
- **Responsive Feedback**: Visual acknowledgment of all interactions
- **Keyboard Accessibility**: Full keyboard navigation support

### **Interaction States**
```css
/* Button states */
.btn:hover {
  @apply transition-colors duration-200;
}

.btn:focus {
  @apply ring-2 ring-accent ring-offset-2 ring-offset-background;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Input states */
.input:focus {
  @apply border-accent ring-1 ring-accent;
}

.input:invalid {
  @apply border-destructive;
}
```

### **Animation Standards**
```css
/* Standard transitions */
.transition-standard {
  @apply transition-all duration-200 ease-in-out;
}

/* Hover animations */
.hover-lift {
  @apply transform hover:scale-105 transition-transform duration-200;
}

/* Loading states */
.loading-pulse {
  @apply animate-pulse;
}
```

---

## 📊 **Spacing System**

### **Spacing Scale**
```css
/* Based on 4px baseline grid */
.space-1    /* 4px */
.space-2    /* 8px */
.space-3    /* 12px */
.space-4    /* 16px */
.space-6    /* 24px */
.space-8    /* 32px */
.space-12   /* 48px */
.space-16   /* 64px */
.space-24   /* 96px */
```

### **Layout Spacing Standards**
```css
/* Component spacing */
.component-padding: p-6;      /* 24px internal padding */
.component-margin: space-y-6; /* 24px between components */

/* Button spacing */
.button-gap: gap-3;           /* 12px between buttons */
.icon-text-gap: gap-2;        /* 8px between icon and text */

/* Content spacing */
.content-container: max-w-4xl mx-auto; /* Centered content */
.content-padding: p-6;        /* Content area padding */
```

---

## 🎨 **Design Tokens**

### **Border Radius**
```css
.rounded-sm    /* 2px - Small elements */
.rounded       /* 4px - Default */
.rounded-md    /* 6px - Cards */
.rounded-lg    /* 8px - Buttons, inputs */
.rounded-xl    /* 12px - Large cards */
```

### **Shadows**
```css
/* Subtle shadows for depth */
.shadow-sm     /* 0 1px 2px rgba(0,0,0,0.05) */
.shadow        /* 0 1px 3px rgba(0,0,0,0.1) */
.shadow-lg     /* 0 10px 15px rgba(0,0,0,0.1) */
```

### **Z-Index Scale**
```css
.z-0     /* Base layer */
.z-10    /* Dropdowns */
.z-20    /* Sticky elements */
.z-30    /* Modals backdrop */
.z-40    /* Sidebar */
.z-50    /* Header */
```

---

## 📱 **Responsive Design**

### **Breakpoint System**
```css
/* Tailwind breakpoints */
sm: 640px    /* Small tablets */
md: 768px    /* Large tablets */
lg: 1024px   /* Laptops */
xl: 1280px   /* Desktops */
2xl: 1536px  /* Large desktops */
```

### **Mobile-First Patterns**
```tsx
// Always design mobile-first
<div className="text-sm md:text-base lg:text-lg">
  Responsive text sizing
</div>

<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  Responsive grid
</div>
```

---

## 🔧 **Implementation Guidelines**

### **CSS-in-JS Pattern**
```tsx
// Use Tailwind utility classes
const buttonClasses = cn(
  "px-6 py-3 rounded-lg font-medium transition-colors",
  "bg-primary text-primary-foreground",
  "hover:bg-primary/90 focus:ring-2 focus:ring-accent",
  disabled && "opacity-50 cursor-not-allowed"
)
```

### **Component Composition**
```tsx
// Composable design system components
<Card>
  <CardHeader>
    <CardTitle>Practice Session</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Enter your translation..." />
    <div className="flex gap-3 mt-4">
      <Button>Check</Button>
      <Button variant="ghost">Hint</Button>
    </div>
  </CardContent>
</Card>
```

### **Theme Customization**
```css
/* Override CSS variables for theme variants */
:root {
  --background: 220 13% 8%;
  --foreground: 220 8% 95%;
  /* ... other variables */
}

[data-theme="high-contrast"] {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
}
```

---

## ✅ **Quality Checklist**

### **Design Compliance**
- [ ] Uses only CSS variables, no hardcoded colors
- [ ] Follows HSL lightness scale (8% → 9% → 15% → etc.)
- [ ] Consistent button sizing (`px-6 py-3`)
- [ ] Proper color hierarchy (`text-gray-400` → `text-white`)
- [ ] Cross-page component consistency

### **Accessibility Compliance**
- [ ] WCAG AAA contrast ratios (21:1)
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Touch-friendly targets (44px minimum)
- [ ] Semantic HTML structure

### **Performance Standards**
- [ ] Minimal CSS bundle size
- [ ] Optimized font loading
- [ ] Hardware-accelerated animations
- [ ] Responsive image handling
- [ ] Critical CSS inlined

---

## 🎨 **Design System Maintenance**

### **Update Protocol**
1. **Design Changes**: Update CSS variables in root
2. **Component Updates**: Modify base components, propagate to all usage
3. **Documentation**: Update this guide with any changes
4. **Testing**: Verify changes across all pages
5. **Review**: Design system changes require team approval

### **Consistency Enforcement**
- All UI changes must be applied to ALL relevant pages
- Use shared components instead of duplicating styles
- Regular design system audits to catch inconsistencies
- Automated testing for design token usage

---

*This design system ensures AIdioma maintains a cohesive, accessible, and beautiful learning experience that reduces cognitive load while maximizing learning effectiveness.* 