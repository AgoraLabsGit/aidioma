# Learning Components v2.0
## Specialized Components for Language Learning

*Components specifically designed for translation practice, progress tracking, and interactive learning experiences based on Practice Page v2.0 refinements.*

**🚀 NEW**: Enhanced with **[Dynamic Translation UI](../dynamic-translation-ui.md)** features including real-time health visualization, intelligent auto-hints, and space-bar optimized API calls.

---

## 🎯 **ActionButtons Component (MANDATORY PATTERN)**

### **Two-Row Layout Standard**
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
        {/* Previous Button - Large Arrow Icon */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigatePrevious}
          disabled={currentSentence <= 1}
          className="flex items-center justify-center p-3 h-14 w-14"
        >
          <ChevronUp className="w-11 h-11" />
        </Button>

        {/* Main Check Button - Green Circle with Check Icon */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-6 h-6" />
        </Button>

        {/* Next Button - Large Arrow Icon */}
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

**MANDATORY Requirements:**
- **Two-row layout**: Primary navigation + secondary actions
- **gap-5 spacing**: 20px between primary buttons
- **gap-3 spacing**: 12px between secondary buttons
- **Green circular main**: `bg-green-600` with check icon
- **Large arrows**: `w-11 h-11` navigation icons
- **Muted secondary**: `bg-muted` matching input fields
- **Icon library**: `lucide-react` exclusively

**Usage on ALL pages:**
- Practice: Translation checking and navigation
- Reading: Paragraph progression
- Conversation: Turn-based dialogue
- Memorize: Card-based learning

---

## ✍️ **TranslationInput Component**

### **Standardized Input Interface**
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

**Key Standards:**
- **Height**: Fixed `h-20` (80px) for consistency
- **Background**: `bg-input` matching design system
- **Focus**: Ring-2 with proper offset
- **No resize**: `resize-none` for clean layout
- **Padding**: `px-4 py-3` for proper spacing

---

## 🎯 **InteractiveSentence Component**

### **Clickable Word Evaluation**
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

**Interactive Features:**
- **Clickable words**: Individual word evaluation
- **Color coding**: Green/orange/red status indicators
- **Hover effects**: Scale transformation `hover:scale-105`
- **Status icons**: Visual feedback with icons
- **Punctuation**: Preserved but not interactive

---

## 📊 **ProgressCard Component**

### **Individual Progress Tracking**
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

**Design Requirements:**
- **Individual cards**: Separate for each metric
- **Clean bars**: No right-side text/numbers
- **Minimum width**: 10% for visibility
- **Smooth transitions**: 300ms animation
- **Consistent spacing**: `mb-4` between cards

**Usage Examples:**
```tsx
// Session Progress
<ProgressCard title="Session Progress" value={75} color="primary" />

// Translation Health
<ProgressCard title="Translation Health" value={85} color="green" />

// Correct Answers
<ProgressCard title="Correct Answers" value={92} color="green" />
```

---

## 📋 **PracticeFilters Component**

### **Collapsible Filter Interface**
```typescript
interface PracticeFiltersProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export function PracticeFilters({ isOpen, onToggle, className = '' }: PracticeFiltersProps) {
  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg text-foreground hover:bg-muted/80 transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Practice Filters</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-muted border border-border rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter content */}
            <div className="text-sm text-muted-foreground">
              Filter options go here
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Filter Standards:**
- **Collapsible design**: Toggle with chevron rotation
- **Muted background**: `bg-muted` consistency
- **Bordered**: Clean border definition
- **Responsive grid**: Single column mobile, 3 columns desktop
- **Smooth transitions**: Transform and colors

---

## 🎨 **HintBox Component**

### **Contextual Help Display**
```typescript
interface HintBoxProps {
  hint: string
  isVisible: boolean
  onClose?: () => void
  className?: string
}

export function HintBox({ hint, isVisible, onClose, className = '' }: HintBoxProps) {
  if (!isVisible) return null

  return (
    <div className={`mt-4 p-4 bg-muted border border-border rounded-lg ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-foreground mt-0.5" />
          <div className="text-sm text-foreground">
            {hint}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
```

**Hint Standards:**
- **Muted background**: Consistent with other cards
- **Lightbulb icon**: Clear hint indicator
- **Optional close**: Dismissible hints
- **Proper spacing**: Gap-3 for comfortable reading

---

## 🎛️ **Logo Component**

### **Brand Identity Display**
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

**Logo Requirements:**
- **BookOpen icon**: Consistent brand symbol
- **Primary colors**: Design system compliance
- **Scalable sizes**: sm/md/lg variants
- **Optional text**: Flexible display
- **LEFT-ALIGNED**: Never centered in headers

---

## ✅ **Implementation Rules**

### **Mandatory Patterns**
1. **ActionButtons**: Two-row layout on ALL learning pages
2. **ProgressCard**: Individual cards, never combined
3. **TranslationInput**: Fixed height, muted background
4. **InteractiveSentence**: Clickable words with feedback
5. **Logo**: Left-aligned in headers, proper sizing

### **Design Consistency**
- **Colors**: Green primary (`bg-green-600`), muted secondary (`bg-muted`)
- **Spacing**: gap-5 primary, gap-3 secondary, mb-4 sections
- **Icons**: lucide-react library exclusively
- **Touch**: 44px minimum targets for accessibility
- **Transitions**: 200-300ms for smooth interactions

### **Quality Standards**
- **Reusability**: Works across Practice, Reading, Conversation, Memorize
- **Accessibility**: WCAG AA compliance
- **Performance**: <100ms interactions
- **TypeScript**: Zero `any` types
- **Testing**: >90% coverage for critical paths

This learning components library ensures consistent, accessible, and engaging language learning experiences across all AIdioma pages. 