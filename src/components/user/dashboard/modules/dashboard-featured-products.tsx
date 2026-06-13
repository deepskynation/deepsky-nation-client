"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { ListSectionState } from "@/components/common/feedback/list-section-state";
import { GlassInlineAlert } from "@/components/common/feedback/glass-inline-alert";
import { ProductsCategorySection } from "@/components/user/products/modules/products-category-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { groupProductsByCategory } from "@/lib/storefront-categories";
import { pickFeaturedProducts } from "@/lib/user-dashboard-products";
import { fetchShopCategories, selectShopCategories } from "@/store/slices/categorySlice";
import type { ApiProduct } from "@/types/product";

type DashboardFeaturedProductsProps = {
  products: ApiProduct[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

export function DashboardFeaturedProducts({
  products,
  status,
  error,
}: DashboardFeaturedProductsProps) {
  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectShopCategories);
  const featuredProducts = pickFeaturedProducts(products);
  const productSections = useMemo(
    () => groupProductsByCategory(featuredProducts, categories),
    [categories, featuredProducts],
  );
  const isLoading = status === "loading" && featuredProducts.length === 0;

  useEffect(() => {
    void dispatch(fetchShopCategories());
  }, [dispatch]);

  return (
    <section className="space-y-5">
      <AnimateInView>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Shop
            </p>
            <h2 className="font-serif text-xl font-normal text-black sm:text-2xl">
              Featured products
            </h2>
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">New Arrivals</p>
          </div>
          <Link
            href="/user/products"
            className="text-[11px] uppercase tracking-[0.22em] text-black/55 transition-colors hover:text-black"
          >
            View all
          </Link>
        </div>
      </AnimateInView>

      <GlassInlineAlert
        message={status === "failed" ? error : null}
        surface="plain"
        centered={false}
      />

      <ListSectionState
        loading={isLoading}
        loadingMessage="Loading featured products…"
        loadingClassName="min-h-[220px] py-0"
        empty={featuredProducts.length === 0}
        emptyMessage="No released products yet. Check back soon for new arrivals."
      >
        <div className="space-y-10">
          {productSections.map(({ section, products: sectionProducts }, index) => (
            <ProductsCategorySection
              key={section.id}
              title={section.title}
              products={sectionProducts}
              priorityCount={index === 0 ? 3 : 0}
            />
          ))}
        </div>
      </ListSectionState>
    </section>
  );
}
