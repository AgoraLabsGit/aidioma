import React from 'react'

interface HealthBarProps {
  hintsUsed: number
  maxHints?: number
  className?: string
}

export function HealthBar({ hintsUsed, maxHints = 3, className = '' }: HealthBarProps) {
  // Calculate health percentage (100% = no hints, 0% = max hints)
  const healthPercentage = Math.max(0, ((maxHints - hintsUsed) / maxHints) * 100)
  
  // Determine color based on health percentage
  const getHealthColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500' 
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }
  
  const getHealthLabel = (percentage: number) => {
    if (percentage >= 80) return 'Excellent'
    if (percentage >= 60) return 'Good'
    if (percentage >= 40) return 'Fair'
    return 'Poor'
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">Translation Health</span>
        <span className="text-xs text-muted-foreground">
          {getHealthLabel(healthPercentage)}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getHealthColor(healthPercentage)}`}
          style={{ width: `${healthPercentage}%` }}
        />
      </div>
    </div>
  )
} 