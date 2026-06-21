import { apiUrl } from "@/lib/api-config";
import { buildCategoryPageHref } from "@/lib/storefront-categories";
import type { ApiProductCategory } from "@/types/catalog";
import type { ApiProduct, PaginatedApiProducts } from "@/types/product";

/** Max product rows shown in the header search dropdown. */
export const PRODUCT_SEARCH_PREVIEW_LIMIT = 4;

export const PRODUCT_SEARCH_DEBOUNCE_MS = 300;

export function buildProductSearchPageHref(basePath: string, query: string): string {
  const trimmed = query.trim();
  const normalizedBase = basePath.replace(/\/$/, "") || "/";
  if (!trimmed) {
    return normalizedBase;
  }
  return `${normalizedBase}?q=${encodeURIComponent(trimmed)}`;
}

export function buildProductCategoryHref(
  basePath: string,
  categoryName: string | null | undefined,
): string | null {
  const name = categoryName?.trim();
  if (!name) {
    return null;
  }
  return buildCategoryPageHref(basePath, name);
}

/** Product detail page for a search preview row. */
export function buildProductPageHref(product: ApiProduct): string {
  return `/products/${product.id}`;
}

/** Buy-now checkout for a product. */
export function buildProductCheckoutHref(product: ApiProduct): string {
  const search = new URLSearchParams({ quantity: "1" });
  const firstInStock =
    product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];

  if (firstInStock?.id) {
    search.set("variantId", firstInStock.id);
  }

  return `/checkout/${product.id}?${search.toString()}`;
}

/** Category page for a product row (Enter / “Search for …”). */
export function buildProductCategoryHrefFromProduct(
  basePath: string,
  product: ApiProduct,
): string | null {
  return buildProductCategoryHref(basePath, product.category_name);
}

function findCategoryBySearchQuery(
  categories: ApiProductCategory[],
  query: string,
): ApiProductCategory | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  return categories.find((category) => {
    const name = category.category_name.trim().toLowerCase();
    return name.includes(normalized) || normalized.includes(name);
  });
}

/** Storefront category pages live at `/categories/...` regardless of auth context. */
const CATEGORY_PAGE_BASE_PATH = "/";

/** Enter / “Search for …” — category of the top preview result, else name match, else catalog search. */
export function resolveSearchSubmitHref(
  basePath: string,
  query: string,
  results: ApiProduct[],
  categories: ApiProductCategory[] = [],
): string {
  const trimmed = query.trim();
  if (!trimmed) {
    return basePath.replace(/\/$/, "") || "/";
  }

  if (results[0]) {
    const fromFirstResult = buildProductCategoryHrefFromProduct(
      CATEGORY_PAGE_BASE_PATH,
      results[0],
    );
    if (fromFirstResult) {
      return fromFirstResult;
    }
  }

  const matchedCategory = findCategoryBySearchQuery(categories, trimmed);
  if (matchedCategory) {
    return buildCategoryPageHref(
      CATEGORY_PAGE_BASE_PATH,
      matchedCategory.category_name,
    );
  }

  return buildProductSearchPageHref(basePath, trimmed);
}

/** Resolves submit href, fetching preview rows when Enter is pressed before debounced suggestions load. */
export async function resolveSearchSubmitHrefAsync(
  basePath: string,
  query: string,
  cachedResults: ApiProduct[],
  categories: ApiProductCategory[] = [],
): Promise<string> {
  const trimmed = query.trim();
  if (!trimmed) {
    return basePath.replace(/\/$/, "") || "/";
  }

  let results = cachedResults;
  if (results.length === 0) {
    try {
      results = await fetchProductSearchPreview(trimmed);
    } catch {
      results = [];
    }
  }

  return resolveSearchSubmitHref(basePath, trimmed, results, categories);
}

/** Removes `q` from the current URL while preserving other query params. */
export function clearProductSearchQueryParam(
  pathname: string,
  searchParams: URLSearchParams,
): string {
  const params = new URLSearchParams(searchParams.toString());
  if (!params.has("q")) {
    const suffix = params.toString();
    return suffix ? `${pathname}?${suffix}` : pathname;
  }
  params.delete("q");
  const suffix = params.toString();
  return suffix ? `${pathname}?${suffix}` : pathname;
}

export async function fetchProductSearchPreview(
  query: string,
  signal?: AbortSignal,
): Promise<ApiProduct[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  const params = new URLSearchParams({
    page: "1",
    page_size: String(PRODUCT_SEARCH_PREVIEW_LIMIT),
    search: trimmed,
  });

  const response = await fetch(apiUrl(`/api/products?${params.toString()}`), {
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to search products.");
  }

  const data = (await response.json()) as PaginatedApiProducts;
  return data.rows;
}
