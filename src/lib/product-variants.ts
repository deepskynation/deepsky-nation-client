import type { ApiProductVariant } from "@/types/product";
import { parseApiProductPrice } from "@/types/product";

export type VariantColorOption = {
  color_id: string;
  color_name: string;
  hex_code: string | null;
  stock: number;
};

/** Unique sizes in API order (product variant sort_order). */
export function getUniqueSizes(variants: ApiProductVariant[]): string[] {
  const seen = new Set<string>();
  const sizes: string[] = [];
  for (const variant of variants) {
    if (seen.has(variant.size)) {
      continue;
    }
    seen.add(variant.size);
    sizes.push(variant.size);
  }
  return sizes;
}

export function isSizeInStock(variants: ApiProductVariant[], size: string): boolean {
  return variants.some((variant) => variant.size === size && variant.stock > 0);
}

export function getColorOptionsForSize(
  variants: ApiProductVariant[],
  size: string,
): VariantColorOption[] {
  const byColor = new Map<string, VariantColorOption>();

  for (const variant of variants) {
    if (variant.size !== size) {
      continue;
    }

    const existing = byColor.get(variant.color_id);
    if (!existing || variant.stock > existing.stock) {
      byColor.set(variant.color_id, {
        color_id: variant.color_id,
        color_name: variant.color_name,
        hex_code: variant.hex_code,
        stock: variant.stock,
      });
    }
  }

  return [...byColor.values()].sort((a, b) =>
    a.color_name.localeCompare(b.color_name),
  );
}

export function findVariant(
  variants: ApiProductVariant[],
  size: string | null,
  colorId: string | null,
): ApiProductVariant | undefined {
  if (!size || !colorId) {
    return undefined;
  }

  return variants.find(
    (variant) => variant.size === size && variant.color_id === colorId,
  );
}

export function getVariantUnitPrice(
  variant: ApiProductVariant | undefined,
  productPrice: string,
): number {
  if (variant?.price) {
    return parseApiProductPrice(variant.price);
  }
  return parseApiProductPrice(productPrice);
}

export function formatVariantLabel(variant: ApiProductVariant): string {
  return `${variant.size} · ${variant.color_name}`;
}
