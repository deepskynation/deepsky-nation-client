"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { CheckoutProductDetails } from "@/components/user/checkout/modules/checkout-product-details";
import { CheckoutVariantPicker } from "@/components/user/checkout/modules/checkout-variant-picker";
import {
  glassMediaFlatClassName,
  glassPanelFlatClassName,
  glassQuantityButtonClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import type { ApiProduct, ApiProductVariant } from "@/types/product";

type CheckoutOrderReviewProps = {
  product: ApiProduct;
  thumbnailSrc: string | null;
  onImagePreview: (src: string, alt: string) => void;
  isOutOfStock: boolean;
  needsVariantSelection: boolean;
  quantity: number;
  maxQuantity: number;
  onDecreaseQuantity: () => void;
  onIncreaseQuantity: () => void;
  subtotal: number;
  selectedSize: string | null;
  selectedColorId: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (colorId: string) => void;
  variantError: string | null;
  unitPrice: number;
  selectedVariant?: ApiProductVariant | null;
  hasVariants: boolean;
  total: number;
  shippingFee: number;
  shippingFeeLoading?: boolean;
  checkoutButtonLabel: string;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  placeOrderDisabled: boolean;
  onAddToCart: () => void;
  addToCartDisabled: boolean;
  backHref?: string;
};

export function CheckoutOrderReview({
  product,
  thumbnailSrc,
  onImagePreview,
  isOutOfStock,
  needsVariantSelection,
  quantity,
  maxQuantity,
  onDecreaseQuantity,
  onIncreaseQuantity,
  subtotal,
  selectedSize,
  selectedColorId,
  onSizeChange,
  onColorChange,
  variantError,
  unitPrice,
  selectedVariant,
  hasVariants,
  total,
  shippingFee,
  shippingFeeLoading,
  checkoutButtonLabel,
  isPlacingOrder,
  onPlaceOrder,
  placeOrderDisabled,
  onAddToCart,
  addToCartDisabled,
  backHref = "/products",
}: CheckoutOrderReviewProps) {
  return (
    <div className="space-y-4">
      <div className={cn(glassPanelFlatClassName, "p-5 sm:p-6")}>
        <h2 className="mb-5 text-lg font-semibold text-black">Review Your Order</h2>

        <div className="flex gap-4 pb-5">
          <div className={cn(glassMediaFlatClassName, "size-20 shrink-0 overflow-hidden")}>
            {thumbnailSrc ? (
              <button
                type="button"
                onClick={() =>
                  onImagePreview(thumbnailSrc, `${product.title} product image`)
                }
                className="size-full cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
                aria-label={`View Larger Image Of ${product.title}`}
              >
                <img
                  src={thumbnailSrc}
                  alt={product.title}
                  className="size-full object-cover"
                />
              </button>
            ) : (
              <div className="flex size-full items-center justify-center bg-white/40 text-lg font-semibold text-black/30">
                {product.title.slice(0, 1)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-sm font-semibold text-black">{product.title}</p>
              <p className="text-xs text-black/50">
                {product.category_name ?? "Uncategorized"}
              </p>
            </div>

            {isOutOfStock ? (
              <p className="text-xs font-medium text-red-600">Out Of Stock</p>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onDecreaseQuantity}
                  disabled={quantity <= 1 || isOutOfStock || needsVariantSelection}
                  aria-label="Decrease Quantity"
                  className={cn(glassQuantityButtonClassName, "size-8")}
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-[1.5rem] text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={onIncreaseQuantity}
                  disabled={
                    quantity >= maxQuantity || isOutOfStock || needsVariantSelection
                  }
                  aria-label="Increase Quantity"
                  className={cn(glassQuantityButtonClassName, "size-8")}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <p className="text-sm font-semibold text-black">
                PHP {subtotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <CheckoutVariantPicker
          variants={product.variants}
          selectedSize={selectedSize}
          selectedColorId={selectedColorId}
          onSizeChange={onSizeChange}
          onColorChange={onColorChange}
        />

        {variantError ? (
          <p className="text-sm text-red-600" role="alert">
            {variantError}
          </p>
        ) : null}

        <CheckoutProductDetails
          product={product}
          unitPrice={unitPrice}
          selectedVariant={selectedVariant}
          subtotal={subtotal}
          total={total}
          shippingFee={shippingFee}
          shippingFeeLoading={shippingFeeLoading}
          onImagePreview={onImagePreview}
          checkoutButtonLabel={checkoutButtonLabel}
          isPlacingOrder={isPlacingOrder}
          onPlaceOrder={onPlaceOrder}
          placeOrderDisabled={placeOrderDisabled}
          onAddToCart={onAddToCart}
          addToCartDisabled={addToCartDisabled}
        />
      </div>

      <Link
        href={backHref}
        className="inline-flex text-sm text-black/55 transition-colors hover:text-black"
      >
        ← Back To Products
      </Link>
    </div>
  );
}
