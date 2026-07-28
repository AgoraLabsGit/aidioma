import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

import { AuthPage } from "@/components/auth-page";
import { shouldUseClerk } from "@/lib/auth/config";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  const configured = shouldUseClerk();

  return (
    <AuthPage configured={configured} eyebrow="Start here" heading="Build Spanish that stays.">
      <SignUp path="/sign-up" routing="path" />
    </AuthPage>
  );
}
