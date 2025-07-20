# Learning Components
## Specialized Components for Language Learning

*Components specifically designed for translation practice, progress tracking, and interactive learning experiences.*

---

## ✍️ **Translation Input Component**

### **Practice Translation Interface**
```typescript
interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  showHintButton?: boolean
  onHintRequest?: () => void
  maxLength?: number
}

export function TranslationInput({
  value,
  onChange,
  onSubmit,
  placeholder = "Type your Spanish translation here...",
  disabled = false,
  showHintButton = false,
  onHintRequest,
  maxLength = 200
}: TranslationInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }
  
  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="
            w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg
            text-white placeholder-gray-400 resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          rows={3}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-500">
          {value.length}/{maxLength}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        {showHintButton && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onHintRequest}
            disabled={disabled}
          >
            💡 Hint
          </Button>
        )}
        
        <Button 
          onClick={onSubmit} 
          disabled={disabled || !value.trim()}
          className="ml-auto"
        >
          Check Translation
        </Button>
      </div>
    </div>
  )
}
```

---

## 🎯 **Action Buttons Component**

### **Standard Learning Page Actions**
```typescript
interface ActionButtonsProps {
  onCheck: () => void
  onNext: () => void
  onHint: () => void
  onReset: () => void
  onBookmark: () => void
  onSkip: () => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  isEvaluated: boolean
  showHint: boolean
  disabled: boolean
  currentParagraph: number
  totalParagraphs: number
}

export function ActionButtons({ 
  onCheck, onNext, onHint, onReset, onBookmark, onSkip, 
  onNavigatePrevious, onNavigateNext, isEvaluated, showHint, 
  disabled, currentParagraph, totalParagraphs 
}: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3">
        {/* Previous Button */}
        <button
          onClick={onNavigatePrevious}
          disabled={currentParagraph === 0}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
          Previous
        </button>

        {/* Check/Reset Button */}
        {!isEvaluated ? (
          <button
            onClick={onCheck}
            disabled={disabled}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Check
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        )}

        {/* Next Button - Primary action with white text */}
        <button
          onClick={onNavigateNext}
          disabled={currentParagraph === totalParagraphs - 1}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-white hover:text-white hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Hint Button */}
        <button
          onClick={onHint}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          {showHint ? 'Hide' : 'Hint'}
        </button>

        {/* Skip/Next Sentence Button */}
        {!isEvaluated ? (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Skip
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Next Sentence
          </button>
        )}

        {/* Bookmark Button */}
        <button
          onClick={onBookmark}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <BookmarkPlus className="w-4 h-4" />
          Bookmark
        </button>
      </div>
    </div>
  )
}
```

---

## 📊 **Score Display Component**

### **Learning Progress Visualization**
```typescript
interface ScoreDisplayProps {
  score: number
  maxScore?: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreDisplay({ score, maxScore = 10, showDetails = false, size = 'md' }: ScoreDisplayProps) {
  const percentage = (score / maxScore) * 100
  
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-400'
    if (score >= 6) return 'text-yellow-400'
    if (score >= 4) return 'text-orange-400'
    return 'text-red-400'
  }
  
  const getScoreEmoji = (score: number) => {
    if (score >= 9) return '🎉'
    if (score >= 8) return '✨'
    if (score >= 6) return '👍'
    if (score >= 4) return '📚'
    return '💪'
  }
  
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  }
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-2xl">{getScoreEmoji(score)}</span>
      <span className={`font-bold ${getScoreColor(score)} ${sizeClasses[size]}`}>
        {score.toFixed(1)}/{maxScore}
      </span>
      {showDetails && (
        <div className="ml-4 text-sm text-gray-400">
          ({percentage.toFixed(0)}%)
        </div>
      )}
    </div>
  )
}
```

---

## 📈 **Progress Bar Component**

### **Learning Progress Indicator**
```typescript
interface ProgressBarProps {
  current: number
  total: number
  label?: string
  showNumbers?: boolean
  className?: string
}

export function ProgressBar({ current, total, label, showNumbers = true, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100)
  
  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showNumbers) && (
        <div className="flex justify-between text-sm text-gray-400">
          {label && <span>{label}</span>}
          {showNumbers && <span>{current}/{total}</span>}
        </div>
      )}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 🎯 **Component Standards**

### **Learning Flow Patterns**
- **Action Button Order**: Previous, Check, Next, Hint, Skip, Bookmark
- **Primary Action**: Next button uses `text-white`, all others use `text-gray-400`
- **Button Sizing**: All action buttons use `px-6 py-3` for consistency
- **Spacing**: `gap-3` between buttons for optimal touch targets

### **Progress Visualization**
- **Score Colors**: Green (8+), Yellow (6-7), Orange (4-5), Red (<4)
- **Progress Animations**: Use smooth transitions for visual feedback
- **Emoji Feedback**: Contextual emojis enhance engagement
- **Accessibility**: Ensure color information has text alternatives 