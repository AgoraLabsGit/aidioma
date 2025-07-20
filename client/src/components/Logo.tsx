import React from 'react'
import { BookOpen } from 'lucide-react'

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