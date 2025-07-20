# Component Library v2.0
## Reusable Component Architecture for AIdioma

*Comprehensive component library based on Practice Page v2.0 refinements, featuring standardized patterns with 64% reusability across 6 pages and 12 modules.*

---

## 🏗️ **Component Architecture**

### **Design Philosophy**
- **Module-First**: Components serve multiple pages/modules with standardized APIs
- **Fixed Header Layout**: Left-aligned logo with proper spacing patterns
- **Button System**: Two-row layout with green primary actions
- **Progress Cards**: Individual cards with clean progress bars
- **Accessibility**: WCAG AA compliance with 44px minimum touch targets
- **Performance**: <100ms UI interactions, optimized rendering

### **Component Categories**

| Category | File | Purpose | Usage |
|----------|------|---------|-------|
| **[Core UI](./components/core-ui.md)** | Basic building blocks | Button, Input, Card, Logo | All pages |
| **[Learning Components](./components/learning-components.md)** | Language learning specific | ActionButtons, InteractiveSentence, TranslationInput | Practice, Reading, Conversation |
| **[Analytics Components](./components/analytics-components.md)** | Progress & statistics | ProgressCard, HealthBar, ProgressWheels | All pages with metrics |

---

## 🎨 **Design System Standards v2.0**

### **Color System**
```css
/* Primary Actions */
--green-600: #16a34a;      /* Main action buttons */
--green-700: #15803d;      /* Hover states */

/* Backgrounds */
--muted: hsl(var(--muted));           /* Secondary elements, cards */
--background: hsl(var(--background)); /* Main content areas */
--input: hsl(var(--input));           /* Form elements */

/* Interactive States */
--correct: #16a34a;    /* text-green-600 */
--close: #ea580c;      /* text-orange-600 */
--wrong: #dc2626;      /* text-red-600 */

/* Text Colors */
--foreground: hsl(var(--foreground));           /* Primary text */
--muted-foreground: hsl(var(--muted-foreground)); /* Secondary text */
```

### **Spacing Standards**
```css
/* Layout Offsets */
--header-offset: 4rem;      /* pt-16 - Main content offset */
--filter-spacing: 2rem;     /* pt-8 - Filter section */
--sidebar-spacing: 3rem;    /* pt-12 - Sidebar navigation */

/* Component Spacing */
--section-spacing: 1rem;    /* mb-4 - Between sections */
--button-primary-gap: 1.25rem;  /* gap-5 - Primary buttons */
--button-secondary-gap: 0.75rem; /* gap-3 - Secondary buttons */
```

### **Component Standards**
- **Button Layout**: Two-row ActionButtons pattern mandatory
- **Main Action**: Green circular button (`bg-green-600`)
- **Navigation**: Large transparent arrows (`w-11 h-11`)
- **Secondary**: Muted background matching inputs (`bg-muted`)
- **Icon Library**: `lucide-react` exclusively
- **Touch Targets**: 44px minimum for accessibility

---

## 🎯 **Core Component Patterns**

### **ActionButtons Component (Mandatory)**
```typescript
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

export function ActionButtons({ 
  isEvaluated: _isEvaluated,
  userTranslation, 
  onSubmit, 
  onSkip, 
  onNext: _onNext, 
  onHint, 
  onBookmark, 
  onNavigatePrevious, 
  onNavigateNext, 
  showHint: _showHint, 
  currentSentence, 
  totalSentences,
  className = ''
}: ActionButtonsProps) {
  const canSubmit = userTranslation.trim().length > 0

  return (
    <div className={`space-y-4 w-full max-w-lg mx-auto ${className}`}>
      {/* PRIMARY ROW - Navigation + Main Action */}
      <div className="flex items-center justify-center gap-5 w-full">
        {/* Previous Button - Large Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigatePrevious}
          disabled={currentSentence <= 1}
          className="flex items-center justify-center p-3 h-14 w-14"
        >
          <ChevronUp className="w-11 h-11" />
        </Button>

        {/* Main Action - Green Circle */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-6 h-6" />
        </Button>

        {/* Next Button - Large Arrow */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateNext}
          disabled={currentSentence >= totalSentences}
          className="flex items-center justify-center p-3 h-14 w-14"
        >
          <ChevronDown className="w-11 h-11" />
        </Button>
      </div>

      {/* SECONDARY ROW - Helper Actions */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onHint}
          className="flex items-center gap-1 px-3 py-2 text-sm h-9 bg-muted hover:bg-muted/80"
        >
          <Lightbulb className="w-4 h-4" />
          Hint
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="flex items-center gap-1 px-3 py-2 text-sm h-9 bg-muted hover:bg-muted/80"
        >
          <RotateCcw className="w-4 h-4" />
          Skip
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBookmark}
          className="flex items-center gap-1 px-3 py-2 text-sm h-9 bg-muted hover:bg-muted/80"
        >
          <BookmarkPlus className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  )
}
```

**Key Requirements:**
- **Mandatory two-row layout** for all pages
- **gap-5 spacing** for primary buttons (20px)
- **gap-3 spacing** for secondary buttons (12px)
- **Green circular** main action button
- **Large transparent** navigation arrows
- **Muted background** for secondary actions

---

### **Logo Component**
```typescript
interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: {
      icon: 'w-6 h-6',
      container: 'w-8 h-8',
      text: 'text-lg'
    },
    md: {
      icon: 'w-6 h-6',
      container: 'w-10 h-10',
      text: 'text-2xl'
    },
    lg: {
      icon: 'w-8 h-8',
      container: 'w-12 h-12',
      text: 'text-3xl'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizes.container} bg-primary rounded-lg flex items-center justify-center`}>
        <BookOpen className={`${sizes.icon} text-primary-foreground`} />
      </div>
      {showText && (
        <div>
          <h1 className={`${sizes.text} font-normal text-foreground`}>AIdioma</h1>
        </div>
      )}
    </div>
  )
}
```

**Usage:**
- **Header desktop:** `<Logo size="md" showText={true} />`
- **Header mobile:** `<Logo size="sm" showText={true} />`
- **Large display:** `<Logo size="lg" showText={false} />`

---

### **ProgressCard Component**
```typescript
interface ProgressCardProps {
  title: string
  value: number // Percentage 0-100
  color?: 'green' | 'orange' | 'red' | 'primary'
  className?: string
}

export function ProgressCard({ title, value, color = 'primary', className = '' }: ProgressCardProps) {
  const colorClasses = {
    green: 'bg-green-600',
    orange: 'bg-orange-500', 
    red: 'bg-red-600',
    primary: 'bg-primary'
  }

  return (
    <div className={`mb-4 max-w-4xl mx-auto w-full ${className}`}>
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground">{title}</span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
            style={{ width: `${Math.min(100, Math.max(10, value))}%` }}
          />
        </div>
      </div>
    </div>
  )
}
```

**Key Features:**
- **Individual cards** for each progress type
- **Clean progress bars** without right-side text
- **Color-coded** progress indicators
- **Consistent spacing** with mb-4

---

### **InteractiveSentence Component**
```typescript
interface InteractiveSentenceProps {
  sentence: string
  onWordClick?: (word: string) => void
  wordEvaluations?: Map<string, WordEvaluation>
  className?: string
}

interface WordEvaluation {
  word: string
  status: 'correct' | 'close' | 'wrong' | 'unknown'
  confidence: number
}

export function InteractiveSentence({ 
  sentence, 
  onWordClick, 
  wordEvaluations = new Map(),
  className = '' 
}: InteractiveSentenceProps) {
  const getWordColor = (status?: string) => {
    switch (status) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200'
      case 'close': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'wrong': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-foreground hover:bg-muted/50'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'correct': return <CheckCircle className="w-3 h-3 ml-1" />
      case 'close': return <AlertCircle className="w-3 h-3 ml-1" />
      case 'wrong': return <X className="w-3 h-3 ml-1" />
      default: return null
    }
  }

  const renderWord = (word: string, index: number) => {
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    const punctuation = word.slice(cleanWord.length)
    const evaluation = wordEvaluations.get(cleanWord)
    
    return (
      <span
        key={index}
        className={`
          inline-flex items-center px-1 py-0.5 rounded cursor-pointer 
          transition-all duration-200 hover:scale-105 border border-transparent
          ${getWordColor(evaluation?.status)}
        `}
        onClick={() => onWordClick?.(cleanWord)}
      >
        {cleanWord}
        {evaluation && getStatusIcon(evaluation.status)}
        {punctuation}
      </span>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div className="text-lg font-medium text-foreground mb-4 leading-relaxed">
        {sentence.split(' ').map(renderWord)}
      </div>
    </div>
  )
}
```

**Key Features:**
- **Clickable words** with visual feedback
- **Color-coded evaluation** states
- **Hover effects** with scale transformation
- **Status icons** for immediate feedback

---

## 📋 **Layout Components**

### **Fixed Header Pattern**
```typescript
export function HeaderLayout({ pageTitle, children }: { pageTitle: string, children: React.ReactNode }) {
  return (
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
      
      {children}
    </div>
  )
}
```

### **Main Content Pattern**
```typescript
export function MainContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col md:ml-64">
      <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
        {children}
      </div>
    </main>
  )
}
```

---

## 🎨 **Form Components**

### **TranslationInput Component**
```typescript
interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TranslationInput({
  value,
  onChange,
  placeholder = "Type your Spanish translation here...",
  disabled = false,
  className = ''
}: TranslationInputProps) {
  return (
    <div className={`space-y-3 pb-2 ${className}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
      />
    </div>
  )
}
```

**Key Requirements:**
- **Muted background** matching secondary buttons
- **Proper focus states** with ring
- **No resize** capability
- **Consistent padding** and border radius

---

## ✅ **Implementation Guidelines**

### **Component Usage Rules**
1. **ActionButtons:** MUST use two-row layout on all pages
2. **Logo:** MUST be left-aligned in headers
3. **ProgressCard:** Use individual cards, not combined bars
4. **Colors:** Use design system tokens exclusively
5. **Icons:** lucide-react library only
6. **Spacing:** Follow pt-8/pt-12/mb-4 patterns

### **Performance Standards**
- **Reusability:** 64% component reuse across pages
- **Bundle Size:** <10KB additions preferred
- **Accessibility:** 44px minimum touch targets
- **TypeScript:** Zero `any` types allowed

### **Quality Checklist**
- [ ] Uses design system colors and spacing
- [ ] Follows ActionButtons pattern
- [ ] Implements proper accessibility
- [ ] Includes responsive breakpoints
- [ ] Passes TypeScript strict checks

This component library provides the foundation for consistent, accessible, and performant UI development across all AIdioma pages.