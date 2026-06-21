"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { dashboardHeaderMenuItems } from "@/components/layout/HeaderMenuItems";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import { CartIconButton } from "@/components/common/navigation/cart-icon-button";
import { OrdersIconButton } from "@/components/common/navigation/orders-icon-button";
import {
  HeaderProductSearch,
  ProductSearchIconButton,
  useProductSearch,
} from "@/components/common/navigation/product-search";
import { LandingProfileLink } from "@/components/LandingPage/dashboard/modules/landing-profile-link";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { useAppSelector } from "@/hooks";
import { selectCartItemCount } from "@/store/slices/cartSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { getStorefrontHomeHref } from "@/lib/storefront-categories";
import { storefrontHeaderBarClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type LandingStorefrontHeaderProps = {
  searchQuery?: string;
};

/** Solid white bar above hero — matches Offhigh storefront header. */
const landingHeaderBarClassName = storefrontHeaderBarClassName;

const landingHeaderActionButtonClassName =
  "size-10 rounded-lg text-black hover:bg-neutral-100 hover:text-neutral-900 hover:opacity-100";

function LandingHeaderDesktopActions({
  cartCount,
  onSearchOpen,
  isAuthenticated,
}: {
  cartCount: number;
  onSearchOpen: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ProductSearchIconButton onOpen={onSearchOpen} />
      {isAuthenticated ? (
        <>
          <OrdersIconButton className={landingHeaderActionButtonClassName} />
          <CartIconButton
            count={cartCount}
            className={landingHeaderActionButtonClassName}
          />
          <UserProfileMenu
            compact
            className={landingHeaderActionButtonClassName}
          />
        </>
      ) : (
        <LandingProfileLink />
      )}
    </div>
  );
}

function LandingHeaderMobileActions({
  cartCount,
  onSearchOpen,
  isAuthenticated,
}: {
  cartCount: number;
  onSearchOpen: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <ProductSearchIconButton onOpen={onSearchOpen} />
      {isAuthenticated ? (
        <>
          <CartIconButton
            count={cartCount}
            className={landingHeaderActionButtonClassName}
          />
          <UserProfileMenu
            compact
            className={landingHeaderActionButtonClassName}
          />
        </>
      ) : (
        <LandingProfileLink />
      )}
    </div>
  );
}

export function LandingStorefrontHeader({
  searchQuery = "",
}: LandingStorefrontHeaderProps) {
  const pathname = usePathname();
  const cartCount = useAppSelector(selectCartItemCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const homeHref = getStorefrontHomeHref(isAuthenticated);
  const searchBasePath = isAuthenticated ? "/dashboard" : "/";
  const navItems = dashboardHeaderMenuItems.map((item) =>
    item.id === "dashboard" ? { ...item, href: homeHref } : item,
  );
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
          basePath={searchBasePath}
          initialQuery={searchQuery}
        >
          <div className="hidden items-center py-5 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-5">
            <nav className="flex items-center justify-start gap-x-9">
              {navItems.map((item) => (
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
              href={homeHref}
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

            <LandingHeaderDesktopActions
              cartCount={cartCount}
              onSearchOpen={openSearch}
              isAuthenticated={isAuthenticated}
            />
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

              <Link
                href={homeHref}
                className="justify-self-center transition-opacity hover:opacity-70"
              >
                <Image
                  src="/deepsky-logo.png"
                  alt="Deepsky"
                  width={140}
                  height={28}
                  className="h-6 w-auto"
                  priority
                />
              </Link>

              <LandingHeaderMobileActions
                cartCount={cartCount}
                onSearchOpen={openSearch}
                isAuthenticated={isAuthenticated}
              />
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
                  {navItems.map((item) => (
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
