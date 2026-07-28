type ClerkEnvironment = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
};

export function isClerkConfigured(
  environment: ClerkEnvironment = process.env as ClerkEnvironment,
): boolean {
  return Boolean(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      environment.CLERK_SECRET_KEY?.trim(),
  );
}

export function shouldUseClerk(
  environment: ClerkEnvironment = process.env as ClerkEnvironment,
  nodeEnvironment = process.env.NODE_ENV,
): boolean {
  if (isClerkConfigured(environment)) {
    return true;
  }

  const hasPartialConfiguration = Boolean(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
      environment.CLERK_SECRET_KEY?.trim(),
  );

  return nodeEnvironment === "development" && !hasPartialConfiguration;
}
