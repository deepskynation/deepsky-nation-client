"use client";

import Link from "next/link";
import { UserIcon } from "lucide-react";
import { useAppSelector } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-session";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import {
  getAuthBootstrapUser,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

type LandingProfileLinkProps = {
  className?: string;
  iconClassName?: string;
};

export function LandingProfileLink({
  className,
  iconClassName = "size-6",
}: LandingProfileLinkProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser) ?? getAuthBootstrapUser();
  const href =
    isAuthenticated && authUser
      ? getDashboardPathForRole(authUser.role)
      : buildLoginRedirectPath("/dashboard");

  return (
    <Link
      href={href}
      aria-label={isAuthenticated ? "Open account" : "Sign in"}
      className={cn(
        "inline-flex size-10 items-center justify-center text-black transition-opacity hover:opacity-70",
        className,
      )}
    >
      <UserIcon className={iconClassName} strokeWidth={1.75} />
    </Link>
  );
}
