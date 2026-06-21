"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dashboardHeaderMenuItems } from "@/components/layout/HeaderMenuItems";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import {
  HeaderProductSearch,
  ProductSearchIconButton,
  useProductSearch,
} from "@/components/common/navigation/product-search";
import { LandingProfileLink } from "@/components/LandingPage/dashboard/modules/landing-profile-link";
import { cn } from "@/lib/utils";

type LandingStorefrontHeaderProps = {
  searchQuery?: string;
};

/** Solid white bar above hero — matches Offhigh storefront header. */
const landingHeaderBarClassName = "border-b border-black/10 bg-white shadow-none";

export function LandingStorefrontHeader({
  searchQuery = "",
}: LandingStorefrontHeaderProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open: searchOpen, openSearch, closeSearch } = useProductSearch(
    pathname,
    searchQuery,
  );
  const isLandingHome = pathname === "/";

  const isActive = (href?: string) => {
    if (!href) {
      return false;
    }

    const hashIndex = href.indexOf("#");
    const path = hashIndex === -1 ? href : href.slice(0, hashIndex) || "/";
    const hash = hashIndex === -1 ? "" : href.slice(hashIndex + 1);

    if (path !== "/" && pathname === path) {
      return true;
    }

    if (pathname !== "/") {
      return false;
    }

    if (path === "/") {
      if (hash) {
        return activeHash === hash;
      }
      return activeHash === "";
    }

    return false;
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isLandingHome) {
      return;
    }

    const syncHash = () => setActiveHash(window.location.hash.slice(1));

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [isLandingHome]);

  return (
    <header
      className={cn(
        "sticky z-50",
        landingHeaderBarClassName,
        searchOpen && "pointer-events-none",
      )}
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
        <HeaderProductSearch
          open={searchOpen}
          onClose={closeSearch}
          basePath="/"
          initialQuery={searchQuery}
        >
          <div className="hidden items-center py-5 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-5">
            <nav className="flex items-center justify-start gap-x-9">
              {dashboardHeaderMenuItems.map((item) => (
                <HeaderNavLink
                  key={item.id}
                  item={item}
                  variant="minimal"
                  showIcon={false}
                  active={isActive(item.href)}
                  onHashNavigate={setActiveHash}
                />
              ))}
            </nav>

            <Link
              href="/"
              className="justify-self-center transition-opacity hover:opacity-70"
            >
              <Image
                src="/deepsky-logo.png"
                alt="Deepsky"
                width={140}
                height={28}
                className="h-6 w-auto md:h-7"
                priority
              />
            </Link>

            <div className="flex items-center justify-end gap-1">
              <ProductSearchIconButton onOpen={openSearch} />
              <LandingProfileLink />
            </div>
          </div>

          <div className="relative md:hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
              <button
                type="button"
                className="inline-flex size-10 items-center justify-center justify-self-start rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileMenuOpen((open) => !open)}
              >
                {mobileMenuOpen ? (
                  <XIcon className="size-5" strokeWidth={1.75} />
                ) : (
                  <MenuIcon className="size-5" strokeWidth={1.75} />
                )}
              </button>

              <Link href="/" className="justify-self-center transition-opacity hover:opacity-70">
                <Image
                  src="/deepsky-logo.png"
                  alt="Deepsky"
                  width={140}
                  height={28}
                  className="h-6 w-auto"
                  priority
                />
              </Link>

              <div className="flex items-center justify-end gap-1">
                <ProductSearchIconButton onOpen={openSearch} />
                <LandingProfileLink />
              </div>
            </div>

            {mobileMenuOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close menu overlay"
                  className="fixed inset-0 z-40 bg-black/25"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <nav
                  className={cn(
                    "absolute inset-x-0 top-full z-50 -mx-6 border-b border-white/40 bg-white/95 px-6 py-5 shadow-sm backdrop-blur-xl",
                    "flex flex-col gap-4",
                  )}
                >
                  {dashboardHeaderMenuItems.map((item) => (
                    <HeaderNavLink
                      key={item.id}
                      item={item}
                      variant="minimal"
                      showIcon={false}
                      active={isActive(item.href)}
                      onHashNavigate={setActiveHash}
                      className="w-fit py-1 text-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </>
            ) : null}
          </div>
        </HeaderProductSearch>
      </div>
    </header>
  );
}
