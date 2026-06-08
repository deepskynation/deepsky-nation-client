"use client";

import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CartIconButtonProps = {
  count?: number;
  href?: string;
  label?: string;
  className?: string;
  iconClassName?: string;
  badgeClassName?: string;
};

export function CartIconButton({
  count = 0,
  href = "/user/cart",
  label = "Cart",
  className,
  iconClassName = "size-5",
  badgeClassName,
}: CartIconButtonProps) {
  const hasItems = count > 0;
  const badgeLabel = count > 99 ? "99+" : count;

  return (
    <Link
      href={href}
      className={cn(
        "relative inline-flex size-7 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
        className,
      )}
      aria-label={hasItems ? `${label}, ${count} items` : label}
    >
      <ShoppingCartIcon className={iconClassName} strokeWidth={1.75} />
      {hasItems ? (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-black px-1 py-0.5 text-[9px] font-medium text-white tabular-nums",
            badgeClassName,
          )}
        >
          {badgeLabel}
        </span>
      ) : null}
    </Link>
  );
}
