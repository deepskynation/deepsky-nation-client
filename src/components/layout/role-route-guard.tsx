"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AccessDeniedPanel } from "@/components/common/feedback/access-denied-panel";
import {
  AuthRequiredPage,
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { useAppSelector } from "@/hooks";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import { getDashboardPathForRole } from "@/lib/auth-session";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import type { UserRole } from "@/types";

type RoleRouteGuardProps = {
  allowedRoles: UserRole[];
  /** When true, unauthenticated visitors may view the route. */
  allowGuest?: boolean;
  children: React.ReactNode;
};

export function RoleRouteGuard({
  allowedRoles,
  allowGuest = false,
  children,
}: RoleRouteGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  const roleMismatch = Boolean(user && !allowedRoles.includes(user.role));
  const adminRedirectPath =
    user?.role === "admin" ? getDashboardPathForRole("admin") : null;

  useEffect(() => {
    if (roleMismatch && adminRedirectPath) {
      router.replace(adminRedirectPath);
    }
  }, [adminRedirectPath, roleMismatch, router]);

  if (!authReady) {
    return <CenteredLoading message="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return allowGuest ? (
      <>{children}</>
    ) : (
      <AuthRequiredPage
        title="Sign In Required"
        description="Sign in with an administrator account to continue."
        action={{ href: buildLoginRedirectPath(pathname), label: "Sign In" }}
        layout="centered"
      />
    );
  }

  if (roleMismatch) {
    if (user?.role === "admin") {
      return <CenteredLoading message="Redirecting…" />;
    }

    const fallbackRole: UserRole = "user";
    return <AccessDeniedPanel fallbackRole={fallbackRole} />;
  }

  return <>{children}</>;
}
