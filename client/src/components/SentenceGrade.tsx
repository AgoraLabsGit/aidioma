import React from 'react'
import { TrendingUp, TrendingDown, Award } from 'lucide-react'

interface SentenceGradeProps {
  currentScore: number // 0-10
  originalScore?: number // Score before penalties
  hintsUsed: number
  attemptNumber: number
  isEvaluated: boolean
  layout?: 'vertical' | 'horizontal'
  className?: string
}

interface GradeData {
  letter: string
  color: string
  bgColor: string
  description: string
}

function getGradeData(score: number): GradeData {
  if (score >= 9.5) return { letter: 'A+', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', description: 'Perfect' }
  if (score >= 8.5) return { letter: 'A', color: 'text-green-500', bgColor: 'bg-green-50 border-green-200', description: 'Excellent' }
  if (score >= 7.5) return { letter: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', description: 'Very Good' }
  if (score >= 6.5) return { letter: 'B', color: 'text-blue-500', bgColor: 'bg-blue-50 border-blue-200', description: 'Good' }
  if (score >= 5.5) return { letter: 'C+', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', description: 'Above Average' }
  if (score >= 4.5) return { letter: 'C', color: 'text-purple-500', bgColor: 'bg-purple-50 border-purple-200', description: 'Average' }
  if (score >= 3.5) return { letter: 'D+', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', description: 'Below Average' }
  if (score >= 2.5) return { letter: 'D', color: 'text-orange-500', bgColor: 'bg-orange-50 border-orange-200', description: 'Needs Work' }
  return { letter: 'F', color: 'text-red-500', bgColor: 'bg-red-50 border-red-200', description: 'Try Again' }
}

function calculatePenalties(hintsUsed: number, attemptNumber: number): { hintPenalty: number, attemptPenalty: number } {
  // Based on docs: Level 1: -1.0, Level 2: -1.5, Level 3: -2.0
  const hintPenalties = [0, 1.0, 1.5, 2.0] // Index matches hint level
  const hintPenalty = hintsUsed > 0 ? (hintPenalties[Math.min(hintsUsed, 3)] || 2.0) : 0
  
  const attemptPenalty = attemptNumber > 1 ? (attemptNumber - 1) * 0.2 : 0
  
  return { hintPenalty, attemptPenalty }
}

export function SentenceGrade({ 
  currentScore, 
  originalScore, 
  hintsUsed, 
  attemptNumber, 
  isEvaluated, 
  layout = 'vertical',
  className = '' 
}: SentenceGradeProps) {
  const grade = getGradeData(currentScore)
  const { hintPenalty, attemptPenalty } = calculatePenalties(hintsUsed, attemptNumber)
  const totalPenalty = hintPenalty + attemptPenalty
  
  // Estimate potential score if not evaluated yet
  const estimatedScore = isEvaluated ? currentScore : Math.max(0, 10 - totalPenalty)
  const estimatedGrade = getGradeData(estimatedScore)
  
  if (layout === 'horizontal') {
    return (
      <div className={`flex items-center gap-4 p-3 bg-card border border-border rounded-lg ${className}`}>
        {/* Grade Display */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-md border ${isEvaluated ? grade.bgColor : estimatedGrade.bgColor}`}>
          <Award className={`w-4 h-4 ${isEvaluated ? grade.color : estimatedGrade.color}`} />
          <span className={`text-lg font-bold ${isEvaluated ? grade.color : estimatedGrade.color}`}>
            {isEvaluated ? grade.letter : estimatedGrade.letter}
          </span>
        </div>
        
        {/* Score and Penalties */}
        <div className="flex items-center gap-3 text-sm">
          <span className="font-medium">
            {isEvaluated ? currentScore.toFixed(1) : estimatedScore.toFixed(1)}/10
          </span>
          
          {totalPenalty > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <TrendingDown className="w-3 h-3" />
              <span>-{totalPenalty.toFixed(1)}</span>
            </div>
          )}
          
          {hintsUsed > 0 && (
            <span className="text-xs text-muted-foreground">
              {hintsUsed} hint{hintsUsed > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    )
  }
  
  // Vertical layout (default)
  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-xs text-muted-foreground mb-1">Sentence Grade</div>
        <div className={`text-2xl font-bold ${isEvaluated ? grade.color : estimatedGrade.color}`}>
          {isEvaluated ? grade.letter : estimatedGrade.letter}
        </div>
        <div className="text-xs text-muted-foreground">
          {isEvaluated ? grade.description : estimatedGrade.description}
        </div>
      </div>
      
      {/* Score Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">Score</span>
          <span className="text-sm font-medium">
            {isEvaluated ? currentScore.toFixed(1) : estimatedScore.toFixed(1)}/10
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isEvaluated 
                ? currentScore >= 8 ? 'bg-green-500' : currentScore >= 6 ? 'bg-blue-500' : currentScore >= 4 ? 'bg-purple-500' : 'bg-orange-500'
                : estimatedScore >= 8 ? 'bg-green-400' : estimatedScore >= 6 ? 'bg-blue-400' : estimatedScore >= 4 ? 'bg-purple-400' : 'bg-orange-400'
            }`}
            style={{ width: `${(isEvaluated ? currentScore : estimatedScore) * 10}%` }}
          />
        </div>
      </div>
      
      {/* Penalties Display */}
      {(totalPenalty > 0 || originalScore) && (
        <div className="space-y-1">
          {originalScore && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Original:</span>
              <span className="text-green-600">{originalScore.toFixed(1)}</span>
            </div>
          )}
          
          {hintPenalty > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Hints ({hintsUsed}):</span>
              <span className="text-orange-600">-{hintPenalty.toFixed(1)}</span>
            </div>
          )}
          
          {attemptPenalty > 0 && (
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Attempts:</span>
              <span className="text-orange-600">-{attemptPenalty.toFixed(1)}</span>
            </div>
          )}
          
          {totalPenalty > 0 && (
            <div className="border-t border-border/50 pt-1 flex justify-between items-center text-xs font-medium">
              <span>Final Score:</span>
              <span className={isEvaluated ? grade.color : estimatedGrade.color}>
                {isEvaluated ? currentScore.toFixed(1) : estimatedScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 