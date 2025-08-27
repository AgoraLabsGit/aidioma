import { useState } from 'react'
import { useLocation } from 'wouter'
import { useUser } from '../hooks/useUser'
import type { CurrentUser } from '../types'
import { 
  Brain, 
  BookOpen, 
  Book, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  BookmarkPlus,
  Filter,
  RefreshCw,
  Eye,
  Target,
  Clock,
  Star
} from 'lucide-react'
import { motion, PanInfo } from 'framer-motion'

// TypeScript Interfaces for Flash Cards
interface FlashCardData {
  id: string
  spanish: string
  english: string
  originalSentence: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  nextReview: Date
  reviewCount: number
  successRate: number
}

interface FlashCardProps {
  card: FlashCardData
  onResult: (result: 'again' | 'hard' | 'good' | 'easy') => void
  onFlip: () => void
  isFlipped: boolean
}

interface MemorizeStatsProps {
  currentCard: number
  totalCards: number
  reviewsToday: number
  masteredWords: number
}

interface MemorizeFiltersProps {
  isOpen: boolean
  onToggle: () => void
  selectedDifficulty: string
  selectedStatus: string
  onDifficultyChange: (difficulty: string) => void
  onStatusChange: (status: string) => void
}

interface ActionButtonsProps {
  onPrevious: () => void
  onNext: () => void
  onHint: () => void
  onBookmark: () => void
  onShuffle: () => void
  onReset: () => void
  currentCard: number
  totalCards: number
  showHint: boolean
  canGoBack: boolean
  canGoForward: boolean
}

// Navigation items
const navigationItems = [
  { icon: BookOpen, label: 'Practice', path: '/practice' },
  { icon: Book, label: 'Reading', path: '/reading' },
  { icon: Brain, label: 'Memorize', path: '/memorize' },
  { icon: MessageCircle, label: 'Conversations', path: '/conversations' },
  { icon: TrendingUp, label: 'Progress', path: '/progress' },
  { icon: Award, label: 'Achievements', path: '/achievements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

// Helper function to get user initials
const getInitials = (email: string) => {
  return email.split('@')[0].slice(0, 2).toUpperCase()
}

// Flash Card Component with 3D Flip Animation
function FlashCard({ card, onResult, onFlip, isFlipped }: FlashCardProps) {
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null)

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      setDragDirection('right')
      setTimeout(() => onResult('good'), 300)
    } else if (info.offset.x < -threshold) {
      setDragDirection('left')
      setTimeout(() => onResult('again'), 300)
    }
    setDragDirection(null)
  }

  return (
    <div className="w-full max-w-md mx-auto" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full h-80 cursor-pointer"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={onFlip}
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          x: dragDirection === 'right' ? 100 : dragDirection === 'left' ? -100 : 0,
          opacity: dragDirection ? 0.7 : 1
        }}
        transition={{ duration: 0.6 }}
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
      >
        {/* Front - Spanish Word */}
        <div 
          className="absolute inset-0 rounded-xl shadow-lg"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          <div className="h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 flex flex-col justify-center text-center border border-border">
            <div className="flex justify-between items-start mb-4">
              <div className="text-xs text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                {card.difficulty}
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6">{card.spanish}</h2>

            {/* Success Rate Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm">{Math.round(card.successRate)}% success</span>
            </div>
          </div>
        </div>

        {/* Back - English + Action Buttons */}
        <div 
          className="absolute inset-0 rounded-xl shadow-lg"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)'
          }}
        >
          <div className="h-full bg-gradient-to-br from-green-900 to-teal-900 rounded-xl p-6 flex flex-col justify-between border border-border">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-4">{card.english}</h3>
              <div className="bg-green-800/30 rounded-lg p-3 mb-4">
                <p className="text-green-200 text-sm italic">"{card.originalSentence}"</p>
              </div>
            </div>
            
            {/* Spaced Repetition Buttons */}
            <div className="space-y-3">
              <p className="text-center text-green-300 text-sm mb-3">How well did you know this?</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); onResult('again') }}
                  className="bg-red-600 hover:bg-red-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Again
                  <div className="text-xs opacity-75">&lt; 1 min</div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onResult('hard') }}
                  className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Hard
                  <div className="text-xs opacity-75">&lt; 6 min</div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onResult('good') }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Good
                  <div className="text-xs opacity-75">&lt; 10 min</div>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onResult('easy') }}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  Easy
                  <div className="text-xs opacity-75">4 days</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Memorize Stats Component
function MemorizeStats({ currentCard, totalCards, reviewsToday, masteredWords }: MemorizeStatsProps) {
  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Brain className="w-6 h-6 text-purple-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {currentCard}/{totalCards}
            </div>
            <div className="text-xs text-muted-foreground">Cards</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Clock className="w-6 h-6 text-blue-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {reviewsToday}
            </div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Star className="w-6 h-6 text-yellow-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {masteredWords}
            </div>
            <div className="text-xs text-muted-foreground">Mastered</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Target className="w-6 h-6 text-green-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {Math.round((currentCard / totalCards) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Memorize Filters Component
function MemorizeFilters({ 
  isOpen, 
  onToggle, 
  selectedDifficulty, 
  selectedStatus,
  onDifficultyChange,
  onStatusChange 
}: MemorizeFiltersProps) {
  const difficulties = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const statuses = [
    { value: 'all', label: 'All Cards' },
    { value: 'new', label: 'New Cards' },
    { value: 'learning', label: 'Learning' },
    { value: 'review', label: 'Due for Review' },
    { value: 'mastered', label: 'Mastered' }
  ]

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 card text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Flash Card Filters</span>
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
          <div className="space-y-4">
            {/* Difficulty Filter */}
            <div>
              <label className="text-sm text-foreground mb-3 block font-medium">Difficulty Level</label>
              <div className="grid grid-cols-2 gap-3">
                {difficulties.map((difficulty) => (
                  <button
                    key={difficulty.value}
                    onClick={() => onDifficultyChange(difficulty.value)}
                    className={`p-3 rounded-lg border transition-colors text-sm ${
                      selectedDifficulty === difficulty.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {difficulty.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div>
                <label className="text-sm text-foreground mb-2 block">Card Status</label>
                <select 
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Action Buttons Component (Following our established pattern)
function ActionButtons({ 
  onPrevious, 
  onNext, 
  onHint, 
  onBookmark, 
  onShuffle, 
  onReset,
  currentCard, 
  totalCards, 
  showHint,
  canGoBack,
  canGoForward 
}: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      {/* Main Action Row with Navigation */}
      <div className="flex items-center justify-center gap-3">
        {/* 1. Previous Button */}
        <button
          onClick={onPrevious}
          disabled={!canGoBack}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
          Previous
        </button>

        {/* 2. Shuffle Button */}
        <button
          onClick={onShuffle}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Shuffle
        </button>

        {/* 3. Next Button */}
        <button
          onClick={onNext}
          disabled={!canGoForward}
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

        {/* 5. Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
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

// Main Memorize Page Component
export default function MemorizePage() {
  const [location, setLocation] = useLocation()
  
  // ✅ REAL STACK AUTH INTEGRATION
  const userAuth = useUser()
  
  // Redirect to sign-in if not authenticated
  if (!userAuth) {
    window.location.href = '/handler/sign-in'
    return null
  }

  const currentUser: CurrentUser = {
    id: userAuth.data.id,
    name: userAuth.data.name,
    email: userAuth.data.email,
    level: userAuth.data.level || 'beginner',
    totalPoints: userAuth.data.totalScore || 0,
    streakDays: userAuth.data.streak || 0
  }

  // Sample flash card data
  const [flashCards] = useState<FlashCardData[]>([
    {
      id: '1',
      spanish: 'gastronomía',
      english: 'gastronomy',
      originalSentence: 'La gastronomía española es muy rica.',
      difficulty: 'intermediate',
      nextReview: new Date(),
      reviewCount: 5,
      successRate: 78
    },
    {
      id: '2',
      spanish: 'península',
      english: 'peninsula',
      originalSentence: 'España está en la península ibérica.',
      difficulty: 'advanced',
      nextReview: new Date(),
      reviewCount: 3,
      successRate: 60
    },
    {
      id: '3',
      spanish: 'especialidades',
      english: 'specialties',
      originalSentence: 'Cada región tiene sus especialidades culinarias.',
      difficulty: 'intermediate',
      nextReview: new Date(),
      reviewCount: 7,
      successRate: 85
    }
  ])

  // Memorize state
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [reviewedToday, setReviewedToday] = useState(12)
  const [masteredWords, setMasteredWords] = useState(45)

  // Filter state
  const [filters, setFilters] = useState({
    difficulty: 'all',
    status: 'all'
  })

  const currentCard = flashCards[currentCardIndex]

  // Event Handlers
  const handleCardResult = (result: 'again' | 'hard' | 'good' | 'easy') => {
    // In real app: send to spaced repetition API
    console.log(`Card result: ${result} for word: ${currentCard.spanish}`)
    
    // Move to next card
    handleNext()
    setIsFlipped(false)
    setReviewedToday(prev => prev + 1)
    
    if (result === 'easy') {
      setMasteredWords(prev => prev + 1)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setIsFlipped(false)
      setShowHint(false)
    }
  }

  const handleNext = () => {
    if (currentCardIndex < flashCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setIsFlipped(false)
      setShowHint(false)
    }
  }

  const handleShuffle = () => {
    // In real app: shuffle the card deck
    console.log('Shuffling flash cards...')
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowHint(false)
  }

  const handleReset = () => {
    setCurrentCardIndex(0)
    setIsFlipped(false)
    setShowHint(false)
  }

  const handleHint = () => {
    setShowHint(!showHint)
  }

  const handleBookmark = () => {
    // Mock bookmark functionality
    console.log('Bookmarking flash card:', currentCard.spanish)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header - MANDATORY - Fixed Position */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Desktop Logo Section */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Mobile Logo */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Page Title Section */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Flash Cards
          </h1>
        </div>
        
        {/* Page-Specific Actions/Stats */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          <div className="text-sm text-muted-foreground">
            Due: {flashCards.length} cards
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar - Desktop Only - Fixed Position */}
        <aside className="hidden md:flex w-64 bg-muted border-r border-border flex-col fixed left-0 top-16 bottom-0 z-40">
          {/* Navigation */}
          <nav className="flex-1 p-4 pt-8">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location === item.path
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => setLocation(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-accent text-accent-foreground font-medium' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-gray-200 text-sm font-semibold">
                {getInitials(currentUser.email)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-foreground">{currentUser.email}</div>
                <div className="text-xs text-muted-foreground">
                  Level {currentUser.level} • {currentUser.totalPoints} pts
                </div>
              </div>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors block w-full text-center">
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:ml-64">
          <div className="flex-1 flex flex-col p-4 md:p-6 pt-6 md:pt-8 bg-background">
            {/* Page Stats - Centered and Reduced Size */}
            <div className="mb-6">
              <MemorizeStats 
                currentCard={currentCardIndex + 1}
                totalCards={flashCards.length}
                reviewsToday={reviewedToday}
                masteredWords={masteredWords}
              />
            </div>

            {/* Filters/Controls - Aligned Width */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <MemorizeFilters
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                selectedDifficulty={filters.difficulty}
                selectedStatus={filters.status}
                onDifficultyChange={(difficulty) => setFilters(prev => ({ ...prev, difficulty }))}
                onStatusChange={(status) => setFilters(prev => ({ ...prev, status }))}
              />
            </div>

            {/* Flash Card Container - Matching Width */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="w-full card p-4 md:p-8">
                {/* Flash Card */}
                <div className="mb-8">
                  <FlashCard
                    key={currentCard.id}
                    card={currentCard}
                    onResult={handleCardResult}
                    onFlip={handleFlip}
                    isFlipped={isFlipped}
                  />
                </div>

                {/* Hint Section */}
                {showHint && (
                  <div className="mb-6 p-4 bg-muted border border-border rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>Memory Tip:</strong> Try to associate "{currentCard.spanish}" with the context: "{currentCard.originalSentence}"
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <ActionButtons
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                  onHint={handleHint}
                  onBookmark={handleBookmark}
                  onShuffle={handleShuffle}
                  onReset={handleReset}
                  currentCard={currentCardIndex + 1}
                  totalCards={flashCards.length}
                  showHint={showHint}
                  canGoBack={currentCardIndex > 0}
                  canGoForward={currentCardIndex < flashCards.length - 1}
                />
              </div>

              {/* Progress Section */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Session Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {currentCardIndex + 1} of {flashCards.length} cards
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / flashCards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
