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

/** Category page for a preview row; falls back to product detail when uncategorized. */
export function buildProductSuggestionHref(
  basePath: string,
  product: ApiProduct,
): string {
  return (
    buildProductCategoryHref(basePath, product.category_name) ??
    `/products/${product.id}`
  );
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

/** Enter / “Search for …” — first result’s category, else name match, else catalog search. */
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

  const fromFirstResult = results[0]
    ? buildProductCategoryHref(basePath, results[0].category_name)
    : null;
  if (fromFirstResult) {
    return fromFirstResult;
  }

  const matchedCategory = findCategoryBySearchQuery(categories, trimmed);
  if (matchedCategory) {
    return buildCategoryPageHref(basePath, matchedCategory.category_name);
  }

  return buildProductSearchPageHref(basePath, trimmed);
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
