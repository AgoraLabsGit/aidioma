import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";

import { shouldUseClerk } from "@/lib/auth/config";

export function AuthControls() {
  if (!shouldUseClerk()) {
    return (
      <div className="auth-actions" aria-label="Account">
        <Link className="button button-quiet" href="/sign-in">
          Sign in
        </Link>
        <Link className="button button-solid" href="/sign-up">
          Start learning
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-actions" aria-label="Account">
      <Show when="signed-out">
        <SignInButton mode="redirect">
          <button className="button button-quiet" type="button">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button className="button button-solid" type="button">
            Start learning
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
