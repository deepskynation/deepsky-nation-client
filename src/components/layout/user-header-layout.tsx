"use client";

import Image from "next/image";
import Link from "next/link";
import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { userHeaderMenuItems } from "@/components/layout/HeaderMenuItems";
import { CartIconButton } from "@/components/common/navigation/cart-icon-button";
import { OrdersIconButton } from "@/components/common/navigation/orders-icon-button";
import { HeaderNavLink } from "@/components/layout/header-nav-link";
import { UserProfileMenu } from "@/components/layout/user-profile-menu";
import { useAppSelector } from "@/hooks";
import { selectCartItemCount } from "@/store/slices/cartSlice";
import { glassHeaderClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

function HeaderDesktopActions({ cartCount }: { cartCount: number }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-2">
      <OrdersIconButton />
      <CartIconButton count={cartCount} />
      <UserProfileMenu compact />
    </div>
  );
}

function HeaderMobileActions({ cartCount }: { cartCount: number }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-1">
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
  const cartCount = useAppSelector(selectCartItemCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <header className={cn(glassHeaderClassName, "relative z-50")}>
        <div className="mx-auto max-w-7xl px-6 md:px-10 lg:px-12">
          <div className="hidden items-center gap-5 py-5 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/user/dashboard"
              className="justify-self-start transition-opacity hover:opacity-70"
            >
              <Image
                src="/deepsky-logo.png"
                alt="DeepSky"
                width={140}
                height={28}
                className="h-6 w-auto md:h-7"
                priority
              />
            </Link>

            <nav className="flex items-center justify-center gap-x-9">
              {userHeaderMenuItems
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

            <HeaderDesktopActions cartCount={cartCount} />
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
                href="/user/dashboard"
                className="justify-self-center transition-opacity hover:opacity-70"
              >
                <Image
                  src="/deepsky-logo.png"
                  alt="DeepSky"
                  width={140}
                  height={28}
                  className="h-6 w-auto md:h-7"
                  priority
                />
              </Link>
              <HeaderMobileActions cartCount={cartCount} />
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
                  {userHeaderMenuItems.map((item) => (
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
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
