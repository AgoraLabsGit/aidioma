import { useUser as useClerkUser, UserButton } from '@clerk/clerk-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, NewUser, APIResponse } from '../types'

interface UpdateUserData {
  username?: string
  email?: string
  nativeLanguage?: string
  targetLanguage?: string
  currentLevel?: string
}

// Real API functions - integrated with Clerk Auth
const api = {
  updateUserProfile: async (clerkUserId: string, data: UpdateUserData): Promise<APIResponse<User>> => {
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clerkUserId,
          ...data
        })
      })

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Profile update failed')
      }

      return result
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }
}

// ✅ Real Clerk Auth integration - replaces mock useUser hook
export function useUser() {
  const { user: clerkUser, isLoaded } = useClerkUser()
  
  // Return null if not loaded or no user
  if (!isLoaded || !clerkUser) {
    return null
  }

  // Transform Clerk user to our app's User interface
  const appUser: User = {
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress || 'user@example.com',
    name: clerkUser.fullName || clerkUser.firstName || 'User',
    level: 'beginner', // TODO: Get from user profile/progress API
    streak: 0, // TODO: Get from user progress API
    totalScore: 0, // TODO: Get from user progress API
    preferences: '{}', // TODO: Get from user profile API
    createdAt: clerkUser.createdAt || new Date(),
    updatedAt: clerkUser.updatedAt || new Date()
  }

  return {
    data: appUser,
    isLoading: !isLoaded,
    error: null,
    // Include Clerk user methods
    clerkUser,
    isSignedIn: true
  }
}

// ✅ Enhanced: Real user profile updates with Clerk Auth integration
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const { user: clerkUser } = useClerkUser()
  
  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      if (!clerkUser) {
        throw new Error('User not authenticated')
      }

      // Update Clerk user profile
      if (data.username) {
        await clerkUser.update({ firstName: data.username })
      }

      // Update app-specific profile data
      const response = await api.updateUserProfile(clerkUser.id, data)
      
      if (!response.success) {
        throw new Error(response.error)
      }
      
      return response.data
    },
    onSuccess: (updatedUser) => {
      // Invalidate user-related queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user'] })
      queryClient.invalidateQueries({ queryKey: ['user-progress'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
    onError: (error) => {
      console.error('Failed to update user profile:', error)
    }
  })
}

// ✅ Utility hook for protected routes
export function useRequireAuth() {
  const { user: clerkUser, isLoaded } = useClerkUser()
  
  if (!isLoaded || !clerkUser) {
    // Redirect to sign-in if not authenticated
    window.location.href = '/sign-in'
    return null
  }
  
  return clerkUser
}

// ✅ Export Clerk Auth components for easy import
export { UserButton }
