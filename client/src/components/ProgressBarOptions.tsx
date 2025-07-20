import React from 'react'

interface ProgressBarProps {
  currentSentence: number
  totalSentences: number
}

// Option 1: Header Progress Bar (GitHub style)
export function HeaderProgressBar({ currentSentence, totalSentences }: ProgressBarProps) {
  const progress = (currentSentence / totalSentences) * 100
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="text-muted-foreground">
          Session Progress
        </span>
        <span className="text-foreground font-medium">
          {currentSentence}/{totalSentences}
        </span>
      </div>
      <div className="h-1 bg-muted">
        <div 
          className="h-1 bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Option 2: Sidebar Progress Bar (integrated into navigation)
export function SidebarProgressBar({ currentSentence, totalSentences }: ProgressBarProps) {
  const progress = (currentSentence / totalSentences) * 100
  
  return (
    <div className="px-4 py-3 border-t border-border bg-card/50">
      <div className="text-xs text-muted-foreground mb-2">Practice Progress</div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{currentSentence}/{totalSentences}</span>
        <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

// Option 3: Practice Box Header Progress Bar (in card header)
export function PracticeHeaderProgressBar({ currentSentence, totalSentences }: ProgressBarProps) {
  const progress = (currentSentence / totalSentences) * 100
  
  return (
    <div className="mb-6 p-4 bg-card border border-border rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Translation Practice</h2>
        <span className="text-sm text-muted-foreground">
          Sentence {currentSentence} of {totalSentences}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 