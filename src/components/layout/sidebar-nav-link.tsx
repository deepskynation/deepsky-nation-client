"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type { MenuItemTypes } from "@/components/layout/SideBarMenuItems";
import { SidebarIcon } from "@/components/layout/sidebar-icons";
import {
  sidebarActiveClassName,
  sidebarHoverClassName,
} from "@/components/layout/sidebar-styles";
import { cn } from "@/lib/utils";

type SidebarNavLinkProps = {
  item: MenuItemTypes;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function SidebarNavLink({
  item,
  collapsed = false,
  onNavigate,
}: SidebarNavLinkProps) {
  const pathname = usePathname();
  const href = item.href;
  const isActive =
    pathname === href ||
    (href !== "/" && pathname.startsWith(`${href}/`));
  const hasBadge = item.badge !== undefined && item.badge !== "";

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? item.title : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-sm text-neutral-700 transition-colors",
        sidebarHoverClassName,
        collapsed
          ? "mx-2 size-9 justify-center"
          : "gap-3 px-2 py-1.5",
        isActive && sidebarActiveClassName,
      )}
    >
      {item.icon ? (
        <SidebarIcon
          name={item.icon}
          className={cn("shrink-0 text-neutral-600", collapsed ? "size-5" : "size-4")}
        />
      ) : null}

      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          {hasBadge ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {item.badge}
            </span>
          ) : null}
          {item.showChevron ? (
            <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
          ) : null}
        </>
      ) : null}

      {collapsed && hasBadge ? (
        <span
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500"
          aria-label={`${item.badge} notifications`}
        />
      ) : null}

      {collapsed ? (
        <span className="pointer-events-none absolute left-full z-50 ml-2 hidden rounded-md bg-foreground px-2 py-1 text-xs text-background group-hover:block">
          {item.title}
        </span>
      ) : null}
    </Link>
  );
}
