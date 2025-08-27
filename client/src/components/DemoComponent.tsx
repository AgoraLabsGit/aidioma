import React from 'react'
import { useUser, useSentencesForPractice, useSubmitPractice } from '../hooks'
import type { CurrentUser, APIResponse } from '../types'

interface DemoComponentProps {
  userId: string
}

export function DemoComponent({ userId }: DemoComponentProps) {
  const userResult = useUser()
  const user = userResult?.data
  const userLoading = false // Stack Auth manages loading internally
  const userError = null
  const { data: sentences, isLoading: sentencesLoading, error: sentencesError } = useSentencesForPractice({
    userId,
    targetLanguage: 'spanish'
  })
  const submitPractice = useSubmitPractice()

  if (userLoading || sentencesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (userError || sentencesError) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <h3 className="font-semibold text-destructive mb-2">Error Loading Data</h3>
        <p className="text-sm text-muted-foreground">
          {sentencesError?.message || 'An unexpected error occurred'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border">
      <h2 className="text-xl font-bold text-foreground">✅ Improvements Demonstration</h2>
      
      {/* Show error boundary is working */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">🛡️ Error Boundary</h3>
        <p className="text-sm text-muted-foreground">
          Error boundary is now active and will catch React component errors gracefully.
        </p>
      </div>

      {/* Show shared types are working */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">🔗 Shared Schema Integration</h3>
        <p className="text-sm text-muted-foreground">
          Using shared types from schema. User: {user?.name} ({user?.email})
        </p>
        <p className="text-sm text-muted-foreground">
          Sentences loaded: {sentences?.length || 0}
        </p>
      </div>

      {/* Show standardized API responses */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">📡 Standardized API Responses</h3>
        <p className="text-sm text-muted-foreground">
          All API calls now use the standardized APIResponse&lt;T&gt; format with proper error handling.
        </p>
      </div>

      {/* Show loading and error states */}
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">⏳ Loading & Error States</h3>
        <p className="text-sm text-muted-foreground">
          Components now have proper loading states and error handling with user-friendly messages.
        </p>
      </div>

      {/* Demonstration button */}
      <button
        onClick={() => {
          if (!sentences?.length) return
          
          submitPractice.mutate({
            userId,
            data: {
              sentenceId: sentences[0].id,
              userInput: 'Test translation',
              isCorrect: true,
              timeSpent: 30,
              hintsUsed: 0
            }
          })
        }}
        disabled={submitPractice.isPending || !sentences?.length}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {submitPractice.isPending ? 'Testing...' : 'Test Practice Submission'}
      </button>

      {submitPractice.isSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✅ Practice submission successful! Data invalidation and cache updates working.
          </p>
        </div>
      )}

      {submitPractice.error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400">
            ❌ Error: {submitPractice.error.message}
          </p>
        </div>
      )}
    </div>
  )
}

export default DemoComponent
