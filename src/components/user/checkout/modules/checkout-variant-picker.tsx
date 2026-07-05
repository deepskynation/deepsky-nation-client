"use client";

import { ColorPicker } from "@/components/common/product/color-picker";
import { SizePicker } from "@/components/common/product/size-picker";
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

      <ColorPicker
        variants={variants}
        selectedSize={selectedSize}
        selectedColorId={selectedColorId}
        onColorChange={onColorChange}
      />
    </div>
  );
}
