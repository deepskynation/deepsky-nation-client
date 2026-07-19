"use client";

import { useEffect, useState } from "react";
import type { SidebarConfig } from "@/components/layout/SideBarMenuItems";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ContentTopBar } from "@/components/layout/content-top-bar";
import { cn } from "@/lib/utils";

type SidebarLayoutProps = {
  children: React.ReactNode;
  config: SidebarConfig;
  brandHref?: string;
  title?: string;
  className?: string;
  mainClassName?: string;
};

export function SidebarLayout({
  children,
  config,
  brandHref,
  title,
  className,
  mainClassName,
}: SidebarLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent a second (document) scrollbar beside main; sidebar nav scroll stays.
  useEffect(() => {
    const { documentElement, body } = document;
    const previous = {
      htmlOverflow: documentElement.style.overflow,
      bodyOverflow: body.style.overflow,
    };
    documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      documentElement.style.overflow = previous.htmlOverflow;
      body.style.overflow = previous.bodyOverflow;
    };
  }, []);

  return (
    <div
      className={cn(
        "h-dvh min-h-0 overflow-hidden bg-background text-foreground",
        className,
      )}
    >
      <div className="flex h-full flex-col md:flex-row">
        <AppSidebar
          config={config}
          brandHref={brandHref}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <ContentTopBar
            title={title}
            mobileOpen={mobileOpen}
            onMobileMenuToggle={() => setMobileOpen((open) => !open)}
          />

          <main
            className={cn("min-h-0 flex-1 overflow-y-auto", mainClassName)}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
