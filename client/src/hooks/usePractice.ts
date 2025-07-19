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

// Mock API functions
const api = {
  getSentencesForPractice: async (params: {
    userId: string
    targetLanguage: string
    difficulty?: string
    limit?: number
  }): Promise<APIResponse<Sentence[]>> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      success: true,
      data: [
        {
          id: '1',
          spanish: 'Hola, ¿cómo estás?',
          english: 'Hello, how are you?',
          difficulty: 'beginner',
          category: 'greetings',
          hints: JSON.stringify(['Think about greetings', 'Hola means hello', '¿Cómo estás? asks how you are']),
          grammarPoints: JSON.stringify(['question formation', 'greetings']),
          createdAt: new Date(Date.now()),
          isActive: true
        },
        {
          id: '2',
          spanish: 'Me gustaría un café, por favor.',
          english: 'I would like a coffee, please.',
          difficulty: 'beginner',
          category: 'food_drink',
          hints: JSON.stringify(['Think about polite requests', 'Me gustaría means I would like', 'Por favor means please']),
          grammarPoints: JSON.stringify(['conditional tense', 'polite requests']),
          createdAt: new Date(Date.now()),
          isActive: true
        }
      ]
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
          averageScore: 0.67
        }
      ]
    }
  },

  submitPractice: async (userId: string, data: SubmitPracticeData): Promise<APIResponse<PracticeSession>> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      data: {
        id: 'new-session-id',
        userId,
        startedAt: new Date(),
        completedAt: new Date(),
        totalSentences: 1,
        completedSentences: 1,
        averageScore: data.isCorrect ? 85 : 45,
        sessionType: 'standard'
      }
    }
  },

  getSentenceById: async (id: string): Promise<APIResponse<Sentence>> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      success: true,
      data: {
        id,
        spanish: 'Hola, ¿cómo estás?',
        english: 'Hello, how are you?',
        difficulty: 'beginner',
        category: 'greetings',
        hints: JSON.stringify(['Think about greetings', 'Hola means hello']),
        grammarPoints: JSON.stringify(['question formation']),
        createdAt: new Date(),
        isActive: true
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

  const currentSentenceIndex = sentences.data?.findIndex(sentence => {
    const progress = userProgress.data?.find(p => p.sentenceId === sentence.id)
    return !progress || !progress.mastered
  }) ?? 0

  const currentSentence = sentences.data?.[currentSentenceIndex]

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
    isSubmitting: submitPractice.isPending
  }
}
