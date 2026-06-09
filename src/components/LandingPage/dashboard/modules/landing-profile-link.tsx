"use client";

import Link from "next/link";
import { UserIcon } from "lucide-react";
import { useAppSelector } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-session";
import {
  getAuthBootstrapUser,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";

type LandingProfileLinkProps = {
  className?: string;
};

export function LandingProfileLink({ className }: LandingProfileLinkProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser) ?? getAuthBootstrapUser();
  const href = isAuthenticated && authUser
    ? getDashboardPathForRole(authUser.role)
    : "/login";

  return (
    <Link
      href={href}
      aria-label={isAuthenticated ? "Open account" : "Sign in"}
      className={cn(
        "inline-flex size-10 items-center justify-center text-black transition-opacity hover:opacity-70",
        className,
      )}
    >
      <UserIcon className="size-6" strokeWidth={1.75} />
    </Link>
  );
}
