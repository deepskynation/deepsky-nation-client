"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { ListSectionState } from "@/components/common/feedback/list-section-state";
import { GlassInlineAlert } from "@/components/common/feedback/glass-inline-alert";
import { ProductsCategorySection } from "@/components/common/product/products-category-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  buildCategoryPageHref,
  filterStorefrontProducts,
  groupProductsByCategory,
  sliceCategoryProducts,
} from "@/lib/storefront-categories";
import { fetchShopCategories, selectShopCategories } from "@/store/slices/categorySlice";
import type { ApiProduct } from "@/types/product";

type StorefrontCategorySectionsProps = {
  products: ApiProduct[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  catalogBasePath: string;
  searchQuery?: string;
  cardVariant?: "shop" | "landing";
};

export function StorefrontCategorySections({
  products,
  status,
  error,
  catalogBasePath,
  searchQuery = "",
  cardVariant = "shop",
}: StorefrontCategorySectionsProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectShopCategories);
  const trimmedSearch = searchQuery.trim();

  const displayedProducts = useMemo(() => {
    if (!trimmedSearch) {
      return products;
    }

    return filterStorefrontProducts(products, trimmedSearch);
  }, [products, trimmedSearch]);

  const productSections = useMemo(
    () => groupProductsByCategory(displayedProducts, categories),
    [categories, displayedProducts],
  );

  const isLoading = status === "loading" && displayedProducts.length === 0;

  useEffect(() => {
    void dispatch(fetchShopCategories());
  }, [dispatch]);

  return (
    <section className="space-y-5">
      <GlassInlineAlert
        message={status === "failed" ? error : null}
        surface="plain"
        centered={false}
      />

      <ListSectionState
        loading={isLoading}
        loadingMessage="Loading products…"
        loadingClassName="min-h-[220px] py-0"
        empty={displayedProducts.length === 0}
        emptyMessage={
          trimmedSearch
            ? `No products found for "${trimmedSearch}".`
            : "No released products yet. Check back soon for new arrivals."
        }
      >
        <div className="space-y-10">
          {productSections.map(({ section, products: sectionProducts }, index) => {
            const slice = sliceCategoryProducts(sectionProducts);

            return (
              <ProductsCategorySection
                key={section.id}
                title={section.title}
                products={slice.visible}
                totalCount={slice.total}
                viewAllHref={
                  slice.hasMore
                    ? buildCategoryPageHref(catalogBasePath, section.title)
                    : undefined
                }
                priorityCount={index === 0 ? (cardVariant === "landing" ? 5 : 3) : 0}
                cardVariant={cardVariant}
              />
            );
          })}
        </div>
      </ListSectionState>
    </section>
  );
}
