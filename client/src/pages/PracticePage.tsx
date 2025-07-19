import { useState } from 'react'
import { useLocation } from 'wouter'
import SharedSidebar from '../components/Sidebar'
import { CheckCircle, XCircle, Lightbulb, RefreshCw, SkipForward, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Check, ArrowRight, RotateCcw, BookmarkPlus, BookOpen, Book, Brain, MessageCircle, TrendingUp, Award, Settings, User, Filter } from 'lucide-react'
import type { 
  Sentence, 
  EvaluationResult, 
  PracticeUIState, 
  CurrentUser,
  PracticeSessionUI 
} from '../types'

// TypeScript Interfaces (Following best-practices.md patterns)
interface SentenceData {
  id: string
  english: string
  spanish: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  hints: string[]
}

interface PracticeFiltersProps {
  isOpen: boolean
  onToggle: () => void
}

interface SessionStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  incorrectCount: number
}

interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

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
}

interface NavigationFooterProps {
  currentSentence: number
  totalSentences: number
  onPrevious: () => void
  onNext: () => void
}

interface ErrorToastProps {
  message: string
  onClose: () => void
}

interface PracticeStatsProps {
  currentSentence: number
  totalSentences: number
  correctCount: number
  streakCount: number
}

// Modular Components (Following component architecture)

// Clickable Word Component for Individual Word Hints
interface ClickableWordProps {
  word: string
  onWordClick: (word: string) => void
  isLast?: boolean
}

function ClickableWord({ word, onWordClick, isLast = false }: ClickableWordProps) {
  const cleanWord = word.replace(/[.,!?;:]$/, '')
  const punctuation = word.slice(cleanWord.length)
  
  return (
    <>
      <span
        onClick={() => onWordClick(cleanWord)}
        className="cursor-pointer hover:bg-primary/20 hover:text-primary px-1 py-0.5 rounded transition-colors"
        title={`Click for hint about "${cleanWord}"`}
      >
        {cleanWord}
      </span>
      {punctuation && <span>{punctuation}</span>}
      {!isLast && <span> </span>}
    </>
  )
}

function PracticeFilters({ isOpen, onToggle }: PracticeFiltersProps) {
  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 card text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Practice Filters</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="mt-2 p-4" 
          style={{
            background: 'var(--background-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-subtle)'
          }}
        >
          <div className="space-y-3">
            <div>
              <label className="text-sm text-foreground mb-2 block">Difficulty</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">Tense</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Present Tense</option>
                <option>Past Tense</option>
                <option>Future Tense</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-foreground mb-2 block">Topic</label>
              <select className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground">
                <option>Daily Life</option>
                <option>Food & Drink</option>
                <option>Travel</option>
                <option>Work</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SessionStats({ currentSentence, totalSentences, correctCount, incorrectCount }: SessionStatsProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 md:gap-0">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          Sentence <span className="text-blue-400 font-medium">{currentSentence}</span> of <span className="text-blue-400 font-medium">{totalSentences}</span>
        </span>
        <div className="w-16 h-2 bg-muted rounded-full">
          <div 
            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentSentence / totalSentences) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-muted-foreground">
          <span className="text-green-400 font-medium">{correctCount} correct</span> • <span className="text-red-400 font-medium">{incorrectCount} incorrect</span>
        </div>
      </div>
    </div>
  )
}

// Practice Stats Component (Similar to ReadingPage and MemorizePage)
function PracticeStats({ currentSentence, totalSentences, correctCount, streakCount }: PracticeStatsProps) {
  const accuracy = totalSentences > 0 ? Math.round((correctCount / totalSentences) * 100) : 0

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {currentSentence}/{totalSentences}
            </div>
            <div className="text-xs text-muted-foreground">Sentences</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {correctCount}
            </div>
            <div className="text-xs text-muted-foreground">Correct</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <TrendingUp className="w-6 h-6 text-purple-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {streakCount}
            </div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Award className="w-6 h-6 text-orange-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {accuracy}%
            </div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TranslationInput({ value, onChange, disabled = false, placeholder = "Type your Spanish translation here..." }: TranslationInputProps) {
  return (
    <div className="mb-6">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono"
      />
    </div>
  )
}

function ActionButtons({ isEvaluated, userTranslation, onSubmit, onSkip, onNext, onHint, onBookmark, onNavigatePrevious, onNavigateNext, showHint, currentSentence, totalSentences }: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      {/* Main Action Row with Navigation */}
      <div className="flex items-center justify-center gap-3">
        {/* 1. Previous Button */}
        <button
          onClick={onNavigatePrevious}
          disabled={currentSentence <= 1}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
          Previous
        </button>

        {/* 2. Check Button */}
        <button
          onClick={onSubmit}
          disabled={!userTranslation.trim()}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="w-4 h-4" />
          Check
        </button>

        {/* 3. Next Button */}
        <button
          onClick={onNavigateNext}
          disabled={currentSentence >= totalSentences}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-white hover:text-white hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 4. Hint Button */}
        <button
          onClick={onHint}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          {showHint ? 'Hide' : 'Hint'}
        </button>

        {/* 5. Skip Button */}
        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Skip
        </button>

        {/* 6. Bookmark Button */}
        <button
          onClick={onBookmark}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <BookmarkPlus className="w-4 h-4" />
          Bookmark
        </button>
      </div>
    </div>
  )
}

function NavigationFooter({ currentSentence, totalSentences, onPrevious, onNext }: NavigationFooterProps) {
  return (
    <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
      <button 
        onClick={onPrevious}
        disabled={currentSentence <= 1}
        className="flex items-center gap-2 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>
      
      <span className="text-sm text-muted-foreground">
        Sentence <span className="text-foreground font-medium">{currentSentence}</span> of <span className="text-foreground font-medium">{totalSentences}</span>
      </span>
      
      <button 
        onClick={onNext}
        disabled={currentSentence >= totalSentences}
        className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function ErrorToast({ message, onClose }: ErrorToastProps) {
  return (
    <div className="fixed bottom-6 right-6 px-4 py-3 bg-destructive text-destructive-foreground rounded-lg border-l-4 border-l-red-500 shadow-lg z-50 max-w-sm">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-sm">Error</h4>
          <p className="text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-destructive-foreground/70 hover:text-destructive-foreground ml-4"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Main Practice Page Component (Following page structure)
export default function PracticePage() {
  const [location, setLocation] = useLocation()
  
  // State Management (Following TanStack Query patterns)
  const [currentSentence, setCurrentSentence] = useState<SentenceData>({
    id: '1',
    english: 'I drink coffee every morning.',
    spanish: 'Bebo café todas las mañanas.',
    difficulty: 'beginner',
    hints: ['Think about the verb for drinking', 'Coffee is "café"', 'Every morning is "todas las mañanas"']
  })
  
  const [userTranslation, setUserTranslation] = useState('Bebo cafe todas las mananas.')
  const [isEvaluated, setIsEvaluated] = useState(true) // Changed to true to see Next button
  const [showFilters, setShowFilters] = useState(false)
  const [showError, setShowError] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const [wordHint, setWordHint] = useState<{word: string, hint: string} | null>(null)
  const [practiceSettings] = useState({
    difficulty: 'Beginner',
    tense: 'Present Tense',
    topic: 'Daily Life'
  })
  const [sessionStats] = useState({
    currentSentence: 1,
    totalSentences: 3,
    correctCount: 12,
    incorrectCount: 3
  })
  const [practiceStats] = useState({
    currentSentence: 1,
    totalSentences: 3,
    correctCount: 12,
    streakCount: 5
  })
  const [currentUser] = useState<CurrentUser>({
    id: 'demo-user-1',
    name: 'Demo User',
    email: 'local@example.com',
    level: 'beginner',
    totalPoints: 150,
    streakDays: 3
  })

  const navigationItems = [
    { icon: BookOpen, label: 'Practice', path: '/practice', active: true },
    { icon: Book, label: 'Reading', path: '/reading', active: false },
    { icon: Brain, label: 'Memorize', path: '/memorize', active: false },
    { icon: MessageCircle, label: 'Conversations', path: '/conversations', active: false },
    { icon: TrendingUp, label: 'Progress', path: '/progress', active: false },
    { icon: Award, label: 'Achievements', path: '/achievements', active: false },
    { icon: Settings, label: 'Settings', path: '/settings', active: false },
  ]

  // Event Handlers (Following component patterns)
  const handleSubmit = () => {
    // Mock evaluation logic - replace with TanStack Query mutation
    setIsEvaluated(true)
  }

  const handleNext = () => {
    setUserTranslation('')
    setIsEvaluated(false)
    // In real app: load next sentence with TanStack Query
  }

  const handleSkip = () => {
    setUserTranslation('')
    setIsEvaluated(false)
    // In real app: skip to next sentence
  }

  const handleHint = () => {
    setShowHint(!showHint)
  }

  const handleBookmark = () => {
    // Mock bookmark functionality - in real app, this would add sentence to flashcards/memorize
    console.log('Bookmarking sentence for flashcards:', currentSentence.english)
    // This would typically call an API to add the sentence to the user's memorization deck
  }

  const handleWordClick = (word: string) => {
    // Mock word-specific hint generation - in real app, this would call API
    const wordHints: {[key: string]: string} = {
      'I': 'Subject pronoun for first person singular',
      'drink': 'Verb meaning "beber" in Spanish (present tense)',
      'coffee': 'Noun meaning "café" in Spanish',
      'every': 'Adjective meaning "cada" or "todo/a" in Spanish',
      'morning': 'Noun meaning "mañana" in Spanish (time of day)',
      'The': 'Definite article "el/la" in Spanish',
      'dog': 'Noun meaning "perro" in Spanish',
      'runs': 'Verb meaning "corre" in Spanish (3rd person singular)',
      'in': 'Preposition meaning "en" in Spanish',
      'park': 'Noun meaning "parque" in Spanish'
    }
    
    const hint = wordHints[word] || `Word: "${word}" - Click for detailed translation and grammar explanation`
    setWordHint({word, hint})
  }

  const renderClickableText = (text: string) => {
    const words = text.split(' ')
    return (
      <h2 className="text-3xl font-light text-foreground leading-relaxed mb-4">
        {words.map((word, index) => (
          <ClickableWord
            key={index}
            word={word}
            onWordClick={handleWordClick}
            isLast={index === words.length - 1}
          />
        ))}
      </h2>
    )
  }

  const handleNavigatePrevious = () => {
    // In real app: navigate to previous sentence
    if (sessionStats.currentSentence > 1) {
      // Navigate to previous sentence
    }
  }

  const handleNavigateNext = () => {
    // In real app: navigate to next sentence
    if (sessionStats.currentSentence < sessionStats.totalSentences) {
      // Navigate to next sentence
    }
  }

  const handlePrevious = () => {
    // In real app: load previous sentence
  }

  const handleNavigationNext = () => {
    // In real app: navigate to next sentence
  }

  const handleChangeSettings = () => {
    // In real app: open settings modal or navigate to settings page
    console.log('Opening practice settings...')
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header spanning full width - responsive - Fixed Position */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Logo Section - responsive */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
            </div>
          </div>
        </div>
        
        {/* Mobile Logo - only on mobile */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Header Content - responsive */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">Translation Practice</h1>
        </div>
        
        {/* Header Stats - responsive */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          <div className="px-2 md:px-3 py-1 bg-yellow-500 text-black rounded-lg text-xs font-medium">
            0 day streak
          </div>
          <div className="px-2 md:px-3 py-1 bg-blue-500 text-gray-200 rounded-lg text-xs font-medium">
            ⭐ 0 pts
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Shared Sidebar Component */}
        <SharedSidebar currentUser={currentUser} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:ml-64">
          <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
            {/* Practice Stats - Always first */}
            <div className="mb-6">
              <PracticeStats 
                currentSentence={practiceStats.currentSentence}
                totalSentences={practiceStats.totalSentences}
                correctCount={practiceStats.correctCount}
                streakCount={practiceStats.streakCount}
              />
            </div>

            {/* Practice Filters Component - Always second */}
          <div className="mb-6 max-w-4xl mx-auto w-full">
            <PracticeFilters isOpen={showFilters} onToggle={() => setShowFilters(!showFilters)} />
          </div>

          {/* Practice Container - Always third */}
          <div className="max-w-4xl mx-auto w-full">
            <div className="w-full card p-4 md:p-8">
              {/* English Sentence Display */}
              <div className="mb-8 text-left">
                {renderClickableText(currentSentence.english)}
                {wordHint && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>"{wordHint.word}":</strong> {wordHint.hint}
                        </p>
                      </div>
                      <button
                        onClick={() => setWordHint(null)}
                        className="text-blue-500 hover:text-blue-700 ml-2"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
                {showHint && (
                  <div className="mt-3 p-3 bg-muted border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>General Hint:</strong> {currentSentence.hints[0]}
                    </p>
                  </div>
                )}
              </div>

              {/* Translation Input Component */}
              <TranslationInput 
                value={userTranslation}
                onChange={setUserTranslation}
              />

              {/* Hints Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    💡 Hints used: <span className="text-foreground font-medium">0</span> (<span className="text-red-400">~0 points</span>)
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Click words above for hints
                  </div>
                </div>
              </div>

              {/* Action Buttons Component */}
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
                currentSentence={sessionStats.currentSentence}
                totalSentences={sessionStats.totalSentences}
              />

              {/* Standard Progress Bar */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Session Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {sessionStats.currentSentence} of {sessionStats.totalSentences} sentences
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(sessionStats.currentSentence / sessionStats.totalSentences) * 100}%` }}
                  />
                </div>
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
