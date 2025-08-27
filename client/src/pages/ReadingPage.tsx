import { useState } from 'react'
import { useLocation } from 'wouter'
import { useUser } from '../hooks/useUser'
import type { CurrentUser } from '../types'
import SharedSidebar from '../components/Sidebar'
import { 
  Book, 
  BookOpen, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Settings,
  Clock,
  Target,
  BookmarkCheck,
  Eye,
  ScrollText,
  Bookmark,
  BookmarkPlus,
  Volume2,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowRight,
  Lightbulb,
  RotateCcw
} from 'lucide-react'

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

// Translation Input Component (same as PracticePage)
interface TranslationInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

function TranslationInput({ value, onChange, disabled = false, placeholder = "Type your English translation here..." }: TranslationInputProps) {
  return (
    <div className="mb-6">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full h-20 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200 font-mono"
      />
    </div>
  )
}

// Action Buttons Component (same as PracticePage)
interface ActionButtonsProps {
  onCheck: () => void
  onNext: () => void
  onHint: () => void
  onReset: () => void
  onBookmark: () => void
  onSkip: () => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  isEvaluated: boolean
  showHint: boolean
  disabled: boolean
  currentParagraph: number
  totalParagraphs: number
}

function ActionButtons({ onCheck, onNext, onHint, onReset, onBookmark, onSkip, onNavigatePrevious, onNavigateNext, isEvaluated, showHint, disabled, currentParagraph, totalParagraphs }: ActionButtonsProps) {
  return (
    <div className="space-y-4">
      {/* Main Action Row with Navigation */}
      <div className="flex items-center justify-center gap-3">
        {/* 1. Previous Button */}
        <button
          onClick={onNavigatePrevious}
          disabled={currentParagraph === 0}
          className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronUp className="w-4 h-4" />
          Previous
        </button>

        {/* 2. Check Button */}
        {!isEvaluated ? (
          <button
            onClick={onCheck}
            disabled={disabled}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            Check
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        )}

        {/* 3. Next Button */}
        <button
          onClick={onNavigateNext}
          disabled={currentParagraph === totalParagraphs - 1}
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
        {!isEvaluated ? (
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Skip
          </button>
        ) : (
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 bg-muted text-gray-400 hover:text-gray-300 hover:bg-accent rounded-lg font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            Next Sentence
          </button>
        )}

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

// Reading Stats Component
interface ReadingStatsProps {
  currentParagraph: number
  totalParagraphs: number
  readingTime: number
  comprehensionScore: number
}

function ReadingStats({ currentParagraph, totalParagraphs, readingTime, comprehensionScore }: ReadingStatsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <ScrollText className="w-6 h-6 text-blue-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {currentParagraph}/{totalParagraphs}
            </div>
            <div className="text-xs text-muted-foreground">Paragraphs</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Clock className="w-6 h-6 text-green-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {formatTime(readingTime)}
            </div>
            <div className="text-xs text-muted-foreground">Reading Time</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <Target className="w-6 h-6 text-purple-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {comprehensionScore}%
            </div>
            <div className="text-xs text-muted-foreground">Comprehension</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 md:p-3 bg-muted rounded-lg">
          <BookmarkCheck className="w-4 h-4 text-orange-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {Math.round((currentParagraph / totalParagraphs) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Reading Filters Component
interface ReadingFiltersProps {
  selectedLevel: string
  selectedGenre: string
  selectedLength: string
  selectedTextCategory: string
  onLevelChange: (level: string) => void
  onGenreChange: (genre: string) => void
  onLengthChange: (length: string) => void
  onTextCategoryChange: (category: string) => void
}

function ReadingFilters({
  selectedLevel,
  selectedGenre,
  selectedLength,
  selectedTextCategory,
  onLevelChange,
  onGenreChange,
  onLengthChange,
  onTextCategoryChange
}: ReadingFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const textCategories = [
    { value: 'books', label: 'Books', icon: Book },
    { value: 'articles', label: 'Articles', icon: ScrollText },
    { value: 'stories', label: 'Stories', icon: BookOpen }
  ]

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const genres = [
    { value: 'news', label: 'News' },
    { value: 'stories', label: 'Short Stories' },
    { value: 'culture', label: 'Culture' },
    { value: 'science', label: 'Science' },
    { value: 'travel', label: 'Travel' }
  ]

  const lengths = [
    { value: 'short', label: 'Short (2-5 min)' },
    { value: 'medium', label: 'Medium (5-10 min)' },
    { value: 'long', label: 'Long (10+ min)' }
  ]

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 card-minimal text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Eye className="w-4 h-4" />
        <span className="text-sm">Reading Filters</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 card-minimal">
          <div className="space-y-4">
            {/* Text Category Selection */}
            <div>
              <label className="text-sm text-foreground mb-3 block font-medium">Text Category</label>
              <div className="grid grid-cols-3 gap-3">
                {textCategories.map((category) => {
                  const IconComponent = category.icon
                  const isSelected = selectedTextCategory === category.value
                  return (
                    <button
                      key={category.value}
                      onClick={() => onTextCategoryChange(category.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-xs font-medium">{category.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-foreground mb-2 block">Level</label>
                  <select 
                    value={selectedLevel}
                    onChange={(e) => onLevelChange(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-foreground mb-2 block">Genre</label>
                  <select 
                    value={selectedGenre}
                    onChange={(e) => onGenreChange(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                  >
                    {genres.map((genre) => (
                      <option key={genre.value} value={genre.value}>
                        {genre.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-foreground mb-2 block">Reading Length</label>
                  <select 
                    value={selectedLength}
                    onChange={(e) => onLengthChange(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                  >
                    {lengths.map((length) => (
                      <option key={length.value} value={length.value}>
                        {length.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reading Content Component with Translation Practice
interface ReadingContentProps {
  title: string
  content: string[]
  currentParagraph: number
  totalParagraphs: number
  onParagraphChange: (index: number) => void
  onNavigatePrevious: () => void
  onNavigateNext: () => void
  userTranslation: string
  onTranslationChange: (value: string) => void
  onCheckAnswer: () => void
  onNextSentence: () => void
  onShowHint: () => void
  onReset: () => void
  onBookmark: () => void
  isEvaluated: boolean
  showHint: boolean
  evaluation: any
}

function ReadingContent({ 
  title, 
  content, 
  currentParagraph, 
  totalParagraphs,
  onParagraphChange,
  onNavigatePrevious,
  onNavigateNext,
  userTranslation,
  onTranslationChange,
  onCheckAnswer,
  onNextSentence,
  onShowHint,
  onReset,
  onBookmark,
  isEvaluated,
  showHint,
  evaluation
}: ReadingContentProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const [wordHint, setWordHint] = useState<{word: string, hint: string} | null>(null)

  const handleWordClick = (word: string) => {
    // Mock word-specific hint generation - in real app, this would call API
    const wordHints: {[key: string]: string} = {
      'La': 'Definite article "the" (feminine singular)',
      'gastronomía': 'Noun meaning "gastronomy" or "culinary art"',
      'española': 'Adjective meaning "Spanish" (feminine form)',
      'es': 'Verb "to be" (3rd person singular, permanent characteristics)',
      'una': 'Indefinite article "a/an" (feminine singular)',
      'de': 'Preposition meaning "of" or "from"',
      'las': 'Definite article "the" (feminine plural)',
      'más': 'Adverb meaning "most" or "more"',
      'ricas': 'Adjective meaning "rich" or "delicious" (feminine plural)',
      'y': 'Conjunction meaning "and"',
      'variadas': 'Adjective meaning "varied" (feminine plural)',
      'del': 'Contraction of "de + el" meaning "of the"',
      'mundo': 'Noun meaning "world"',
      'reflejando': 'Gerund of "reflejar" meaning "reflecting"',
      'diversidad': 'Noun meaning "diversity"',
      'cultural': 'Adjective meaning "cultural"',
      'geográfica': 'Adjective meaning "geographical" (feminine)',
      'península': 'Noun meaning "peninsula"',
      'ibérica': 'Adjective meaning "Iberian" (feminine)'
    }
    
    const hint = wordHints[word] || `Word: "${word}" - Click for detailed translation and grammar explanation`
    setWordHint({word, hint})
  }

  const renderClickableText = (text: string) => {
    const words = text.split(' ')
    return (
      <p className="text-lg md:text-xl leading-relaxed text-foreground font-medium">
        {words.map((word, index) => (
          <ClickableWord
            key={index}
            word={word}
            onWordClick={handleWordClick}
            isLast={index === words.length - 1}
          />
        ))}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight mb-2">
          {title}
        </h2>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Reading Level: Intermediate</span>
          <span>•</span>
          <span>Estimated: 8 minutes</span>
          <span>•</span>
          <span>Genre: Culture</span>
        </div>
      </div>

      {/* Context View - Three Box Scrolling System */}
      <div className="space-y-2">
        {/* Previous sentence (context) - show placeholder if at beginning */}
        {currentParagraph > 0 ? (
          <div className="space-y-2 opacity-40">
            <div
              className="p-3 rounded-lg border border-border/20 bg-card/20 cursor-pointer hover:bg-card/30 hover:border-border/30 transition-all duration-200"
              onClick={() => onParagraphChange(currentParagraph - 1)}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content[currentParagraph - 1]}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 opacity-20">
            <div className="p-3 rounded-lg border border-border/10 bg-card/10">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                [Beginning of article]
              </p>
            </div>
          </div>
        )}

        {/* Current sentence (highlighted) */}
        <div className="p-4">
          {renderClickableText(content[currentParagraph])}
          {showHint && (
            <div className="mt-3 p-3 card-ghost">
              <p className="text-sm text-muted-foreground">
                💡 <strong>General Hint:</strong> Pay attention to verb tenses and article agreement. Consider the context from previous sentences.
              </p>
            </div>
          )}
          {wordHint && (
            <div className="mt-3 p-3 card-ghost">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    <strong>"{wordHint.word}":</strong> {wordHint.hint}
                  </p>
                </div>
                <button
                  onClick={() => setWordHint(null)}
                  className="text-muted-foreground hover:text-foreground ml-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Next sentence (context) - show placeholder if at end */}
        {currentParagraph < content.length - 1 ? (
          <div className="space-y-2 opacity-40">
            <div
              className="p-3 rounded-lg border border-border/20 bg-card/20 cursor-pointer hover:bg-card/30 hover:border-border/30 transition-all duration-200"
              onClick={() => onParagraphChange(currentParagraph + 1)}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content[currentParagraph + 1]}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 opacity-20">
            <div className="p-3 rounded-lg border border-border/10 bg-card/10">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                [End of article]
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Translation Practice Section */}
      <div className="border-t border-border pt-6">
        {/* Translation Input */}
        <TranslationInput
          value={userTranslation}
          onChange={onTranslationChange}
          disabled={isEvaluated}
          placeholder="Type your English translation of the highlighted sentence..."
        />

        {/* Evaluation Results */}
        {isEvaluated && evaluation && (
          <div className="mb-6 p-4 card-minimal">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                evaluation.score >= 80 ? 'bg-green-500/80' : 
                evaluation.score >= 60 ? 'bg-yellow-500/80' : 'bg-red-500/80'
              }`} />
              <span className="font-medium text-foreground text-sm">
                Score: {evaluation.score}% 
                {evaluation.score >= 80 ? ' - Excellent!' : 
                 evaluation.score >= 60 ? ' - Good job!' : ' - Keep practicing!'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{evaluation.feedback}</p>
          </div>
        )}

        {/* Action Buttons */}
        <ActionButtons
          onCheck={onCheckAnswer}
          onNext={onNextSentence}
          onSkip={onNextSentence}
          onHint={onShowHint}
          onReset={onReset}
          onBookmark={onBookmark}
          onNavigatePrevious={onNavigatePrevious}
          onNavigateNext={onNavigateNext}
          isEvaluated={isEvaluated}
          showHint={showHint}
          disabled={!userTranslation.trim()}
          currentParagraph={currentParagraph}
          totalParagraphs={totalParagraphs}
        />
      </div>

      {/* Reading Progress - Standard Progress Bar */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-foreground">Session Progress</span>
          <span className="text-sm text-muted-foreground">
            {currentParagraph + 1} of {content.length} sentences
          </span>
        </div>
        <div className="w-full bg-background rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentParagraph + 1) / content.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default function ReadingPage() {
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

  // Sample article content
  const articleContent = [
    "La gastronomía española es una de las más ricas y variadas del mundo, reflejando la diversidad cultural y geográfica de la península ibérica.",
    "Cada región tiene sus propias especialidades culinarias, desde los pintxos del País Vasco hasta el gazpacho andaluz.",
    "El aceite de oliva es fundamental en la cocina española, utilizado tanto para cocinar como para aderezar ensaladas y tostadas.",
    "La paella, originaria de Valencia, es quizás el plato español más conocido internacionalmente, aunque existen muchas variantes regionales.",
    "Los mariscos y pescados frescos son protagonistas en las costas, especialmente en Galicia, donde el pulpo es una especialidad local.",
    "La cultura del tapeo es única en España, permitiendo a las personas socializar mientras prueban pequeñas porciones de diferentes platos.",
    "Los jamones ibéricos, especialmente los de bellota, son considerados uno de los productos gourmet más apreciados del país.",
    "La repostería española también es notable, con dulces como los churros, el flan, y los turrones navideños que forman parte de la tradición."
  ]

  // Reading state
  const [readingState, setReadingState] = useState({
    currentParagraph: 0,
    totalParagraphs: articleContent.length,
    timeSpent: 245, // seconds
    comprehension: 78
  })

  // Translation practice state
  const [userTranslation, setUserTranslation] = useState('')
  const [isEvaluated, setIsEvaluated] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [evaluation, setEvaluation] = useState<{score: number, feedback: string} | null>(null)

  // Filter state
  const [filters, setFilters] = useState({
    textCategory: 'articles',
    level: 'intermediate',
    genre: 'culture',
    length: 'medium'
  })

  // Translation practice functions
  const handleCheckAnswer = () => {
    // Mock evaluation - in real app, this would call API
    const mockEvaluation = {
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      feedback: "Good translation! Pay attention to verb tense consistency."
    }
    setEvaluation(mockEvaluation)
    setIsEvaluated(true)
  }

  const handleNextSentence = () => {
    if (readingState.currentParagraph < readingState.totalParagraphs - 1) {
      // Scroll to next sentence: current becomes previous, next becomes current
      setReadingState(prev => ({ ...prev, currentParagraph: prev.currentParagraph + 1 }))
      // Reset translation practice state for new sentence
      setUserTranslation('')
      setIsEvaluated(false)
      setShowHint(false)
      setEvaluation(null)
    }
  }

  const handleShowHint = () => {
    setShowHint(!showHint)
  }

  const handleReset = () => {
    setUserTranslation('')
    setIsEvaluated(false)
    setShowHint(false)
    setEvaluation(null)
  }

  const handleBookmark = () => {
    // Mock bookmark functionality - in real app, this would add sentence to flashcards/memorize
    console.log('Bookmarking sentence for flashcards:', articleContent[readingState.currentParagraph])
    // This would typically call an API to add the sentence to the user's memorization deck
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header - MANDATORY - Fixed Position */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Desktop Logo Section */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Book className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Mobile Logo */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Book className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Page Title Section */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Reading Practice
          </h1>
        </div>
        
        {/* Page-Specific Actions/Stats */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          <div className="text-sm text-muted-foreground">
            Progress: {Math.round((readingState.currentParagraph / readingState.totalParagraphs) * 100)}%
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
              <ReadingStats 
                currentParagraph={readingState.currentParagraph + 1}
                totalParagraphs={readingState.totalParagraphs}
                readingTime={readingState.timeSpent}
                comprehensionScore={readingState.comprehension}
              />
            </div>

            {/* Filters/Controls - Aligned Width */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <ReadingFilters
                selectedTextCategory={filters.textCategory}
                selectedLevel={filters.level}
                selectedGenre={filters.genre}
                selectedLength={filters.length}
                onTextCategoryChange={(textCategory) => setFilters(prev => ({ ...prev, textCategory }))}
                onLevelChange={(level) => setFilters(prev => ({ ...prev, level }))}
                onGenreChange={(genre) => setFilters(prev => ({ ...prev, genre }))}
                onLengthChange={(length) => setFilters(prev => ({ ...prev, length }))}
              />
            </div>

            {/* Main Content Container - Matching Width */}
            <div className="max-w-4xl mx-auto w-full">
              <div className="w-full card p-4 md:p-8">
                <ReadingContent
                  title="La Gastronomía Española: Un Viaje Culinario"
                  content={articleContent}
                  currentParagraph={readingState.currentParagraph}
                  totalParagraphs={readingState.totalParagraphs}
                  onParagraphChange={(index) => 
                    setReadingState(prev => ({ ...prev, currentParagraph: index }))
                  }
                  onNavigatePrevious={() => {
                    if (readingState.currentParagraph > 0) {
                      setReadingState(prev => ({ ...prev, currentParagraph: prev.currentParagraph - 1 }))
                      setUserTranslation('')
                      setIsEvaluated(false)
                      setShowHint(false)
                      setEvaluation(null)
                    }
                  }}
                  onNavigateNext={() => {
                    if (readingState.currentParagraph < readingState.totalParagraphs - 1) {
                      setReadingState(prev => ({ ...prev, currentParagraph: prev.currentParagraph + 1 }))
                      setUserTranslation('')
                      setIsEvaluated(false)
                      setShowHint(false)
                      setEvaluation(null)
                    }
                  }}
                  userTranslation={userTranslation}
                  onTranslationChange={setUserTranslation}
                  onCheckAnswer={handleCheckAnswer}
                  onNextSentence={handleNextSentence}
                  onShowHint={handleShowHint}
                  onReset={handleReset}
                  onBookmark={handleBookmark}
                  isEvaluated={isEvaluated}
                  showHint={showHint}
                  evaluation={evaluation}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
