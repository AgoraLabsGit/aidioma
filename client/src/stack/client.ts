import { StackClientApp } from "@stackframe/stack";

// Check environment variables before initializing
const projectId = import.meta.env.VITE_STACK_PROJECT_ID;
const publishableClientKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY;

if (!projectId || !publishableClientKey) {
  console.warn('Stack Auth environment variables not found:', {
    projectId: projectId ? 'SET' : 'MISSING',
    publishableClientKey: publishableClientKey ? 'SET' : 'MISSING'
  });
}

// Only initialize if environment variables are available
export const stackClientApp = (projectId && publishableClientKey) 
  ? new StackClientApp({
      projectId,
      publishableClientKey,
      tokenStore: "cookie",
    })
  : null;
