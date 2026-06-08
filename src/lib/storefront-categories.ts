import { parseApiProductPrice, type ApiProduct } from "@/types/product";
import type { ProductSortOption } from "@/lib/shop-filters";

export const STOREFRONT_CATALOG_PAGE_SIZE = 100;

export const STOREFRONT_CATALOG_QUERY = {
  page: 1,
  page_size: STOREFRONT_CATALOG_PAGE_SIZE,
  include_gallery_images: true,
} as const;

export type StorefrontProductSection = {
  id: "tops" | "bottoms" | "essentials";
  title: string;
  matchNames: readonly string[];
};

export const STOREFRONT_PRODUCT_SECTIONS: StorefrontProductSection[] = [
  { id: "tops", title: "Tops", matchNames: ["top", "tops"] },
  { id: "bottoms", title: "Bottoms", matchNames: ["bottom", "bottoms"] },
  { id: "essentials", title: "Essentials", matchNames: ["essential", "essentials"] },
];

function normalizeCategoryName(categoryName: string): string {
  return categoryName.trim().toLowerCase();
}

export function matchesStorefrontSection(
  categoryName: string | null | undefined,
  matchNames: readonly string[],
): boolean {
  if (!categoryName) {
    return false;
  }

  const normalized = normalizeCategoryName(categoryName);
  return matchNames.some((name) => normalized === name);
}

export function sortStorefrontProducts(
  products: ApiProduct[],
  sort: ProductSortOption,
): ApiProduct[] {
  if (sort === "Low to High") {
    return [...products].sort(
      (a, b) => parseApiProductPrice(a.price) - parseApiProductPrice(b.price),
    );
  }

  if (sort === "High To Low") {
    return [...products].sort(
      (a, b) => parseApiProductPrice(b.price) - parseApiProductPrice(a.price),
    );
  }

  return products;
}

export function filterStorefrontProducts(
  products: ApiProduct[],
  searchQuery: string,
): ApiProduct[] {
  const query = searchQuery.trim().toLowerCase();
  if (query.length === 0) {
    return products;
  }

  return products.filter((product) => {
    return (
      product.title.toLowerCase().includes(query) ||
      (product.description ?? "").toLowerCase().includes(query) ||
      (product.category_name ?? "").toLowerCase().includes(query) ||
      product.product_code.toLowerCase().includes(query)
    );
  });
}

export function filterProductsByCategoryId(
  products: ApiProduct[],
  categoryId: string,
): ApiProduct[] {
  if (categoryId === "all") {
    return products;
  }

  return products.filter((product) => product.category_id === categoryId);
}

export function findStorefrontSectionByCategoryName(
  categoryName: string | null | undefined,
): StorefrontProductSection | null {
  return (
    STOREFRONT_PRODUCT_SECTIONS.find((section) =>
      matchesStorefrontSection(categoryName, section.matchNames),
    ) ?? null
  );
}

export function getStorefrontSectionTitle(
  categoryName: string | null | undefined,
): string {
  return findStorefrontSectionByCategoryName(categoryName)?.title ?? categoryName ?? "Products";
}

export type StorefrontProductSectionGroup = {
  section: StorefrontProductSection;
  products: ApiProduct[];
};

export function groupProductsByStorefrontSection(
  products: ApiProduct[],
): StorefrontProductSectionGroup[] {
  return STOREFRONT_PRODUCT_SECTIONS.map((section) => ({
    section,
    products: products.filter((product) =>
      matchesStorefrontSection(product.category_name, section.matchNames),
    ),
  })).filter((group) => group.products.length > 0);
}
