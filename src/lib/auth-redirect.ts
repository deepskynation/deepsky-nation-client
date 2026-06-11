/** Validates in-app redirect targets (must be same-origin path). */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  return value;
}

/** Builds `/login?redirect=...` with a safe return path. */
export function buildLoginRedirectPath(returnPath: string): string {
  const safe = safeRedirectPath(returnPath) ?? "/";
  return `/login?redirect=${encodeURIComponent(safe)}`;
}
