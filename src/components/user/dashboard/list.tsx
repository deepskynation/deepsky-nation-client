"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { PageStateGate } from "@/components/common/feedback/page-state-gate";
import { DashboardAlerts } from "@/components/user/dashboard/modules/dashboard-alerts";
import { DashboardCartSummary } from "@/components/user/dashboard/modules/dashboard-cart-summary";
import { DashboardFeaturedProducts } from "@/components/user/dashboard/modules/dashboard-featured-products";
import { DashboardModelShowcase } from "@/components/user/dashboard/modules/dashboard-model-showcase";
import { DashboardRecentOrders } from "@/components/user/dashboard/modules/dashboard-recent-orders";
import { useAppDispatch, useAppSelector } from "@/hooks";
import {
  deliveryFormFromUser,
  validateCheckoutDeliveryForm,
} from "@/lib/checkout-delivery";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import {
  selectCartError,
  selectCartItemCount,
  selectCartStatus,
  selectCartSubtotal,
} from "@/store/slices/cartSlice";
import {
  fetchMyOrdersPreview,
  selectMyOrdersPreview,
  selectMyOrdersPreviewError,
  selectMyOrdersPreviewStatus,
} from "@/store/slices/orderSlice";
import {
  fetchReleasedProducts,
  selectShopProducts,
  selectShopProductsListError,
  selectShopProductsListStatus,
} from "@/store/slices/productSlice";
import { STOREFRONT_CATALOG_FETCH_PAGE_SIZE, buildCategoryPageHrefFromParam } from "@/lib/storefront-categories";
import { selectShopCategories } from "@/store/slices/categorySlice";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
export function UserDashboardPageContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser);

  const cartItemCount = useAppSelector(selectCartItemCount);
  const cartSubtotal = useAppSelector(selectCartSubtotal);
  const cartStatus = useAppSelector(selectCartStatus);
  const cartError = useAppSelector(selectCartError);

  const previewOrders = useAppSelector(selectMyOrdersPreview);
  const previewOrdersStatus = useAppSelector(selectMyOrdersPreviewStatus);
  const previewOrdersError = useAppSelector(selectMyOrdersPreviewError);

  const shopProducts = useAppSelector(selectShopProducts);
  const shopProductsStatus = useAppSelector(selectShopProductsListStatus);
  const shopProductsError = useAppSelector(selectShopProductsListError);
  const categories = useAppSelector(selectShopCategories);

  const profileIncomplete = useMemo(() => {
    if (!authUser) {
      return false;
    }
    return validateCheckoutDeliveryForm(deliveryFormFromUser(authUser)) !== null;
  }, [authUser]);

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

    void dispatch(fetchMyOrdersPreview({ page_size: 5 }));
    const trimmedSearch = searchQuery.trim();
    void dispatch(
      fetchReleasedProducts({
        page: 1,
        page_size: STOREFRONT_CATALOG_FETCH_PAGE_SIZE,
        search: trimmedSearch || undefined,
        include_gallery_images: !trimmedSearch,
      }),
    );
  }, [authInitialized, dispatch, isAuthenticated, searchQuery]);

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
        <DashboardModelShowcase />

        <DashboardGlassSection variant="light" className="min-h-full">
          <div className="mx-auto max-w-7xl space-y-10 px-6 py-8 lg:px-12 lg:py-10">
            <DashboardFeaturedProducts
              products={shopProducts}
              status={shopProductsStatus}
              error={shopProductsError}
              searchQuery={searchQuery}
            />

            {/* <div className="grid gap-4 lg:grid-cols-2">
              <DashboardCartSummary
                itemCount={cartItemCount}
                subtotal={cartSubtotal}
                status={cartStatus}
                error={cartError}
              />
              <DashboardRecentOrders
                orders={previewOrders}
                status={previewOrdersStatus}
                error={previewOrdersError}
              />
            </div> */}
{/* 
            <DashboardAlerts
              user={authUser}
              profileIncomplete={profileIncomplete}
              orders={previewOrders}
            /> */}
            <EmailSubscribeSection className="mt-12" />
          </div>
          
        </DashboardGlassSection>
      </div>
    </PageStateGate>
  );
}
