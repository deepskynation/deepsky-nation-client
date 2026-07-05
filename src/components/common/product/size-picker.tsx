"use client";

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

function SizeButtonStrike() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full text-red-500"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1="8"
        y1="92"
        x2="92"
        y2="8"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SizePicker({
  variants,
  selectedSize,
  onSizeChange,
  id = "size-picker",
  label = "Size",
  className,
  buttonGridThreshold = 6,
}: SizePickerProps) {
  "use no memo";

  const sizes = getUniqueSizes(variants);

  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-0.2", className)}>
      <label htmlFor={id} className="text-xs font-medium text-black/45">
        {label}
      </label>
      {sizes.length <= buttonGridThreshold ? (
        <div
          className="flex flex-wrap items-start gap-x-1 gap-y-0.2"
          role="group"
          aria-label={label}
        >
          {sizes.map((size) => {
            const inStock = isSizeInStock(variants, size);
            return (
              <div
                key={size}
                className="flex w-11 shrink-0 flex-col items-center gap-px"
              >
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => onSizeChange(size)}
                  aria-label={!inStock ? `${size}, out of stock` : size}
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border px-0.5 text-xs font-medium transition-colors",
                    inStock
                      ? selectedSize === size
                        ? "border-neutral-400 bg-neutral-200 text-neutral-900 ring-1 ring-neutral-300/80"
                        : "border-black/15 bg-white/60 text-black hover:bg-neutral-50"
                      : "cursor-not-allowed border-black/15 bg-white/60 text-black/45",
                  )}
                >
                  {size}
                  {!inStock ? <SizeButtonStrike /> : null}
                </button>
                {!inStock ? (
                  <span className="text-red-500 text-center text-[7px] leading-none text-black/55">
                    Out Of Stock
                  </span>
                ) : null}
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
