"use client";

import Link from "next/link";
import { ChevronDownIcon, HeadphonesIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  sidebarBorderClassName,
  sidebarHoverClassName,
} from "@/components/layout/sidebar-styles";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  getAuthBootstrapUser,
  logout,
  selectAuthUser,
} from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const fallbackUser: User = {
  id: "guest",
  name: "Guest",
  email: "",
  role: "user",
};

function getProfilePath(role: User["role"]) {
  return role === "admin" ? "/admin/profile" : "/profile";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type UserProfileMenuProps = {
  className?: string;
  compact?: boolean;
};

export function UserProfileMenu({
  className,
  compact = false,
}: UserProfileMenuProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector(selectAuthUser);
  const [user, setUser] = useState<User>(fallbackUser);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(authUser ?? getAuthBootstrapUser() ?? fallbackUser);
  }, [authUser]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleSignOut = () => {
    void dispatch(logout());
    setOpen(false);
    router.push("/login");
  };

  const profilePath = getProfilePath(user.role);
  const initials = getInitials(user.name);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors",
          compact && "px-0.5",
          sidebarHoverClassName,
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account Menu"
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground"
          aria-hidden
        >
          {initials}
        </div>

        {!compact ? (
          <span className="hidden min-w-0 max-w-32 truncate text-sm font-medium text-neutral-900 md:block">
            {user.name}
          </span>
        ) : null}

        {!compact ? (
          <ChevronDownIcon
            className={cn(
              "hidden size-4 shrink-0 text-muted-foreground transition-transform md:block",
              open && "rotate-180",
            )}
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-56 rounded-lg border bg-white p-1 shadow-md",
            sidebarBorderClassName,
          )}
        >
          <div className={cn("border-b px-3 py-2.5", sidebarBorderClassName)}>
            <p className="truncate text-sm font-medium text-neutral-900">
              {user.name}
            </p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            ) : null}
          </div>

          <Link
            href={profilePath}
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors",
              sidebarHoverClassName,
            )}
          >
            <UserIcon className="size-4 shrink-0" strokeWidth={1.75} />
            Profile
          </Link>

          {user.role !== "admin" ? (
            <Link
              href="/customer-service"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 transition-colors",
                sidebarHoverClassName,
              )}
            >
              <HeadphonesIcon className="size-4 shrink-0" strokeWidth={1.75} />
              Customer Service
            </Link>
          ) : null}

          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOutIcon className="size-4 shrink-0" strokeWidth={1.75} />
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
