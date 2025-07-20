# AIdioma UI Patterns v2.0

## Overview

This document defines the specific UI patterns established through the Practice Page refinements. These patterns are MANDATORY across all pages to ensure design consistency and optimal user experience.

---

## Header Pattern

### Fixed Header Layout
```tsx
<header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
  {/* Logo Section - LEFT-ALIGNED */}
  <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-start">
    <Logo size="md" showText={true} />
  </div>
  
  {/* Mobile Logo */}
  <div className="md:hidden px-4 py-4 flex items-center">
    <Logo size="sm" showText={true} />
  </div>
  
  {/* Page Title */}
  <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
    <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
      {pageTitle}
    </h1>
  </div>
  
  {/* Header Actions */}
  <div className="px-4 md:px-6 py-4 flex items-center">
    <ProgressWheels />
  </div>
</header>
```

**Key Requirements:**
- **Fixed positioning** with `top-0 z-50`
- **Logo left-aligned** (not centered)
- **64px width** for logo section
- **Consistent border pattern** with `border-b border-border`

---

## Sidebar Pattern

### Navigation Spacing Alignment
```tsx
<aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col fixed left-0 top-16 bottom-0 z-40">
  {/* Navigation with pt-12 to align with filter box */}
  <nav className="flex-1 p-4 pt-12">
    <ul className="space-y-2">
      {navigationItems.map((item) => (
        <li key={item.path}>
          <button className={`
            w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors
            ${isActive 
              ? 'bg-accent text-accent-foreground font-medium' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }
          `}>
            <Icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </button>
        </li>
      ))}
    </ul>
  </nav>
</aside>
```

**Key Requirements:**
- **pt-12 spacing** to align with filter box
- **64px width** matching logo section
- **Fixed positioning** from top-16 to bottom-0

---

## Main Content Pattern

### Content Layout Structure
```tsx
<main className="flex-1 flex flex-col md:ml-64">
  <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
    
    {/* FILTERS - pt-8 spacing from header */}
    <div className="pt-8 mb-4 max-w-4xl mx-auto w-full">
      <PracticeFilters 
        isOpen={isFiltersOpen}
        onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
      />
    </div>

    {/* MAIN CONTENT - Standardized container */}
    <div className="mb-4 max-w-4xl mx-auto w-full">
      <div className="bg-muted border border-border rounded-lg p-6 md:p-8 space-y-8">
        {/* Page-specific content */}
      </div>
    </div>

    {/* PROGRESS CARDS - Individual cards with mb-4 spacing */}
    <div className="mb-4 max-w-4xl mx-auto w-full">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-foreground">Card Title</span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div className="h-2 rounded-full transition-all duration-300 bg-green-600" 
               style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  </div>
</main>
```

**Key Requirements:**
- **pt-16 offset** for fixed header
- **pt-8 spacing** for filter section
- **max-w-4xl mx-auto** for content containers
- **mb-4 spacing** between major sections

---

## Button Patterns

### ActionButtons Component Pattern
```tsx
<div className="space-y-4 w-full max-w-lg mx-auto">
  {/* PRIMARY ROW - Navigation + Main Action */}
  <div className="flex items-center justify-center gap-5 w-full">
    {/* Previous Button */}
    <Button
      variant="ghost"
      size="sm"
      onClick={onNavigatePrevious}
      disabled={currentSentence <= 1}
      className="flex items-center justify-center p-3 h-14 w-14"
    >
      <ChevronUp className="w-11 h-11" />
    </Button>

    {/* Main Action Button */}
    <Button
      onClick={onSubmit}
      disabled={!canSubmit}
      className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white"
    >
      <Check className="w-6 h-6" />
    </Button>

    {/* Next Button */}
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
```

**Key Requirements:**
- **Two-row layout** with primary and secondary actions
- **gap-5** for primary buttons (20px spacing)
- **gap-3** for secondary buttons (12px spacing)
- **Green circular** main action button
- **Large transparent** navigation arrows
- **Muted background** for secondary actions

---

## Progress Card Pattern

### Individual Progress Cards
```tsx
{/* Translation Health Card */}
<div className="mb-4 max-w-4xl mx-auto w-full">
  <div className="p-4 bg-muted rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-foreground">Translation Health</span>
    </div>
    <div className="w-full bg-background rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          correctCount > incorrectCount * 2 ? 'bg-green-600' :
          correctCount > incorrectCount ? 'bg-orange-500' : 'bg-red-600'
        }`}
        style={{ 
          width: `${Math.min(100, Math.max(10, (correctCount / (correctCount + incorrectCount)) * 100))}%` 
        }}
      />
    </div>
  </div>
</div>

{/* Translation Statistics Card */}
<div className="mb-4 max-w-4xl mx-auto w-full">
  <div className="p-4 bg-muted rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-foreground">Translation Statistics</span>
    </div>
    <div className="w-full bg-background rounded-full h-2">
      <div
        className="bg-green-600 h-2 rounded-full transition-all duration-300"
        style={{ 
          width: `${Math.min(100, Math.max(10, (correctCount / (correctCount + incorrectCount)) * 100))}%` 
        }}
      />
    </div>
  </div>
</div>

{/* Session Progress Card */}
<div className="mb-4 max-w-4xl mx-auto w-full">
  <div className="p-4 bg-muted rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs text-foreground">Session Progress</span>
    </div>
    <div className="w-full bg-background rounded-full h-2">
      <div
        className="bg-primary h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentSentence / totalSentences) * 100}%` }}
      />
    </div>
  </div>
</div>
```

**Key Requirements:**
- **Individual cards** for each progress type
- **Clean progress bars** without right-side text
- **Consistent spacing** with mb-4
- **Color-coded progress** (green/orange/red for health)

---

## Interactive Elements Pattern

### Clickable Words with Feedback
```tsx
const InteractiveSentence = ({ sentence }: { sentence: string }) => {
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)

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
        onClick={() => handleWordClick(cleanWord)}
      >
        {cleanWord}
        {evaluation && getStatusIcon(evaluation.status)}
        {punctuation}
      </span>
    )
  }

  return (
    <div className="relative">
      <div className="text-lg font-medium text-foreground mb-4 leading-relaxed">
        {sentence.split(' ').map(renderWord)}
      </div>
      
      {/* Hint Popup */}
      {activeHint && (
        <div className="absolute top-full left-0 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg z-10 max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">HINT</span>
            <button onClick={() => setActiveHint(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-sm text-popover-foreground">{activeHint.content}</p>
        </div>
      )}
    </div>
  )
}
```

**Key Requirements:**
- **Color-coded feedback** (green/orange/red)
- **Hover effects** with scale transformation
- **Status icons** for immediate feedback
- **Popup hints** with proper positioning

---

## Input Pattern

### Translation Input Field
```tsx
<div className="space-y-3 pb-2">
  <textarea
    value={userTranslation}
    onChange={(e) => setUserTranslation(e.target.value)}
    placeholder="Type your Spanish translation here..."
    className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
  />
</div>
```

**Key Requirements:**
- **Muted background** matching secondary buttons
- **Proper focus states** with ring
- **Consistent padding** and border radius
- **No resize** capability

---

## Filter Pattern

### Collapsible Filter Section
```tsx
const PracticeFilters = ({ isOpen, onToggle }: PracticeFiltersProps) => {
  return (
    <div className="bg-muted border border-border rounded-lg p-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Practice Filters</span>
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div className="mt-4 space-y-3">
          {/* Filter content */}
        </div>
      )}
    </div>
  )
}
```

**Key Requirements:**
- **Collapsible design** with smooth transitions
- **Muted background** consistency
- **Icon rotation** for state indication

---

## Spacing Standards Summary

### Vertical Spacing Scale
```css
/* Between major sections */
.mb-4    /* 16px - Standard section spacing */
.mb-6    /* 24px - Larger section spacing */
.mb-8    /* 32px - Page section spacing */

/* Header offsets */
.pt-16   /* 64px - Main content offset for fixed header */
.pt-8    /* 32px - Filter section spacing */
.pt-12   /* 48px - Sidebar navigation spacing */

/* Button spacing */
.gap-5   /* 20px - Primary button row spacing */
.gap-3   /* 12px - Secondary button row spacing */
.space-y-4 /* 16px - Vertical button group spacing */
```

### Content Containers
```css
/* Standard content width */
.max-w-4xl.mx-auto.w-full  /* 1024px max, centered */

/* Content padding */
.p-4     /* 16px - Mobile */
.p-6     /* 24px - Desktop */
.p-8     /* 32px - Large content areas */
```

---

## Implementation Requirements

### Mandatory Patterns
1. **Fixed header** with left-aligned logo
2. **pt-8 filter spacing** from header
3. **pt-12 sidebar spacing** to align with filters
4. **ActionButtons two-row layout** with correct spacing
5. **Individual progress cards** with clean bars
6. **Muted backgrounds** for secondary elements
7. **Interactive sentence display** with color feedback
8. **max-w-4xl centered containers** for content

### Accessibility Requirements
1. **44px minimum touch targets** for all buttons
2. **Keyboard navigation** support
3. **Screen reader** compatible markup
4. **High contrast** color combinations
5. **Focus indicators** for all interactive elements

### Performance Requirements
1. **Hardware-accelerated** transitions
2. **Optimized hover effects** with transform
3. **Efficient re-renders** for interactive elements
4. **Minimal layout shifts** during interactions

---

This UI pattern guide ensures consistent implementation across all AIdioma pages. Every new page MUST follow these patterns to maintain design coherence and optimal user experience.
