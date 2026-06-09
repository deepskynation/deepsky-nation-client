"use client";

import Link from "next/link";
import { UserRoundIcon } from "lucide-react";
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
        "inline-flex size-10 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/70 shadow-sm transition-colors hover:border-black/20 hover:bg-white hover:text-black",
        className,
      )}
    >
      <UserRoundIcon className="size-5" strokeWidth={1.75} />
    </Link>
  );
}
