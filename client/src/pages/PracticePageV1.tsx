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
}

// Interactive Sentence Display Component
interface InteractiveSentenceProps {
  sentence: string
  className?: string
}

function InteractiveSentence({ sentence, className = '' }: InteractiveSentenceProps) {
  const [wordEvaluations, setWordEvaluations] = useState<Map<string, WordEvaluation>>(new Map())
  const [activeHint, setActiveHint] = useState<HintData | null>(null)

  // Mock evaluation function (replace with real logic)
  const evaluateWord = useCallback(async (word: string): Promise<WordEvaluation> => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const accuracy = Math.random()
    if (accuracy > 0.7) {
      return { word, status: 'correct', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    } else if (accuracy > 0.4) {
      return { word, status: 'close', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    } else {
      return { word, status: 'wrong', confidence: accuracy, attempts: 1, needsHint: false, hintShown: false }
    }
  }, [])

  const generateHint = useCallback(async (word: string): Promise<HintData> => {
    return {
      word,
      level: 'basic',
      content: `"${word}" translates to "${word === 'drink' ? 'bebo/tomo' : 'palabra'}" in Spanish`,
      penalty: 1.0
    }
  }, [])

  const handleWordClick = useCallback(async (word: string) => {
    // Evaluate word on click
    const evaluation = await evaluateWord(word)
    setWordEvaluations(prev => new Map(prev.set(word, evaluation)))
    
    // Generate hint
    const hint = await generateHint(word)
    setActiveHint(hint)
  }, [evaluateWord, generateHint])

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
            transition-all duration-200 border text-2xl md:text-3xl font-normal leading-relaxed
            ${getWordColor(evaluation?.status)}
            ${evaluation ? 'border' : 'border-transparent hover:border-border'}
          `}
          title={`Click for hint about "${cleanWord}"`}
        >
          {cleanWord}
          {getStatusIcon(evaluation?.status)}
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
      
      {/* Hint Popup - Muted styling to match design guidelines */}
      {activeHint && (
        <div className="p-3 bg-muted border border-border rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Hint for "{activeHint.word}" (-{activeHint.penalty} pts)
              </span>
            </div>
            <button
              onClick={() => setActiveHint(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">{activeHint.content}</p>
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
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Mock practice stats
  const practiceStats = {
    currentSentence: 1,
    totalSentences: 3,
    correctCount: 12,
    incorrectCount: 3
  }

  const handleSubmit = async () => {
    if (!userTranslation.trim()) return

    try {
      // Mock evaluation result
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockEvaluation = {
        score: 8.5,
        feedback: 'Great translation! Minor grammar improvements possible.',
        isCorrect: true,
        corrections: []
      }

      setEvaluation(mockEvaluation)
      setIsEvaluated(true)
    } catch (error) {
      setShowError(true)
    }
  }

  const handleSkip = () => {
    console.log('Skipping sentence...')
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
  }

  const handleNext = () => {
    console.log('Next sentence...')
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
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

                {/* Evaluation Results - Muted styling to match design guidelines */}
                {isEvaluated && evaluation && (
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <h3 className="font-semibold text-foreground mb-2">Evaluation Result</h3>
                    <p className="text-foreground mb-2">Score: {evaluation.score}/10</p>
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

                    {/* Check/Submit Button - Green Check Mark Icon */}
                    {!isEvaluated ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={!userTranslation.trim()}
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-6 h-6" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsEvaluated(false)
                          setEvaluation(null)
                          setUserTranslation('')
                        }}
                        variant="secondary"
                        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full"
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

      {/* Error Toast Component */}
      {showError && (
        <ErrorToast 
          message="Failed to evaluate translation. Please try again."
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  )
} 