import React from 'react'
import { SignUp } from '@stackframe/stack'
import { Logo } from '../components/Logo'
import { Card } from '../components/ui/Card'

/**
 * Custom Sign-Up Page following AIdioma design standards
 * Uses Stack Auth components but wraps them in our design system
 */
export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center">
          <Logo size="lg" showText className="mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Bienvenido! 🇪🇸
          </h1>
          <p className="text-muted-foreground text-sm">
            Start your Spanish learning adventure today
          </p>
        </div>

        {/* Stack Auth Sign-Up Component */}
        <Card className="p-6">
          <SignUp />
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Already have an account?{' '}
            <a 
              href="/handler/sign-in" 
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              Sign in here
            </a>
          </p>
        </div>

        {/* Features Preview */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>🎯 Interactive Practice Sessions</p>
          <p>📚 Reading Comprehension</p>
          <p>💬 Conversation Practice</p>
          <p>📊 Progress Tracking</p>
        </div>
      </div>
    </div>
  )
}
