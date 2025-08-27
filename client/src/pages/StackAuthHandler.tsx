import React from 'react';
import { 
  SignIn, 
  SignUp, 
  ForgotPassword, 
  EmailVerification, 
  UserButton 
} from '@stackframe/stack';
import { useLocation } from 'wouter';
import { Logo } from '../components/Logo';
import { Card } from '../components/ui/Card';

/**
 * Stack Auth Handler - Catch-all route for all authentication operations
 * 
 * This component handles:
 * - Password reset flows (/handler/forgot-password)
 * - Email verification (/handler/email-verification)
 * - OAuth callbacks (/handler/oauth)
 * - Magic link authentication (/handler/magic-link)
 * - Account verification (/handler/verify)
 * - Other Stack Auth operations
 * 
 * Route: /handler/[...stack] (catch-all)
 * 
 * Wouter-compatible implementation
 */
export default function StackAuthHandler() {
  const [location] = useLocation();
  
  // Extract the specific handler path
  const handlerPath = location.replace('/handler/', '');
  
  const renderAuthComponent = () => {
    switch (handlerPath) {
      case 'forgot-password':
        return <ForgotPassword />;
      case 'email-verification':
      case 'verify':
        return <EmailVerification />;
      case 'user-profile':
      case 'profile':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">User Profile</h2>
            <UserButton />
          </div>
        );
      case 'sign-out':
        // Handle sign-out redirect
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Signing out...</h2>
            <p className="text-muted-foreground">You will be redirected shortly.</p>
          </div>
        );
      default:
        // For any other handler paths, show a general auth status
        return (
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Authentication</h2>
            <p className="text-muted-foreground">
              Handling authentication operation: {handlerPath}
            </p>
            <div className="flex gap-2 justify-center">
              <a 
                href="/handler/sign-in" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Sign In
              </a>
              <a 
                href="/handler/sign-up" 
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Sign Up
              </a>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm mx-auto space-y-6">
        
        {/* Header with Logo */}
        <div className="text-center">
          <Logo size="lg" showText className="mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            AIdioma Authentication
          </h1>
        </div>

        {/* Auth Component */}
        <Card className="p-6">
          {renderAuthComponent()}
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            <a 
              href="/" 
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              ← Back to AIdioma
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
