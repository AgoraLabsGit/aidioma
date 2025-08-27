import React from 'react'
import { Router, Route } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
// Import test component to isolate Stack Auth issues
import TestStackAuth from './pages/TestStackAuth'
// Temporarily disable auth pages to test for Stack Auth runtime errors
// import SignInPage from './pages/SignInPage'
// import SignUpPage from './pages/SignUpPage'
// Temporarily comment out problematic pages with hook violations
// import PracticePage from './pages/PracticePage'
// import ReadingPage from './pages/ReadingPage'
// import MemorizePage from './pages/MemorizePage'
// import ConversationsPage from './pages/ConversationsPage'
// import ProgressPage from './pages/ProgressPage'

// Landing page with authentication options
function SafeWelcomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-8 p-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🇪🇸</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">AIdioma</h1>
          <p className="text-muted-foreground text-lg">
            Learn Spanish with AI-powered practice
          </p>
        </div>
        
        {/* Authentication Actions */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="/sign-up" 
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Sign Up
            </a>
            <a 
              href="/sign-in" 
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            >
              Sign In
            </a>
          </div>
          
          {/* Guest Mode */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">Or explore as a guest:</p>
            <div className="space-y-2">
              <a 
                href="/practice" 
                className="block w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Try Practice Mode 🚀
              </a>
              <a 
                href="/progress" 
                className="block w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                View Demo Progress 📊
              </a>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div>🎯 Interactive Practice</div>
            <div>📚 Reading Comprehension</div>
          </div>
          <div className="space-y-2">
            <div>💬 AI Conversations</div>
            <div>📊 Progress Tracking</div>
          </div>
        </div>
        
        {/* Debug Tools */}
        <div className="text-center">
          <a 
            href="/test-auth" 
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
          >
            🔧 Test Stack Auth (Debug)
          </a>
        </div>

        {/* System Status */}
        <div className="text-xs text-muted-foreground mt-8 space-y-1">
          <p>✅ Database: Connected to Neon PostgreSQL</p>
          <p>⚠️ Authentication: Stack Auth (Testing)</p>
          <p>✅ Servers: Backend (3001) + Frontend (5001)</p>
        </div>
      </div>
    </div>
  )
}

// Temporary placeholder component for pages with hook violations
function SafePlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-lg mx-auto text-center space-y-6 p-8">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="text-destructive text-sm">
            ⚠️ Temporarily disabled due to React Hooks violations
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Multiple conditional useState calls detected</p>
            <p>• Hooks must be called in the same order every render</p>
            <p>• Pages need to be refactored to fix hook violations</p>
          </div>
        </div>
        
        <div className="flex gap-2 justify-center">
          <a 
            href="/" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}

// Note: Auth pages temporarily disabled to resolve Stack Auth circular dependency issues
// Will be re-enabled once Stack Auth is properly configured

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <Router>
            <Route path="/" component={SafeWelcomePage} />
            {/* Stack Auth Test Route */}
            <Route path="/test-auth" component={TestStackAuth} />
            {/* Authentication Routes (temporarily disabled due to Stack Auth runtime errors) */}
            <Route path="/sign-in" component={() => <SafePlaceholderPage title="Sign In" description="Authentication temporarily disabled due to Stack Auth runtime errors" />} />
            <Route path="/sign-up" component={() => <SafePlaceholderPage title="Sign Up" description="Authentication temporarily disabled due to Stack Auth runtime errors" />} />
            {/* Learning Pages (temporarily disabled due to hook violations) */}
            <Route path="/practice" component={() => <SafePlaceholderPage title="Practice Page" description="Practice Spanish translation with AI feedback" />} />
            <Route path="/reading" component={() => <SafePlaceholderPage title="Reading Page" description="Read Spanish texts with comprehension exercises" />} />
            <Route path="/memorize" component={() => <SafePlaceholderPage title="Memorize Page" description="Learn Spanish vocabulary with spaced repetition" />} />
            <Route path="/conversations" component={() => <SafePlaceholderPage title="Conversations Page" description="Practice Spanish conversations with AI" />} />
            <Route path="/content" component={() => <SafePlaceholderPage title="Content Page" description="Explore Spanish learning content" />} />
            <Route path="/progress" component={() => <SafePlaceholderPage title="Progress Page" description="Track your Spanish learning progress" />} />
            <Route path="/achievements" component={() => <SafePlaceholderPage title="Achievements Page" description="View your learning achievements" />} />
            <Route path="/settings" component={() => <SafePlaceholderPage title="Settings Page" description="Customize your learning experience" />} />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
