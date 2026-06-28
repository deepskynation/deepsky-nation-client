"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { ShoppingCart } from "lucide-react";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { CartOrderSummary } from "@/components/cart/cart-order-summary";
import {
  AuthRequiredPage,
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { useDebouncedCartQuantityUpdate } from "@/hooks/use-debounced-cart-quantity-update";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import { availableCartItemIds } from "@/lib/cart-selection";
import { getCartLineThumbnailSrc } from "@/lib/cart-image";
import { parseApiProductPrice } from "@/types/product";
import { cn } from "@/lib/utils";
import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import {
  fetchCart,
  removeCartItem,
  selectCart,
  selectCartError,
  selectCartItems,
  selectCartMutationStatus,
  selectCartStatus,
  selectCartUpdatingItemIds,
  selectSelectedCartItemCount,
  selectSelectedCartItemIds,
  selectSelectedCartSubtotal,
  setAllAvailableCartItemsSelected,
  toggleCartItemSelected,
} from "@/store/slices/cartSlice";
import {
  fetchShippingFee,
  selectShippingFee,
  selectShippingFeeStatus,
} from "@/store/slices/settingsSlice";
import type { ApiCartLine } from "@/types/cart";

const FALLBACK_SHIPPING_FEE = 50;

function toCartItemCard(line: ApiCartLine) {
  return {
    id: line.id,
    title: line.product_title,
    productCode: line.product_code,
    variantLabel: line.variant_label,
    thumbnailSrc: getCartLineThumbnailSrc(line.thumbnail_base64),
    quantity: line.quantity,
    lineTotal: line.line_subtotal,
    maxQuantity: line.max_quantity,
    isAvailable: line.is_available,
    unavailableReason: line.is_available
      ? undefined
      : "Out Of Stock or unavailable — uncheck or remove to continue.",
  };
}

export function CartList() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const changeQuantity = useDebouncedCartQuantityUpdate();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectCartItems);
  const selectedIds = useAppSelector(selectSelectedCartItemIds);
  const selectedSubtotal = useAppSelector(selectSelectedCartSubtotal);
  const selectedCount = useAppSelector(selectSelectedCartItemCount);
  const status = useAppSelector(selectCartStatus);
  const error = useAppSelector(selectCartError);
  const mutationStatus = useAppSelector(selectCartMutationStatus);
  const updatingItemIds = useAppSelector(selectCartUpdatingItemIds);
  const shippingFeeFromStore = useAppSelector(selectShippingFee);
  const shippingFeeStatus = useAppSelector(selectShippingFeeStatus);
  const shippingFee = shippingFeeFromStore ?? FALLBACK_SHIPPING_FEE;

  useEffect(() => {
    void dispatch(fetchShippingFee());
  }, [dispatch]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && status === "idle") {
      void dispatch(fetchCart());
    }
  }, [authInitialized, dispatch, isAuthenticated, status]);

  const availableIds = useMemo(() => availableCartItemIds(items), [items]);
  const allAvailableSelected = useMemo(
    () =>
      availableIds.length > 0 &&
      availableIds.every((id) => selectedIds.includes(id)),
    [availableIds, selectedIds],
  );
  const someAvailableSelected = useMemo(
    () => availableIds.some((id) => selectedIds.includes(id)),
    [availableIds, selectedIds],
  );

  const selectedItems = useMemo(() => {
    const selected = new Set(selectedIds);
    return items.filter((item) => selected.has(item.id));
  }, [items, selectedIds]);

  const hasUnavailableSelected = selectedItems.some((item) => !item.is_available);
  const selectedSubtotalValue = parseApiProductPrice(selectedSubtotal);
  const orderTotal =
    selectedIds.length > 0 ? selectedSubtotalValue + shippingFee : 0;
  const isRemoving = mutationStatus === "loading";
  const isQuantitySyncing = updatingItemIds.length > 0;

  if (!authInitialized) {
    return <CenteredLoading message="Loading cart…" />;
  }

  if (!isAuthenticated) {
    const loginHref = buildLoginRedirectPath("/cart");
    return (
      <AuthRequiredPage
        title="Sign In To View Your Cart"
        description="Your cart is saved to your account once you are signed in."
        action={{ href: loginHref, label: "Sign In" }}
        layout="centered"
      />
    );
  }

  if (status === "loading" && !cart) {
    return <CenteredLoading message="Loading cart…" />;
  }

  const handleSelectAllChange = () => {
    dispatch(setAllAvailableCartItemsSelected(!allAvailableSelected));
  };

  const canCheckout =
    selectedIds.length > 0 &&
    !hasUnavailableSelected &&
    !isRemoving &&
    !isQuantitySyncing;

  const summaryWarning = hasUnavailableSelected
    ? "Unselect or remove unavailable items before checkout."
    : items.some((item) => !item.is_available) && !hasUnavailableSelected
      ? "Unavailable items will stay in your cart."
      : null;

  return (
    <div className="min-h-full text-black">
      <DashboardGlassSection variant="light" className="min-h-full bg-transparent">
        <div className="w-full px-6 py-8 lg:px-12 lg:py-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-black">
              Your Cart
            </h1>
            {cart && cart.item_count > 0 ? (
              <p className="mt-2 text-sm text-black/45">
                {cart.item_count} {cart.item_count === 1 ? "item" : "items"} in
                your cart
              </p>
            ) : null}
          </header>

          {error ? (
            <p className="mb-6 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}

          {items.length === 0 ? (
            <div
              className={cn(
                "flex flex-col items-center gap-4 rounded-[20px] border border-dashed border-black/12 bg-white px-6 py-16 text-center",
              )}
            >
              <ShoppingCart className="size-10 text-black/25" strokeWidth={1.25} />
              <p className="text-sm text-black/55">Your cart is empty.</p>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-black underline-offset-2 hover:underline"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:items-start">
              <section className="rounded-xl border border-black/8 bg-white px-4 py-1">
                {availableIds.length > 0 ? (
                  <label className="flex cursor-pointer items-center gap-2 border-b border-black/8 py-2.5 text-xs text-black">
                    <input
                      type="checkbox"
                      checked={allAvailableSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate =
                            someAvailableSelected && !allAvailableSelected;
                        }
                      }}
                      onChange={handleSelectAllChange}
                      disabled={isRemoving}
                      className="size-3.5 rounded border-black/20 text-black focus:ring-black/20"
                    />
                    <span className="font-medium">
                      Select All Available
                      {selectedCount > 0 ? (
                        <span className="font-normal text-black/45">
                          {" "}
                          · {selectedCount} selected
                        </span>
                      ) : null}
                    </span>
                  </label>
                ) : null}

                <div>
                  {items.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={toCartItemCard(item)}
                      selected={selectedIds.includes(item.id)}
                      isUpdating={isRemoving}
                      onToggleSelect={() => {
                        dispatch(toggleCartItemSelected(item.id));
                      }}
                      onDecrease={() => {
                        if (item.quantity > 1) {
                          changeQuantity(item.id, item.quantity - 1);
                        }
                      }}
                      onIncrease={() => {
                        if (item.quantity < item.max_quantity) {
                          changeQuantity(item.id, item.quantity + 1);
                        }
                      }}
                      onRemove={() => {
                        void dispatch(removeCartItem(item.id));
                      }}
                    />
                  ))}
                </div>
              </section>

              <CartOrderSummary
                subtotal={selectedSubtotal}
                shippingFee={selectedIds.length > 0 ? shippingFee : 0}
                total={orderTotal}
                shippingLoading={
                  shippingFeeStatus === "loading" && shippingFeeFromStore === null
                }
                selectedCount={selectedCount}
                canCheckout={canCheckout}
                isUpdating={isRemoving || isQuantitySyncing}
                onCheckout={() => router.push("/checkout")}
                warning={summaryWarning}
                className="lg:sticky lg:top-6"
              />
            </div>
          )}
        </div>
      </DashboardGlassSection>
    </div>
  );
}
