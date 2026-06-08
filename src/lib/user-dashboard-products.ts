import type { ApiProduct, ApiProductImage } from "@/types/product";
import { imagesByRole } from "@/lib/product-image";
import { toImagePreviewSrc } from "@/lib/read-image-base64";

export type ModelGallerySlide = {
  id: string;
  productId: string;
  productTitle: string;
  alt: string;
  imageSrc: string;
  href: string;
};

const FEATURED_FALLBACK_PAGE_SIZE = 6;
const MODEL_GALLERY_PAGE_SIZE = 12;
export const RELATED_PRODUCTS_LIMIT = 4;

export function relatedProductsQuery(categoryId: string) {
  return {
    page: 1,
    page_size: 12,
    category_id: categoryId,
    include_gallery_images: true,
  };
}

export function sortProductsNewestFirst(products: ApiProduct[]): ApiProduct[] {
  return [...products].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

/** Prefer admin-curated featured products; fall back to newest released. */
export function pickFeaturedProducts(products: ApiProduct[], limit = FEATURED_FALLBACK_PAGE_SIZE) {
  const featured = products.filter((product) => product.is_featured);
  if (featured.length > 0) {
    return sortProductsNewestFirst(featured).slice(0, limit);
  }
  return sortProductsNewestFirst(products).slice(0, limit);
}

/** Same-category products only; excludes the current product. */
export function pickRelatedProducts(
  products: ApiProduct[],
  currentProductId: string,
  categoryId?: string | null,
  limit = RELATED_PRODUCTS_LIMIT,
): ApiProduct[] {
  if (!categoryId) {
    return [];
  }

  return sortProductsNewestFirst(
    products.filter(
      (product) =>
        product.id !== currentProductId && product.category_id === categoryId,
    ),
  ).slice(0, limit);
}

export function extractModelGallerySlides(products: ApiProduct[]): ModelGallerySlide[] {
  const slides: ModelGallerySlide[] = [];

  for (const product of products) {
    const modelImages = imagesByRole(product.images, "model");
    for (const image of modelImages) {
      slides.push(modelGallerySlideFromImage(product, image));
    }
  }

  return slides;
}

function modelGallerySlideFromImage(
  product: ApiProduct,
  image: ApiProductImage,
): ModelGallerySlide {
  return {
    id: `${product.id}-${image.id}`,
    productId: product.id,
    productTitle: product.title,
    alt: `${product.title} — model`,
    imageSrc: toImagePreviewSrc(image.image_base64),
    href: `/user/products/${product.id}`,
  };
}

export const DASHBOARD_FEATURED_QUERY = {
  page: 1,
  page_size: FEATURED_FALLBACK_PAGE_SIZE,
  featured: true,
} as const;

export const DASHBOARD_MODEL_GALLERY_QUERY = {
  page: 1,
  page_size: MODEL_GALLERY_PAGE_SIZE,
  include_model_images: true,
} as const;

export const DASHBOARD_FEATURED_FALLBACK_QUERY = {
  page: 1,
  page_size: FEATURED_FALLBACK_PAGE_SIZE,
} as const;
