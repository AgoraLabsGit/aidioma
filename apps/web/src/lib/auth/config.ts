type ClerkEnvironment = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  CLERK_SECRET_KEY?: string;
  AIDIOMA_FORCE_LOCAL_KEYLESS_AUTH?: string;
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
  if (
    nodeEnvironment === "development" &&
    environment.AIDIOMA_FORCE_LOCAL_KEYLESS_AUTH === "true"
  ) {
    return false;
  }
  if (isClerkConfigured(environment)) {
    return true;
  }

  const hasPartialConfiguration = Boolean(
    environment.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() ||
      environment.CLERK_SECRET_KEY?.trim(),
  );

  return nodeEnvironment === "development" && !hasPartialConfiguration;
}
