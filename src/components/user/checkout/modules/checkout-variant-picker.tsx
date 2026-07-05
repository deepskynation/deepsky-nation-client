"use client";

import { SizePicker } from "@/components/common/product/size-picker";
import {
  getColorOptionsForSize,
  type VariantColorOption,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
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

      <SizePicker
        id="checkout-size"
        variants={variants}
        selectedSize={selectedSize}
        onSizeChange={onSizeChange}
      />

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
