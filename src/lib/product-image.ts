import { toImagePreviewSrc } from "@/lib/read-image-base64";
import type { ApiProduct, ApiProductImage, ProductImageRole } from "@/types/product";

export type ProductCarouselSlide = {
  src: string;
  role: ProductImageRole;
};

/** Front first, then back, then gallery — for card hover carousel. */
export function getProductCarouselSrcs(product: ApiProduct): ProductCarouselSlide[] {
  const gallery = imagesByRole(product.images, "gallery");
  const back = imagesByRole(product.images, "back");
  const placeholder = product.images.find((image) => image.role === "placeholder");
  const ordered: ApiProductImage[] = [];

  if (placeholder) {
    ordered.push(placeholder);
  }

  for (const image of back) {
    if (!ordered.some((existing) => existing.id === image.id)) {
      ordered.push(image);
    }
  }

  for (const image of gallery) {
    if (!ordered.some((existing) => existing.id === image.id)) {
      ordered.push(image);
    }
  }

  const fallback =
    ordered.length > 0 ? ordered : gallery.length > 0 ? gallery : product.images.slice(0, 1);

  return fallback.flatMap((image) => {
    if (!image.image_base64) {
      return [];
    }
    return [{ src: toImagePreviewSrc(image.image_base64), role: image.role }];
  });
}

/** Placeholder image first, then any other image from the product. */
export function getProductThumbnailSrc(product: ApiProduct): string | null {
  if (!product.images.length) {
    return null;
  }

  const placeholder = product.images.find((image) => image.role === "placeholder");
  const image = placeholder ?? product.images[0];
  return image?.image_base64 ? toImagePreviewSrc(image.image_base64) : null;
}

export function imagesByRole(
  images: ApiProductImage[],
  role: ProductImageRole,
): ApiProductImage[] {
  return images.filter((image) => image.role === role);
}

export const PRODUCT_IMAGE_SECTIONS: { role: ProductImageRole; title: string }[] = [
  { role: "placeholder", title: "Front view" },
  { role: "back", title: "Back view" },
  { role: "model", title: "Model" },
  { role: "gallery", title: "Gallery" },
  { role: "sizing", title: "Size Chart" },
];

export function emptyLabelForProductImageRole(role: ProductImageRole): string {
  if (role === "gallery") {
    return "No gallery images.";
  }
  if (role === "placeholder") {
    return "No front view image.";
  }
  if (role === "back") {
    return "No back view image.";
  }
  if (role === "model") {
    return "No model image.";
  }
  return "No size chart.";
}

export function formatProductDetails(
  details: ApiProduct["details"],
): string[] {
  if (!details) {
    return [];
  }
  if (Array.isArray(details)) {
    return details
      .filter((line): line is string => typeof line === "string")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return Object.entries(details).map(([key, value]) => `${key}: ${String(value)}`);
}
