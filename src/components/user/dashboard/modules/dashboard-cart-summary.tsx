"use client";

import Link from "next/link";
import { Loader2Icon, ShoppingCartIcon } from "lucide-react";
import { glassCardClassName } from "@/lib/glass-styles";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

type DashboardCartSummaryProps = {
  itemCount: number;
  subtotal: string;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export function DashboardCartSummary({
  itemCount,
  subtotal,
  status,
  error,
}: DashboardCartSummaryProps) {
  const isLoading = status === "loading" && itemCount === 0;
  const isEmpty = itemCount === 0 && status === "succeeded";

  return (
    <section className={cn(glassCardClassName, "flex h-full flex-col p-5 sm:p-6")}>
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-black/[0.04] text-black/45">
          <ShoppingCartIcon className="size-4" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-black">Your Cart</h2>
          <p className="text-xs text-black/50">Items ready for checkout</p>
        </div>
      </div>

      {error && status === "failed" ? (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-black/50">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Loading cart…
        </div>
      ) : isEmpty ? (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <p className="text-sm text-black/55">Your cart is empty.</p>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-black px-5 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between gap-4">
          <div className="space-y-1">
            <p className="text-2xl font-semibold tabular-nums text-black">
              {itemCount} item{itemCount === 1 ? "" : "s"}
            </p>
            <p className="text-sm text-black/55">
              Subtotal {formatMoney(subtotal)}
            </p>
          </div>
          <Link
            href="/cart"
            className="inline-flex h-10 items-center justify-center rounded-full border border-black bg-black px-5 text-[11px] uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
          >
            Continue To Checkout
          </Link>
        </div>
      )}
    </section>
  );
}
