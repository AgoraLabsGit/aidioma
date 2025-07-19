import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'wouter'
import type { CurrentUser } from '../types'
import { 
  Book, 
  BookOpen, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Award, 
  Settings,
  Send,
  Filter,
  ChevronDown,
  User,
  Bot,
  Lightbulb,
  BookmarkPlus,
  Volume2,
  Eye,
  EyeOff,
  RefreshCw,
  Mic,
  MicOff
} from 'lucide-react'

// TypeScript Interfaces
interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  corrections?: Array<{
    original: string
    corrected: string
    explanation: string
  }>
  newVocabulary?: Array<{
    word: string
    translation: string
    difficulty: number
  }>
  hints?: string[]
}

interface ConversationFiltersProps {
  selectedTopic: string
  selectedDifficulty: number
  selectedPersona: string
  onTopicChange: (topic: string) => void
  onDifficultyChange: (difficulty: number) => void
  onPersonaChange: (persona: string) => void
}

interface ChatInterfaceProps {
  topic: string
  difficulty: number
  aiPersona: string
  showCorrections: boolean
  onVocabularyAdd: (word: string, translation: string) => void
}

interface ChatSettingsProps {
  showCorrections: boolean
  onToggleCorrections: (show: boolean) => void
  isListening: boolean
  onToggleListening: (listening: boolean) => void
}

interface ConversationStatsProps {
  messagesCount: number
  vocabularyLearned: number
  conversationTime: number
  fluencyScore: number
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
const getInitials = (name: string) => {
  return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2)
}

// Conversation Filters Component
function ConversationFilters({
  selectedTopic,
  selectedDifficulty,
  selectedPersona,
  onTopicChange,
  onDifficultyChange,
  onPersonaChange
}: ConversationFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const topics = [
    'Daily Life', 'Food & Cooking', 'Travel', 'Work', 'Family',
    'Hobbies', 'Current Events', 'Culture', 'Sports', 'Movies'
  ]

  const personas = [
    { id: 'casual', name: 'Casual Friend', description: 'Relaxed, friendly conversation' },
    { id: 'formal', name: 'Professional', description: 'Business-like, polite conversation' },
    { id: 'teacher', name: 'Patient Teacher', description: 'Educational, corrective approach' },
    { id: 'native', name: 'Native Speaker', description: 'Natural, fast-paced conversation' },
  ]

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-4 py-2 card-minimal text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Conversation Settings</span>
        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-2 p-4 card-minimal">
          <div className="space-y-4">
            {/* Topic Selection */}
            <div>
              <label className="text-sm text-foreground mb-3 block font-medium">Conversation Topic</label>
              <select
                value={selectedTopic}
                onChange={(e) => onTopicChange(e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
              >
                <option value="">Choose a topic...</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

            <div className="border-t border-border/30 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Difficulty Slider */}
                <div>
                  <label className="text-sm text-foreground mb-2 block">
                    Difficulty Level: {selectedDifficulty}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={selectedDifficulty}
                    onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Beginner</span>
                    <span>Advanced</span>
                  </div>
                </div>

                {/* AI Persona */}
                <div>
                  <label className="text-sm text-foreground mb-2 block">AI Personality</label>
                  <select
                    value={selectedPersona}
                    onChange={(e) => onPersonaChange(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                  >
                    {personas.map(persona => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {personas.find(p => p.id === selectedPersona)?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Settings Component
function ChatSettings({ showCorrections, onToggleCorrections, isListening, onToggleListening }: ChatSettingsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onToggleCorrections(!showCorrections)}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          showCorrections 
            ? 'bg-accent text-accent-foreground' 
            : 'bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        {showCorrections ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        Corrections
      </button>
      
      <button
        onClick={() => onToggleListening(!isListening)}
        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          isListening 
            ? 'bg-red-600 text-white' 
            : 'bg-muted text-muted-foreground hover:text-foreground'
        }`}
      >
        {isListening ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        Voice
      </button>
    </div>
  )
}

// Conversation Stats Component
function ConversationStats({ messagesCount, vocabularyLearned, conversationTime, fluencyScore }: ConversationStatsProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl">
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <MessageCircle className="w-6 h-6 text-blue-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {messagesCount}
            </div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <BookmarkPlus className="w-6 h-6 text-green-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {vocabularyLearned}
            </div>
            <div className="text-xs text-muted-foreground">New Words</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <RefreshCw className="w-6 h-6 text-purple-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {formatTime(conversationTime)}
            </div>
            <div className="text-xs text-muted-foreground">Chat Time</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-2 md:p-3 bg-muted rounded-lg">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">
              {fluencyScore}%
            </div>
            <div className="text-xs text-muted-foreground">Fluency</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Chat Interface Component
function SpanishChatInterface({ topic, difficulty, aiPersona, showCorrections, onVocabularyAdd }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '¡Hola! Soy tu compañero de práctica de español. ¿De qué te gustaría hablar hoy?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response with corrections and vocabulary
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '¡Muy bien! Me gusta hablar sobre esos temas. ¿Puedes contarme más detalles sobre tu experiencia?',
        sender: 'ai',
        timestamp: new Date(),
        corrections: [
          {
            original: 'me gusta mucho',
            corrected: 'me gusta mucho',
            explanation: 'Correct usage of "gustar" verb structure'
          }
        ],
        newVocabulary: [
          { word: 'experiencia', translation: 'experience', difficulty: 2 },
          { word: 'detalles', translation: 'details', difficulty: 1 }
        ]
      }

      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const quickSuggestions = [
    '¿Cómo estás?', 
    '¿Qué hiciste hoy?', 
    'Cuéntame sobre...', 
    '¿Puedes ayudarme con...?',
    'Me gusta hablar de...',
    'No entiendo...'
  ]

  return (
    <div className="flex flex-col flex-1 card">
      {/* Chat Header */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Spanish Practice Chat
            </h3>
            <p className="text-sm text-muted-foreground">
              {topic && `Topic: ${topic}`} • {aiPersona?.replace('_', ' ') || 'Casual conversation'} • Level {difficulty}/5
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              title="Start new conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="space-y-2">
            {/* Main Message */}
            <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-start gap-2 max-w-xs lg:max-w-md">
                {message.sender === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div className={`px-4 py-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.sender === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Grammar Corrections */}
            {message.corrections && showCorrections && message.corrections.length > 0 && (
              <div className="ml-10 p-3 card-ghost border border-yellow-500/20 bg-yellow-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-xs font-semibold text-yellow-400">Grammar Suggestions:</h4>
                </div>
                {message.corrections.map((correction, idx) => (
                  <div key={idx} className="text-xs text-muted-foreground mb-2 last:mb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="line-through text-red-400 bg-red-500/10 px-1 rounded">
                        {correction.original}
                      </span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-green-400 bg-green-500/10 px-1 rounded">
                        {correction.corrected}
                      </span>
                    </div>
                    <p className="text-muted-foreground italic">{correction.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* New Vocabulary */}
            {message.newVocabulary && message.newVocabulary.length > 0 && (
              <div className="ml-10 p-3 card-ghost border border-purple-500/20 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <BookmarkPlus className="w-4 h-4 text-purple-500" />
                  <h4 className="text-xs font-semibold text-purple-400">New Vocabulary:</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {message.newVocabulary.map((vocab, idx) => (
                    <button
                      key={idx}
                      onClick={() => onVocabularyAdd(vocab.word, vocab.translation)}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded hover:bg-purple-500/30 transition-colors"
                      title={`Add "${vocab.word}" to flash cards`}
                    >
                      {vocab.word} = {vocab.translation}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-muted px-4 py-3 rounded-lg rounded-bl-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border/30">
        {/* Quick Suggestions */}
        <div className="mb-3 flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInputValue(suggestion)}
              className="px-3 py-1 bg-muted/50 text-muted-foreground text-xs rounded-full hover:bg-muted hover:text-foreground transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje en español..."
              className="w-full h-12 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-200"
              disabled={isTyping}
              rows={1}
            />
          </div>
          <button 
            onClick={sendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ConversationsPage() {
  const [location, setLocation] = useLocation()
  
  // Page-specific state
  const [currentUser] = useState<CurrentUser>({
    id: 'conv-user-1',
    name: 'Conversation Learner',
    email: 'user@example.com',
    level: 'beginner',
    totalPoints: 200,
    streakDays: 4
  })

  // Conversation settings state
  const [settings, setSettings] = useState({
    topic: '',
    difficulty: 3,
    persona: 'casual'
  })

  // Chat interface state
  const [showCorrections, setShowCorrections] = useState(true)
  const [isListening, setIsListening] = useState(false)
  
  // Conversation stats state
  const [conversationStats] = useState({
    messagesCount: 23,
    vocabularyLearned: 8,
    conversationTime: 842, // seconds
    fluencyScore: 76
  })

  const handleVocabularyAdd = (word: string, translation: string) => {
    // Mock vocabulary add - in real app, this would add to user's flash cards
    console.log('Adding to vocabulary:', word, '=', translation)
    // This would typically call an API to add the word to the user's memorization deck
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Unified Header - MANDATORY - Fixed Position */}
      <header className="fixed top-0 left-0 right-0 z-50 flex border-b border-border bg-muted">
        {/* Desktop Logo Section */}
        <div className="w-64 px-6 py-4 border-r border-border hidden md:flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Mobile Logo */}
        <div className="md:hidden px-4 py-4 flex items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-normal text-foreground">AIdioma</h1>
          </div>
        </div>
        
        {/* Page Title Section */}
        <div className="flex-1 px-6 py-4 flex items-center justify-start pl-4 md:pl-12">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            Spanish Conversations
          </h1>
        </div>
        
        {/* Page-Specific Actions/Stats */}
        <div className="px-4 md:px-6 py-4 flex items-center gap-2 md:gap-4">
          <ChatSettings
            showCorrections={showCorrections}
            onToggleCorrections={setShowCorrections}
            isListening={isListening}
            onToggleListening={setIsListening}
          />
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
                {getInitials(currentUser.name)}
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
            {/* Conversation Stats - Always first */}
            <div className="mb-6">
              <ConversationStats 
                messagesCount={conversationStats.messagesCount}
                vocabularyLearned={conversationStats.vocabularyLearned}
                conversationTime={conversationStats.conversationTime}
                fluencyScore={conversationStats.fluencyScore}
              />
            </div>

            {/* Conversation Filters - Always second */}
            <div className="mb-6 max-w-4xl mx-auto w-full">
              <ConversationFilters
                selectedTopic={settings.topic}
                selectedDifficulty={settings.difficulty}
                selectedPersona={settings.persona}
                onTopicChange={(topic) => setSettings(prev => ({ ...prev, topic }))}
                onDifficultyChange={(difficulty) => setSettings(prev => ({ ...prev, difficulty }))}
                onPersonaChange={(persona) => setSettings(prev => ({ ...prev, persona }))}
              />
            </div>

            {/* Chat Interface Container - Always third */}
            <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col">
              <SpanishChatInterface
                topic={settings.topic}
                difficulty={settings.difficulty}
                aiPersona={settings.persona}
                showCorrections={showCorrections}
                onVocabularyAdd={handleVocabularyAdd}
              />

              {/* Standard Progress Bar */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground">Session Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {conversationStats.messagesCount} messages exchanged
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((conversationStats.messagesCount / 50) * 100, 100)}%` }}
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
