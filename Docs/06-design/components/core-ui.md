# Core UI Components
## Foundation Building Blocks

*Basic reusable components that form the foundation of AIdioma's design system.*

---

## 🔘 **Button Component**

### **Standard Button Interface**
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

---

## 📝 **Input Component**

### **Standard Input Interface**
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

---

## 🃏 **Card Component**

### **Standard Card Container**
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

## 🔄 **Modal Component**

### **Standard Modal Interface**
```typescript
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`relative bg-gray-900 border border-gray-800 rounded-lg p-6 w-full mx-4 ${sizeClasses[size]}`}>
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
```

---

## 🎯 **Usage Guidelines**

### **Consistent Styling Standards**
- **Button Sizing**: Use `lg` size for primary actions, `md` for secondary
- **Input Validation**: Always provide error states and clear feedback
- **Card Padding**: Use `md` for most content, `lg` for main content areas
- **Modal Size**: Use `md` for forms, `lg` for content-heavy modals

### **Accessibility Requirements**
- **Focus States**: All interactive elements must have visible focus indicators
- **ARIA Labels**: Provide descriptive labels for screen readers
- **Keyboard Navigation**: Support Tab/Enter navigation patterns
- **Color Contrast**: Meet WCAG AA standards for text visibility 