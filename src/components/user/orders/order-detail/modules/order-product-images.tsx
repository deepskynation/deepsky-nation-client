"use client";

import { ProductImageGrid } from "@/components/common/product/product-image-grid";
import {
  emptyLabelForProductImageRole,
  imagesByRole,
  PRODUCT_IMAGE_SECTIONS,
} from "@/lib/product-image";
import { toImagePreviewSrc } from "@/lib/read-image-base64";
import type { ApiProduct, ApiProductImage } from "@/types/product";

type OrderProductImagesProps = {
  product: ApiProduct;
  onImagePreview: (src: string, alt: string) => void;
  className?: string;
};

export function OrderProductImages({
  product,
  onImagePreview,
  className,
}: OrderProductImagesProps) {
  const handleImageClick = (image: ApiProductImage, sectionTitle: string) => {
    onImagePreview(
      toImagePreviewSrc(image.image_base64),
      `${product.title} ${sectionTitle}`,
    );
  };

  return (
    <div className={className}>
      <h3 className="mb-3 text-sm font-semibold text-black">Product Images</h3>
      <div className="space-y-4">
        {PRODUCT_IMAGE_SECTIONS.map(({ role, title }) => {
          const roleImages = imagesByRole(product.images, role);
          return (
            <div key={`${product.id}-${role}`} className="space-y-2">
              <p className="text-xs font-medium tracking-[0.15em] text-black/45 uppercase">
                {title}
                <span className="ml-1 font-normal normal-case tracking-normal text-black/40">
                  ({roleImages.length})
                </span>
              </p>
              <ProductImageGrid
                images={roleImages}
                onImageClick={(image) => handleImageClick(image, title)}
                emptyLabel={emptyLabelForProductImageRole(role)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
