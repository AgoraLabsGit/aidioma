import React from 'react'
import { Check, X, AlertCircle, ArrowRight } from 'lucide-react'

interface WordMapping {
  english: string
  userSpanish: string
  correctSpanish: string
  status: 'correct' | 'wrong' | 'missing' | 'extra'
  note?: string
}

interface GrammarIssue {
  type: 'punctuation' | 'accent' | 'gender' | 'conjugation' | 'word_order'
  description: string
  fix: string
}

interface ConciseEvaluationResult {
  score: number
  feedback: string
  isCorrect: boolean
  grade: string
  pointsEarned: number
  wordMapping: WordMapping[]
  grammarIssues: GrammarIssue[]
  summary: string
}

interface ConciseEvaluationDisplayProps {
  evaluation: ConciseEvaluationResult
  className?: string
}

export function ConciseEvaluationDisplay({ evaluation, className = '' }: ConciseEvaluationDisplayProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'correct': return <Check className="w-4 h-4 text-green-600" />
      case 'wrong': return <X className="w-4 h-4 text-red-600" />
      case 'missing': return <AlertCircle className="w-4 h-4 text-orange-600" />
      case 'extra': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return null
    }
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600'
      case 'B': return 'text-blue-600' 
      case 'C': return 'text-orange-600'
      case 'D': return 'text-red-500'
      case 'F': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className={`p-4 bg-muted border border-border rounded-lg space-y-4 ${className}`}>
      {/* Header: Score and Grade */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-2xl font-bold ${getGradeColor(evaluation.grade)}`}>
            {evaluation.grade}
          </span>
          <span className="text-sm text-muted-foreground">
            {evaluation.score}/100 • +{evaluation.pointsEarned} pts
          </span>
        </div>
      </div>

      {/* Quick Feedback */}
      <div className="text-sm text-foreground bg-background p-3 rounded">
        {evaluation.feedback}
      </div>

      {/* Word Mapping - Clean Lines */}
      {evaluation.wordMapping.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Word Mapping</h4>
          <div className="space-y-1 text-sm font-mono">
            {evaluation.wordMapping.map((word, index) => (
              <div key={index} className="flex items-center gap-2 py-1">
                {getStatusIcon(word.status)}
                <span className="text-muted-foreground min-w-[80px]">{word.english}</span>
                <span className="text-muted-foreground">=</span>
                
                {word.status === 'correct' ? (
                  <span className="text-green-600 font-medium">{word.correctSpanish}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 line-through">{word.userSpanish}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-green-600 font-medium">{word.correctSpanish}</span>
                    {word.note && (
                      <span className="text-xs text-muted-foreground">({word.note})</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grammar Issues - Bulleted List */}
      {evaluation.grammarIssues.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Grammar Issues</h4>
          <div className="space-y-1">
            {evaluation.grammarIssues.map((issue, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground mt-1">•</span>
                <div className="flex-1">
                  <span className="text-foreground">{issue.description}</span>
                  <span className="text-muted-foreground mx-2">→</span>
                  <span className="text-green-600 font-mono">{issue.fix}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary - Action Items */}
      <div className="border-t border-border pt-3">
        <h4 className="text-sm font-medium text-foreground mb-1">Next Steps</h4>
        <p className="text-sm text-muted-foreground">{evaluation.summary}</p>
      </div>
    </div>
  )
}

/*
VISUAL EXAMPLE:

┌─────────────────────────────────────────────────────────────┐
│ C    75/100 • +75 pts                                      │
├─────────────────────────────────────────────────────────────┤
│ Main words correct, missing punctuation and accents        │
├─────────────────────────────────────────────────────────────┤
│ Word Mapping                                                │
│ ✓ Hello      = Hola                                        │
│ ✗ how        = como → cómo (missing accent)                │
│ ✗ are you    = estas → estás (missing accent)              │
├─────────────────────────────────────────────────────────────┤
│ Grammar Issues                                              │
│ • Missing opening question mark → ¿                        │
│ • Missing comma after greeting → Hola,                     │
│ • Question words need accent marks → cómo, estás           │
├─────────────────────────────────────────────────────────────┤
│ Next Steps                                                  │
│ Add question punctuation (¿), comma after Hola, accent     │
│ marks on cómo and estás                                     │
└─────────────────────────────────────────────────────────────┘
*/ 