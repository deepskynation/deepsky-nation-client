"use client";

import { StorefrontCategorySections } from "@/components/common/product/storefront-category-sections";
import type { ApiProduct } from "@/types/product";

type DashboardFeaturedProductsProps = {
  products: ApiProduct[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  searchQuery?: string;
};

export function DashboardFeaturedProducts({
  products,
  status,
  error,
  searchQuery = "",
}: DashboardFeaturedProductsProps) {
  return (
    <StorefrontCategorySections
      products={products}
      status={status}
      error={error}
      catalogBasePath="/dashboard"
      searchQuery={searchQuery}
    />
  );
}
