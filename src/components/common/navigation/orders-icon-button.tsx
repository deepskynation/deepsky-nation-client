"use client";

import Link from "next/link";
import { ShoppingBagIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrdersIconButtonProps = {
  href?: string;
  label?: string;
  className?: string;
  iconClassName?: string;
};

export function OrdersIconButton({
  href = "/user/orders",
  label = "Orders",
  className,
  iconClassName = "size-5",
}: OrdersIconButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
        className,
      )}
      aria-label={label}
    >
      <ShoppingBagIcon className={iconClassName} strokeWidth={1.75} />
    </Link>
  );
}
