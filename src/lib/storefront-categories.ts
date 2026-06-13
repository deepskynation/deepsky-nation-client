import { parseApiProductPrice, type ApiProduct } from "@/types/product";
import type { ApiProductCategory } from "@/types/catalog";
import type { ProductSortOption } from "@/lib/shop-filters";

export const STOREFRONT_CATALOG_PAGE_SIZE = 100;

export const STOREFRONT_CATALOG_QUERY = {
  page: 1,
  page_size: STOREFRONT_CATALOG_PAGE_SIZE,
  include_gallery_images: true,
} as const;

const UNCATEGORIZED_SECTION_ID = "uncategorized";

export type ProductCategorySection = {
  id: string;
  title: string;
};

export type ProductCategorySectionGroup = {
  section: ProductCategorySection;
  products: ApiProduct[];
};

export function getCategorySectionTitle(
  categoryName: string | null | undefined,
): string {
  return categoryName?.trim() || "Uncategorized";
}

export function groupProductsByCategory(
  products: ApiProduct[],
  categories: ApiProductCategory[] = [],
): ProductCategorySectionGroup[] {
  const productsByCategoryId = new Map<string, ApiProduct[]>();

  for (const product of products) {
    const categoryId = product.category_id ?? UNCATEGORIZED_SECTION_ID;
    const bucket = productsByCategoryId.get(categoryId) ?? [];
    bucket.push(product);
    productsByCategoryId.set(categoryId, bucket);
  }

  const knownCategoryIds = categories
    .map((category) => category.id)
    .filter((id) => productsByCategoryId.has(id));

  const extraCategoryIds = [...productsByCategoryId.keys()].filter(
    (id) => !knownCategoryIds.includes(id),
  );

  const orderedCategoryIds = [...knownCategoryIds, ...extraCategoryIds];

  return orderedCategoryIds.map((categoryId) => {
    const category = categories.find((item) => item.id === categoryId);
    const sectionProducts = productsByCategoryId.get(categoryId) ?? [];

    return {
      section: {
        id: categoryId,
        title: getCategorySectionTitle(
          category?.category_name ?? sectionProducts[0]?.category_name,
        ),
      },
      products: sectionProducts,
    };
  });
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
