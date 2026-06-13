"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { ListSectionState } from "@/components/common/feedback/list-section-state";
import { GlassInlineAlert } from "@/components/common/feedback/glass-inline-alert";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { GlassPillFilter } from "@/components/common/filters/glass-pill-filter";
import { GlassOptionsMenu } from "@/components/common/filters/glass-options-menu";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { TabPagination } from "@/components/common/pagination/tab-pagination";
import { ProductsCategorySection } from "@/components/user/products/modules/products-category-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  productSortOptions,
  SHOP_PRODUCTS_PAGE_SIZE,
  type ProductSortOption,
} from "@/lib/shop-filters";
import {
  filterProductsByCategoryId,
  filterStorefrontProducts,
  getCategorySectionTitle,
  groupProductsByCategory,
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
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectShopProducts);
  const listStatus = useAppSelector(selectShopProductsListStatus);
  const listError = useAppSelector(selectShopProductsListError);
  const categories = useAppSelector(selectShopCategories);

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [categoryId, setCategoryId] = useState<string>("all");
  const [sort, setSort] = useState<ProductSortOption>("Default");
  const [page, setPage] = useState(1);

  const categoryOptions = useMemo(
    () => ["All", ...categories.map((category) => category.category_name)],
    [categories],
  );

  useEffect(() => {
    void dispatch(fetchShopCategories());
    void dispatch(fetchReleasedProducts(STOREFRONT_CATALOG_QUERY));
  }, [dispatch]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryId, sort]);

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

  const isCategoryFiltered = categoryId !== "all";

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / SHOP_PRODUCTS_PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    if (isCategoryFiltered && page > totalPages) {
      setPage(totalPages);
    }
  }, [isCategoryFiltered, page, totalPages]);

  const paginatedProducts = useMemo(() => {
    if (!isCategoryFiltered) {
      return sortedProducts;
    }

    const start = (currentPage - 1) * SHOP_PRODUCTS_PAGE_SIZE;
    return sortedProducts.slice(start, start + SHOP_PRODUCTS_PAGE_SIZE);
  }, [currentPage, isCategoryFiltered, sortedProducts]);

  const sectionGroups = useMemo(() => {
    if (isCategoryFiltered) {
      if (paginatedProducts.length === 0) {
        return [];
      }

      const activeCategory = categories.find((category) => category.id === categoryId);
      const title = getCategorySectionTitle(activeCategory?.category_name);

      return [
        {
          section: { id: categoryId, title },
          products: paginatedProducts,
        },
      ];
    }

    return groupProductsByCategory(sortedProducts, categories);
  }, [categories, categoryId, isCategoryFiltered, paginatedProducts, sortedProducts]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-12 lg:py-14">
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
            <div className="relative z-30 mb-6 flex flex-col gap-3 overflow-visible sm:mb-8 lg:flex-row lg:items-center lg:gap-4">
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

              <div className="flex min-w-0 items-center gap-2 lg:flex-1">
                <GlassPillFilter
                  variant="simple"
                  options={categoryOptions}
                  value={activeCategoryLabel}
                  onChange={handleCategoryChange}
                  ariaLabel="Filter By Category"
                  className="min-w-0 flex-1"
                />

                <GlassOptionsMenu
                  options={productSortOptions}
                  value={sort}
                  onChange={setSort}
                  ariaLabel="Sort Products"
                  menuTitle="Price"
                  className="shrink-0"
                />
              </div>
            </div>
          </AnimateInView>

          <GlassInlineAlert
            message={listStatus === "failed" ? listError : null}
            className="mb-6"
          />

          <ListSectionState
            loading={isLoading}
            loadingMessage="Loading products…"
            empty={!hasVisibleProducts}
            emptyMessage={
              products.length === 0
                ? "No released products yet."
                : categoryId !== "all"
                  ? "No products in this category match your search."
                  : "No products match your search."
            }
          >
            <div className="space-y-12">
              {sectionGroups.map(({ section, products: sectionProducts }, index) => (
                <ProductsCategorySection
                  key={section.id}
                  title={section.title}
                  products={sectionProducts}
                  isPageLoading={isPageLoading}
                  priorityCount={index === 0 && (!isCategoryFiltered || currentPage === 1) ? 5 : 0}
                />
              ))}

              {isCategoryFiltered ? (
                <TabPagination
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  disabled={isPageLoading}
                  className="pt-2"
                />
              ) : null}
            </div>
          </ListSectionState>

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
