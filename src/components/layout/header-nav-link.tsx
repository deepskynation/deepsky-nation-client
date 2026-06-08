"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItemTypes } from "@/components/layout/HeaderMenuItems";
import { cn } from "@/lib/utils";

type HeaderNavLinkProps = {
  item: MenuItemTypes;
  className?: string;
  iconClassName?: string;
  showIcon?: boolean;
  active?: boolean;
  variant?: "default" | "minimal";
  badge?: number | string;
  onHashNavigate?: (hash: string) => void;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

function scrollToHash(hash: string, onHashNavigate?: (hash: string) => void) {
  if (!hash) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", window.location.pathname);
    onHashNavigate?.("");
    return;
  }

  const target = document.getElementById(hash);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${hash}`);
    onHashNavigate?.(hash);
  }
}

export function HeaderNavLink({
  item,
  className,
  iconClassName = "size-4",
  showIcon = true,
  active = false,
  variant = "default",
  badge,
  onHashNavigate,
  onClick,
}: HeaderNavLinkProps) {
  const displayBadge = badge ?? item.badge;
  const hasBadge = displayBadge !== undefined && displayBadge !== "";
  const pathname = usePathname();
  const Icon = item.icon;
  const href = item.href ?? "#";

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const isLandingPage = pathname === "/" || pathname === "/dashboard";

    if (isLandingPage && (href === "/" || href === "/dashboard")) {
      event.preventDefault();
      scrollToHash("", onHashNavigate);
      return;
    }

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const path = href.slice(0, hashIndex) || "/";
    const hash = href.slice(hashIndex + 1);
    const isSamePage = path === "/" ? isLandingPage : pathname === path;

    if (isSamePage) {
      event.preventDefault();
      scrollToHash(hash, onHashNavigate);
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        variant === "minimal"
          ? cn(
              "inline-flex items-center text-xs uppercase tracking-[0.18em] text-black/55 transition-colors hover:text-black",
              active && "border-b border-black pb-1 text-black",
            )
          : "flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted",
        variant === "default" && "flex items-center gap-2",
        className,
      )}
    >
      {showIcon && Icon ? <Icon className={iconClassName} /> : null}
      {item.title}
      {hasBadge ? (
        <span className="ml-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-black px-1.5 py-0.5 text-[9px] font-medium text-white tabular-nums">
          {displayBadge}
        </span>
      ) : null}
    </Link>
  );
}
