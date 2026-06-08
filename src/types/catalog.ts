import type { PaginatedResponse } from "@/types/pagination";

/** Matches backend `ProductCategoryResponse`. */
export type ApiProductCategory = {
  id: string;
  category_name: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedCategories = PaginatedResponse<ApiProductCategory>;

export type CreateCategoryPayload = {
  category_name: string;
};

export type UpdateCategoryPayload = {
  category_name: string;
};

export type CreateColorPayload = {
  color_name: string;
  hex_code?: string | null;
};

export type UpdateColorPayload = {
  color_name?: string;
  hex_code?: string | null;
};
