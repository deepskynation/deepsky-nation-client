"use client";

import { SlantOutOfStockBadge } from "@/components/common/product/slant-out-of-stock-badge";
import { glassInputFlatClassName } from "@/lib/glass-styles";
import { getUniqueSizes, isSizeInStock } from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import type { ApiProductVariant } from "@/types/product";

export type SizePickerProps = {
  variants: ApiProductVariant[];
  selectedSize: string | null;
  onSizeChange: (size: string) => void;
  id?: string;
  label?: string;
  className?: string;
  buttonGridThreshold?: number;
};

export function SizePicker({
  variants,
  selectedSize,
  onSizeChange,
  id = "size-picker",
  label = "Size",
  className,
  buttonGridThreshold = 6,
}: SizePickerProps) {
  const sizes = getUniqueSizes(variants);

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-black/45">
        {label}
      </label>
      {sizes.length <= buttonGridThreshold ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
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
          id={id}
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
  );
}
