import { ClerkProvider } from "@clerk/nextjs";

import { shouldUseClerk } from "@/lib/auth/config";

export function AuthBoundary({ children }: { children: React.ReactNode }) {
  if (!shouldUseClerk()) {
    return children;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
