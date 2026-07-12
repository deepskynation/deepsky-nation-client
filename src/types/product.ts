import type { PaginatedResponse } from "@/types/pagination";

/** Legacy mock / UI shape (shop components). */
export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
};

export type ProductVisibility = "released" | "private";

export type ProductImageRole =
  | "placeholder"
  | "back"
  | "model"
  | "gallery"
  | "sizing";

/** Matches backend `ProductImageResponse`. */
export type ApiProductImage = {
  id: string;
  image_base64: string;
  role: ProductImageRole;
  created_at: string;
  updated_at: string;
};

/** Matches backend `ProductVariantResponse`. */
export type ApiProductVariant = {
  id: string;
  size: string;
  color_id: string;
  color_name: string;
  hex_code: string | null;
  stock: number;
  price: string | null;
  created_at: string;
  updated_at: string;
};

/** Matches backend `ProductResponse`. */
export type ApiProduct = {
  id: string;
  product_code: string;
  category_id: string;
  category_name: string | null;
  title: string;
  description: string | null;
  details: string[] | Record<string, unknown> | null;
  price: string;
  sale_price: string | null;
  sale: boolean;
  visibility: ProductVisibility;
  is_featured?: boolean;
  images: ApiProductImage[];
  variants: ApiProductVariant[];
  total_stock: number;
  created_at: string;
  updated_at: string;
};

export type PaginatedApiProducts = PaginatedResponse<ApiProduct>;

export type AdminProductsQuery = {
  page?: number;
  page_size?: number;
  visibility?: ProductVisibility;
  category_id?: string;
  /** Matches title, code, description, or category name. */
  search?: string;
  /** Partial match on product code only. */
  product_code?: string;
  min_price?: number;
  max_price?: number;
  min_stock?: number;
  max_stock?: number;
  /** Date Added on or after (YYYY-MM-DD). */
  created_from?: string;
  /** Date Added on or before (YYYY-MM-DD). */
  created_to?: string;
};

export type ShopProductsQuery = {
  page?: number;
  page_size?: number;
  category_id?: string;
  /** Matches title, code, description, or category name. */
  search?: string;
  featured?: boolean;
  include_model_images?: boolean;
  include_gallery_images?: boolean;
};

export type ProductImageInput = {
  image_base64: string;
  role?: ProductImageRole;
};

export type ProductVariantInput = {
  size: string;
  color_id: string;
  stock: number;
  price?: number | null;
};

/** Matches backend `ProductVariantUpdateInput` (includes optional id for in-place updates). */
export type ProductVariantUpdateInput = ProductVariantInput & {
  id?: string;
};

/** Matches backend `ProductColorResponse`. */
export type ApiProductColor = {
  id: string;
  color_name: string;
  hex_code: string | null;
  created_at: string;
  updated_at: string;
};

/** Matches backend `ProductCreate`. */
export type CreateProductPayload = {
  category_id: string;
  title: string;
  description?: string | null;
  details?: string[] | Record<string, unknown> | null;
  price: number;
  sale_price?: number | null;
  visibility?: ProductVisibility;
  is_featured?: boolean;
  images: ProductImageInput[];
  variants: ProductVariantInput[];
};

/** Matches backend `ProductUpdate` (partial; images replace all when sent; variants sync by id). */
export type UpdateProductPayload = {
  category_id?: string;
  title?: string;
  description?: string | null;
  details?: string[] | Record<string, unknown> | null;
  price?: number;
  sale_price?: number | null;
  visibility?: ProductVisibility;
  is_featured?: boolean;
  images?: ProductImageInput[];
  variants?: ProductVariantUpdateInput[];
};

export function parseApiProductPrice(price: string | number): number {
  const value = typeof price === "number" ? price : Number(price);
  return Number.isFinite(value) ? value : 0;
}
