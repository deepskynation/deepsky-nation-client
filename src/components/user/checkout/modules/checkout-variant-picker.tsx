"use client";

import { SlantOutOfStockBadge } from "@/components/common/product/slant-out-of-stock-badge";
import {
  getColorOptionsForSize,
  getUniqueSizes,
  isSizeInStock,
  type VariantColorOption,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import { glassInputFlatClassName } from "@/lib/glass-styles";
import type { ApiProductVariant } from "@/types/product";

type CheckoutVariantPickerProps = {
  variants: ApiProductVariant[];
  selectedSize: string | null;
  selectedColorId: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (colorId: string) => void;
};

export function CheckoutVariantPicker({
  variants,
  selectedSize,
  selectedColorId,
  onSizeChange,
  onColorChange,
}: CheckoutVariantPickerProps) {
  const sizes = getUniqueSizes(variants);
  const colorOptions: VariantColorOption[] = selectedSize
    ? getColorOptionsForSize(variants, selectedSize)
    : [];

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 border-t border-black/8 pt-5">
      <div>
        <p className="text-sm font-semibold text-black">Choose Size</p>
        <p className="mt-0.5 text-xs text-black/50">
          Select the variant you want before checkout or adding to cart.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="checkout-size" className="text-xs font-medium text-black/45">
          Size
        </label>
        {sizes.length <= 6 ? (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Size">
            {sizes.map((size) => {
              const inStock = isSizeInStock(variants, size);
              return (
                <div key={size} className="relative overflow-hidden rounded-lg">
                  <button
                    type="button"
                    disabled={!inStock}
                    onClick={() => onSizeChange(size)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      selectedSize === size
                        ? "border-neutral-400 bg-neutral-200 text-neutral-900 ring-1 ring-neutral-300/80"
                        : "border-black/15 bg-white/60 text-black hover:bg-neutral-50",
                      !inStock && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {size}
                  </button>
                  {!inStock ? <SlantOutOfStockBadge /> : null}
                </div>
              );
            })}
          </div>
        ) : (
          <select
            id="checkout-size"
            value={selectedSize ?? ""}
            onChange={(event) => onSizeChange(event.target.value)}
            className={glassInputFlatClassName}
          >
            <option value="" disabled>
              Select size
            </option>
            {sizes.map((size) => {
              const inStock = isSizeInStock(variants, size);
              return (
                <option key={size} value={size} disabled={!inStock}>
                  {size}
                  {!inStock ? " (out of stock)" : ""}
                </option>
              );
            })}
          </select>
        )}
      </div>

      <div className="space-y-1.5">
        <span className="text-xs font-medium text-black/45">Color</span>
        {!selectedSize ? (
          <p className="text-xs text-black/45">Select a size first.</p>
        ) : (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Color">
            {colorOptions.map((color) => (
              <button
                key={color.color_id}
                type="button"
                disabled={color.stock <= 0}
                onClick={() => onColorChange(color.color_id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  selectedColorId === color.color_id
                    ? "border-neutral-400 bg-neutral-200 text-neutral-900 ring-1 ring-neutral-300/80"
                    : "border-black/15 bg-white/60 text-black hover:bg-neutral-50",
                  color.stock <= 0 && "cursor-not-allowed opacity-40",
                )}
              >
                {color.hex_code && (
                  <span
                    className="size-4 shrink-0 rounded border border-black/15"
                    style={{ backgroundColor: color.hex_code }}
                    aria-hidden
                  />
                )}
                {color.color_name}
                {color.stock <= 0 && (
                  <span className="text-xs opacity-80">(out)</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
