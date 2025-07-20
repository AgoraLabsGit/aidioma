import React from 'react'
import { Check, ChevronUp, ChevronDown, Lightbulb, RotateCcw, BookmarkPlus } from 'lucide-react'
import { Button } from './ui/Button'

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
  canGoPrevious?: boolean  // ✅ NEW: Proper navigation state
  canGoNext?: boolean      // ✅ NEW: Proper navigation state
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
  canGoPrevious = false,  // ✅ NEW: Default to false
  canGoNext = false,      // ✅ NEW: Default to false
  className = ''
}: ActionButtonsProps) {
  const canSubmit = userTranslation.trim().length > 0

  return (
    <div className={`space-y-4 w-full max-w-lg mx-auto ${className}`}>
      {/* Main Action Row - Icon-only buttons with increased spacing */}
      <div className="flex items-center justify-center gap-5 w-full">
        {/* Previous Button - Up Arrow Icon - Reduced by 30% */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigatePrevious}
          disabled={!canGoPrevious}  // ✅ FIXED: Use proper navigation state
          className="flex items-center justify-center p-3 h-14 w-14"
        >
          <ChevronUp className="w-11 h-11" />
        </Button>

        {/* Main Check Button - Green Check Mark Icon */}
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white"
        >
          <Check className="w-6 h-6" />
        </Button>

        {/* Next Button - Down Arrow Icon - Reduced by 30% */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateNext}
          disabled={!canGoNext}  // ✅ FIXED: Use proper navigation state
          className="flex items-center justify-center p-3 h-14 w-14"
        >
          <ChevronDown className="w-11 h-11" />
        </Button>
      </div>

      {/* Secondary Action Buttons - Same grey background as text input */}
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