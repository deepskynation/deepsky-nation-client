"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { LandingStorefrontHeader } from "@/components/LandingPage/dashboard/modules/landing-storefront-header";
import { StorefrontCategorySections } from "@/components/common/product/storefront-category-sections";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { ModelCarousel } from "@/components/LandingPage/dashboard/modules/model-carousel";
import { buildCategoryPageHrefFromParam, STOREFRONT_CATALOG_FETCH_PAGE_SIZE } from "@/lib/storefront-categories";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { getDashboardPathForRole } from "@/lib/auth-session";
import { selectShopCategories } from "@/store/slices/categorySlice";
import {
  selectAuthInitialized,
  selectAuthUser,
} from "@/store/slices/authSlice";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";
import { fetchShopCategories } from "@/store/slices/categorySlice";

export default function DashboardList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("q") ?? "";
  const dispatch = useAppDispatch();
  const shopProducts = useAppSelector(selectShopProducts);
  const shopProductsStatus = useAppSelector(selectShopProductsListStatus);
  const shopProductsError = useAppSelector(selectShopProductsListError);
  const categories = useAppSelector(selectShopCategories);
  const authReady = useAppSelector(selectAuthInitialized);
  const authUser = useAppSelector(selectAuthUser);

  useEffect(() => {
    if (authReady && authUser?.role === "admin") {
      router.replace(getDashboardPathForRole("admin"));
    }
  }, [authReady, authUser?.role, router]);

  useEffect(() => {
    const legacyCategoryId = searchParams.get("category");
    if (!legacyCategoryId) {
      return;
    }

    const href = buildCategoryPageHrefFromParam("/", categories, legacyCategoryId);
    if (href) {
      router.replace(href);
    }
  }, [categories, router, searchParams]);

  useEffect(() => {
    void dispatch(fetchShopCategories());
    const trimmedSearch = searchQuery.trim();
    void dispatch(
      fetchReleasedProducts({
        page: 1,
        page_size: STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
        search: trimmedSearch || undefined,
        include_gallery_images: !trimmedSearch,
      }),
    );
  }, [dispatch, searchQuery]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash === "about-us") {
      router.replace("/about-us");
      return;
    }
    if (hash === "products" || hash === "contact-us") {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <LandingStorefrontHeader searchQuery={searchQuery} />

      <section className="relative w-full border-b border-white/5 bg-model-carousel">
        <ModelCarousel variant="banner" />
      </section>

      <DashboardGlassSection
        id="products"
        variant="light"
        className="scroll-mt-24 border-t border-white/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
          <StorefrontCategorySections
            products={shopProducts}
            status={shopProductsStatus}
            error={shopProductsError}
            catalogBasePath="/"
            searchQuery={searchQuery}
            cardVariant="landing"
          />

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
