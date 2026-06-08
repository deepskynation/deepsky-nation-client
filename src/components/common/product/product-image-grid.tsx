"use client";

import { toImagePreviewSrc } from "@/lib/read-image-base64";
import { cn } from "@/lib/utils";
import type { ApiProductImage } from "@/types/product";

type ProductImageGridProps = {
  images: ApiProductImage[];
  emptyLabel: string;
  onImageClick?: (image: ApiProductImage) => void;
  className?: string;
  itemClassName?: string;
};

export function ProductImageGrid({
  images,
  emptyLabel,
  onImageClick,
  className,
  itemClassName,
}: ProductImageGridProps) {
  if (images.length === 0) {
    return <p className="text-xs text-black/45">{emptyLabel}</p>;
  }

  return (
    <ul className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {images.map((image) => {
        const src = toImagePreviewSrc(image.image_base64);
        const tile = (
          <img
            src={src}
            alt=""
            className="aspect-square size-full object-cover"
          />
        );

        return (
          <li
            key={image.id}
            className={cn(
              "overflow-hidden rounded-lg border border-black/10 bg-white/50",
              itemClassName,
            )}
          >
            {onImageClick ? (
              <button
                type="button"
                onClick={() => onImageClick(image)}
                className="block size-full cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
                aria-label="View Larger Image"
              >
                {tile}
              </button>
            ) : (
              tile
            )}
          </li>
        );
      })}
    </ul>
  );
}
