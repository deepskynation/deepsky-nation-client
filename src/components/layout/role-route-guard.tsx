"use client";

import { usePathname } from "next/navigation";
import { AccessDeniedPanel } from "@/components/common/feedback/access-denied-panel";
import {
  AuthRequiredPage,
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { useAppSelector } from "@/hooks";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
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
  const authReady = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

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

  if (!user || !allowedRoles.includes(user.role)) {
    const fallbackRole: UserRole = user?.role === "admin" ? "admin" : "user";
    return <AccessDeniedPanel fallbackRole={fallbackRole} />;
  }

  return <>{children}</>;
}
