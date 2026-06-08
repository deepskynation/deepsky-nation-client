"use client";

import Image from "next/image";
import Link from "next/link";
import { PanelLeftCloseIcon, PanelLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { SidebarConfig } from "@/components/layout/SideBarMenuItems";
import { SidebarNavLink } from "@/components/layout/sidebar-nav-link";
import {
  sidebarBorderClassName,
  sidebarHoverClassName,
  sidebarSurfaceClassName,
} from "@/components/layout/sidebar-styles";
import { cn } from "@/lib/utils";

const COLLAPSED_STORAGE_KEY = "deepsky-sidebar-collapsed";

function SidebarBrandLogo({
  href,
  label,
  size = "md",
}: {
  href: string;
  label: string;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? 32 : 36;

  return (
    <Link
      href={href}
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-full",
        size === "sm" ? "size-8" : "size-9",
      )}
      aria-label={label}
    >
      <Image
        src="/logo.png"
        alt=""
        width={dimension}
        height={dimension}
        className="size-full object-cover"
        priority
      />
    </Link>
  );
}

type AppSidebarProps = {
  config: SidebarConfig;
  brandHref?: string;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
};

function SidebarHeader({
  brandHref,
  productTitle,
  collapsed,
  onToggleCollapse,
}: {
  brandHref: string;
  productTitle: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b",
        sidebarBorderClassName,
        "min-h-[3.75rem]",
        collapsed ? "flex-col justify-center gap-2 py-3" : "gap-3 px-3",
      )}
    >
      <SidebarBrandLogo href={brandHref} label={productTitle} />

      {!collapsed ? (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-900">
            {productTitle}
          </p>
        </div>
      ) : null}

      <button
        type="button"
        onClick={onToggleCollapse}
        className={cn(
          "rounded-md p-1.5 text-neutral-500 transition-colors",
          sidebarHoverClassName,
          "hover:text-neutral-900",
          collapsed && "mx-auto",
        )}
        aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {collapsed ? (
          <PanelLeftIcon className="size-4" />
        ) : (
          <PanelLeftCloseIcon className="size-4" />
        )}
      </button>
    </div>
  );
}

function SidebarNav({
  config,
  collapsed,
  onNavigate,
}: {
  config: SidebarConfig;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
      {config.sections.map((section) => (
        <div key={section.id} className={cn("mb-4", collapsed ? "px-0" : "px-2")}>
          {!collapsed ? (
            <p className="mb-1 px-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
              {section.label}
            </p>
          ) : null}
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <li key={item.id}>
                <SidebarNavLink
                  item={item}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AppSidebar({
  config,
  brandHref = "/",
  mobileOpen = false,
  onMobileOpenChange,
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  };

  const closeMobile = () => onMobileOpenChange?.(false);
  const isCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close Menu Overlay"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r transition-[width,transform] duration-200 md:relative md:z-auto md:shrink-0 md:self-stretch",
          sidebarBorderClassName,
          sidebarSurfaceClassName,
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-[4.5rem] md:w-[4.5rem]" : "w-60 md:w-60",
        )}
      >
        <SidebarHeader
          brandHref={brandHref}
          productTitle={config.productTitle}
          collapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        <SidebarNav
          config={config}
          collapsed={isCollapsed}
          onNavigate={closeMobile}
        />
      </aside>
    </>
  );
}
