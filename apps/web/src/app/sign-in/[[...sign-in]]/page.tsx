import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthPage } from "@/components/auth-page";
import { shouldUseClerk } from "@/lib/auth/config";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  const configured = shouldUseClerk();

  return (
    <AuthPage configured={configured} eyebrow="Welcome back" heading="Return to your Spanish.">
      <SignIn path="/sign-in" routing="path" />
    </AuthPage>
  );
}
