# Component Library
## UI Component System & Design Guidelines

---

## 🎯 **Overview**

Reusable React components following AIdioma's Strike-inspired dark theme with consistent patterns across all 6 pages.

### **Design Principles**
- **Dark Theme**: Primary background #0A0A0B, surfaces #111113
- **Minimal UI**: Clean, distraction-free learning environment
- **Amber Accents**: Warnings and highlights use amber instead of red
- **Mobile First**: Touch-friendly with responsive breakpoints
- **Accessibility**: WCAG 2.1 AA compliant with proper contrast

---

## 🎨 **Design System Variables**

### **CSS Custom Properties**
```css
:root {
  /* Colors */
  --background-primary: #0A0A0B;
  --background-surface: #111113;
  --border-subtle: #1F1F23;
  --text-primary: #E5E5E7;
  --text-secondary: #AAAAASD;
  --accent-primary: #374151;
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  
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