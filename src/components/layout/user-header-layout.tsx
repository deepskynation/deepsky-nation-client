"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { userHeaderMenuItems } from "@/components/layout/HeaderMenuItems";
import { CartIconButton } from "@/components/common/navigation/cart-icon-button";
import { OrdersIconButton } from "@/components/common/navigation/orders-icon-button";
import {
  HeaderProductSearch,
  ProductSearchIconButton,
  useProductSearch,
  userHeaderProductSearchIconClassName,
  userHeaderProductSearchMobileTriggerClassName,
  userHeaderProductSearchTriggerClassName,
} from "@/components/common/navigation/product-search";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { useAppSelector } from "@/hooks";
import { selectCartItemCount } from "@/store/slices/cartSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { getStorefrontHomeHref } from "@/lib/storefront-categories";
import { glassHeaderClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

function HeaderDesktopActions({
  cartCount,
  onSearchOpen,
}: {
  cartCount: number;
  onSearchOpen: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <ProductSearchIconButton
        onOpen={onSearchOpen}
        className={userHeaderProductSearchTriggerClassName}
        iconClassName={userHeaderProductSearchIconClassName}
      />
      <OrdersIconButton />
      <CartIconButton count={cartCount} />
      <UserProfileMenu compact />
    </div>
  );
}

function HeaderMobileActions({
  cartCount,
  onSearchOpen,
}: {
  cartCount: number;
  onSearchOpen: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
      <ProductSearchIconButton
        onOpen={onSearchOpen}
        className={userHeaderProductSearchMobileTriggerClassName}
        iconClassName={userHeaderProductSearchIconClassName}
      />
      <CartIconButton count={cartCount} />
      <UserProfileMenu compact />
    </div>
  );
}

type UserHeaderLayoutProps = {
  children: React.ReactNode;
};

export function UserHeaderLayout({ children }: UserHeaderLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const cartCount = useAppSelector(selectCartItemCount);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const homeHref = getStorefrontHomeHref(isAuthenticated);
  const searchBasePath = isAuthenticated ? "/dashboard" : "/";
  const navItems = userHeaderMenuItems.map((item) =>
    item.id === "dashboard" ? { ...item, href: homeHref } : item,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { open: searchOpen, openSearch, closeSearch } = useProductSearch(
    pathname,
    searchQuery,
  );

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <header
        className={cn(
          "sticky top-0 z-50",
          glassHeaderClassName,
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
                {navItems
                  .filter((item) => !item.hideInDesktopNav)
                  .map((item) => (
                    <HeaderNavLink
                      key={item.id}
                      item={item}
                      variant="minimal"
                      showIcon={false}
                      active={isActive(item.href)}
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

              <HeaderDesktopActions
                cartCount={cartCount}
                onSearchOpen={openSearch}
              />
            </div>

            <div className="relative md:hidden">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center py-4">
                <button
                  type="button"
                  className="inline-flex size-9 items-center justify-center justify-self-start rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  aria-expanded={mobileMenuOpen}
                  aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
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
                    className="h-6 w-auto md:h-7"
                    priority
                  />
                </Link>
                <HeaderMobileActions
                  cartCount={cartCount}
                  onSearchOpen={openSearch}
                />
              </div>

              {mobileMenuOpen ? (
                <>
                  <button
                    type="button"
                    aria-label="Close Menu Overlay"
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

      <main>{children}</main>
    </div>
  );
}
