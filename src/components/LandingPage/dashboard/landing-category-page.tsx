"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { LandingStorefrontHeader } from "@/components/LandingPage/dashboard/modules/landing-storefront-header";
import { StorefrontCategoryPage } from "@/components/common/product/storefront-category-page";
import { buildCategoryPageHrefFromParam } from "@/lib/storefront-categories";
import { useAppSelector } from "@/hooks";
import { selectShopCategories } from "@/store/slices/categorySlice";

type LandingCategoryPageContentProps = {
  categorySlug: string;
};

export function LandingCategoryPageContent({
  categorySlug,
}: LandingCategoryPageContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categories = useAppSelector(selectShopCategories);
  const searchQuery = searchParams.get("q") ?? "";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <LandingStorefrontHeader searchQuery={searchQuery} />

      <DashboardGlassSection
        variant="light"
        className="scroll-mt-24 border-t border-white/40"
      >
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
          <StorefrontCategoryPage
            categorySlug={categorySlug}
            catalogBasePath="/"
            cardVariant="landing"
          />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
