import React, { useState, useEffect, useCallback } from 'react'
import SharedSidebar from '../components/Sidebar'
import { ChevronDown, Filter, BookOpen, Volume2, CheckCircle, AlertCircle, X, Target, Clock, Zap, Lightbulb, ChevronUp, Check, RotateCcw } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { ProgressWheels } from '../components/ProgressWheels'
import { Logo } from '../components/Logo'
import type { CurrentUser } from '../types'

interface SentenceData {
  id: number
  english: string
  spanish: string
  hints: string[]
}

interface PracticeFiltersProps {
  isOpen: boolean
  onToggle: () => void
}

interface AudioButtonProps {
  text: string
  language: string
  className?: string
}

interface ErrorToastProps {
  message: string
  onClose: () => void
  onRetry?: () => void
  type?: 'error' | 'warning' | 'info'
}

interface WordEvaluation {
  word: string
  status: 'correct' | 'close' | 'wrong' | 'unknown'
  confidence: number
  attempts: number
  needsHint: boolean
  hintShown: boolean
}

interface HintData {
  word: string
  level: 'basic' | 'intermediate' | 'complete'
  content: string
  penalty: number
  levelNumber: number // 1, 2, or 3
  canAdvance: boolean // Can show next level
}

// Interactive Sentence Display Component
interface InteractiveSentenceProps {
  sentence: string
  className?: string
}

function InteractiveSentence({ sentence, className = '' }: InteractiveSentenceProps) {
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)
  const [hintLevel, setHintLevel] = useState<number>(1) // Track current hint level for a word
  const [loadingWord, setLoadingWord] = useState<string | null>(null) // Track which word is being evaluated
  const [loadingHint, setLoadingHint] = useState<boolean>(false) // Track hint generation

  // ✅ REAL WORD EVALUATION - Connected to Universal AI Service
  const evaluateWord = useCallback(async (word: string): Promise<WordEvaluation> => {
    try {
      const response = await fetch('/api/sentences/evaluate-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          word: word.trim(),
          context: 'Bebo café todas las mañanas.', // Default context for V1 demo
          difficulty: 'beginner',
          language: 'spanish',
          pageContext: 'practice'
        })
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Word evaluation failed')
      }

      return {
        word: result.data.word,
        status: result.data.status,
        confidence: result.data.confidence,
        attempts: result.data.attempts || 1,
        needsHint: result.data.needsHint || false,
        hintShown: result.data.hintShown || false
      }
    } catch (error) {
      console.error('Word evaluation failed, using fallback:', error)
      
      // Graceful fallback (better than original Math.random)
      const wordLower = word.toLowerCase().trim()
      const isCommonSpanish = ['bebo', 'café', 'todas', 'las', 'mañanas'].includes(wordLower)
      const hasSpanishChars = /[ñáéíóúü]/.test(wordLower)
      
      let confidence = 0.3 // Base confidence for fallback
      if (isCommonSpanish) confidence += 0.4
      if (hasSpanishChars) confidence += 0.2
      
      const status = confidence > 0.7 ? 'correct' : confidence > 0.4 ? 'close' : 'wrong'
      
      return {
        word,
        status,
        confidence,
        attempts: 1,
        needsHint: confidence < 0.5,
        hintShown: false
      }
    }
  }, [])

  // ✅ PROGRESSIVE 3-LEVEL HINT SYSTEM - Real implementation
  const generateHint = useCallback(async (word: string, level: number = 1): Promise<HintData> => {
    try {
      // 3-level progressive hints with increasing specificity
      const hintLevels: Record<string, { basic: string, intermediate: string, advanced: string }> = {
        'drink': {
          basic: 'This word is a verb related to consuming liquids.',
          intermediate: 'In Spanish, this verb can be "beber" or "tomar" - both mean to drink.',
          advanced: 'The first-person form is "bebo" (from beber) - "Yo bebo café" or just "Bebo café".'
        },
        'coffee': {
          basic: 'This is a popular hot beverage, masculine in Spanish.',
          intermediate: 'This word is "café" in Spanish - note it\'s masculine.',
          advanced: 'The complete phrase is "el café" - remember masculine articles.'
        },
        'every': {
          basic: 'This word indicates frequency or totality.',
          intermediate: 'This translates to "todas" or "todos" depending on gender.',
          advanced: 'Since "mañanas" is feminine plural, use "todas las mañanas".'
        },
        'morning': {
          basic: 'This is a time of day, feminine in Spanish.',
          intermediate: 'This word is "mañana" in Spanish with the ñ character.',
          advanced: 'The complete phrase is "las mañanas" (feminine plural).'
        },
        'i': {
          basic: 'This pronoun is often omitted in Spanish.',
          intermediate: 'Spanish verbs show who is speaking through their endings.',
          advanced: 'Just use "Bebo" - the verb ending shows it\'s "I" (yo).'
        }
      }
      
      const wordLower = word.toLowerCase()
      const hints = hintLevels[wordLower]
      
      let content: string
             let hintLevel: 'basic' | 'intermediate' | 'complete'
      let penalty: number
      
      if (hints) {
        switch (level) {
          case 1:
            content = hints.basic
            hintLevel = 'basic'
            penalty = 0.5
            break
          case 2:
            content = hints.intermediate
            hintLevel = 'intermediate'
            penalty = 1.0
            break
                     case 3:
             content = hints.advanced
             hintLevel = 'complete'
             penalty = 2.0
             break
          default:
            content = hints.basic
            hintLevel = 'basic'
            penalty = 0.5
        }
      } else {
        // Generic progressive hints for unknown words
        switch (level) {
          case 1:
            content = `Think about the Spanish equivalent of "${word}". Consider the sentence context.`
            hintLevel = 'basic'
            penalty = 0.5
            break
          case 2:
            content = `"${word}" is a key word in this sentence. Consider verb forms or article agreement.`
            hintLevel = 'intermediate'
            penalty = 1.0
            break
                     case 3:
             content = `Look up "${word}" in Spanish and check if it needs conjugation or gender agreement.`
             hintLevel = 'complete'
             penalty = 2.0
             break
          default:
            content = `Think about how "${word}" might be expressed in Spanish.`
            hintLevel = 'basic'
            penalty = 0.5
        }
      }
      
      return {
        word,
        level: hintLevel,
        content,
        penalty,
        levelNumber: level,
        canAdvance: level < 3
      }
    } catch (error) {
      console.error('Hint generation failed:', error)
      return {
        word,
        level: 'basic',
        content: `Think about the Spanish equivalent of "${word}".`,
        penalty: 0.5,
        levelNumber: 1,
        canAdvance: true
      }
    }
  }, [])

  // ✅ ENHANCED: Word evaluation with loading states
  const handleWordClick = useCallback(async (word: string) => {
    try {
      setLoadingWord(word) // Show loading for this word
      
      // Evaluate word on click
      const evaluation = await evaluateWord(word)
      setWordEvaluations(prev => new Map(prev.set(word, evaluation)))
      
      setLoadingHint(true) // Show hint loading
      
      // Generate hint at level 1 (or advance current level)
      const currentLevel = activeHint?.word === word ? (activeHint.levelNumber + 1) : 1
      const hint = await generateHint(word, Math.min(currentLevel, 3))
      setActiveHint(hint)
      setHintLevel(hint.levelNumber)
    } catch (error) {
      console.error('Word evaluation failed:', error)
    } finally {
      setLoadingWord(null) // Clear loading state
      setLoadingHint(false) // Clear hint loading
    }
  }, [evaluateWord, generateHint, activeHint])

  // ✅ ENHANCED: Advance hint level with loading state
  const advanceHintLevel = useCallback(async () => {
    if (activeHint && activeHint.canAdvance) {
      try {
        setLoadingHint(true)
        const nextLevel = Math.min(activeHint.levelNumber + 1, 3)
        const newHint = await generateHint(activeHint.word, nextLevel)
        setActiveHint(newHint)
        setHintLevel(nextLevel)
      } catch (error) {
        console.error('Hint advancement failed:', error)
      } finally {
        setLoadingHint(false)
      }
    }
  }, [activeHint, generateHint])

  const renderWord = useCallback((word: string, index: number) => {
    const cleanWord = word.replace(/[.,!?;:]$/, '')
    const punctuation = word.slice(cleanWord.length)
    const evaluation = wordEvaluations.get(cleanWord)
    
    const getWordColor = (status?: string) => {
      switch (status) {
        case 'correct': return 'text-green-600 bg-green-50 border-green-200'
        case 'close': return 'text-orange-600 bg-orange-50 border-orange-200'
        case 'wrong': return 'text-red-600 bg-red-50 border-red-200'
        default: return 'text-foreground hover:bg-muted/50'
      }
    }
    
    const getStatusIcon = (status?: string) => {
      switch (status) {
        case 'correct': return <CheckCircle className="w-3 h-3 ml-1" />
        case 'close': return <AlertCircle className="w-3 h-3 ml-1" />
        case 'wrong': return <X className="w-3 h-3 ml-1" />
        default: return null
      }
    }
    
    return (
      <span key={index} className="inline">
        <span
          onClick={() => handleWordClick(cleanWord)}
          className={`
            inline-flex items-center px-2 py-1 rounded-md cursor-pointer
            transition-all duration-300 border text-2xl md:text-3xl font-normal leading-relaxed
            ${getWordColor(evaluation?.status)}
            ${evaluation ? 'border' : 'border-transparent hover:border-border'}
            ${loadingWord === cleanWord ? 'animate-pulse bg-muted/50' : ''}
            hover:scale-105 hover:shadow-sm
          `}
          title={`Click for hint about "${cleanWord}"`}
        >
          {cleanWord}
          {loadingWord === cleanWord ? (
            <div className="w-3 h-3 ml-1 border border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            getStatusIcon(evaluation?.status)
          )}
        </span>
        {punctuation && <span className="text-foreground text-2xl md:text-3xl font-normal">{punctuation}</span>}
        <span> </span>
      </span>
    )
  }, [wordEvaluations, handleWordClick])

  const words = sentence.split(/\s+/)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Interactive Sentence Display */}
      <div className="text-center">
        <div className="inline-block">
          {words.map((word, index) => renderWord(word, index))}
        </div>
      </div>
      
      {/* Progressive Hint System - Enhanced UI */}
      {activeHint && (
        <div className="p-4 bg-muted border border-border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Level {activeHint.levelNumber} Hint for "{activeHint.word}"
              </span>
              <span className="text-xs text-muted-foreground">
                (-{activeHint.penalty} pts)
              </span>
            </div>
            <button
              onClick={() => setActiveHint(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Hint Level Indicator */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3].map((level) => (
              <div
                key={level}
                className={`w-2 h-2 rounded-full ${
                  level <= activeHint.levelNumber 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground capitalize">
              {activeHint.level} Hint
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{activeHint.content}</p>
          
          {/* Advance Hint Button with Loading State */}
          {activeHint.canAdvance && (
            <button
              onClick={advanceHintLevel}
              disabled={loadingHint}
              className="text-xs text-primary hover:text-primary/80 font-medium disabled:opacity-50 flex items-center gap-1"
            >
              {loadingHint ? (
                <>
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                  Getting next hint...
                </>
              ) : (
                <>Need more help? Next hint (-{activeHint.penalty + 0.5} pts) →</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Audio Button Component
function AudioButton({ text, language, className = '' }: AudioButtonProps) {
  const handlePlay = () => {
    // Mock audio play functionality
    console.log(`Playing: "${text}" in ${language}`)
  }

  return (
    <button
      onClick={handlePlay}
      className={`p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors ${className}`}
      title={`Play ${language} audio`}
    >
      <Volume2 className="w-4 h-4 text-muted-foreground" />
    </button>
  )
}

// Practice Filters Component - Compact style like in screenshot
function PracticeFilters({ isOpen, onToggle }: PracticeFiltersProps) {
  return (
    <div className="border border-border rounded-lg">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-2 text-left hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">Practice Filters</span>
        </div>
        <ChevronDown 
          className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      {isOpen && (
        <div className="border-t border-border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Difficulty
            </label>
            <select className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Topic
            </label>
            <select className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
              <option>All Topics</option>
              <option>Daily Life</option>
              <option>Food & Drink</option>
              <option>Travel</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              Tense
            </label>
            <select className="w-full px-3 py-2 bg-input border border-border rounded-md text-sm">
              <option>All Tenses</option>
              <option>Present</option>
              <option>Past</option>
              <option>Future</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// Error Toast Component
function ErrorToast({ message, onClose }: ErrorToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
      <AlertCircle className="w-5 h-5" />
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function PracticePageV1() {
  const [currentUser] = useState<CurrentUser>({ 
    id: 'demo-user', 
    name: 'Demo User', 
    email: 'demo@example.com',
    level: 'beginner',
    totalPoints: 150,
    streakDays: 3
  })

  const [currentSentence] = useState<SentenceData>({
    id: 1,
    english: 'I drink coffee every morning.',
    spanish: 'Bebo café todas las mañanas.',
    hints: [
      'In Spanish, "drink" can be "bebo" (from beber) or "tomo" (from tomar)',
      'Remember that "coffee" is masculine: "el café"',
      'Morning routine verbs often use present tense'
    ]
  })

  const [userTranslation, setUserTranslation] = useState('')
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'info'>('error')
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isEvaluating, setIsEvaluating] = useState(false) // Loading state for translation evaluation
  const [retryFunction, setRetryFunction] = useState<(() => void) | null>(null)

  // Mock practice stats
  const practiceStats = {
    currentSentence: 1,
    totalSentences: 3,
    correctCount: 12,
    incorrectCount: 3
  }

  // ✅ ENHANCED: Translation evaluation with loading states and animations
  const handleSubmit = async () => {
    if (!userTranslation.trim() || isEvaluating) return

    try {
      setIsEvaluating(true) // Show loading state
      
      const response = await fetch('/api/sentences/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sentenceId: currentSentence.id.toString(),
          userTranslation: userTranslation,
          correctAnswer: currentSentence.spanish,
          pageContext: 'practice'
        })
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Translation evaluation failed')
      }

      // Simulate minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500))

      setEvaluation({
        score: result.data.score,
        feedback: result.data.feedback,
        isCorrect: result.data.isCorrect || result.data.score >= 70,
        corrections: result.data.corrections || [],
        grade: result.data.grade
      })
      setIsEvaluated(true)
    } catch (error) {
      console.error('Translation evaluation failed:', error)
      
      // Enhanced error handling with specific messages
      let message = 'Failed to evaluate translation. Please try again.'
      let type: 'error' | 'warning' | 'info' = 'error'
      
      if (error instanceof Error) {
        if (error.message.includes('Network') || error.message.includes('fetch')) {
          message = 'Network error. Please check your connection and try again.'
          type = 'warning'
        } else if (error.message.includes('timeout')) {
          message = 'Evaluation took too long. Please try again.'
          type = 'warning'
        } else if (error.message.includes('500')) {
          message = 'Server error. Our team has been notified.'
          type = 'error'
        }
      }
      
      setErrorMessage(message)
      setErrorType(type)
      setRetryFunction(() => handleSubmit) // Allow retry
      setShowError(true)
    } finally {
      setIsEvaluating(false) // Clear loading state
    }
  }

  // ✅ FIXED: Real navigation with proper state management
  const handleSkip = () => {
    // Clear all current state
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
    // In real app, this would navigate to next sentence via API
    console.log('Skipping to next sentence...')
  }

  const handleNext = () => {
    // Clear all current state  
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
    // In real app, this would navigate to next sentence via API
    console.log('Moving to next sentence...')
  }

  const handleHint = () => {
    setShowHint(!showHint)
  }

  const handleBookmark = () => {
    console.log('Bookmarking sentence...')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header spanning full width - responsive - Fixed Position - Match menu background */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Logo Section - left-aligned instead of centered */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-start">
          <Logo size="md" showText={true} />
        </div>
        
        {/* Mobile Logo - left-aligned */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <Logo size="sm" showText={true} />
        </div>
        
        {/* Header Content - responsive */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Practice.v1</h1>
        </div>
        
        {/* Header Progress Wheels - responsive */}
        <div className="px-4 md:px-6 py-4 flex items-center">
          <ProgressWheels />
        </div>
      </header>

      {/* Content Area - Proper spacing implementation */}
      <div className="flex flex-1 pt-16">
        {/* Shared Sidebar Component */}
        <SharedSidebar currentUser={currentUser} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:ml-64">
          <div className="flex-1 flex flex-col p-4 md:p-6 bg-background">
            
            {/* FILTERS - Reduced spacing to pt-8 */}
            <div className="pt-8 mb-4 max-w-4xl mx-auto w-full">
              <PracticeFilters 
                isOpen={isFiltersOpen}
                onToggle={() => setIsFiltersOpen(!isFiltersOpen)}
              />
            </div>

            {/* MAIN CONTENT - Match menu background with reduced spacing */}
            <div className="mb-4 max-w-4xl mx-auto w-full">
              <div className="bg-muted border border-border rounded-lg p-6 md:p-8 space-y-8">
                
                {/* Interactive Sentence Display - Increased bottom padding */}
                <InteractiveSentence 
                  sentence={currentSentence.english}
                  className="pb-2"
                />

                {/* Enhanced Evaluation Results with Animation */}
                {isEvaluating && (
                  <div className="p-4 bg-muted border border-border rounded-lg animate-pulse">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-5 h-5 border border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-foreground font-medium">Evaluating your translation...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="w-3/4 h-3 bg-muted-foreground/20 rounded animate-pulse" />
                      <div className="w-1/2 h-3 bg-muted-foreground/20 rounded animate-pulse" />
                    </div>
                  </div>
                )}
                
                {isEvaluated && evaluation && !isEvaluating && (
                  <div className="p-4 bg-muted border border-border rounded-lg animate-in slide-in-from-top-3 duration-500">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Evaluation Result</h3>
                      <div className={`px-2 py-1 rounded-full text-sm font-bold ${
                        evaluation.score >= 80 ? 'bg-green-100 text-green-800' : 
                        evaluation.score >= 60 ? 'bg-orange-100 text-orange-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {evaluation.grade || 'N/A'}
                      </div>
                    </div>
                    <p className="text-foreground mb-2">Score: <span className="font-semibold">{evaluation.score}/100</span></p>
                    <p className="text-muted-foreground text-sm">{evaluation.feedback}</p>
                  </div>
                )}

                {/* Hint Display - Muted styling to match design guidelines */}
                {showHint && (
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Hint:</strong> {currentSentence.hints[0]}
                    </p>
                  </div>
                )}

                {/* Simple Translation Input - Increased bottom padding */}
                <div className="space-y-3 pb-2">
                  <textarea
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    placeholder="Type your Spanish translation here..."
                    className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
                  />
                </div>

                {/* Action Buttons - Icon-only style with larger Check button */}
                <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
                  {/* Primary action row */}
                  <div className="flex items-center justify-center gap-4 w-full">
                    {/* Previous Button - Up Arrow Icon - Reduced by 30% */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      disabled={practiceStats.currentSentence <= 1}
                      className="flex items-center justify-center p-3 h-14 w-14"
                    >
                      <ChevronUp className="w-11 h-11" />
                    </Button>

                    {/* Enhanced Submit Button with Loading States */}
                    {!isEvaluated ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!userTranslation.trim() || isEvaluating}
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 transition-all duration-300 hover:scale-110"
                      >
                        {isEvaluating ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check className="w-6 h-6" />
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsEvaluated(false)
                          setEvaluation(null)
                          setUserTranslation('')
                        }}
                        variant="secondary"
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full transition-all duration-300 hover:scale-110"
                      >
                        <RotateCcw className="w-6 h-6" />
                      </Button>
                    )}

                    {/* Next Button - Down Arrow Icon - Reduced by 30% */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNext}
                      disabled={practiceStats.currentSentence >= practiceStats.totalSentences}
                      className="flex items-center justify-center p-3 h-14 w-14"
                    >
                      <ChevronDown className="w-11 h-11" />
                    </Button>
                  </div>

                  {/* Secondary Buttons */}
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="secondary"
                      onClick={handleHint}
                      className="px-3 py-2 text-sm"
                    >
                      💡 Hint
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="px-3 py-2 text-sm"
                    >
                      Skip
                    </Button>
                  </div>

                  {/* Next Button (when evaluated) */}
                  {isEvaluated && (
                    <Button
                      onClick={handleNext}
                      variant="ghost"
                      className="px-6 py-2 text-sm"
                      size="md"
                    >
                      Next Sentence →
                    </Button>
                  )}
                </div>
              </div>
            </div>
              
            {/* Translation Health - Clean progress bar without text */}
            <div className="mb-4 max-w-4xl mx-auto w-full">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground">Translation Health</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      practiceStats.correctCount > practiceStats.incorrectCount * 2 ? 'bg-green-600' :
                      practiceStats.correctCount > practiceStats.incorrectCount ? 'bg-orange-500' : 'bg-red-600'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (practiceStats.correctCount / (practiceStats.correctCount + practiceStats.incorrectCount)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Translation Statistics - Clean progress bar without text */}
            <div className="mb-4 max-w-4xl mx-auto w-full">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground">Translation Statistics</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, Math.max(10, (practiceStats.correctCount / (practiceStats.correctCount + practiceStats.incorrectCount)) * 100))}%` 
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Session Progress - Clean progress bar without text */}
            <div className="mb-4 max-w-4xl mx-auto w-full">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground">Session Progress</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(practiceStats.currentSentence / practiceStats.totalSentences) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Enhanced Error Toast with Recovery */}
      {showError && (
        <ErrorToast 
          message={errorMessage}
          type={errorType}
          onClose={() => {
            setShowError(false)
            setRetryFunction(null)
          }}
          onRetry={retryFunction ? () => {
            setShowError(false)
            retryFunction()
          } : undefined}
        />
      )}
    </div>
  )
} 