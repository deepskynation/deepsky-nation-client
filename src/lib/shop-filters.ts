/** Grid-friendly page sizes for the shop catalog. */
export const SHOP_PAGE_SIZE_OPTIONS = [10, 15, 20, 25] as const;

export const productSortOptions = [
  "Default",
  "Low to High",
  "High To Low",
] as const;

export type ProductSortOption = (typeof productSortOptions)[number];
