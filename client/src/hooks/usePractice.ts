import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  Sentence, 
  UserProgress, 
  PracticeSession, 
  NewEvaluation,
  APIResponse 
} from '../types'

interface SubmitPracticeData {
  sentenceId: string
  userInput: string
  isCorrect: boolean
  timeSpent: number
  hintsUsed: number
}

// Real API functions - connected to backend
const api = {
  getSentencesForPractice: async (params: {
    userId: string
    targetLanguage: string
    difficulty?: string
    limit?: number
  }): Promise<APIResponse<Sentence[]>> => {
    try {
      const queryParams = new URLSearchParams({
        difficulty: params.difficulty || 'all',
        limit: (params.limit || 10).toString()
      })
      
      const response = await fetch(`/api/sentences?${queryParams}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sentences')
      }
      
      return {
        success: true,
        data: result.data.sentences
      }
    } catch (error) {
      console.error('Error fetching sentences:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  getUserProgress: async (userId: string): Promise<APIResponse<UserProgress[]>> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return {
      success: true,
      data: [
        {
          id: '1',
          userId,
          sentenceId: '1',
          attempts: 3,
          bestScore: 67,
          lastAttemptAt: new Date(),
          mastered: false,
          averageScore: '0.67'
        }
      ]
    }
  },

  submitPractice: async (userId: string, data: SubmitPracticeData): Promise<APIResponse<PracticeSession>> => {
    try {
      const response = await fetch('/api/sentences/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sentenceId: data.sentenceId,
          userTranslation: data.userInput,
          timeSpent: data.timeSpent,
          hintsUsed: data.hintsUsed
        })
      })
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to evaluate translation')
      }
      
      // Convert evaluation result to practice session format
      return {
        success: true,
        data: {
          id: `session-${Date.now()}`,
          userId,
          startedAt: new Date(),
          completedAt: new Date(),
          totalSentences: 1,
          completedSentences: 1,
          averageScore: result.data.score,
          sessionType: 'standard',
          evaluationResult: result.data // Include full evaluation data
        } as PracticeSession & { evaluationResult: any }
      }
    } catch (error) {
      console.error('Error submitting practice:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  getSentenceById: async (id: string): Promise<APIResponse<Sentence>> => {
    try {
      const response = await fetch(`/api/sentences/${id}`)
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch sentence')
      }
      
      return {
        success: true,
        data: result.data
      }
    } catch (error) {
      console.error('Error fetching sentence:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Custom hooks
export function useSentencesForPractice(params: {
  userId: string
  targetLanguage: string
  difficulty?: string
  limit?: number
}) {
  return useQuery({
    queryKey: ['sentences', 'practice', params],
    queryFn: async () => {
      const response = await api.getSentencesForPractice(params)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!params.userId && !!params.targetLanguage,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  })
}

export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: async () => {
      const response = await api.getUserProgress(userId)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useSentence(id: string) {
  return useQuery({
    queryKey: ['sentence', id],
    queryFn: async () => {
      const response = await api.getSentenceById(id)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutes (sentences don't change often)
    refetchOnWindowFocus: false
  })
}

export function useSubmitPractice() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: SubmitPracticeData }) => {
      const response = await api.submitPractice(userId, data)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (newSession, { userId }) => {
      // Invalidate user progress to reflect the new practice session
      queryClient.invalidateQueries({ queryKey: ['userProgress', userId] })
      
      // Optionally invalidate sentences to get updated recommendations
      queryClient.invalidateQueries({ queryKey: ['sentences', 'practice'] })
    },
    onError: (error) => {
      console.error('Failed to submit practice:', error)
    }
  })
}

// Helper hook for practice workflow
export function usePracticeWorkflow(userId: string, targetLanguage: string) {
  const sentences = useSentencesForPractice({ userId, targetLanguage, limit: 10 })
  const userProgress = useUserProgress(userId)
  const submitPractice = useSubmitPractice()

  // ✅ FIXED: Use state to track current sentence index for navigation
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)

  const currentSentence = sentences.data?.[currentSentenceIndex]

  // ✅ FIXED: Navigation functions
  const goToNextSentence = () => {
    if (sentences.data && currentSentenceIndex < sentences.data.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1)
    }
  }

  const goToPreviousSentence = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1)
    }
  }

  const goToSentence = (index: number) => {
    if (sentences.data && index >= 0 && index < sentences.data.length) {
      setCurrentSentenceIndex(index)
    }
  }

  const handleSubmitAnswer = async (userInput: string, isCorrect: boolean, timeSpent: number, hintsUsed: number = 0) => {
    if (!currentSentence) return

    try {
      await submitPractice.mutateAsync({
        userId,
        data: {
          sentenceId: currentSentence.id,
          userInput,
          isCorrect,
          timeSpent,
          hintsUsed
        }
      })
      
    } catch (error) {
      throw error
    }
  }

  return {
    sentences: sentences.data ?? [],
    currentSentence,
    currentSentenceIndex,
    totalSentences: sentences.data?.length ?? 0,
    isLoading: sentences.isLoading || userProgress.isLoading,
    error: sentences.error || userProgress.error,
    handleSubmitAnswer,
    isSubmitting: submitPractice.isPending,
    // ✅ NEW: Navigation functions
    goToNextSentence,
    goToPreviousSentence,
    goToSentence,
    canGoNext: sentences.data ? currentSentenceIndex < sentences.data.length - 1 : false,
    canGoPrevious: currentSentenceIndex > 0
  }
}
