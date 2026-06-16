"use client";

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

function optionButtonClass(selected: boolean, disabled: boolean) {
  return cn(
    "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
    selected
      ? "border-neutral-400 bg-neutral-200 text-neutral-900 ring-1 ring-neutral-300/80"
      : "border-black/15 bg-white/60 text-black hover:bg-neutral-50",
    disabled && "cursor-not-allowed opacity-40",
  );
}

function SlantOutOfStockBadge() {
  return (
    <span
      className="pointer-events-none absolute right-0 top-0 z-10 size-9 overflow-hidden rounded-tr-lg"
      aria-hidden
    >
      <span className="absolute right-[-30px] top-[10px] block w-[72px] rotate-45 whitespace-nowrap bg-red-600 py-0.5 text-center text-[5px] font-bold uppercase leading-none tracking-tight text-white shadow-sm">
        Out of stock
      </span>
    </span>
  );
}

export function CheckoutVariantPicker({
  variants,
  selectedSize,
  selectedColorId,
  onSizeChange,
  onColorChange,
}: CheckoutVariantPickerProps) {
  const sizes = getUniqueSizes(variants);
  const selectedSizeOutOfStock =
    selectedSize !== null && !isSizeInStock(variants, selectedSize);
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
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="checkout-size" className="text-xs font-medium text-black/45">
            Size
          </label>
          {selectedSizeOutOfStock ? (
            <span
              role="status"
              aria-live="polite"
              className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 ring-1 ring-inset ring-red-200"
            >
              Out of stock
            </span>
          ) : null}
        </div>
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
                    className={optionButtonClass(selectedSize === size, !inStock)}
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
                  optionButtonClass(selectedColorId === color.color_id, color.stock <= 0),
                  "inline-flex items-center gap-2",
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
