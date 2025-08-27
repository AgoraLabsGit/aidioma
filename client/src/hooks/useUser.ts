import { useUser as useStackUser, UserButton } from '@stackframe/stack'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { User, NewUser, APIResponse } from '../types'

interface UpdateUserData {
  username?: string
  email?: string
  nativeLanguage?: string
  targetLanguage?: string
  currentLevel?: string
}

// Real API functions - integrated with Stack Auth
const api = {
  updateUserProfile: async (stackUserId: string, data: UpdateUserData): Promise<APIResponse<User>> => {
    try {
      const response = await fetch('/api/users/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stackUserId,
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

// ✅ Real Stack Auth integration - replaces mock useUser hook
export function useUser() {
  const stackUser = useStackUser()
  
  // Return Stack Auth user with additional app-specific data structure
  if (!stackUser) {
    return null
  }

  // Transform Stack Auth user to our app's User interface
  const appUser: User = {
    id: stackUser.id,
    email: stackUser.primaryEmail || 'user@example.com',
    name: stackUser.displayName || 'User',
    level: 'beginner', // TODO: Get from user profile/progress API
    streak: 0, // TODO: Get from user progress API
    totalScore: 0, // TODO: Get from user progress API
    preferences: '{}', // TODO: Get from user profile API
    createdAt: new Date(), // Stack Auth doesn't expose createdAt, use current date
    updatedAt: new Date()
  }

  return {
    data: appUser,
    isLoading: false,
    error: null,
    // Include Stack Auth user methods
    stackUser,
    signOut: () => stackUser.signOut(),
    update: (data: any) => stackUser.update(data),
    isSignedIn: true
  }
}

// ✅ Enhanced: Real user profile updates with Stack Auth integration
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const stackUser = useStackUser()
  
  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      if (!stackUser) {
        throw new Error('User not authenticated')
      }

      // Update Stack Auth user profile
      if (data.username) {
        await stackUser.update({ displayName: data.username })
      }

      // Update app-specific profile data
      const response = await api.updateUserProfile(stackUser.id, data)
      
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
  const stackUser = useStackUser()
  
  if (!stackUser) {
    // Redirect to sign-in if not authenticated
    window.location.href = '/handler/sign-in'
    return null
  }
  
  return stackUser
}

// ✅ Export Stack Auth components for easy import
export { UserButton }
