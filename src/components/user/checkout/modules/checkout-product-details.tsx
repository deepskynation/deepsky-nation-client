"use client";

import { Loader2Icon, Lock, ShoppingCart } from "lucide-react";
import { ProductImageGrid } from "@/components/common/product/product-image-grid";
import {
  emptyLabelForProductImageRole,
  formatProductDetails,
  imagesByRole,
  PRODUCT_IMAGE_SECTIONS,
} from "@/lib/product-image";
import { formatVariantLabel } from "@/lib/product-variants";
import { toImagePreviewSrc } from "@/lib/read-image-base64";
import type { ApiProduct, ApiProductImage, ApiProductVariant } from "@/types/product";

type CheckoutProductDetailsProps = {
  product: ApiProduct;
  unitPrice: number;
  selectedVariant?: ApiProductVariant | null;
  subtotal: number;
  total: number;
  shippingFee: number;
  shippingFeeLoading?: boolean;
  onImagePreview: (src: string, alt: string) => void;
  checkoutButtonLabel: string;
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  placeOrderDisabled: boolean;
  onAddToCart: () => void;
  addToCartDisabled: boolean;
};

export function CheckoutProductDetails({
  product,
  unitPrice,
  selectedVariant,
  subtotal,
  total,
  shippingFee,
  shippingFeeLoading = false,
  onImagePreview,
  checkoutButtonLabel,
  isPlacingOrder,
  onPlaceOrder,
  placeOrderDisabled,
  onAddToCart,
  addToCartDisabled,
}: CheckoutProductDetailsProps) {
  const specLines = formatProductDetails(product.details);

  const handleImageClick = (image: ApiProductImage, sectionTitle: string) => {
    onImagePreview(
      toImagePreviewSrc(image.image_base64),
      `${product.title} ${sectionTitle}`,
    );
  };

  return (
    <>
      <div className="space-y-4 border-t border-black/8 pt-5">
        <h3 className="text-sm font-semibold text-black">Product Details</h3>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium text-black/45">Category</dt>
            <dd className="mt-0.5 font-medium text-black">
              {product.category_name ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-black/45">Price</dt>
            <dd className="mt-0.5 font-medium tabular-nums text-black">
              PHP{" "}
              {unitPrice.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-black/45">Product Code</dt>
            <dd className="mt-0.5 font-mono text-xs text-black/70">
              {product.product_code}
            </dd>
          </div>
          {selectedVariant && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-black/45">Selected</dt>
              <dd className="mt-0.5 font-medium text-black">
                {formatVariantLabel(selectedVariant)}
              </dd>
            </div>
          )}
          {product.description && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-black/45">Description</dt>
              <dd className="mt-0.5 text-black/70">{product.description}</dd>
            </div>
          )}
          {specLines.length > 0 && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium text-black/45">Details</dt>
              <dd className="mt-0.5">
                <ul className="list-disc space-y-1 pl-4 text-black/70">
                  {specLines.map((line, index) => (
                    <li key={`detail-${index}`}>{line}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="space-y-4 border-t border-black/8 pt-5">
        <h3 className="text-sm font-semibold text-black">Product Images</h3>
        {PRODUCT_IMAGE_SECTIONS.map(({ role, title }) => {
          const roleImages = imagesByRole(product.images, role);
          return (
            <div key={role} className="space-y-2">
              <p className="text-xs font-medium tracking-[0.15em] text-black/45 uppercase">
                {title}
                <span className="ml-1 font-normal normal-case tracking-normal text-black/40">
                  ({roleImages.length})
                </span>
              </p>
              <ProductImageGrid
                images={roleImages}
                onImageClick={(image) => handleImageClick(image, title)}
                emptyLabel={emptyLabelForProductImageRole(role)}
              />
            </div>
          );
        })}
      </div>

      <dl className="space-y-2.5 border-t border-black/8 pt-5 text-sm">
        <div className="flex justify-between text-black/60">
          <dt>Subtotal</dt>
          <dd className="font-medium text-black">PHP {subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between text-black/60">
          <dt>Shipping</dt>
          <dd className="font-medium text-black">
            {shippingFeeLoading ? "…" : `PHP ${shippingFee.toFixed(2)}`}
          </dd>
        </div>
        <div className="flex justify-between pt-4 text-base">
          <dt className="font-semibold text-black">Total</dt>
          <dd className="font-semibold text-black">PHP {total.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={placeOrderDisabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
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
        <button
          type="button"
          onClick={onAddToCart}
          disabled={addToCartDisabled}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-white/60 text-sm font-medium text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingCart className="size-4" aria-hidden />
          Add To Cart
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-black/45">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        Secure checkout — your details are kept private
      </p>
    </>
  );
}
