"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import {
  CenteredLoading,
  PageStateGate,
} from "@/components/common/feedback/page-state-gate";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { OrderDetailContent } from "@/components/user/orders/order-detail/modules/order-detail-content";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { apiUrl } from "@/lib/api-config";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import {
  clearOrderDetail,
  fetchMyOrderDetail,
  selectMyOrderDetail,
  selectMyOrderDetailError,
  selectMyOrderDetailStatus,
} from "@/store/slices/orderSlice";
import type { ApiProduct } from "@/types/product";

type OrderDetailViewProps = {
  params: Promise<{ id: string }>;
};

async function fetchReleasedProduct(productId: string): Promise<ApiProduct | null> {
  try {
    const response = await fetch(apiUrl(`/api/products/${productId}`));
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as ApiProduct;
  } catch {
    return null;
  }
}

export function OrderDetailView({ params }: OrderDetailViewProps) {
  const { id: orderId } = use(params);
  const dispatch = useAppDispatch();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const order = useAppSelector(selectMyOrderDetail);
  const detailStatus = useAppSelector(selectMyOrderDetailStatus);
  const detailError = useAppSelector(selectMyOrderDetailError);

  const [orderProducts, setOrderProducts] = useState<Record<string, ApiProduct>>({});

  useEffect(() => {
    if (!authInitialized || !isAuthenticated) {
      return;
    }
    void dispatch(fetchMyOrderDetail(orderId));
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [authInitialized, dispatch, isAuthenticated, orderId]);

  useEffect(() => {
    if (!order) {
      setOrderProducts({});
      return;
    }

    const productIds = [
      ...new Set(
        order.items
          .map((item) => item.product_id)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (productIds.length === 0) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const entries = await Promise.all(
        productIds.map(async (productId) => {
          const product = await fetchReleasedProduct(productId);
          return [productId, product] as const;
        }),
      );

      if (cancelled) {
        return;
      }

      const next: Record<string, ApiProduct> = {};
      for (const [productId, product] of entries) {
        if (product) {
          next[productId] = product;
        }
      }
      setOrderProducts(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [order]);

  const isLoading = detailStatus === "loading";
  const showError = detailStatus === "failed" || (detailStatus === "succeeded" && !order);

  return (
    <PageStateGate
      authChecking={!authInitialized}
      authCheckingMessage="Loading your session…"
      authRequired={authInitialized && !isAuthenticated}
      authRequiredTitle="Sign In To View This Order"
      authRequiredDescription="Order Details are only available for signed-in customers."
      authRequiredAction={{ href: "/login", label: "Sign In" }}
      authRequiredLayout="centered"
    >
      <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
        <DashboardGlassSection variant="light" className="min-h-full">
          <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-10">
            <div className="mb-6">
              <Link
                href="/orders"
                className="inline-flex text-sm text-black/55 transition-colors hover:text-black"
              >
                ← Back To Orders
              </Link>
            </div>

            {isLoading ? (
              <CenteredLoading message="Loading order details…" className="min-h-[40vh]" />
            ) : showError ? (
              <GlassMessagePanel
                variant="flat"
                fullPage={false}
                title="Order Not Found"
                description={
                  detailError ??
                  "This order may not exist or does not belong to your account."
                }
                action={{ href: "/orders", label: "Back To Orders", variant: "button" }}
                className="max-w-none"
              />
            ) : order ? (
              <div className={cn(glassCardClassName, "p-5 sm:p-8")}>
                <OrderDetailContent order={order} orderProducts={orderProducts} />
              </div>
            ) : null}
          </div>
        </DashboardGlassSection>
      </div>
    </PageStateGate>
  );
}
