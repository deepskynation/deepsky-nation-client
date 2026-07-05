"use client";

import {
  getColorOptionsForSize,
  type VariantColorOption,
} from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import type { ApiProductVariant } from "@/types/product";

export type ColorPickerProps = {
  variants: ApiProductVariant[];
  selectedSize: string | null;
  selectedColorId: string | null;
  onColorChange: (colorId: string) => void;
  label?: string;
  className?: string;
  requireSizeMessage?: string;
};

export function ColorPicker({
  variants,
  selectedSize,
  selectedColorId,
  onColorChange,
  label = "Color",
  className,
  requireSizeMessage = "Select a size first.",
}: ColorPickerProps) {
  "use no memo";

  const colorOptions: VariantColorOption[] = selectedSize
    ? getColorOptionsForSize(variants, selectedSize)
    : [];

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1.5", className)}>
      <span className="text-xs font-medium text-black/45">{label}</span>
      {!selectedSize ? (
        <p className="text-xs text-black/45">{requireSizeMessage}</p>
      ) : colorOptions.length === 0 ? (
        <p className="text-xs text-black/45">No colors available.</p>
      ) : (
        <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
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
              {/* {color.hex_code && (
                <span
                  className="size-4 shrink-0 rounded border border-black/15"
                  style={{ backgroundColor: color.hex_code }}
                  aria-hidden
                />
              )} */}
              {color.color_name}
              {color.stock <= 0 && (
                <span className="text-xs opacity-80">(out)</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
