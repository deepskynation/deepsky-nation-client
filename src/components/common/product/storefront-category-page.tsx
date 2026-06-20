"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { ListSectionState } from "@/components/common/feedback/list-section-state";
import { GlassInlineAlert } from "@/components/common/feedback/glass-inline-alert";
import { ProductsCategorySection } from "@/components/common/product/products-category-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  buildCategoryPageHref,
  filterProductsByCategoryId,
  getCategorySectionTitle,
  isCategoryUuid,
  resolveCategoryIdFromRouteParam,
  STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
} from "@/lib/storefront-categories";
import { fetchShopCategories, selectShopCategories } from "@/store/slices/categorySlice";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";
import type { ApiProduct } from "@/types/product";

type StorefrontCategoryPageProps = {
  categorySlug: string;
  catalogBasePath: string;
  cardVariant?: "shop" | "landing";
  products?: ApiProduct[];
  status?: "idle" | "loading" | "succeeded" | "failed";
  error?: string | null;
  skipFetch?: boolean;
};

export function StorefrontCategoryPage({
  categorySlug,
  catalogBasePath,
  cardVariant = "shop",
  products: productsProp,
  status: statusProp,
  error: errorProp,
  skipFetch = false,
}: StorefrontCategoryPageProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const categories = useAppSelector(selectShopCategories);
  const storeProducts = useAppSelector(selectShopProducts);
  const storeStatus = useAppSelector(selectShopProductsListStatus);
  const storeError = useAppSelector(selectShopProductsListError);

  const products = productsProp ?? storeProducts;
  const status = statusProp ?? storeStatus;
  const error = errorProp ?? storeError;

  const categoryId = useMemo(
    () => resolveCategoryIdFromRouteParam(categories, categorySlug),
    [categories, categorySlug],
  );

  const categoryProducts = useMemo(() => {
    if (!categoryId) {
      return [];
    }

    return filterProductsByCategoryId(products, categoryId);
  }, [categoryId, products]);

  const category = categoryId
    ? categories.find((item) => item.id === categoryId)
    : undefined;
  const title = getCategorySectionTitle(
    category?.category_name ?? categoryProducts[0]?.category_name,
  );
  const catalogHomeHref = catalogBasePath === "/" ? "/#products" : catalogBasePath;
  const isLoading =
    (status === "loading" && categoryProducts.length === 0) ||
    (categories.length === 0 && isCategoryUuid(categorySlug));

  useEffect(() => {
    void dispatch(fetchShopCategories());
  }, [dispatch]);

  useEffect(() => {
    if (skipFetch || productsProp) {
      return;
    }

    void dispatch(
      fetchReleasedProducts({
        page: 1,
        page_size: STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
        include_gallery_images: true,
      }),
    );
  }, [dispatch, productsProp, skipFetch]);

  useEffect(() => {
    if (!isCategoryUuid(categorySlug)) {
      return;
    }

    const matchedCategory = categories.find((item) => item.id === categorySlug);
    if (!matchedCategory) {
      return;
    }

    router.replace(buildCategoryPageHref(catalogBasePath, matchedCategory.category_name));
  }, [catalogBasePath, categories, categorySlug, router]);

  return (
    <section className="space-y-5">
      <AnimateInView>
        <Link
          href={catalogHomeHref}
          className="inline-flex text-[11px] uppercase tracking-[0.22em] text-black/55 transition-colors hover:text-black"
        >
          ← Back to all products
        </Link>
      </AnimateInView>

      <GlassInlineAlert
        message={status === "failed" ? error : null}
        surface="plain"
        centered={false}
      />

      <ListSectionState
        loading={isLoading}
        loadingMessage="Loading products…"
        loadingClassName="min-h-[220px] py-0"
        empty={!isLoading && categoryProducts.length === 0}
        emptyMessage="No products in this category yet."
      >
        <ProductsCategorySection
          title={title}
          products={categoryProducts}
          totalCount={categoryProducts.length}
          priorityCount={cardVariant === "landing" ? 5 : 3}
          cardVariant={cardVariant}
        />
      </ListSectionState>
    </section>
  );
}
