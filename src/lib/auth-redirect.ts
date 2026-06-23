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

const NON_SHOP_REDIRECT_PREFIXES = ["/admin", "/login", "/verify-email"] as const;

function isShopRedirectPath(path: string): boolean {
  return !NON_SHOP_REDIRECT_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/** Post-login destination; only honors redirects that match the user's role area. */
export function getPostLoginPath(
  role: UserRole,
  redirect?: string | null,
): string {
  const safe = safeRedirectPath(redirect);
  if (!safe || safe === "/") {
    return getDashboardPathForRole(role);
  }

  if (role === "admin" && safe.startsWith("/admin")) {
    return safe;
  }

  if (role === "user" && isShopRedirectPath(safe)) {
    return safe;
  }

  return getDashboardPathForRole(role);
}
