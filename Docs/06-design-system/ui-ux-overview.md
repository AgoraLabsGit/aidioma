# UI/UX Overview - AIdioma v2

## Design Philosophy

AIdioma v2 follows a **Strike-inspired minimal dark theme** with an emphasis on:
- Ultra-dark backgrounds for reduced eye strain during extended learning sessions
- Subtle visual hierarchy through carefully calibrated greys
- Clean, distraction-free interface that keeps focus on learning content
- Consistent spacing and typography for professional appearance

---

## Color System

### Core Color Palette (HSL Values)

#### Background Colors
- **Main Content Area**: `220 13% 8%` - Deep black/dark for primary content
- **Sidebar/Header**: `220 8% 9%` - Nearly black muted (slightly lighter than main)
- **Cards/Components**: `220 8% 15%` - Dark charcoal grey for elevated elements
- **Interactive Elements**: `220 8% 25%` - Medium dark for hover states

#### Text Colors
- **Primary Text**: `220 8% 95%` - Near-white for high contrast readability
- **Secondary Text**: `220 8% 85%` - Light grey for secondary information
- **Muted Text**: `220 8% 40%` - Medium grey for less important text

#### Functional Colors
- **Success**: `#10B981` (Green) - For positive feedback and completed actions
- **Warning**: `#F59E0B` (Amber) - For warnings and cautions
- **Error**: `#EF4444` (Red) - For errors and destructive actions
- **Primary Actions**: `220 8% 40%` - Blue-grey for buttons and interactive elements

#### Border Colors
- **Subtle Borders**: `220 13% 25%` - For component separation
- **Default Borders**: `#374151` - For inputs and containers
- **Emphasis Borders**: `#4B5563` - For focused or highlighted elements

### Legacy Color Variables (for reference)
```css
--background-primary: #0A0A0B;       /* Almost black base */
--background-surface: #111113;       /* Card backgrounds */
--background-elevated: #1A1A1C;      /* Elevated elements */
--background-interactive: #1F1F23;   /* Hover states */
```

---

## Established UI Framework Standards

### **Coherent Design System**
AIdioma v2 implements a **coherent UI system** with the following mandatory requirements:

#### **Cross-Page Consistency Rules**
- **Identical Styling Frameworks**: All shared components must be identical across pages
- **UI Change Propagation**: Any styling changes must be applied to ALL relevant pages
- **Component Standardization**: ActionButtons, headers, navigation must be uniform
- **Design System Integrity**: Maintains visual and functional consistency throughout the app

#### **Button Framework Standards**
- **Uniform Sizing**: All buttons use `px-6 py-3` for consistent touch targets
- **Standard Spacing**: `gap-3` between buttons, `gap-2` between icon and text
- **Color Hierarchy**: `text-gray-400` for secondary, `text-white` for primary actions only
- **Hover States**: `hover:text-gray-300` and `hover:text-white` with `hover:bg-accent`
- **Icon Standards**: `w-4 h-4` for button icons, `w-5 h-5` for navigation icons

#### **ActionButtons Component Standard**
**Fixed button order (left to right):**
1. **Previous** - Navigation to previous content
2. **Check** - Validate input (or "Try Again" when evaluated)
3. **Next** - Primary action with white text treatment
4. **Hint** - Toggle hint display
5. **Skip** - Skip exercise (or "Next Sentence" when evaluated)
6. **Bookmark** - Save content for review

**Critical Implementation Rules:**
- Must be identical on ReadingPage and PracticePage
- Only Next button uses `text-white`, all others use `text-gray-400`
- All buttons use `px-6 py-3` sizing and `rounded-lg font-medium` styling
- Conditional rendering for Check/Try Again and Skip/Next Sentence based on `isEvaluated`

#### **Layout Framework Standards**
- **Fixed Header**: `fixed top-0 left-0 right-0 z-50` with proper clearance
- **Fixed Sidebar**: `fixed left-0 top-16 bottom-0 z-40` (desktop only)
- **Content Spacing**: `pt-16` for header, `ml-64` for sidebar clearance
- **Main Content**: `pt-6 md:pt-8` for optimal content positioning (UPDATED v2.1)
- **Responsive Design**: `hidden md:flex` patterns for mobile adaptation
- **Content Width**: `max-w-4xl mx-auto w-full` for optimal reading experience

#### **Color Implementation Guidelines**
- **Explicit Color Classes**: Use `text-gray-400` instead of `text-muted-foreground`
- **Primary Actions**: Only Next button gets white text treatment
- **Background Standards**: `bg-muted` for buttons, `bg-input` for text areas
- **Hover Feedback**: Consistent hover states across all interactive elements

#### **Component-Specific Standards**
- **TranslationInput**: `font-mono` typography, `h-20` height, proper focus rings
- **Navigation**: Active state with `bg-accent text-accent-foreground font-medium`
- **Typography**: `font-semibold tracking-tight` for headings, `font-medium` for buttons

---

## 🚨 **Critical UI/UX Compliance Standards**

### **MANDATORY: Shared Component Implementation**
**RULE**: All navigation and header components MUST be shared components to prevent inconsistencies.

#### **Shared Sidebar Component** (`/components/Sidebar.tsx`)
**CRITICAL**: All pages must use the shared `<Sidebar />` component - NO exceptions.

```tsx
// ✅ CORRECT: Use shared component
import SharedSidebar from '../components/Sidebar'
<SharedSidebar currentUser={currentUser} />

// ❌ INCORRECT: Duplicate inline navigation
<aside className="...">
  {/* Inline navigation code */}
</aside>
```

**Required Sidebar Structure**:
- **Fixed positioning**: `fixed left-0 top-16 bottom-0 z-40`
- **Proper spacing**: Navigation uses `p-4 pt-8` (critical for proper padding)
- **Active state logic**: `item.path === location || (location === '/' && item.path === '/practice')`
- **Icon sizing**: `w-5 h-5` for all navigation icons
- **User profile section**: Included at bottom with proper border

#### **Header Badge Standards**
**CRITICAL**: All header badges must follow established sizing patterns.

```tsx
// ✅ CORRECT: Standard header badge sizing
className="px-2 md:px-3 py-1 text-xs font-medium"

// ❌ INCORRECT: Oversized badges
className="px-4 py-2 text-lg font-bold"
```

**Badge Implementation Rules**:
- **Size**: `px-2 md:px-3 py-1` for all header badges
- **Typography**: `text-xs font-medium` - never larger
- **Icons**: `w-3 h-3` maximum for badge icons
- **No excessive content**: Keep badges minimal and clean

### **Header Consistency Enforcement**

#### **Unified Header Structure** (ALL pages must follow)
```tsx
{/* Unified Header spanning full width - responsive - Fixed Position */}
<header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
  {/* Logo Section - responsive */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-xl font-normal text-foreground">AIdioma</h1>
      </div>
    </div>
  </div>
  
  {/* Mobile Logo - only on mobile */}
  <div className="md:hidden px-4 py-4 flex items-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Header Content - responsive */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">[Page Title]</h1>
  </div>
  
  {/* Header Stats - responsive (OPTIONAL - use sparingly) */}
  <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
    {/* ONLY small badges following standard sizing */}
  </div>
</header>
```

**CRITICAL Header Rules**:
- **Logo consistency**: Always use `BookOpen` icon, never change per page
- **Logo sizing**: `w-8 h-8` container, `w-5 h-5` icon, `text-xl` (desktop) / `text-lg` (mobile)
- **Title sizing**: `text-xl md:text-2xl font-semibold` - NEVER larger
- **NO oversized elements**: Keep header clean and minimal

### **Spacing Standards Enforcement**

#### **Content Padding Requirements**
**CRITICAL**: All main content areas must follow established spacing patterns.

```tsx
// ✅ CORRECT: Standard content spacing (UPDATED v2.1)
<main className="flex-1 flex flex-col md:ml-64">
  <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
    {/* Content sections with proper max-width */}
    <div className="mb-6 max-w-4xl mx-auto w-full">
```

**Updated Spacing Rules (v2.1)**:
- **Top padding**: `pt-6 md:pt-8` for optimal header clearance (REDUCED from pt-8 md:pt-12)
- **Side padding**: `p-4 md:p-6` for responsive margins
- **Content width**: `max-w-4xl mx-auto w-full` for all major sections
- **Section spacing**: `mb-6` between major content blocks

#### **Navigation Spacing Standards**
**CRITICAL**: Sidebar navigation must use exact spacing from shared component standard.

```tsx
// ✅ CORRECT: Navigation spacing
<nav className="flex-1 p-4 pt-8">  // pt-8 is CRITICAL

// ❌ INCORRECT: Missing top padding
<nav className="flex-1 p-4">
```

### **Icon Spacing Enhancement** 
**Applied to ALL practice pages for consistent visual hierarchy**:

```tsx
// ✅ CORRECT: Enhanced icon spacing in stats
className="flex items-center gap-3 mb-3"  // gap-3 for 50% more spacing
<Icon className="w-6 h-6" />              // w-6 h-6 for proper icon size

// ❌ INCORRECT: Previous tight spacing  
className="flex items-center gap-2 mb-3"  // gap-2 too tight
<Icon className="w-5 h-5" />              // w-5 h-5 too small
```

### **Development Protocol Enforcement**

#### **Pre-Implementation Checklist**
Before creating ANY new page or component:

1. **✅ Check Reference Implementation**: Use ReadingPage/PracticePage as standard
2. **✅ Use Shared Components**: Never recreate navigation, headers, or common elements
3. **✅ Follow Spacing Standards**: Use established padding and margin patterns
4. **✅ Verify Badge Sizing**: No oversized badges in headers
5. **✅ Test Responsiveness**: Ensure mobile and desktop consistency

#### **Code Review Requirements**
ALL UI implementations must verify:

1. **✅ Shared Component Usage**: No duplicate navigation or header code
2. **✅ Consistent Sizing**: Headers, badges, and spacing match standards
3. **✅ Icon Consistency**: Proper sizing and spacing throughout
4. **✅ Responsive Design**: Mobile-first approach with proper breakpoints
5. **✅ Cross-Page Testing**: Verify consistency across all pages

---

## Typography

### Font System
- **Primary Font**: `system-ui, -apple-system, BlinkMacSystemFont, sans-serif`
  - Used for all UI text, buttons, navigation
  - Ensures native platform consistency
  - Clean, readable across all devices

- **Monospace Font**: `'JetBrains Mono', 'Consolas', monospace`
  - Used for translation input fields
  - Provides clear character distinction for language learning
  - Consistent spacing for typing practice

### Font Sizing Hierarchy
- **Large Display**: `1.875rem` (30px) - Main sentence display on desktop
- **Medium Display**: `1.5rem` (24px) - Main sentence display on mobile
- **Body Text**: `1rem` (16px) - Standard UI text
- **Small Text**: `0.875rem` (14px) - Secondary information

### Font Weights
- **Light**: `300` - For large display text (sentences)
- **Regular**: `400` - Standard UI text and buttons
- **Medium**: `500` - Active navigation items and emphasis

---

## Layout Structure

### Unified Header System (New Standard)
**Established Pattern from PracticePage implementation:**

```tsx
// Standard header structure for all pages
<header className="flex border-b border-border bg-muted">
  {/* Logo Section - Desktop Only */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Mobile Logo */}
  <div className="md:hidden px-4 py-4 flex items-center">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
    </div>
  </div>
  
  {/* Page Title - Responsive */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      [Page Title]
    </h1>
  </div>
  
  {/* Stats/Actions - Responsive */}
  <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
    {/* Page-specific header content */}
  </div>
</header>
```

### Content Width Alignment Standards
**Critical: All page components must follow these width patterns:**

```tsx
// Session/Page Stats - Full width with responsive design
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">

// Filter/Control Components - Consistent width container
<div className="mb-6 max-w-4xl mx-auto w-full">
  <FilterComponent />
</div>

// Main Content Container - Matching width, NO left padding
<div className="max-w-4xl mx-auto w-full">
  <div className="w-full card p-4 md:p-8">
    {/* Content */}
  </div>
</div>
```

### Responsive Design Patterns
**Mobile-First Approach - All pages must implement:**

#### Breakpoint Strategy
- **Mobile**: Base styles (0px+)
- **Tablet**: `md:` prefix (768px+)
- **Desktop**: `lg:` prefix (1024px+) when needed

#### Layout Adaptations
```tsx
// Responsive sidebar visibility
<aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">

// Responsive main content padding
<div className="flex-1 flex flex-col p-4 md:p-6 bg-background">

// Responsive component layout
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
```

### Grid System
- **Sidebar Width**: Fixed `w-64` (256px) on desktop, hidden on mobile
- **Main Content**: Flexible width adapting to remaining space (`flex-1`)
- **Component Spacing**: Consistent padding and margins using Tailwind spacing scale

### Component Hierarchy Standards
1. **Unified Header** (`bg-muted` - spans full width)
   - Logo section (desktop: w-64, mobile: auto)
   - Page title section (flex-1)
   - Action/stats section (auto width)

2. **Sidebar Navigation** (`bg-muted` - desktop only)
   - Fixed position navigation
   - Dark background with light text
   - Active states with accent color

3. **Main Content Area** (`bg-background`)
   - Deep black background
   - Maximum contrast for reading content
   - Responsive padding (p-4 md:p-6)

4. **Content Containers** (max-w-4xl mx-auto w-full)
   - Consistent width alignment across all components
   - Centered with responsive max-width
   - Perfect edge-to-edge alignment

5. **Card Components** (`bg-card`)
   - Practice boxes, filter containers
   - Elevated appearance with subtle shadows
   - Consistent border radius and padding (p-4 md:p-8)

### Spacing System
```css
--spacing-xs: 0.25rem;    /* 4px - Tight spacing */
--spacing-sm: 0.5rem;     /* 8px - Small spacing */
--spacing-md: 1rem;       /* 16px - Standard spacing */
--spacing-lg: 1.5rem;     /* 24px - Large spacing */
--spacing-xl: 2rem;       /* 32px - Extra large */
--spacing-2xl: 3rem;      /* 48px - Section spacing */
```

---

## Component Design Patterns

### Page Layout Template (Established Standard)
**Every page should follow this exact structure:**

```tsx
export default function PageName() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header - MANDATORY */}
      <header className="flex border-b border-border bg-muted">
        {/* Logo Section - Desktop */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          {/* Logo content */}
        </div>
        
        {/* Mobile Logo */}
        <div className="md:hidden px-4 py-4 flex items-center">
          {/* Mobile logo content */}
        </div>
        
        {/* Page Title */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Page Title
          </h1>
        </div>
        
        {/* Page Actions/Stats */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          {/* Page-specific header content */}
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop Only */}
        <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col">
          {/* Navigation content */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
            {/* Page Stats - Responsive */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
              {/* Stats content */}
            </div>

            {/* Filters/Controls - Aligned Width */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              {/* Filter components */}
            </div>

            {/* Main Content Container - Matching Width */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="w-full card p-4 md:p-8">
                {/* Page content */}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

### Filter System Patterns
**Consistent filter implementation across all pages:**

#### Collapsible Filter Component
```tsx
function PageFilters({ isOpen, onToggle }: FilterProps) {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 card text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Page Filters</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 p-4 card">
          {/* Filter controls */}
        </div>
      )}
    </div>
  )
}
```

### Practice Interface

#### Session Stats Pattern
**Responsive stats display for all practice-type pages:**

```tsx
function SessionStats({ currentItem, totalItems, successCount, errorCount }: StatsProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Item <span className="text-blue-400 font-medium">{currentItem}</span> of <span className="text-blue-400 font-medium">{totalItems}</span>
        </span>
        <div className="w-16 h-2 bg-muted rounded-full">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentItem / totalItems) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <span className="text-green-400 font-medium">{successCount} correct</span> • <span className="text-red-400 font-medium">{errorCount} incorrect</span>
      </div>
    </div>
  )
}
```

#### Action Button Patterns
**Consistent button layouts for all interactive pages:**

```tsx
function ActionButtons({ isPrimaryAction, onPrimary, onSecondary, currentItem, totalItems }: ActionProps) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      <button
        onClick={onSecondary}
        className="btn-secondary px-6 py-3 rounded-lg font-medium transition-all duration-200"
      >
        Secondary Action
      </button>
      <button
        onClick={onPrimary}
        disabled={currentItem >= totalItems}
        className="btn-primary px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Primary Action
      </button>
    </div>
  )
}
```

#### Content Display Standards
**Typography and layout for learning content:**

```tsx
// Main content display (sentences, questions, etc.)
<div className="mb-8 text-left">
  <h2 className="text-3xl font-light text-foreground leading-relaxed mb-4">
    {mainContent}
  </h2>
</div>

// Input areas
<div className="mb-6">
  <textarea
    className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono"
  />
</div>
```

#### Sentence Display
- **Font**: Primary system font
- **Size**: Responsive (1.5rem mobile, 1.875rem desktop)
- **Weight**: Light (300) for easy reading
- **Alignment**: Center-aligned
- **Color**: Primary text color (95% lightness)
- **Line Height**: 1.6 for comfortable reading

#### Translation Input
- **Font**: Monospace (JetBrains Mono)
- **Background**: Surface color (15% lightness)
- **Border**: 2px solid default border color
- **Focus State**: Primary color border with subtle shadow
- **Padding**: 1rem for comfortable typing area

#### Action Buttons
- **Style**: Consistent border radius (0.75rem)
- **Spacing**: Side-by-side layout (Skip + Next)
- **Colors**: Primary and secondary button styles
- **Hover States**: Subtle background color shifts

### Filter System

#### Inline Filter Layout
- **Position**: Above practice box, same width
- **Background**: Card color (15% lightness)
- **Borders**: Removed for clean appearance
- **Styling**: Matches practice box appearance

#### Filter Controls
- **Dropdowns**: Dark backgrounds with light text
- **Focus States**: Primary color borders
- **Options**: Consistent with theme colors

### Navigation

#### Sidebar Design
- **Background**: Gradient from surface to primary (subtle depth)
- **Width**: Fixed for consistency
- **Items**: Rounded rectangles with hover states
- **Active State**: Primary color background
- **Typography**: Regular weight with medium for active items

---

## Interactive States

### Button States
1. **Default**: Surface background, border, primary text
2. **Hover**: Darker background, emphasized border
3. **Focus**: Outline ring in primary color
4. **Active**: Primary background, white text

### Input States
1. **Default**: Surface background, default border
2. **Focus**: Primary border, elevated background, subtle shadow
3. **Error**: Red border and background tint
4. **Success**: Green border and background tint

### Card States
1. **Default**: Surface background, subtle border, minimal shadow
2. **Hover**: Emphasized border, increased shadow

---

## Critical Implementation Rules

### ⚠️ MANDATORY WIDTH ALIGNMENT
**All pages MUST follow these width alignment rules:**

1. **Filter/Control Components**: `max-w-4xl mx-auto w-full`
2. **Main Content Containers**: `max-w-4xl mx-auto w-full` (NO left padding)
3. **Consistent Edge Alignment**: All components must align perfectly edge-to-edge

### ⚠️ RESPONSIVE DESIGN REQUIREMENTS
**Every page MUST implement mobile-first responsive design:**

1. **Breakpoint Usage**: Use `md:` prefix for tablet/desktop (768px+)
2. **Sidebar Visibility**: `hidden md:flex` for desktop-only sidebar
3. **Responsive Padding**: `p-4 md:p-6` for main content areas
4. **Responsive Typography**: `text-xl md:text-2xl` for headings

### ⚠️ UNIFIED HEADER COMPLIANCE
**Every page MUST use the exact unified header structure:**

1. **Desktop Logo Section**: `w-64 px-6 py-4 border-r border-border hidden md:flex`
2. **Mobile Logo Section**: `md:hidden px-4 py-4 flex items-center`
3. **Page Title Section**: `flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12`
4. **Action Section**: `px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4`

### ⚠️ COMPONENT SPACING STANDARDS
**Consistent spacing across all pages:**

1. **Section Spacing**: `mb-6` between major sections
2. **Component Padding**: `p-4 md:p-8` for card content
3. **Button Spacing**: `gap-4` for action button groups
4. **Stats Layout**: `gap-4 md:gap-0` for responsive stat displays

---

## Implementation Checklist

### New Page Creation Checklist
When creating any new page, verify:

- [ ] Uses unified header structure with exact class names
- [ ] Implements responsive sidebar (`hidden md:flex w-64`)
- [ ] Main content uses responsive padding (`p-4 md:p-6`)
- [ ] All content containers use `max-w-4xl mx-auto w-full`
- [ ] NO left padding on main content containers
- [ ] Stats use responsive layout (`flex flex-col md:flex-row`)
- [ ] Filter components align with content width
- [ ] Mobile-first responsive design throughout
- [ ] Consistent spacing using established patterns
- [ ] Typography follows size and weight hierarchy

### Component Integration Checklist
When adding components to existing pages:

- [ ] Component width matches page content width
- [ ] Responsive behavior matches page patterns
- [ ] Spacing consistent with page standards
- [ ] Color scheme follows dark theme guidelines
- [ ] Interactive states properly implemented
- [ ] Focus management for accessibility

---

### Color Contrast
- **Primary Text**: 95% lightness on 8% background = 21:1 ratio (WCAG AAA)
- **Secondary Text**: 85% lightness on 9% background = 15:1 ratio (WCAG AAA)
- **Interactive Elements**: Minimum 4.5:1 contrast ratio maintained

### Focus Management
- **Visible Focus**: 2px outline rings in primary color
- **Keyboard Navigation**: Logical tab order through components
- **Screen Reader**: Semantic HTML structure

### Typography
- **Minimum Size**: 16px base font size
- **Line Height**: 1.6 for comfortable reading
- **Font Choices**: System fonts for maximum compatibility

---

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Desktop**: ≥ 768px

### Adaptive Elements
- **Sentence Display**: Larger text on desktop
- **Sidebar**: Collapsible on mobile (if implemented)
- **Spacing**: Consistent across breakpoints using CSS variables

---

## Animation & Transitions

### Transition Speeds
```css
--transition-fast: 0.15s ease;     /* Quick interactions */
--transition-normal: 0.2s ease;    /* Standard transitions */
--transition-slow: 0.3s ease;      /* Smooth animations */
```

### Usage Guidelines
- **Button Hovers**: Fast transitions (0.15s)
- **Background Changes**: Normal transitions (0.2s)
- **Layout Shifts**: Slow transitions (0.3s)

---

## Implementation Guidelines

### CSS Architecture
- **CSS Variables**: All colors and spacing defined as variables
- **Tailwind Integration**: CSS variables mapped to Tailwind utilities
- **Component Classes**: Specific classes for complex components
- **Utility First**: Tailwind utilities for spacing and layout

### Color Implementation
```css
/* Always use CSS variables for colors */
background: hsl(var(--background));
color: hsl(var(--foreground));

/* Never use hardcoded hex values in components */
/* ❌ background: #1a1a1c; */
/* ✅ background: hsl(var(--card)); */
```

### Spacing Implementation
```css
/* Use spacing variables consistently */
padding: var(--spacing-md);
margin: var(--spacing-lg);

/* Avoid arbitrary values */
/* ❌ padding: 17px; */
/* ✅ padding: var(--spacing-md); */
```

---

## Future Considerations

### Potential Enhancements
- **Light Mode**: Alternative color scheme with inverted values
- **Accent Colors**: Language-specific color themes
- **Animation Library**: Enhanced micro-interactions
- **Custom Components**: Specialized learning interface elements

### Maintenance Notes
- **Color Updates**: Always update CSS variables, never individual components
- **Consistency**: New components should follow established patterns
- **Testing**: Verify contrast ratios when adding new colors
- **Documentation**: Update this document when making significant changes

---

## Quick Reference

### Most Common Values
- **Background**: `hsl(220 13% 8%)` - Main content
- **Sidebar**: `hsl(220 8% 9%)` - Navigation
- **Cards**: `hsl(220 8% 15%)` - Components
- **Text**: `hsl(220 8% 95%)` - Primary
- **Border Radius**: `0.75rem` - Standard
- **Transition**: `0.2s ease` - Standard

### Color Lightness Scale
- **8%**: Main background (deepest)
- **9%**: Sidebar/header
- **15%**: Cards and elevated elements
- **25%**: Interactive hover states
- **40%**: Primary buttons and accents
- **85%**: Secondary text
- **95%**: Primary text (lightest)

This design system ensures consistency, accessibility, and maintainability across the entire AIdioma v2 application.

---

## 🐛 UI/UX Debugging Guide

### Common Issues & Solutions

This section documents the UI/UX issues we encountered during development and their solutions to prevent future occurrences.

#### **Color System Issues**

**Problem**: Inconsistent color application and hardcoded values
- **Symptoms**: Components not respecting theme colors, mixed color formats (hex vs HSL)
- **Root Cause**: Using hardcoded color values instead of CSS variables
- **Solution**: Always use CSS variables for all colors
```css
/* ❌ Incorrect - hardcoded values */
background: #1a1a1c;
color: #ffffff;

/* ✅ Correct - CSS variables */
background: hsl(var(--card));
color: hsl(var(--foreground));
```

**Problem**: Color contrast and theme inconsistencies
- **Symptoms**: Sidebar/header too light or too dark, poor text readability
- **Root Cause**: Incorrect lightness values in HSL color system
- **Solution**: Follow established lightness scale (8% → 9% → 15% → 25% → 85% → 95%)

#### **Layout & Positioning Issues**

**Problem**: Filter positioning conflicts
- **Symptoms**: Overlapping elements, fixed positioning issues, inconsistent widths
- **Root Cause**: Using fixed positioning without proper container management
- **Solution**: Use inline flow layout with consistent widths
```tsx
/* ❌ Problematic fixed positioning */
<div className="fixed top-0 left-0 z-50">

/* ✅ Inline flow positioning */
<div className="w-full max-w-4xl mx-auto mb-6">
```

**Problem**: Component width inconsistencies
- **Symptoms**: Filters not matching practice box width, misaligned elements
- **Root Cause**: Different container constraints and max-width values
- **Solution**: Use consistent container classes and width constraints
```tsx
/* ✅ Consistent container pattern */
<div className="w-full max-w-4xl mx-auto">
  <FilterComponent />
  <PracticeBox />
</div>
```

#### **Border & Styling Issues**

**Problem**: Unwanted white borders and separation lines
- **Symptoms**: White lines appearing between components, inconsistent border styles
- **Root Cause**: Default browser styles and inconsistent border removal
- **Solution**: Explicitly remove borders and use consistent border colors
```css
/* ✅ Consistent border removal */
border: none;
border-color: transparent;

/* ✅ When borders are needed, use theme colors */
border: 1px solid hsl(var(--border));
```

#### **Typography Issues**

**Problem**: Font weight and family inconsistencies
- **Symptoms**: Different fonts appearing across components, weight variations
- **Root Cause**: Missing font-family declarations, inconsistent font loading
- **Solution**: Always specify font-family using CSS variables
```css
/* ✅ Consistent font usage */
font-family: var(--font-primary);
font-weight: 400; /* Use specific weights, not relative */
```

### **Debugging Workflow**

#### **1. Color Debugging**
```bash
# Check CSS variable values in browser DevTools
getComputedStyle(document.documentElement).getPropertyValue('--muted')

# Verify color contrast ratios
# Use browser accessibility tools or online contrast checkers
```

#### **2. Layout Debugging**
```css
/* Temporary debugging borders */
* {
  outline: 1px solid red !important;
}

/* Check specific component containers */
.debug-container {
  border: 2px solid yellow !important;
  background: rgba(255, 0, 0, 0.1) !important;
}
```

#### **3. Responsive Debugging**
```css
/* Check breakpoint behavior */
@media (max-width: 767px) {
  .debug-mobile {
    background: rgba(0, 255, 0, 0.2) !important;
  }
}

@media (min-width: 768px) {
  .debug-desktop {
    background: rgba(0, 0, 255, 0.2) !important;
  }
}
```

### **Issue Prevention Checklist**

#### **Before Making Changes**
- [ ] Check current CSS variable values
- [ ] Identify which components will be affected
- [ ] Test on both mobile and desktop
- [ ] Verify color contrast ratios

#### **During Development**
- [ ] Use CSS variables for all colors
- [ ] Follow established spacing system
- [ ] Test component interactions
- [ ] Check HMR updates work correctly

#### **After Changes**
- [ ] Verify no white borders/lines appear
- [ ] Check text readability on all backgrounds
- [ ] Test responsive behavior
- [ ] Document any new patterns used

### **Common Anti-Patterns**

#### **❌ Avoid These Patterns**
```tsx
// Hardcoded colors
style={{ backgroundColor: '#1a1a1c' }}

// Fixed positioning without context
className="fixed top-0 left-0"

// Arbitrary spacing values
style={{ padding: '17px' }}

// Mixing color formats
background: '#111' // instead of hsl(var(--card))

// Relative font weights
font-weight: 'lighter' // instead of specific weights
```

#### **✅ Preferred Patterns**
```tsx
// CSS variables for colors
className="bg-card text-card-foreground"

// Semantic positioning
className="w-full max-w-4xl mx-auto"

// Spacing system
className="p-4" // or padding: var(--spacing-md)

// Consistent color format
background: hsl(var(--muted))

// Specific font weights
font-weight: 300 // or 400, 500
```

### **Testing Procedures**

---

## 🚨 **UI/UX Troubleshooting Guide**

### **Common Spacing Issues**

#### **Problem: Excessive top spacing on page content**
**Symptoms**: Large gap between header and first content element
**Root Cause**: Using outdated `pt-8 md:pt-12` or `pt-12 md:pt-16` values
**Solution**: Update to standard `pt-6 md:pt-8`

```tsx
// ❌ WRONG: Excessive spacing
<div className="flex-1 flex flex-col p-4 md:p-6 pt-8 md:pt-12 bg-background">
<div className="flex-1 flex flex-col p-4 md:p-6 pt-12 md:pt-16 bg-background">

// ✅ CORRECT: Standard spacing
<div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
```

#### **Problem: Chat interface with fixed height causing spacing gaps**
**Symptoms**: Awkward empty space in middle of chat interface
**Root Cause**: Using fixed height values like `h-[600px]` instead of flexible layout
**Solution**: Use `flex-1` for dynamic height

```tsx
// ❌ WRONG: Fixed height
<div className="flex flex-col h-[600px] card">

// ✅ CORRECT: Flexible height
<div className="flex flex-col flex-1 card">
```

#### **Problem: Inconsistent component spacing across pages**
**Symptoms**: Different visual spacing between similar components on different pages
**Root Cause**: Not using shared components or inconsistent padding values
**Solution**: Always use shared components and standard spacing

### **Layout Troubleshooting**

#### **Header/Sidebar Overlap Issues**
**Symptoms**: Content appearing behind fixed header or sidebar
**Solution**: Ensure proper clearance classes

```tsx
// ✅ CORRECT: Proper clearance
<div className="flex flex-1 pt-16">  {/* Header clearance */}
  <SharedSidebar currentUser={currentUser} />
  <main className="flex-1 flex flex-col md:ml-64">  {/* Sidebar clearance */}
```

#### **Mobile Responsiveness Issues**
**Symptoms**: Poor layout on mobile devices
**Solution**: Use proper responsive patterns

```tsx
// ✅ CORRECT: Mobile-first responsive design
<div className="px-4 md:px-6 py-4">  {/* Responsive padding */}
<div className="hidden md:flex">  {/* Desktop only */}
<div className="md:hidden">  {/* Mobile only */}
```

### **Component Consistency Issues**

#### **Problem: Duplicate navigation instead of shared component**
**Symptoms**: Inconsistent styling or behavior across pages
**Solution**: Always use SharedSidebar component

```tsx
// ❌ WRONG: Inline navigation
<aside className="hidden md:flex w-64...">
  {/* Custom navigation code */}
</aside>

// ✅ CORRECT: Shared component
import SharedSidebar from '../components/Sidebar'
<SharedSidebar currentUser={currentUser} />
```

#### **Problem: Button styling inconsistencies**
**Symptoms**: Different button sizes, colors, or hover states
**Solution**: Follow ActionButtons component standards

```tsx
// ✅ CORRECT: Standard button styling
className="px-6 py-3 bg-muted text-gray-400 rounded-lg font-medium hover:text-gray-300 hover:bg-accent"
```

### **Visual Hierarchy Issues**

#### **Problem: Oversized header elements**
**Symptoms**: Header text or badges too large, overwhelming the interface
**Solution**: Follow header size constraints

```tsx
// ❌ WRONG: Oversized elements
<h1 className="text-4xl font-bold">  // Too large
<div className="px-6 py-3 text-lg">  // Badge too large

// ✅ CORRECT: Proper sizing
<h1 className="text-xl md:text-2xl font-semibold">  // Header
<div className="px-2 md:px-3 py-1 text-xs">  // Badge
```

### **Quick Fix Checklist**

When experiencing layout issues, check these items:

1. **✅ Spacing**: Using `pt-6 md:pt-8` for main content
2. **✅ Components**: Using SharedSidebar, not inline navigation
3. **✅ Clearance**: `pt-16` for header, `md:ml-64` for sidebar
4. **✅ Responsive**: Proper mobile/desktop patterns
5. **✅ Heights**: Using `flex-1` instead of fixed heights
6. **✅ Max Width**: `max-w-4xl mx-auto w-full` for content containers

---

## 🛠️ **Debug Testing and Validation**

#### **Color Theme Testing**
1. **Visual Inspection**: Check all components render with correct colors
2. **Contrast Testing**: Verify text readability on all backgrounds
3. **Dark Mode Compliance**: Ensure no light artifacts appear
4. **Browser Compatibility**: Test in Chrome, Firefox, Safari

#### **Layout Testing**
1. **Responsive Testing**: Check mobile (320px) to desktop (1920px)
2. **Component Alignment**: Verify consistent widths and positioning
3. **Overflow Testing**: Check long content doesn't break layouts
4. **Interactive Testing**: Hover states, focus indicators work correctly

#### **Performance Testing**
1. **HMR Verification**: Changes apply without full page refresh
2. **CSS Load Time**: Ensure no FOUC (Flash of Unstyled Content)
3. **Animation Smoothness**: Transitions perform well on low-end devices

### **Documentation Updates**

When making UI/UX changes, always update:
1. **This debugging guide** - Add new issues encountered
2. **Component examples** - Update code samples if patterns change
3. **Color values** - Document any new color additions
4. **Accessibility notes** - Update contrast ratios if changed

### **Emergency Fixes**

If critical UI issues occur in production:
1. **Identify affected components** using browser DevTools
2. **Apply temporary fixes** using CSS custom properties
3. **Test thoroughly** before deploying
4. **Document the fix** in this debugging guide
5. **Plan permanent solution** for next development cycle

This debugging guide should be referenced whenever UI/UX issues arise and updated as new patterns emerge.
