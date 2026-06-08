"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import {
  sidebarBorderClassName,
  sidebarHoverClassName,
} from "@/components/layout/sidebar-styles";
import { cn } from "@/lib/utils";

type ContentTopBarProps = {
  title?: string;
  mobileOpen?: boolean;
  onMobileMenuToggle?: () => void;
};

export function ContentTopBar({
  title,
  mobileOpen = false,
  onMobileMenuToggle,
}: ContentTopBarProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center gap-3 border-b px-4 md:px-6",
        sidebarBorderClassName,
        "min-h-[3.75rem]",
      )}
    >
      {onMobileMenuToggle ? (
        <button
          type="button"
          className={cn(
            "rounded-md p-1.5 text-neutral-700 transition-colors md:hidden",
            sidebarHoverClassName,
          )}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
          onClick={onMobileMenuToggle}
        >
          {mobileOpen ? (
            <XIcon className="size-5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </button>
      ) : null}

      {title ? (
        <h1 className="truncate text-base font-semibold text-neutral-900 md:text-lg">
          {title}
        </h1>
      ) : null}

      <div className="ml-auto flex items-center gap-1">
        <UserProfileMenu />
      </div>
    </header>
  );
}
