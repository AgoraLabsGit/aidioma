// Re-export shared schema types for easier imports
export type {
  User,
  NewUser,
  Sentence,
  NewSentence,
  UserProgress,
  NewUserProgress,
  PracticeSession,
  NewPracticeSession,
  Evaluation,
  NewEvaluation,
  EvaluationCache,
  NewEvaluationCache,
  LearningAnalytics,
  NewLearningAnalytics
} from '@shared/schema'

// Export validation schemas
export {
  insertUserSchema,
  selectUserSchema,
  insertSentenceSchema,
  selectSentenceSchema,
  insertUserProgressSchema,
  selectUserProgressSchema,
  insertPracticeSessionSchema,
  selectPracticeSessionSchema,
  insertEvaluationSchema,
  selectEvaluationSchema,
  insertEvaluationCacheSchema,
  selectEvaluationCacheSchema,
  insertLearningAnalyticsSchema,
  selectLearningAnalyticsSchema
} from '@shared/schema'

// API Response format - standardized across the application
export type APIResponse<T> = {
  success: true
  data: T
  message?: string
} | {
  success: false
  error: string
  details?: unknown
  code?: string
}

// Practice-specific types for better UX
export interface PracticeSessionUI {
  currentSentence: number
  totalSentences: number
  correctCount: number
  incorrectCount: number
  streakCount: number
  accuracy: number
}

export interface EvaluationResult {
  isCorrect: boolean
  score: number // 0-100
  feedback: string
  detailedFeedback?: {
    grammar?: string[]
    vocabulary?: string[]
    suggestions?: string[]
  }
  hintsUsed: number
  timeSpent?: number
}

// Hint system types following the progressive hints documentation
export type HintLevel = 'basic' | 'intermediate' | 'complete'

export interface WordHint {
  word: string
  level: HintLevel
  hint: string
  penalty: number // Points deducted
}

export interface ProgressiveHints {
  sentenceId: string
  hints: {
    [word: string]: {
      basic: string
      intermediate: string  
      complete: string
    }
  }
}

// UI State types
export interface PracticeUIState {
  isEvaluated: boolean
  showHint: boolean
  showFilters: boolean
  currentHintLevel: HintLevel | null
  wordHint: WordHint | null
}

// Filter types for practice customization
export interface PracticeFilters {
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all'
  category: string | 'all'
  tense: string | 'all'
  mastered: boolean | null // null = all, true = only mastered, false = only unmastered
}

// Component prop types for consistency
export interface CurrentUser {
  id: string
  email: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  totalPoints: number
  streakDays: number
}

// Error types for better error handling
export interface AppError {
  code: string
  message: string
  details?: unknown
  timestamp: string
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorContext {
  component: string
  action: string
  userId?: string
  sessionId?: string
}
