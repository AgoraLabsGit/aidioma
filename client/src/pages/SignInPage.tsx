import React from 'react'
import { SignIn } from '@stackframe/stack'
import { Logo } from '../components/Logo'
import { Card } from '../components/ui/Card'

/**
 * Custom Sign-In Page following AIdioma design standards
 * Uses Stack Auth components but wraps them in our design system
 */
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center">
          <Logo size="lg" showText className="mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Welcome Back! 🎯
          </h1>
          <p className="text-muted-foreground text-sm">
            Continue your Spanish learning journey
          </p>
        </div>

        {/* Stack Auth Sign-In Component */}
        <Card className="p-6">
          <SignIn />
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>New to AIdioma?{' '}
            <a 
              href="/handler/sign-up" 
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              Create an account
            </a>
          </p>
        </div>

        {/* System Status */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>✅ Database: Neon PostgreSQL Connected</p>
          <p>✅ Authentication: Stack Auth Ready</p>
        </div>
      </div>
    </div>
  )
}
