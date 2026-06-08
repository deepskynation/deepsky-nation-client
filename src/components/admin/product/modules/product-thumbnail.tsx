"use client";

import { cn } from "@/lib/utils";
import { getProductThumbnailSrc } from "@/lib/product-image";
import type { ApiProduct } from "@/types/product";

type ProductThumbnailProps = {
  product: ApiProduct;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-14 w-14",
} as const;

const frameClass =
  "relative shrink-0 overflow-hidden rounded-full border border-neutral-200/90 bg-neutral-100 shadow-sm";

export function ProductThumbnail({
  product,
  size = "md",
  className,
}: ProductThumbnailProps) {
  const src = getProductThumbnailSrc(product);
  const sizeClass = sizeClasses[size];

  if (src) {
    return (
      <div className={cn(frameClass, sizeClass, className)}>
        <img
          src={src}
          alt={product.title}
          className="block size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        frameClass,
        sizeClass,
        "flex items-center justify-center text-sm font-semibold text-neutral-500",
        className,
      )}
    >
      {product.title.slice(0, 1).toUpperCase()}
    </div>
  );
}
