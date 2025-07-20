import React, { useState, useEffect, useCallback } from 'react'
import SharedSidebar from '../components/Sidebar'
import { ChevronDown, Filter, BookOpen, Lightbulb, CheckCircle, AlertCircle, X, Target, Clock, Zap } from 'lucide-react'
import { ActionButtons, ProgressStats, ProgressWheels } from '../components/ui'
import { Logo } from '../components/Logo'
import { usePracticeWorkflow } from '../hooks/usePractice'
import type { CurrentUser, Sentence } from '../types'

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

export default function PracticePage() {
  const [currentUser] = useState<CurrentUser>({ 
    id: 'demo-user', 
    name: 'Demo User', 
    email: 'demo@example.com',
    level: 'beginner',
    totalPoints: 150,
    streakDays: 3
  })

  // ✅ REAL API INTEGRATION - Using actual backend
  const practiceWorkflow = usePracticeWorkflow(currentUser.id, 'spanish')
  
  const [userTranslation, setUserTranslation] = useState('')
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [evaluation, setEvaluation] = useState<any>(null)
  const [showHint, setShowHint] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // ✅ REAL DATA - From backend API with proper navigation
  const practiceStats = {
    currentSentence: practiceWorkflow.currentSentenceIndex + 1, // 1-based for display
    totalSentences: practiceWorkflow.totalSentences,
    correctCount: 12, // TODO: Get from user progress
    incorrectCount: 3, // TODO: Get from user progress
    canGoPrevious: practiceWorkflow.canGoPrevious,
    canGoNext: practiceWorkflow.canGoNext
  }

  // ✅ REAL SENTENCE DATA - From backend  
  const currentSentence = practiceWorkflow.currentSentence ? {
    id: parseInt(practiceWorkflow.currentSentence.id),
    english: practiceWorkflow.currentSentence.english,
    spanish: practiceWorkflow.currentSentence.spanish,
    hints: Array.isArray(practiceWorkflow.currentSentence.hints) 
      ? practiceWorkflow.currentSentence.hints 
      : JSON.parse(practiceWorkflow.currentSentence.hints as string || '[]')
  } : null

  const handleSubmit = async () => {
    if (!userTranslation.trim() || !currentSentence) return

    try {
      // ✅ REAL API EVALUATION - Using backend evaluation
      const startTime = Date.now()
      const response = await fetch('http://localhost:5001/api/sentences/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sentenceId: currentSentence.id.toString(),
          userTranslation: userTranslation,
          timeSpent: Date.now() - startTime,
          hintsUsed: showHint ? 1 : 0
        })
      })

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Evaluation failed')
      }

      setEvaluation({
        score: result.data.score,
        feedback: result.data.feedback,
        isCorrect: result.data.isCorrect,
        grade: result.data.grade,
        pointsEarned: result.data.pointsEarned
      })
      setIsEvaluated(true)
    } catch (error) {
      console.error('Evaluation error:', error)
      setShowError(true)
    }
  }

  const handleSkip = () => {
    // ✅ FIXED: Actually skip to next sentence
    practiceWorkflow.goToNextSentence()
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
  }

  const handleNext = () => {
    // ✅ FIXED: Actually go to next sentence
    practiceWorkflow.goToNextSentence()
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

  const handleNavigatePrevious = () => {
    // ✅ FIXED: Actually go to previous sentence
    practiceWorkflow.goToPreviousSentence()
    setUserTranslation('')
    setIsEvaluated(false)
    setEvaluation(null)
    setShowHint(false)
  }

  const handleNavigateNext = () => {
    handleNext()
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
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Translation Practice</h1>
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
                {practiceWorkflow.isLoading ? (
                  <div className="text-center text-muted-foreground py-8">
                    Loading sentences...
                  </div>
                ) : practiceWorkflow.error ? (
                  <div className="text-center text-red-600 py-8">
                    Error loading sentences. Please refresh the page.
                  </div>
                ) : currentSentence ? (
                  <InteractiveSentence 
                    sentence={currentSentence.english}
                    className="pb-2"
                  />
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No sentences available.
                  </div>
                )}

                {/* Evaluation Results - Enhanced with grade and points */}
                {isEvaluated && evaluation && (
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">Evaluation Result</h3>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold text-lg ${
                          evaluation.score >= 80 ? 'text-green-600' : 
                          evaluation.score >= 60 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {evaluation.grade}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          +{evaluation.pointsEarned} pts
                        </span>
                      </div>
                    </div>
                    <p className="text-foreground mb-3">
                      Score: <span className="font-semibold">{evaluation.score}/100</span>
                    </p>
                    <p className="text-muted-foreground text-sm">{evaluation.feedback}</p>
                  </div>
                )}

                {/* Hint Display - Muted styling to match design guidelines */}
                {showHint && currentSentence && (
                  <div className="p-4 bg-muted border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Hint:</strong> {currentSentence.hints[0] || 'No hint available'}
                    </p>
                  </div>
                )}

                {/* Translation Input - Increased bottom padding */}
                <div className="space-y-3 pb-2">
                  <textarea
                    value={userTranslation}
                    onChange={(e) => setUserTranslation(e.target.value)}
                    placeholder="Type your Spanish translation here..."
                    className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
                  />
                </div>

                {/* Action Buttons */}
                <ActionButtons 
                  isEvaluated={isEvaluated}
                  userTranslation={userTranslation}
                  onSubmit={handleSubmit}
                  onSkip={handleSkip}
                  onNext={handleNext}
                  onHint={handleHint}
                  onBookmark={handleBookmark}
                  onNavigatePrevious={handleNavigatePrevious}
                  onNavigateNext={handleNavigateNext}
                  showHint={showHint}
                  currentSentence={practiceStats.currentSentence}
                  totalSentences={practiceStats.totalSentences}
                  canGoPrevious={practiceStats.canGoPrevious}  // ✅ NEW: Proper navigation
                  canGoNext={practiceStats.canGoNext}          // ✅ NEW: Proper navigation
                />
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
