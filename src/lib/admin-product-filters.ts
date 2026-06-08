import type { AdminProductsQuery } from "@/types/product";

export type OptionalProductFilterKey =
  | "category"
  | "status"
  | "product_code"
  | "stock"
  | "price";

export function optionalFiltersFromQuery(
  query: AdminProductsQuery,
): Set<OptionalProductFilterKey> {
  const keys = new Set<OptionalProductFilterKey>();
  if (query.category_id) {
    keys.add("category");
  }
  if (query.visibility) {
    keys.add("status");
  }
  if (query.product_code?.trim()) {
    keys.add("product_code");
  }
  if (query.min_stock != null || query.max_stock != null) {
    keys.add("stock");
  }
  if (query.min_price != null || query.max_price != null) {
    keys.add("price");
  }
  return keys;
}

export function adminProductsHasActiveFilters(query: AdminProductsQuery): boolean {
  return Boolean(
    query.search?.trim() ||
      query.product_code?.trim() ||
      query.category_id ||
      query.visibility ||
      query.created_from ||
      query.created_to ||
      query.min_price != null ||
      query.max_price != null ||
      query.min_stock != null ||
      query.max_stock != null,
  );
}

export function parseOptionalNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
