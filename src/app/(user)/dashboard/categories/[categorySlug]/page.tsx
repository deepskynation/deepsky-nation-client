"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { PageStateGate } from "@/components/common/feedback/page-state-gate";
import { StorefrontCategoryPage } from "@/components/common/product/storefront-category-page";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  buildCategoryPageHrefFromParam,
  STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
} from "@/lib/storefront-categories";
import { selectShopCategories } from "@/store/slices/categorySlice";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";

export default function DashboardCategoryPage() {
  const params = useParams<{ categorySlug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const categorySlug = params.categorySlug;
  const categories = useAppSelector(selectShopCategories);
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const shopProducts = useAppSelector(selectShopProducts);
  const shopProductsStatus = useAppSelector(selectShopProductsListStatus);
  const shopProductsError = useAppSelector(selectShopProductsListError);

  useEffect(() => {
    const legacyCategoryId = searchParams.get("category");
    if (!legacyCategoryId) {
      return;
    }

    const href = buildCategoryPageHrefFromParam("/dashboard", categories, legacyCategoryId);
    if (href) {
      router.replace(href);
    }
  }, [categories, router, searchParams]);

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) {
      return;
    }

    void dispatch(
      fetchReleasedProducts({
        page: 1,
        page_size: STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
        include_gallery_images: true,
      }),
    );
  }, [authInitialized, dispatch, isAuthenticated]);

  return (
    <PageStateGate
      authChecking={!authInitialized}
      authCheckingMessage="Loading your session…"
      authRequired={authInitialized && !isAuthenticated}
      authRequiredTitle="Sign In To View Your Dashboard"
      authRequiredDescription="Your cart, orders, and featured products appear after you sign in."
      authRequiredAction={{ href: "/login", label: "Sign In" }}
      authRequiredLayout="centered"
    >
      <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
        <DashboardGlassSection variant="light" className="min-h-full">
          <div className="mx-auto max-w-7xl space-y-10 px-6 py-8 lg:px-12 lg:py-10">
            <StorefrontCategoryPage
              categorySlug={categorySlug}
              catalogBasePath="/dashboard"
              products={shopProducts}
              status={shopProductsStatus}
              error={shopProductsError}
              skipFetch
            />
          </div>
        </DashboardGlassSection>
      </div>
    </PageStateGate>
  );
}
