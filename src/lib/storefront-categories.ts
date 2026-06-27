import { getDashboardPathForRole } from "@/lib/auth-session";
import { SHOP_PRODUCTS_PAGE_SIZE, type ProductSortOption } from "@/lib/shop-filters";
import type { ApiProductCategory } from "@/types/catalog";
import { parseApiProductPrice, type ApiProduct, type ShopProductsQuery } from "@/types/product";
import type { UserRole } from "@/types";

export const STOREFRONT_CATALOG_PAGE_SIZE = SHOP_PRODUCTS_PAGE_SIZE;

/** Products shown per category on landing / dashboard before "View all". */
export const CATEGORY_SECTION_PREVIEW_LIMIT = SHOP_PRODUCTS_PAGE_SIZE;

/** Fetch enough released products for the full storefront grid. */
export const STOREFRONT_CATALOG_FETCH_PAGE_SIZE = 100;

const UNCATEGORIZED_SECTION_ID = "uncategorized";

export type CategoryProductSlice = {
  visible: ApiProduct[];
  total: number;
  hasMore: boolean;
};

export function sliceCategoryProducts(
  products: ApiProduct[],
  limit = CATEGORY_SECTION_PREVIEW_LIMIT,
): CategoryProductSlice {
  return {
    visible: products.slice(0, limit),
    total: products.length,
    hasMore: products.length > limit,
  };
}

export function encodeCategorySlug(categoryName: string): string {
  return encodeURIComponent(categoryName.trim());
}

export function decodeCategorySlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function isCategoryUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function findCategoryByRouteParam(
  categories: ApiProductCategory[],
  param: string,
): ApiProductCategory | undefined {
  if (isCategoryUuid(param)) {
    return categories.find((category) => category.id === param);
  }

  const decoded = decodeCategorySlug(param);
  return categories.find(
    (category) =>
      category.category_name === decoded ||
      category.category_name.toLowerCase() === decoded.toLowerCase(),
  );
}

export function resolveCategoryIdFromRouteParam(
  categories: ApiProductCategory[],
  param: string,
): string | null {
  const decoded = decodeCategorySlug(param);
  if (
    param === UNCATEGORIZED_SECTION_ID ||
    decoded.toLowerCase() === "uncategorized"
  ) {
    return UNCATEGORIZED_SECTION_ID;
  }

  const category = findCategoryByRouteParam(categories, param);
  return category?.id ?? (isCategoryUuid(param) ? param : null);
}

export function buildCategoryPageHref(basePath: string, categoryName: string): string {
  const slug = encodeCategorySlug(categoryName);
  const normalized = basePath.replace(/\/$/, "") || "/";

  if (normalized === "/") {
    return `/categories/${slug}`;
  }

  return `${normalized}/categories/${slug}`;
}

export function buildCategoryPageHrefFromParam(
  basePath: string,
  categories: ApiProductCategory[],
  categoryParam: string,
): string | null {
  const decoded = decodeCategorySlug(categoryParam);
  if (
    categoryParam === UNCATEGORIZED_SECTION_ID ||
    decoded.toLowerCase() === "uncategorized"
  ) {
    return buildCategoryPageHref(basePath, "Uncategorized");
  }

  const category = findCategoryByRouteParam(categories, categoryParam);
  if (!category) {
    return null;
  }

  return buildCategoryPageHref(basePath, category.category_name);
}

/** Logo / Home link for storefront chrome (user header, product detail). */
export function getStorefrontHomeHref(role?: UserRole | null): string {
  if (!role) {
    return "/";
  }
  return getDashboardPathForRole(role);
}

/** Products catalog link after browsing from landing vs signed-in dashboard. */
export function getStorefrontCatalogHref(role?: UserRole | null): string {
  if (!role || role === "admin") {
    return "/#products";
  }
  return getDashboardPathForRole(role);
}

/** Product search base path for storefront headers. */
export function getStorefrontSearchBasePath(role?: UserRole | null): string {
  if (!role || role === "admin") {
    return "/";
  }
  return getDashboardPathForRole(role);
}

/** @deprecated Use {@link buildCategoryPageHref} with category name. */
export function buildCategoryViewAllHref(
  basePath: string,
  categoryName: string,
): string {
  return buildCategoryPageHref(basePath, categoryName);
}

export function buildStorefrontCatalogQuery(
  page: number,
  categoryId = "all",
): ShopProductsQuery {
  const query: ShopProductsQuery = {
    page,
    page_size: STOREFRONT_CATALOG_PAGE_SIZE,
    include_gallery_images: true,
  };

  if (categoryId !== "all") {
    query.category_id = categoryId;
  } else {
    query.category_id = undefined;
  }

  return query;
}

export const STOREFRONT_CATALOG_QUERY = buildStorefrontCatalogQuery(1);

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
