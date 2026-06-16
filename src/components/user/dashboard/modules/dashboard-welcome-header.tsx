"use client";

import Link from "next/link";
import {
  PackageIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserCircleIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardWelcomeHeaderProps = {
  userName: string;
  cartItemCount: number;
};

const QUICK_ACTIONS = [
  {
    href: "/products",
    label: "Products",
    icon: ShoppingBagIcon,
  },
  {
    href: "/cart",
    label: "Cart",
    icon: ShoppingCartIcon,
    showCartBadge: true,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: PackageIcon,
  },
  {
    href: "/profile",
    label: "Profile",
    icon: UserCircleIcon,
  },
] as const;

export function DashboardWelcomeHeader({
  userName,
  cartItemCount,
}: DashboardWelcomeHeaderProps) {
  return (
    <header className="space-y-5">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
        Deepsky
        </p>
        <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
          Welcome Back, {userName}
        </h1>
        <p className="text-sm text-black/55">
          Discover new pieces, manage your cart, and track your orders.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const showBadge =
            "showCartBadge" in action && action.showCartBadge && cartItemCount > 0;

          return (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2",
                "text-[11px] font-medium uppercase tracking-[0.18em] text-black/75",
                "transition-colors hover:border-black/20 hover:bg-white hover:text-black",
              )}
            >
              <Icon className="size-3.5" aria-hidden />
              {action.label}
              {showBadge ? (
                <span className="rounded-full bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {cartItemCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
