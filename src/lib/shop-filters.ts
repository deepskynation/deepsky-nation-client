/** Grid-friendly page sizes for the shop catalog. */
export const SHOP_PAGE_SIZE_OPTIONS = [10, 15, 20, 25] as const;

/** Default products shown per shop page (5-column grid × 3 rows). */
export const SHOP_PRODUCTS_PAGE_SIZE = 15;

export const productSortOptions = [
  "Default",
  "Low to High",
  "High To Low",
] as const;

export type ProductSortOption = (typeof productSortOptions)[number];
