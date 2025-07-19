import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, NewUser, APIResponse } from '../types'

interface CreateUserData {
  username: string
  email: string
  nativeLanguage: string
  targetLanguage: string
}

interface UpdateUserData {
  username?: string
  email?: string
  nativeLanguage?: string
  targetLanguage?: string
  currentLevel?: string
}

// Mock API functions - these will be replaced with actual API calls
const api = {
  getUser: async (id: string): Promise<APIResponse<User>> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      success: true,
      data: {
        id,
        email: 'demo@example.com',
        name: 'Demo User',
        level: 'beginner',
        streak: 5,
        totalScore: 150,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },
  
  createUser: async (data: CreateUserData): Promise<APIResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      success: true,
      data: {
        id: 'new-user-id',
        email: data.email,
        name: data.username,
        level: 'beginner',
        streak: 0,
        totalScore: 0,
        preferences: '{}',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  },
  
  updateUser: async (id: string, data: UpdateUserData): Promise<APIResponse<User>> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      success: true,
      data: {
        id,
        email: data.email || 'demo@example.com',
        name: data.username || 'Demo User',
        level: (data.currentLevel as any) || 'beginner',
        streak: 5,
        totalScore: 150,
        preferences: '{}',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    }
  }
}

// Custom hooks
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.getUser(id)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await api.createUser(data)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (newUser) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
      // Optionally set the new user data in cache
      queryClient.setQueryData(['user', newUser.id], newUser)
    },
    onError: (error) => {
      console.error('Failed to create user:', error)
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await api.updateUser(id, data)
      if (!response.success) {
        throw new Error(response.error)
      }
      return response.data
    },
    onSuccess: (updatedUser) => {
      // Update the user data in cache
      queryClient.setQueryData(['user', updatedUser.id], updatedUser)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      console.error('Failed to update user:', error)
    }
  })
}
