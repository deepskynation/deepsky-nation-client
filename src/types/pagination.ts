/** Default row counts for table pagination UI. */
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 15, 25, 50, 100] as const;

export type PageSizeOption = (typeof DEFAULT_PAGE_SIZE_OPTIONS)[number];

/** Matches backend `PaginatedResponse`. */
export type PaginatedResponse<T> = {
  rows: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type PaginationQuery = {
  page?: number;
  page_size?: number;
};
