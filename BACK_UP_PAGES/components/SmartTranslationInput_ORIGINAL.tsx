import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Lightbulb, X, CheckCircle, AlertCircle } from 'lucide-react'

// Mock Spanish dictionary for cost optimization
const SPANISH_DICTIONARY = new Set([
  'hola', 'como', 'estas', 'muy', 'bien', 'que', 'tal', 'soy', 'es', 'son',
  'tengo', 'tienes', 'tiene', 'el', 'la', 'los', 'las', 'un', 'una', 'de',
  'en', 'con', 'por', 'para', 'me', 'te', 'se', 'nos', 'le', 'les', 'mi',
  'tu', 'su', 'y', 'o', 'pero', 'si', 'no', 'mas', 'cuando', 'donde', 'quien'
])

interface WordEvaluation {
  word: string
  status: 'correct' | 'close' | 'wrong' | 'pending' | 'unknown'
  confidence: number
  attempts: number
  needsHint: boolean
  hintShown: boolean
}

interface WordAttempt {
  word: string
  attemptCount: number
  wrongCount: number
  lastAttemptTime: number
}

interface HintData {
  word: string
  level: 'basic' | 'intermediate' | 'complete'
  content: string
  penalty: number
}

interface SmartTranslationInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  expectedWords?: string[]
  onWordEvaluated?: (word: string, evaluation: WordEvaluation) => void
  disabled?: boolean
  className?: string
}

export function SmartTranslationInput({
  value,
  onChange,
  placeholder = "Escribe tu traducción aquí...",
  expectedWords = [],
  onWordEvaluated,
  disabled = false,
  className = ''
}: SmartTranslationInputProps) {
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [wordAttempts, setWordAttempts] = useState<Map<string, WordAttempt>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastWordRef = useRef<string>('')

  // Mock word evaluation function (in real app, this would hit AI/API)
  const evaluateWord = useCallback(async (word: string): Promise<WordEvaluation> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const cleanWord = word.toLowerCase().trim()
    
    // Local dictionary check (FREE)
    if (SPANISH_DICTIONARY.has(cleanWord)) {
      return {
        word,
        status: 'correct',
        confidence: 0.9,
        attempts: 1,
        needsHint: false,
        hintShown: false
      }
    }
    
    // Mock AI evaluation logic
    const accuracy = Math.random()
    
    if (accuracy > 0.8) {
      return { word, status: 'correct', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    } else if (accuracy > 0.5) {
      return { word, status: 'close', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    } else {
      return { word, status: 'wrong', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    }
  }, [])

  // Generate hint for word (mock implementation)
  const generateHint = useCallback(async (word: string, level: 'basic' | 'intermediate' | 'complete'): Promise<HintData> => {
    // Mock hint generation
    const hints = {
      basic: `"${word}" is a common Spanish word`,
      intermediate: `"${word}" typically means something related to daily conversation`,
      complete: `"${word}" = "${word === 'hola' ? 'hello' : 'word'}" (${word === 'hola' ? 'greeting' : 'noun'})`,
    }
    
    const penalties = { basic: 1.0, intermediate: 1.5, complete: 2.0 }
    
    return {
      word,
      level,
      content: hints[level],
      penalty: penalties[level]
    }
  }, [])

  // Handle space-bar triggered evaluation
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' && !isEvaluating) {
      const currentValue = e.currentTarget.value
      const words = currentValue.trim().split(/\s+/)
      const lastWord = words[words.length - 1]?.trim()
      
      if (lastWord && lastWord !== lastWordRef.current && lastWord.length > 1) {
        lastWordRef.current = lastWord
        setIsEvaluating(true)
        
        try {
          // Evaluate the word
          const evaluation = await evaluateWord(lastWord)
          
          // Track attempts
          const attempts = wordAttempts.get(lastWord) || { word: lastWord, attemptCount: 0, wrongCount: 0, lastAttemptTime: 0 }
          attempts.attemptCount++
          attempts.lastAttemptTime = Date.now()
          
          if (evaluation.status === 'wrong') {
            attempts.wrongCount++
          }
          
          // Check if auto-hint should trigger (after 2nd wrong attempt)
          evaluation.needsHint = attempts.wrongCount >= 2 && !evaluation.hintShown
          
          setWordAttempts(prev => new Map(prev.set(lastWord, attempts)))
          setWordEvaluations(prev => new Map(prev.set(lastWord, evaluation)))
          
          // Trigger auto-hint if needed
          if (evaluation.needsHint) {
            const hint = await generateHint(lastWord, 'basic')
            setActiveHint(hint)
          }
          
          onWordEvaluated?.(lastWord, evaluation)
        } catch (error) {
          console.error('Word evaluation failed:', error)
        } finally {
          setIsEvaluating(false)
        }
      }
    }
  }, [isEvaluating, wordAttempts, evaluateWord, generateHint, onWordEvaluated])

  // Handle word click for immediate hint
  const handleWordClick = useCallback(async (word: string) => {
    if (activeHint?.word === word) {
      setActiveHint(null)
      return
    }
    
    const hint = await generateHint(word, 'basic')
    setActiveHint(hint)
    
    // Mark as hint shown
    setWordEvaluations(prev => {
      const updated = new Map(prev)
      const evaluation = updated.get(word)
      if (evaluation) {
        updated.set(word, { ...evaluation, hintShown: true })
      }
      return updated
    })
  }, [activeHint, generateHint])

  // Render word with color coding
  const renderWord = useCallback((word: string, index: number) => {
    const evaluation = wordEvaluations.get(word)
    
    const getWordColor = (status?: string) => {
      switch (status) {
        case 'correct': return 'text-green-600 bg-green-50 border-green-200'
        case 'close': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'wrong': return 'text-red-600 bg-red-50 border-red-200'
        case 'pending': return 'text-blue-600 bg-blue-50 border-blue-200'
        default: return 'text-foreground'
      }
    }
    
    const getStatusIcon = (status?: string) => {
      switch (status) {
        case 'correct': return <CheckCircle className="w-3 h-3 text-green-600" />
        case 'close': return <AlertCircle className="w-3 h-3 text-orange-600" />
        case 'wrong': return <X className="w-3 h-3 text-red-600" />
        default: return null
      }
    }
    
    return (
      <span
        key={index}
        onClick={() => handleWordClick(word)}
        className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-md border cursor-pointer
          transition-all duration-200 hover:shadow-sm mr-1 mb-1
          ${getWordColor(evaluation?.status)}
          ${evaluation ? 'border' : 'border-transparent'}
        `}
        title={`Click for hint about "${word}"`}
      >
        {word}
        {getStatusIcon(evaluation?.status)}
      </span>
    )
  }, [wordEvaluations, handleWordClick])

  // Parse value into words for rendering
  const words = value.trim().split(/\s+/).filter(word => word.length > 0)

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Visual Word Display */}
      <div className="min-h-[60px] p-4 bg-muted/50 border border-border rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">Translation Preview:</div>
        <div className="flex flex-wrap items-start">
          {words.length > 0 ? (
            words.map((word, index) => renderWord(word, index))
          ) : (
            <span className="text-muted-foreground italic">Start typing...</span>
          )}
          {isEvaluating && (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 text-sm">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Evaluating...
            </span>
          )}
        </div>
      </div>

      {/* Text Input */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-3 bg-background border border-border rounded-lg 
                   focus:border-primary focus:ring-1 focus:ring-primary
                   disabled:opacity-50 disabled:cursor-not-allowed
                   resize-none text-base"
        />
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
          Press space to evaluate words
        </div>
      </div>

      {/* Auto-Hint Popup */}
      {activeHint && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Hint for "{activeHint.word}" (-{activeHint.penalty} pts)
              </span>
            </div>
            <button
              onClick={() => setActiveHint(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-blue-700">{activeHint.content}</p>
          <div className="mt-2 text-xs text-blue-600">
            Click the word again to dismiss, or click other words for more hints.
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded" />
          <span>Correct</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded" />
          <span>Close</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-50 border border-red-200 rounded" />
          <span>Wrong</span>
        </div>
        <div className="text-muted-foreground">
          • Click words for hints • Auto-hints after 2 wrong attempts
        </div>
      </div>
    </div>
  )
} 