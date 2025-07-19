# Component Library
## UI Component System & Design Guidelines

---

## 🎯 **Overview**

Reusable React components following AIdioma's Strike-inspired dark theme with consistent patterns across all 6 pages.

### **Design Principles**
- **Dark Theme**: Current HSL color system with main content at 8% lightness, sidebar at 9%
- **Minimal UI**: Clean, distraction-free learning environment
- **Amber Accents**: Warnings and highlights use amber instead of red
- *export function StatsBox({ icon: Icon, iconColor, value, label, className = '' }: StatsBoxProps) {
  return (
    <div className={`flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg ${className}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <div>
        <div className="text-base md:text-lg font-semibold text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}**: Touch-friendly with responsive breakpoints
- **Accessibility**: WCAG 2.1 AA compliant with proper contrast

---

## 🎨 **Design System Variables**

### **CSS Custom Properties**
```css
:root {
  /* Current HSL Color System */
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
  --destructive: 0 84% 60%;            /* Red for errors */
  --destructive-foreground: 210 40% 98%; /* Light text on red */
  
  /* Legacy Variables (for reference) */
  --background-primary: #0A0A0B;       /* Almost black */
  --background-surface: #111113;       /* Cards */
  --border-subtle: #1F1F23;            /* Subtle borders */
  --text-primary: #E5E7EB;             /* Light grey text */
  --text-secondary: #A1A1AA;           /* Gray secondary */
  --accent-primary: #374151;           /* Dark gray primary */
  --success: #10B981;                  /* Green for positive */
  --warning: #F59E0B;                  /* Amber warnings */

---

## 🎯 **Component Framework Standards**

### **Coherent UI System**
- **Design System Integrity**: All UI changes must be applied across ALL relevant pages
- **Identical Styling Frameworks**: Components must have consistent interfaces and styling patterns
- **Cross-Page Consistency**: ActionButtons, headers, and navigation must be identical across pages

### **Button Framework Standards**
- **Uniform Sizing**: `px-6 py-3` for all buttons
- **Consistent Spacing**: `gap-3` between buttons
- **Standard Styling**: `rounded-lg`, `font-medium`, `transition-colors`
- **Hover States**: Defined for all interactive elements

### **Color Scheme Guidelines**
- **Primary Text Colors**: `text-gray-400` for most buttons and secondary text
- **Accent Text**: `text-white` for primary actions (Next button only)
- **Hover States**: `hover:text-gray-300` and `hover:text-white`
- **Background Colors**: `bg-muted` for buttons, `hover:bg-accent` for hover states
- **Avoid Problematic Classes**: Never use `text-muted-foreground` (doesn't apply properly)
  --error: #EF4444;                    /* Red for errors */
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
}
```

---

## 🔘 **Core UI Components**

### **Button Component**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  children,
  onClick 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900'
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    ghost: 'text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

### **ActionButtons Component (Standard Pattern)**
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
        {/* 1. Previous Button */}
        <button
          onClick={onNavigatePrevious}
          disabled={currentParagraph === 0}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
          Previous
        </button>

        {/* 2. Check Button */}
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

        {/* 3. Next Button - ONLY button with white text */}
        <button
          onClick={onNavigateNext}
          disabled={currentParagraph === totalParagraphs - 1}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-white hover:text-white hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 4. Hint Button */}
        <button
          onClick={onHint}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          {showHint ? 'Hide' : 'Hint'}
        </button>

        {/* 5. Skip Button */}
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

        {/* 6. Bookmark Button */}
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

// Button Layout Standards:
// Order (left to right): Previous, Check, Next, Hint, Skip, Bookmark
// Sizing: All buttons use px-6 py-3 for uniform sizing
// Colors: text-gray-400 for all buttons EXCEPT Next button (text-white)
// Spacing: gap-3 between buttons
// Hover: hover:text-gray-300 and hover:text-white respectively
```

### **TranslationInput Component (Standard Pattern)**
```typescript
interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function TranslationInput({ 
  value, onChange, disabled = false, 
  placeholder = "Type your English translation here..." 
}: TranslationInputProps) {
  return (
    <div className="mb-6">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono"
      />
    </div>
  )
}
```

### **Input Component**
```typescript
interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password'
  className?: string
}

export function Input({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  error, 
  disabled = false,
  type = 'text',
  className = ''
}: InputProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 bg-gray-800 border rounded-lg text-white placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-gray-600 hover:border-gray-500'}
        `}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}
```

### **Card Component**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }
  
  return (
    <div className={`
      bg-gray-900 border border-gray-800 rounded-lg
      ${paddingClasses[padding]}
      ${hover ? 'hover:border-gray-700 transition-colors' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
```

---

## 📱 **Learning-Specific Components**

### **Translation Input Component**
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

### **Stats Box Component (Practice Pages)**
```typescript
interface StatsBoxProps {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  value: string | number
  label: string
  className?: string
}

export function StatsBox({ icon: Icon, iconColor, value, label, className = '' }: StatsBoxProps) {
  return (
    <div className={`flex items-center gap-2 p-2 md:p-3 bg-muted rounded-lg ${className}`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
      <div>
        <div className="text-base md:text-lg font-semibold text-foreground">
          {value}
        </div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
```

**Usage Example**:
```tsx
// Practice page stats implementation
<div className="flex justify-center">
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
    <StatsBox
      icon={BookOpen}
      iconColor="text-blue-500"
      value={`${currentSentence}/${totalSentences}`}
      label="Sentences"
    />
    <StatsBox
      icon={CheckCircle}
      iconColor="text-green-500"
      value={correctCount}
      label="Correct"
    />
    {/* More stats boxes... */}
  </div>
</div>
```

**Icon Standards**:
- **Size**: `w-6 h-6` (24px) - 50% larger than standard icons for enhanced visibility
- **Colors**: Semantic colors (blue, green, purple, orange, yellow) for different metrics
- **Spacing**: `gap-3` (12px) between icon and text content - 50% increase for better visual breathing room

### **Score Display Component**
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

### **Progress Bar Component**
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

## 🔔 **Feedback Components**

### **Toast Notification**
```typescript
interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])
  
  const typeStyles = {
    success: 'bg-green-800 border-green-600 text-green-100',
    error: 'bg-red-800 border-red-600 text-red-100',
    warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
    info: 'bg-blue-800 border-blue-600 text-blue-100'
  }
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      border rounded-lg p-4 shadow-lg
      animate-slide-in-right
      ${typeStyles[type]}
    `}>
      <div className="flex items-center">
        <span className="text-lg mr-3">{icons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button 
          onClick={onClose}
          className="ml-3 text-current hover:opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  )
}
```

### **Loading Spinner**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', color = 'text-blue-500', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`flex justify-center ${className}`}>
      <svg 
        className={`animate-spin ${sizeClasses[size]} ${color}`}
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
```

---

## 📋 **Layout Components**

### **Page Layout**
```typescript
interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  sidebar?: React.ReactNode
}

export function PageLayout({ title, subtitle, children, actions, sidebar }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-lg text-gray-400">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex space-x-4">
                {actions}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          {sidebar && (
            <aside className="lg:w-1/4">
              {sidebar}
            </aside>
          )}
          
          {/* Main Content */}
          <main className={sidebar ? 'lg:w-3/4' : 'w-full'}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
```

### **Modal Component**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="
          inline-block transform overflow-hidden rounded-lg
          bg-gray-900 border border-gray-700 text-left align-bottom shadow-xl
          transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle
        ">
          {/* Header */}
          <div className="bg-gray-800 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 **Component Usage Guidelines**

### **Import Patterns**
```typescript
// Centralized component exports
export { Button } from './Button'
export { Input } from './Input'
export { Card } from './Card'
export { TranslationInput } from './TranslationInput'
export { ScoreDisplay } from './ScoreDisplay'
export { ProgressBar } from './ProgressBar'
export { Toast } from './Toast'
export { LoadingSpinner } from './LoadingSpinner'
export { PageLayout } from './PageLayout'
export { Modal } from './Modal'

// Usage in pages
import { Button, Input, Card, TranslationInput } from '../components/ui'
```

### **Responsive Design Patterns**
```typescript
// Mobile-first responsive component
export function ResponsiveCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="
      w-full 
      sm:max-w-md sm:mx-auto
      md:max-w-lg 
      lg:max-w-xl
      xl:max-w-2xl
    ">
      {children}
    </Card>
  )
}
```

### **Accessibility Integration**
```typescript
// Accessible button with proper ARIA attributes
export function AccessibleButton({ children, ...props }: ButtonProps) {
  return (
    <Button 
      {...props}
      role="button"
      aria-pressed={props.variant === 'primary'}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {children}
    </Button>
  )
}
```

---

This component library provides a comprehensive foundation for building consistent, accessible, and maintainable UI across all AIdioma pages while maintaining the Strike-inspired dark theme and Spanish learning focus.