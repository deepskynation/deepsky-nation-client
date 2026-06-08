"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2Icon, Search } from "lucide-react";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { AnimateInView } from "@/components/LandingPage/dashboard/modules/animate-in-view";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { GlassPillFilter } from "@/components/common/filters/glass-pill-filter";
import { GlassOptionsMenu } from "@/components/common/filters/glass-options-menu";
import { ProductsCategorySection } from "@/components/user/products/modules/products-category-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { glassCardClassName } from "@/lib/glass-styles";
import {
  productSortOptions,
  type ProductSortOption,
} from "@/lib/shop-filters";
import {
  filterProductsByCategoryId,
  filterStorefrontProducts,
  getStorefrontSectionTitle,
  groupProductsByStorefrontSection,
  sortStorefrontProducts,
  STOREFRONT_CATALOG_QUERY,
} from "@/lib/storefront-categories";
import { cn } from "@/lib/utils";
import { fetchShopCategories, selectShopCategories } from "@/store/slices/categorySlice";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";

export function ProductsList() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectShopProducts);
  const listStatus = useAppSelector(selectShopProductsListStatus);
  const listError = useAppSelector(selectShopProductsListError);
  const categories = useAppSelector(selectShopCategories);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<ProductSortOption>("Default");

  const categoryOptions = useMemo(
    () => ["All", ...categories.map((category) => category.category_name)],
    [categories],
  );

  useEffect(() => {
    void dispatch(fetchShopCategories());
    void dispatch(fetchReleasedProducts(STOREFRONT_CATALOG_QUERY));
  }, [dispatch]);

  const categoryFilteredProducts = useMemo(
    () => filterProductsByCategoryId(products, categoryId),
    [categoryId, products],
  );

  const filteredProducts = useMemo(
    () => filterStorefrontProducts(categoryFilteredProducts, searchQuery),
    [categoryFilteredProducts, searchQuery],
  );

  const sortedProducts = useMemo(
    () => sortStorefrontProducts(filteredProducts, sort),
    [filteredProducts, sort],
  );

  const sectionGroups = useMemo(() => {
    if (categoryId !== "all") {
      if (sortedProducts.length === 0) {
        return [];
      }

      const activeCategory = categories.find((category) => category.id === categoryId);
      const title = getStorefrontSectionTitle(activeCategory?.category_name);

      return [
        {
          section: { id: categoryId, title },
          products: sortedProducts,
        },
      ];
    }

    return groupProductsByStorefrontSection(sortedProducts);
  }, [categories, categoryId, sortedProducts]);

  const handleCategoryChange = (label: string) => {
    if (label === "All") {
      setCategoryId("all");
      return;
    }

    const match = categories.find((category) => category.category_name === label);
    setCategoryId(match?.id ?? "all");
  };

  const activeCategoryLabel =
    categoryId === "all"
      ? "All"
      : categories.find((category) => category.id === categoryId)?.category_name ?? "All";

  const isLoading = listStatus === "loading" && products.length === 0;
  const isPageLoading = listStatus === "loading";
  const totalCount = sortedProducts.length;
  const hasVisibleProducts = sectionGroups.length > 0;

  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
          <AnimateInView>
            <div className="mb-8 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
                Shop
              </p>
              <h2 className="font-serif text-2xl font-normal text-black sm:text-3xl">
                Products
              </h2>
              {listStatus === "succeeded" && totalCount > 0 && (
                <p className="text-sm text-black/45">
                  {totalCount} product{totalCount === 1 ? "" : "s"}
                </p>
              )}
            </div>
          </AnimateInView>

          <AnimateInView delay={80}>
            <div className="relative z-30 mb-8 flex flex-col gap-3 overflow-visible lg:flex-row lg:items-center lg:gap-4">
              <div className="relative w-full shrink-0 lg:max-w-xs">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search Products..."
                  aria-label="Search Products"
                  className={cn(authGlassInputClassName, "pl-10")}
                />
              </div>

              <GlassPillFilter
                variant="simple"
                options={categoryOptions}
                value={activeCategoryLabel}
                onChange={handleCategoryChange}
                ariaLabel="Filter By Category"
                className="min-w-0 flex-1 lg:pb-0"
              />

              <GlassOptionsMenu
                options={productSortOptions}
                value={sort}
                onChange={setSort}
                ariaLabel="Sort Products"
                menuTitle="Price"
              />
            </div>
          </AnimateInView>

          {listError && listStatus === "failed" && (
            <p
              className={cn(
                glassCardClassName,
                "mb-6 border-red-200/80 bg-red-50/80 px-6 py-4 text-center text-sm text-red-700",
              )}
              role="alert"
            >
              {listError}
            </p>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-black/50">
              <Loader2Icon className="size-5 animate-spin" />
              Loading products…
            </div>
          ) : !hasVisibleProducts ? (
            <p
              className={cn(
                glassCardClassName,
                "border-dashed px-6 py-12 text-center text-sm text-black/50",
              )}
            >
              {products.length === 0
                ? "No released products yet."
                : categoryId !== "all"
                  ? "No products in this category match your search."
                  : "No products match your search."}
            </p>
          ) : (
            <div className="space-y-12">
              {sectionGroups.map(({ section, products: sectionProducts }, index) => (
                <ProductsCategorySection
                  key={section.id}
                  title={section.title}
                  products={sectionProducts}
                  isPageLoading={isPageLoading}
                  priorityCount={index === 0 ? 5 : 0}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardGlassSection>
    </div>
  );
}
