import React from 'react'
// Temporarily remove Stack Auth import to isolate the issue
// import { stackClientApp } from '../stack/client'

/**
 * Minimal test component to isolate Stack Auth runtime errors
 */
export default function TestStackAuth() {
  // Step 2: Test if Stack Auth client import works
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-4 p-8">
        <h1 className="text-2xl font-bold text-foreground">Stack Auth Test Page</h1>
        <p className="text-muted-foreground">🔍 Testing Stack Auth step by step</p>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Environment Variables Status:
          </p>
          <div className="text-xs space-y-1 mt-2">
            <p>VITE_STACK_PROJECT_ID: {import.meta.env.VITE_STACK_PROJECT_ID ? '✅ Set' : '❌ Missing'}</p>
            <p>VITE_STACK_PUBLISHABLE_CLIENT_KEY: {import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY ? '✅ Set' : '❌ Missing'}</p>
            <p>Stack Client: ⏸️ Import disabled for testing</p>
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
