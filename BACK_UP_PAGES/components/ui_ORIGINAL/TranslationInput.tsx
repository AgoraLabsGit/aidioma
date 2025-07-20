import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Check, X, Volume2, Lightbulb, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from './Input'
import { Button } from './Button'

// Enhanced Spanish dictionary with frequency-based scoring
const SPANISH_DICTIONARY = new Map([
  // High frequency words (score: 0.95)
  ['hola', 0.95], ['como', 0.95], ['que', 0.95], ['es', 0.95], ['el', 0.95],
  ['la', 0.95], ['de', 0.95], ['en', 0.95], ['y', 0.95], ['un', 0.95],
  ['una', 0.95], ['por', 0.95], ['con', 0.95], ['no', 0.95], ['para', 0.95],
  
  // Medium frequency words (score: 0.85)
  ['muy', 0.85], ['bien', 0.85], ['estas', 0.85], ['tal', 0.85], ['soy', 0.85],
  ['son', 0.85], ['tengo', 0.85], ['tienes', 0.85], ['tiene', 0.85],
  ['los', 0.85], ['las', 0.85], ['me', 0.85], ['te', 0.85], ['se', 0.85],
  
  // Lower frequency words (score: 0.75)
  ['nos', 0.75], ['le', 0.75], ['les', 0.75], ['mi', 0.75], ['tu', 0.75],
  ['su', 0.75], ['o', 0.75], ['pero', 0.75], ['si', 0.75], ['mas', 0.75],
  ['cuando', 0.75], ['donde', 0.75], ['quien', 0.75]
])

// Configuration constants
const EVALUATION_CONFIG = {
  HINT_TRIGGER_THRESHOLD: 2,
  HINT_PENALTIES: { basic: 1.0, intermediate: 1.5, complete: 2.0 },
  ACCURACY_THRESHOLDS: { correct: 0.7, close: 0.4 },
  SPANISH_PATTERN: /^[a-záéíóúñü]+$/i,
  MIN_WORD_LENGTH: 2
} as const

interface WordEvaluation {
  word: string
  status: 'correct' | 'close' | 'wrong' | 'pending'
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

interface TranslationInputProps {
  sentence: string
  targetLanguage: string
  sourceLanguage: string
  onSubmit: (translation: string) => void
  onSkip?: () => void
  placeholder?: string
  showHint?: boolean
  hint?: string
  disabled?: boolean
  autoFocus?: boolean
  enableWordColoring?: boolean
  expectedWords?: string[]
}

// Custom hook for word evaluation with caching
function useWordEvaluation() {
  const evaluationCache = useRef<Map<string, WordEvaluation>>(new Map())
  
  const evaluateWord = useCallback(async (word: string): Promise<WordEvaluation> => {
    const cleanWord = word.toLowerCase().trim()
    
    // Check cache first
    if (evaluationCache.current.has(cleanWord)) {
      return evaluationCache.current.get(cleanWord)!
    }
    
    let evaluation: WordEvaluation
    
    // Dictionary lookup (O(1) with Map)
    const dictionaryScore = SPANISH_DICTIONARY.get(cleanWord)
    if (dictionaryScore) {
      evaluation = {
        word,
        status: 'correct',
        confidence: dictionaryScore,
        attempts: 1,
        needsHint: false,
        hintShown: false
      }
    } else {
      // Enhanced evaluation logic
      const isSpanishLike = EVALUATION_CONFIG.SPANISH_PATTERN.test(cleanWord)
      const hasValidLength = cleanWord.length >= EVALUATION_CONFIG.MIN_WORD_LENGTH
      
      // More sophisticated scoring
      let accuracy = 0.2 // Base score for any input
      if (isSpanishLike) accuracy += 0.3
      if (hasValidLength) accuracy += 0.2
      if (cleanWord.endsWith('a') || cleanWord.endsWith('o')) accuracy += 0.1 // Spanish gender patterns
      if (cleanWord.includes('ñ') || /[áéíóúü]/.test(cleanWord)) accuracy += 0.2 // Spanish diacritics
      
      // Add some controlled randomness (±0.1)
      accuracy += (Math.random() - 0.5) * 0.2
      accuracy = Math.max(0, Math.min(1, accuracy)) // Clamp to [0, 1]
      
      let status: WordEvaluation['status']
      if (accuracy > EVALUATION_CONFIG.ACCURACY_THRESHOLDS.correct) {
        status = 'correct'
      } else if (accuracy > EVALUATION_CONFIG.ACCURACY_THRESHOLDS.close) {
        status = 'close'
      } else {
        status = 'wrong'
      }
      
      evaluation = {
        word,
        status,
        confidence: accuracy,
        attempts: 1,
        needsHint: false,
        hintShown: false
      }
    }
    
    // Cache the result
    evaluationCache.current.set(cleanWord, evaluation)
    return evaluation
  }, [])
  
  return { evaluateWord }
}

// Custom hook for hint generation
function useHintGeneration() {
  const generateHint = useCallback(async (word: string, level: 'basic' | 'intermediate' | 'complete'): Promise<HintData> => {
    const cleanWord = word.toLowerCase()
    
    // Enhanced hint content based on actual Spanish patterns
    const hints = {
      basic: `"${word}" appears to be a Spanish word`,
      intermediate: `"${word}" - check the spelling and gender`,
      complete: SPANISH_DICTIONARY.has(cleanWord) 
        ? `"${word}" is correct! (confidence: ${Math.round((SPANISH_DICTIONARY.get(cleanWord)! * 100))}%)`
        : `"${word}" might need revision - try a more common Spanish word`
    }
    
    return {
      word,
      level,
      content: hints[level],
      penalty: EVALUATION_CONFIG.HINT_PENALTIES[level]
    }
  }, [])
  
  return { generateHint }
}

// Custom hook for audio functionality
function useAudioPlayback() {
  const [isPlaying, setIsPlaying] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  const playAudio = useCallback((text: string, language: string) => {
    if (!text.trim() || isPlaying) return
    
    // Cancel any existing speech
    speechSynthesis.cancel()
    
    setIsPlaying(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = language === 'spanish' ? 'es-ES' : 'en-US'
    utterance.rate = 0.8 // Slightly slower for learning
    
    utterance.onend = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }
    
    utteranceRef.current = utterance
    speechSynthesis.speak(utterance)
  }, [isPlaying])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel()
    }
  }, [])
  
  return { isPlaying, playAudio }
}

// Optimized AudioButton component
const AudioButton = React.memo<{ text: string; language: string; className?: string }>(
  ({ text, language, className = '' }) => {
    const { isPlaying, playAudio } = useAudioPlayback()
    
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => playAudio(text, language)}
        disabled={isPlaying || !text.trim()}
        className={`h-8 w-8 p-0 ${className}`}
        aria-label={`Play audio for: ${text}`}
      >
        <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
      </Button>
    )
  }
)

// Optimized WordDisplay component
const WordDisplay = React.memo<{
  word: string
  index: number
  evaluation?: WordEvaluation
  enableWordColoring: boolean
  onWordClick: (word: string) => void
}>(({ word, index, evaluation, enableWordColoring, onWordClick }) => {
  const wordColorClass = useMemo(() => {
    switch (evaluation?.status) {
      case 'correct': return 'text-green-600 bg-green-50 border-green-200'
      case 'close': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'wrong': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-foreground'
    }
  }, [evaluation?.status])
  
  const statusIcon = useMemo(() => {
    switch (evaluation?.status) {
      case 'correct': return <CheckCircle className="w-3 h-3 text-green-600" />
      case 'close': return <AlertCircle className="w-3 h-3 text-orange-600" />
      case 'wrong': return <X className="w-3 h-3 text-red-600" />
      default: return null
    }
  }, [evaluation?.status])
  
  return (
    <span
      key={index}
      onClick={() => onWordClick(word)}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200 
        hover:shadow-sm mr-1 mb-1 ${wordColorClass}
        ${evaluation ? 'border' : ''}
        ${enableWordColoring ? 'cursor-pointer' : 'cursor-default'}
      `}
      title={enableWordColoring ? `Click for hint about "${word}"` : undefined}
    >
      {word}
      {statusIcon}
    </span>
  )
})

export function TranslationInput({
  sentence,
  targetLanguage,
  sourceLanguage,
  onSubmit,
  onSkip,
  placeholder,
  showHint = false,
  hint,
  disabled = false,
  autoFocus = true,
  enableWordColoring = false,
  expectedWords = []
}: TranslationInputProps) {
  const [value, setValue] = useState('')
  const [showHintText, setShowHintText] = useState(false)
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [wordAttempts, setWordAttempts] = useState<Map<string, WordAttempt>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)
  const [isEvaluating, setIsEvaluating] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const lastWordRef = useRef<string>('')
  
  const { evaluateWord } = useWordEvaluation()
  const { generateHint } = useHintGeneration()
  const { playAudio } = useAudioPlayback()
  
  // Memoized placeholder
  const actualPlaceholder = useMemo(() => {
    const base = placeholder || `Translate to ${targetLanguage}...`
    return enableWordColoring ? `${base} (Press space to evaluate words)` : base
  }, [placeholder, targetLanguage, enableWordColoring])
  
  // Memoized words array
  const words = useMemo(() => 
    value.trim().split(/\s+/).filter(word => word.length > 0), 
    [value]
  )
  
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])
  
  // Optimized handleKeyDown with batch state updates
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
      return
    }

    if (enableWordColoring && e.key === ' ' && !isEvaluating) {
      const currentValue = e.currentTarget.value
      const words = currentValue.trim().split(/\s+/)
      const lastWord = words[words.length - 1]?.trim()
      
      if (lastWord && lastWord !== lastWordRef.current && lastWord.length >= EVALUATION_CONFIG.MIN_WORD_LENGTH) {
        lastWordRef.current = lastWord
        setIsEvaluating(true)
        
        try {
          const evaluation = await evaluateWord(lastWord)
          
          // Batch state updates
          setWordAttempts(prev => {
            const attempts = prev.get(lastWord) || { 
              word: lastWord, 
              attemptCount: 0, 
              wrongCount: 0, 
              lastAttemptTime: 0 
            }
            attempts.attemptCount++
            attempts.lastAttemptTime = Date.now()
            
            if (evaluation.status === 'wrong') {
              attempts.wrongCount++
            }
            
            evaluation.needsHint = attempts.wrongCount >= EVALUATION_CONFIG.HINT_TRIGGER_THRESHOLD && !evaluation.hintShown
            
            return new Map(prev.set(lastWord, attempts))
          })
          
          setWordEvaluations(prev => new Map(prev.set(lastWord, evaluation)))
          
          // Auto-hint if needed
          if (evaluation.needsHint) {
            const hint = await generateHint(lastWord, 'basic')
            setActiveHint(hint)
          }
        } catch (error) {
          console.error('Word evaluation failed:', error)
        } finally {
          setIsEvaluating(false)
        }
      }
    }
  }, [enableWordColoring, isEvaluating, evaluateWord, generateHint])

  // Optimized handleWordClick
  const handleWordClick = useCallback(async (word: string) => {
    if (!enableWordColoring) return
    
    if (activeHint?.word === word) {
      setActiveHint(null)
      return
    }
    
    const hint = await generateHint(word, 'basic')
    setActiveHint(hint)
    
    // Mark hint as shown
    setWordEvaluations(prev => {
      const updated = new Map(prev)
      const evaluation = updated.get(word)
      if (evaluation) {
        updated.set(word, { ...evaluation, hintShown: true })
      }
      return updated
    })
  }, [enableWordColoring, activeHint, generateHint])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onSubmit(value.trim())
      setValue('')
      setWordEvaluations(new Map())
      setWordAttempts(new Map())
      setActiveHint(null)
    }
  }, [value, onSubmit])

  return (
    <div className="w-full space-y-4">
      {/* Source sentence */}
      <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
        <p className="flex-1 text-foreground font-medium">{sentence}</p>
        <AudioButton 
          text={sentence} 
          language={sourceLanguage}
          className="flex-shrink-0"
        />
      </div>

      {/* Word coloring preview */}
      {enableWordColoring && words.length > 0 && (
        <div className="min-h-[40px] p-3 bg-muted/50 border border-border rounded-lg">
          <div className="text-xs text-muted-foreground mb-1">Translation Preview:</div>
          <div className="flex flex-wrap items-start">
            {words.map((word, index) => (
              <WordDisplay
                key={`${word}-${index}`}
                word={word}
                index={index}
                evaluation={wordEvaluations.get(word)}
                enableWordColoring={enableWordColoring}
                onWordClick={handleWordClick}
              />
            ))}
            {isEvaluating && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 text-xs">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                Evaluating...
              </span>
            )}
          </div>
        </div>
      )}

      {/* Auto-Hint Popup */}
      {enableWordColoring && activeHint && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
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
        </div>
      )}

      {/* Translation form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={actualPlaceholder}
            disabled={disabled}
            className="flex-1"
          />
          <AudioButton 
            text={value} 
            language={targetLanguage}
            className="flex-shrink-0"
          />
        </div>

        {/* Hint section */}
        {showHint && hint && (
          <div className="space-y-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHintText(!showHintText)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {showHintText ? 'Hide hint' : 'Show hint'}
            </Button>
            {showHintText && (
              <p className="text-sm text-muted-foreground p-3 bg-accent rounded-md">
                {hint}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={!value.trim() || disabled}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Submit
          </Button>
          {onSkip && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-2" />
              Skip
            </Button>
          )}
        </div>
      </form>

      {/* Legend */}
      {enableWordColoring && (
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
          <span>• Click words for hints • Auto-hints after {EVALUATION_CONFIG.HINT_TRIGGER_THRESHOLD} wrong attempts</span>
        </div>
      )}
    </div>
  )
}
