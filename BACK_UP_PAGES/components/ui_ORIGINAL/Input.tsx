import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success'
  label?: string
  helperText?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant = 'default', label, helperText, error, className = '', ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 text-sm rounded-md border bg-background transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'
    
    const variants = {
      default: 'border-input focus:ring-ring',
      error: 'border-destructive focus:ring-destructive',
      success: 'border-green-500 focus:ring-green-500'
    }

    const actualVariant = error ? 'error' : variant
    const actualHelperText = error || helperText

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${variants[actualVariant]} ${className}`}
          {...props}
        />
        {actualHelperText && (
          <p className={`mt-1 text-xs ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
            {actualHelperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
