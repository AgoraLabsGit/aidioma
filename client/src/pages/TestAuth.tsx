import React from 'react'
import { useAuth } from '@clerk/clerk-react'

/**
 * Test component to verify Clerk authentication status
 */
export default function TestAuth() {
  const { isSignedIn, isLoaded, userId } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold text-foreground">Clerk Auth Test Page</h1>
        <p className="text-muted-foreground">🔍 Testing Clerk authentication status</p>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Environment Variables Status:
          </p>
          <div className="text-xs space-y-1 mt-2">
            <p>VITE_CLERK_PUBLISHABLE_KEY: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Clerk Auth Loaded: {isLoaded ? '✅ Loaded' : '⏳ Loading...'}</p>
            <p>Authentication Status: {isSignedIn ? '✅ Signed In' : '❌ Not Signed In'}</p>
            <p>User ID: {userId || 'No user'}</p>
          </div>
        </div>
        
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
