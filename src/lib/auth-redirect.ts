import { getDashboardPathForRole } from "@/lib/auth-session";
import type { UserRole } from "@/types";

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

/** Post-login destination; only honors redirects that match the user's role prefix. */
export function getPostLoginPath(
  role: UserRole,
  redirect?: string | null,
): string {
  const safe = safeRedirectPath(redirect);
  if (!safe) {
    return getDashboardPathForRole(role);
  }

  if (role === "admin" && safe.startsWith("/admin")) {
    return safe;
  }

  if (role === "user" && safe.startsWith("/user")) {
    return safe;
  }

  return getDashboardPathForRole(role);
}
