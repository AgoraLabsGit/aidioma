import { Router, Route } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import PracticePage from './pages/PracticePage'

import ReadingPage from './pages/ReadingPage'
import MemorizePage from './pages/MemorizePage'
import ConversationsPage from './pages/ConversationsPage'
import ProgressPage from './pages/ProgressPage'

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
            <Route path="/" component={PracticePage} />
            <Route path="/practice" component={PracticePage} />
            <Route path="/reading" component={ReadingPage} />
            <Route path="/memorize" component={MemorizePage} />
            <Route path="/conversations" component={ConversationsPage} />
            <Route path="/content" component={() => <div>Content Page Coming Soon</div>} />
            <Route path="/progress" component={ProgressPage} />
            <Route path="/achievements" component={() => <div>Achievements Page Coming Soon</div>} />
            <Route path="/settings" component={() => <div>Settings Page Coming Soon</div>} />
          </Router>
        </Suspense>
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
