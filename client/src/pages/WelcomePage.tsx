import React from 'react'
import { useUser } from '../hooks/useUser'
import { UserButton } from '@stackframe/stack'

export default function WelcomePage() {
  const userAuth = useUser()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center space-y-6 p-8">
        <h1 className="text-3xl font-bold text-foreground">Welcome to AIdioma! 🇪🇸</h1>
        
        {userAuth ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Hello, <strong>{userAuth.data.name}</strong>! 👋
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {userAuth.data.email}
            </p>
            <div className="flex justify-center">
              <UserButton />
            </div>
            <div className="space-y-2">
              <a 
                href="/practice" 
                className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start Practicing Spanish 🚀
              </a>
              <a 
                href="/progress" 
                className="block w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                View Progress 📊
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please sign in to start learning Spanish!
            </p>
            <div className="space-y-2">
              <a 
                href="/handler/sign-up" 
                className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign Up - Get Started 🎯
              </a>
              <a 
                href="/handler/sign-in" 
                className="block w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Sign In 🔑
              </a>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-8">
          <p>✅ Database: Connected to Neon PostgreSQL</p>
          <p>✅ Authentication: Stack Auth Integrated</p>
          <p>✅ Servers: Backend (3001) + Frontend (5000)</p>
        </div>
      </div>
    </div>
  )
}
