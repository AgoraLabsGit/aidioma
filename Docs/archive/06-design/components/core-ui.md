# Core UI Components v2.0
## Foundation Building Blocks

*Basic reusable components that form the foundation of AIdioma's design system based on Practice Page v2.0 refinements.*

---

## 🔘 **Button Component**

### **Unified Button Interface**
```typescript
interface ButtonProps {
  variant?: 'default' | 'ghost' | 'secondary' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Button({ 
  variant = 'default', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  children,
  onClick 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    default: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    ghost: 'text-foreground hover:bg-muted/80 focus:ring-ring',
    secondary: 'bg-muted hover:bg-muted/80 text-foreground focus:ring-ring',
    destructive: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm h-9',
    md: 'px-4 py-2 text-base h-10',
    lg: 'px-6 py-3 text-lg h-12'
  }
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

**Key Changes from v1.0:**
- **Primary color**: Changed from blue to green (`bg-green-600`)
- **Ghost variant**: Uses muted background instead of gray
- **Focus states**: Updated to match design system
- **Height standards**: Consistent h-9, h-10, h-12 for size variants
- **Ring colors**: Proper focus ring implementation

---

## 📝 **Input Component**

### **Standardized Input Interface**
```typescript
interface InputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
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
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
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
          w-full px-3 py-2 bg-input border border-border rounded-lg
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
        `}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
```

**Key Standards:**
- **Background**: `bg-input` from design system
- **Focus ring**: Consistent with button focus states
- **Error states**: Red border and text for validation
- **Transitions**: Smooth 200ms animations
- **Typography**: Proper placeholder styling

---

## 🏷️ **Card Component**

### **Container Component**
```typescript
interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  }
  
  return (
    <div className={`
      bg-muted border border-border rounded-lg
      ${paddingClasses[padding]}
      ${hover ? 'hover:bg-muted/80 transition-colors' : ''}
      ${className}
    `}>
      {children}
    </div>
  )
}
```

**Card Standards:**
- **Background**: `bg-muted` for consistency
- **Borders**: Subtle `border-border` definition
- **Padding**: Three size variants for flexibility
- **Hover**: Optional interaction states

---

## 📱 **Modal Component**

### **Overlay Dialog Interface**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg', 
    lg: 'max-w-2xl'
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`
          inline-block transform overflow-hidden rounded-lg
          bg-background border border-border text-left align-bottom shadow-xl
          transition-all sm:my-8 sm:w-full sm:align-middle
          ${sizeClasses[size]}
        `}>
          {/* Header */}
          <div className="bg-muted px-4 py-3 sm:px-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">{title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>
          
          {/* Footer */}
          {footer && (
            <div className="bg-muted px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-border">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Modal Standards:**
- **Backdrop**: Semi-transparent overlay
- **Header/Footer**: Muted background with borders
- **Close button**: Ghost variant with X icon
- **Sizes**: Three responsive variants
- **Animation**: Smooth transitions

---

## 🌀 **LoadingSpinner Component**

### **Loading State Indicator**
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  }
  
  return (
    <div className={`flex justify-center ${className}`}>
      <svg 
        className={`animate-spin text-foreground ${sizeClasses[size]}`}
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

## 🎛️ **Logo Component**

### **Brand Identity Component**
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

**Logo Standards:**
- **Icon**: BookOpen from lucide-react
- **Colors**: Primary background with foreground text
- **Sizes**: Three variants for different contexts
- **Text**: Optional "AIdioma" text
- **Alignment**: ALWAYS left-aligned in headers

---

## 🚨 **Toast Component**

### **Notification System**
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
    success: 'bg-green-600 border-green-500 text-white',
    error: 'bg-red-600 border-red-500 text-white',
    warning: 'bg-orange-600 border-orange-500 text-white',
    info: 'bg-blue-600 border-blue-500 text-white'
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />
  }
  
  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      border rounded-lg p-4 shadow-lg
      animate-slide-in-right
      ${typeStyles[type]}
    `}>
      <div className="flex items-center">
        <span className="mr-3">{icons[type]}</span>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <Button 
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="ml-3 text-current hover:opacity-75 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
```

---

## ✅ **Component Usage Guidelines**

### **Import Patterns**
```typescript
// Centralized component exports
export { Button } from './Button'
export { Input } from './Input'
export { Card } from './Card'
export { Modal } from './Modal'
export { LoadingSpinner } from './LoadingSpinner'
export { Logo } from './Logo'
export { Toast } from './Toast'

// Usage in pages
import { Button, Input, Card, Logo } from '../components/ui'
```

### **Responsive Design Standards**
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

### **Accessibility Requirements**
```typescript
// Accessible button with proper ARIA attributes
export function AccessibleButton({ children, ...props }: ButtonProps) {
  return (
    <Button 
      {...props}
      role="button"
      aria-pressed={props.variant === 'default'}
      className={`min-h-[44px] ${props.className || ''}`} // 44px minimum touch target
    >
      {children}
    </Button>
  )
}
```

---

## 🎨 **Design System Integration**

### **Color Usage**
- **Primary Actions**: `bg-green-600` (main buttons)
- **Secondary**: `bg-muted` (helper buttons, cards)
- **Destructive**: `bg-red-600` (delete, error actions)
- **Text**: `text-foreground` (primary), `text-muted-foreground` (secondary)

### **Spacing Standards**
- **Component Padding**: p-3 (sm), p-4 (md), p-6 (lg)
- **Button Heights**: h-9 (sm), h-10 (md), h-12 (lg)
- **Gap Spacing**: gap-3 (12px), gap-5 (20px)
- **Margins**: mb-4 (16px) between sections

### **Typography**
- **Font Weights**: font-medium for buttons, font-normal for text
- **Text Sizes**: text-sm, text-base, text-lg for hierarchical content
- **Line Heights**: leading-relaxed for readable text blocks

### **Animation Standards**
- **Transitions**: transition-all duration-200 for interactions
- **Focus**: ring-2 with proper offset for accessibility
- **Hover**: Subtle color/opacity changes, no jarring effects

---

## 📋 **Quality Checklist**

### **Component Requirements**
- [ ] Uses design system colors exclusively
- [ ] Implements proper focus states with rings
- [ ] Includes 44px minimum touch targets
- [ ] Follows responsive design patterns
- [ ] Passes TypeScript strict checks
- [ ] Includes proper ARIA attributes

### **Performance Standards**
- [ ] <10KB bundle size additions
- [ ] <100ms interaction response
- [ ] Smooth 200-300ms animations
- [ ] Efficient re-render patterns
- [ ] Proper memoization where needed

This core UI foundation ensures consistent, accessible, and performant components across all AIdioma pages while supporting the v2.0 design system standards. 