"use client";

import Link from "next/link";
import { ArrowRight, Loader2Icon } from "lucide-react";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

type CartOrderSummaryProps = {
  subtotal: string | number;
  shippingFee: string | number;
  total: string | number;
  shippingLoading?: boolean;
  selectedCount: number;
  canCheckout: boolean;
  isUpdating?: boolean;
  onCheckout: () => void;
  warning?: string | null;
  className?: string;
};

export function CartOrderSummary({
  subtotal,
  shippingFee,
  total,
  shippingLoading = false,
  selectedCount,
  canCheckout,
  isUpdating = false,
  onCheckout,
  warning,
  className,
}: CartOrderSummaryProps) {
  return (
    <aside
      className={cn(
        "rounded-xl border border-black/8 bg-white px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)]",
        className,
      )}
    >
      <h2 className="mb-4 text-base font-semibold text-black">Order Summary</h2>

      <dl className="space-y-2 text-sm text-black">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-black/50">Subtotal</dt>
          <dd className="font-medium tabular-nums text-black">
            {formatMoney(subtotal)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-black/50">Delivery Fee</dt>
          <dd className="font-medium tabular-nums text-black">
            {shippingLoading ? "…" : formatMoney(shippingFee)}
          </dd>
        </div>
      </dl>

      <div className="my-3 border-t border-black/10" />

      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="font-medium text-black">Total</span>
        <span className="text-lg font-bold tabular-nums text-black">
          {formatMoney(total)}
        </span>
      </div>

      {selectedCount === 0 ? (
        <p className="mb-4 text-sm text-black/50">
          Select at least one item to checkout.
        </p>
      ) : null}

      {warning ? (
        <p className="mb-4 text-sm text-amber-800" role="alert">
          {warning}
        </p>
      ) : null}

      <button
        type="button"
        disabled={!canCheckout}
        onClick={onCheckout}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUpdating ? (
          <Loader2Icon className="size-5 animate-spin" aria-hidden />
        ) : (
          <>
            Go to Checkout
            <ArrowRight className="size-5" aria-hidden />
          </>
        )}
      </button>

      <Link
        href="/products"
        className="mt-4 block text-center text-sm text-black/45 underline-offset-2 transition-colors hover:text-black hover:underline"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}
