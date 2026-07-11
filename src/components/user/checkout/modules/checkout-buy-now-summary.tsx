"use client";

import Link from "next/link";
import { Loader2Icon, Lock } from "lucide-react";
import { OrderTotalsSummary } from "@/components/common/order/order-totals-summary";
import { formatVariantLabel } from "@/lib/product-variants";
import {
  glassMediaFlatClassName,
  glassPanelFlatClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import type { ApiProduct, ApiProductVariant } from "@/types/product";

type CheckoutBuyNowSummaryProps = {
  product: ApiProduct;
  thumbnailSrc: string | null;
  quantity: number;
  selectedVariant?: ApiProductVariant | null;
  unitPrice: number;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingFeeLoading?: boolean;
  checkoutButtonLabel: string;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  placeOrderDisabled: boolean;
  productHref: string;
};

export function CheckoutBuyNowSummary({
  product,
  thumbnailSrc,
  quantity,
  selectedVariant,
  unitPrice,
  subtotal,
  shippingFee,
  total,
  shippingFeeLoading,
  checkoutButtonLabel,
  isPlacingOrder,
  onPlaceOrder,
  placeOrderDisabled,
  productHref,
}: CheckoutBuyNowSummaryProps) {
  return (
    <div className="space-y-4">
      <div className={cn(glassPanelFlatClassName, "p-5 sm:p-6")}>
        <h2 className="mb-5 text-lg font-semibold text-black">Review Your Order</h2>

        <div className="flex gap-4 pb-5">
          <div className={cn(glassMediaFlatClassName, "size-20 shrink-0 overflow-hidden")}>
            {thumbnailSrc ? (
              <img
                src={thumbnailSrc}
                alt={product.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-white/40 text-lg font-semibold text-black/30">
                {product.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="uppercase `text-sm font-semibold text-black">{product.title}</p>
            <p className="text-xs text-black/50">
              {product.category_name ?? "Uncategorized"}
            </p>
            {selectedVariant ? (
              <p className="text-xs text-black/55">
                {formatVariantLabel(selectedVariant)}
              </p>
            ) : null}
            <p className="text-xs text-black/55">
              Qty {quantity} × PHP {unitPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <OrderTotalsSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
          shippingNote={
            shippingFeeLoading ? "Loading shipping fee…" : undefined
          }
        />

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={placeOrderDisabled}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
        >
          {isPlacingOrder ? (
            <>
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              Placing order…
            </>
          ) : (
            checkoutButtonLabel
          )}
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-black/45">
          <Lock className="size-3.5 shrink-0" aria-hidden />
          Secure checkout — your details are kept private
        </p>
      </div>

      <Link
        href={productHref}
        className="inline-flex text-sm text-black/55 transition-colors hover:text-black"
      >
        ← Change size or quantity
      </Link>
    </div>
  );
}
