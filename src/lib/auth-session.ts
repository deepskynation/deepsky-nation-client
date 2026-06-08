import type { User, UserRole } from "@/types";

export const AUTH_TOKEN_STORAGE_KEY = "deepsky-auth-token";
export const AUTH_USER_STORAGE_KEY = "deepsky-auth-user";

/** @deprecated Use Redux auth state; kept for gradual migration. */
export const AUTH_SESSION_STORAGE_KEY = AUTH_USER_STORAGE_KEY;

/** @deprecated Use `User` from `@/types` */
export type AuthSession = User;

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as User;
    if (!parsed.email || !parsed.role) return null;

    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(accessToken: string, user: User): void {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, accessToken);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
}

/** @deprecated Use `getStoredUser` */
export function getAuthSession(): User | null {
  return getStoredUser();
}

/** @deprecated Use `setStoredAuth` */
export function setAuthSession(session: User): void {
  const token = getStoredAccessToken();
  if (token) {
    setStoredAuth(token, session);
    return;
  }
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(session));
}

/** @deprecated Use `clearStoredAuth` */
export function clearAuthSession(): void {
  clearStoredAuth();
}

export function getDashboardPathForRole(role: UserRole): string {
  return role === "admin" ? "/admin/dashboard" : "/user/dashboard";
}
