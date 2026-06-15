"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2Icon, Truck } from "lucide-react";
import { OrderLinesList } from "@/components/common/order/order-lines-list";
import { OrderTotalsSummary } from "@/components/common/order/order-totals-summary";
import {
  AuthRequiredPage,
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { useToast } from "@/components/common/feedback/toast-provider";
import { GlassHighlightCallout } from "@/components/common/feedback/glass-highlight-callout";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { CheckoutDeliveryForm } from "@/components/user/checkout/modules/checkout-delivery-form";
import { CheckoutOrderPlacedDialog } from "@/components/user/checkout/modules/checkout-order-placed-dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import { getCartLineThumbnailSrc } from "@/lib/cart-image";
import {
  checkoutDeliveryToProfilePayload,
  deliveryFormFromUser,
  emptyCheckoutDeliveryForm,
  hasProfileDeliveryData,
  isCheckoutDeliveryFormEmpty,
  validateCheckoutDeliveryForm,
  type CheckoutDeliveryFormState,
} from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import { glassPanelFlatClassName } from "@/lib/glass-styles";
import { formatOrderNumber } from "@/lib/order-display";
import { parseApiProductPrice } from "@/types/product";
import { cn } from "@/lib/utils";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
  updateProfile,
} from "@/store/slices/authSlice";
import {
  fetchCart,
  selectCart,
  selectCartError,
  selectCartStatus,
  selectSelectedCartItemIds,
  selectSelectedCartItems,
  selectSelectedCartSubtotal,
} from "@/store/slices/cartSlice";
import { placeOrder, selectPlaceOrderStatus } from "@/store/slices/orderSlice";
import {
  fetchShippingFee,
  selectShippingFee,
  selectShippingFeeStatus,
} from "@/store/slices/settingsSlice";
import type { ApiCartLine } from "@/types/cart";
import type { ApiOrder } from "@/types/order";

const FALLBACK_SHIPPING_FEE = 50;

function toLineRow(line: ApiCartLine) {
  return {
    id: line.id,
    title: line.product_title,
    productCode: line.product_code,
    variantLabel: line.variant_label,
    thumbnailSrc: getCartLineThumbnailSrc(line.thumbnail_base64),
    quantity: line.quantity,
    unitPrice: line.unit_price,
    lineTotal: line.line_subtotal,
    isAvailable: line.is_available,
    unavailableReason: line.is_available
      ? undefined
      : "Out Of Stock or unavailable.",
  };
}

export function CartCheckoutView() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const authInitialized = useAppSelector(selectAuthInitialized);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authUser = useAppSelector(selectAuthUser);
  const cart = useAppSelector(selectCart);
  const items = useAppSelector(selectSelectedCartItems);
  const selectedIds = useAppSelector(selectSelectedCartItemIds);
  const selectedSubtotal = useAppSelector(selectSelectedCartSubtotal);
  const cartStatus = useAppSelector(selectCartStatus);
  const cartError = useAppSelector(selectCartError);
  const placeOrderStatus = useAppSelector(selectPlaceOrderStatus);
  const shippingFeeFromStore = useAppSelector(selectShippingFee);
  const shippingFeeStatus = useAppSelector(selectShippingFeeStatus);
  const shippingFee = shippingFeeFromStore ?? FALLBACK_SHIPPING_FEE;

  const [primaryForm, setPrimaryForm] = useState<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const [alternateForm, setAlternateForm] = useState<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const [usingAlternateAddress, setUsingAlternateAddress] = useState(false);
  const [usingSavedProfileDelivery, setUsingSavedProfileDelivery] = useState(false);
  const primaryFormRef = useRef<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const manualPrimaryFormRef = useRef<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const alternateFormRef = useRef<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const profileDeliveryInitializedRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cod");
  const [paymentProofDataUrl, setPaymentProofDataUrl] = useState<string | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    void dispatch(fetchShippingFee());
  }, [dispatch]);

  useEffect(() => {
    if (authInitialized && isAuthenticated && cartStatus === "idle") {
      void dispatch(fetchCart());
    }
  }, [authInitialized, cartStatus, dispatch, isAuthenticated]);

  useEffect(() => {
    if (!authUser || profileDeliveryInitializedRef.current) {
      return;
    }

    profileDeliveryInitializedRef.current = true;

    setPrimaryForm(emptyCheckoutDeliveryForm);
    primaryFormRef.current = emptyCheckoutDeliveryForm;
    manualPrimaryFormRef.current = emptyCheckoutDeliveryForm;
    setAlternateForm(emptyCheckoutDeliveryForm);
    alternateFormRef.current = emptyCheckoutDeliveryForm;
    setUsingAlternateAddress(false);
    setUsingSavedProfileDelivery(false);
    setSaveToProfile(false);
  }, [authUser]);

  const subtotal = useMemo(
    () => parseApiProductPrice(selectedSubtotal),
    [selectedSubtotal],
  );
  const total = subtotal + shippingFee;
  const hasUnavailable = items.some((item) => !item.is_available);

  useEffect(() => {
    if (
      authInitialized &&
      isAuthenticated &&
      cartStatus === "succeeded" &&
      selectedIds.length === 0 &&
      (cart?.items.length ?? 0) > 0
    ) {
      router.replace("/user/cart");
    }
  }, [
    authInitialized,
    cart?.items.length,
    cartStatus,
    isAuthenticated,
    router,
    selectedIds.length,
  ]);

  const receiptItemLabels = useMemo(() => {
    const labels: Record<string, { title: string; variantLabel?: string }> = {};
    for (const item of items) {
      labels[item.product_id] = {
        title: item.product_title,
        variantLabel: item.variant_label ?? undefined,
      };
    }
    return labels;
  }, [items]);

  const updatePrimaryField = (field: keyof CheckoutDeliveryFormState, value: string) => {
    setPrimaryForm((prev) => {
      const next = { ...prev, [field]: value };
      primaryFormRef.current = next;
      if (!usingSavedProfileDelivery) {
        manualPrimaryFormRef.current = next;
      }
      return next;
    });
    setFormError(null);
  };

  const updateAlternateField = (field: keyof CheckoutDeliveryFormState, value: string) => {
    setAlternateForm((prev) => {
      const next = { ...prev, [field]: value };
      alternateFormRef.current = next;
      return next;
    });
    setFormError(null);
  };

  const handleUsingAlternateAddressChange = (useAlternate: boolean) => {
    setFormError(null);

    if (!useAlternate) {
      setUsingAlternateAddress(false);
      return;
    }

    if (isCheckoutDeliveryFormEmpty(alternateFormRef.current)) {
      alternateFormRef.current = { ...primaryFormRef.current };
    }
    setAlternateForm(alternateFormRef.current);
    setUsingAlternateAddress(true);
  };

  const handleUsingSavedProfileDeliveryChange = (useSaved: boolean) => {
    setFormError(null);

    if (!useSaved) {
      setPrimaryForm(manualPrimaryFormRef.current);
      primaryFormRef.current = manualPrimaryFormRef.current;
      setUsingSavedProfileDelivery(false);
      return;
    }

    if (!authUser) {
      return;
    }

    manualPrimaryFormRef.current = { ...primaryFormRef.current };
    const saved = deliveryFormFromUser(authUser);
    setPrimaryForm(saved);
    primaryFormRef.current = saved;
    setUsingSavedProfileDelivery(true);
  };

  const savedProfileDeliveryAvailable = Boolean(
    authUser && hasProfileDeliveryData(authUser),
  );

  const handlePlaceOrder = async () => {
    const deliveryPayload = usingAlternateAddress ? alternateForm : primaryForm;
    const deliveryError = validateCheckoutDeliveryForm(deliveryPayload);
    if (deliveryError) {
      setFormError(deliveryError);
      toast.error(deliveryError);
      return;
    }

    if (selectedIds.length === 0) {
      const message = "Select at least one item in your cart.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (items.length === 0) {
      const message = "Your selected items are no longer in your cart.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (hasUnavailable) {
      const message = "Unselect unavailable items before placing your order.";
      setFormError(message);
      toast.error(message);
      return;
    }

    if (paymentMethod === "non-cod" && !paymentProofDataUrl) {
      const message = "Please upload your payment receipt to continue with Non-COD.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setFormError(null);

    const result = await dispatch(
      placeOrder({
        fromCart: true,
        cartItemIds: selectedIds,
        deliverySource: "custom",
        delivery: deliveryPayload,
        paymentMethod,
        receiptBase64: paymentProofDataUrl,
      }),
    );

    if (placeOrder.fulfilled.match(result)) {
      if (saveToProfile) {
        const profileResult = await dispatch(
          updateProfile(checkoutDeliveryToProfilePayload(primaryForm)),
        );
        if (!updateProfile.fulfilled.match(profileResult)) {
          toast.error(
            "Order placed, but we couldn't save your address to your profile.",
          );
        }
      }

      toast.success(
        `${formatOrderNumber(result.payload.order_number)} placed successfully.`,
      );
      setPlacedOrder(result.payload);
      setOrderPlaced(true);
      return;
    }

    const message =
      typeof result.payload === "string"
        ? result.payload
        : "Could not place your order.";
    toast.error(message);
    setFormError(message);
  };

  if (!authInitialized) {
    return <CenteredLoading message="Loading checkout…" />;
  }

  if (!isAuthenticated) {
    const loginHref = buildLoginRedirectPath("/user/checkout");
    return (
      <AuthRequiredPage
        title="Sign In To Checkout"
        description="Your cart is saved to your account once you are signed in."
        action={{ href: loginHref, label: "Sign In" }}
        layout="centered"
      />
    );
  }

  if (cartStatus === "loading" && !cart) {
    return <CenteredLoading message="Loading checkout…" />;
  }

  if (cartStatus === "succeeded" && (cart?.items.length ?? 0) === 0) {
    return (
      <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
        <DashboardGlassSection variant="light" className="min-h-full">
          <div className="mx-auto max-w-lg px-6 py-16 text-center">
            <p className="text-sm text-black/55">Your cart is empty.</p>
            <Link
              href="/user/products"
              className="mt-4 inline-block text-sm font-medium text-black underline-offset-2 hover:underline"
            >
              Browse Products
            </Link>
          </div>
        </DashboardGlassSection>
      </div>
    );
  }

  if (cartStatus === "succeeded" && selectedIds.length === 0) {
    return <CenteredLoading message="Returning to cart…" />;
  }

  const isPlacingOrder = placeOrderStatus === "loading";
  const needsPaymentProof = paymentMethod === "non-cod" && !paymentProofDataUrl;
  const checkoutButtonLabel =
    paymentMethod === "cod" ? "Place Order (COD)" : "Place Order";

  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Deepsky
              </p>
              <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
                Checkout
              </h1>
            </div>
            <ol className="flex items-center gap-2 text-xs font-medium text-black/45">
              <li>
                <Link href="/user/cart" className="hover:text-black">
                  Cart
                </Link>
              </li>
              <li aria-hidden className="text-black/25">
                /
              </li>
              <li className="text-black">Checkout</li>
            </ol>
          </div>

          {cartError ? (
            <p className="mb-4 text-sm text-red-700" role="alert">
              {cartError}
            </p>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className={cn(glassPanelFlatClassName, "bg-neutral-50 p-5 sm:p-6")}>
              <div className="mb-6 space-y-1">
                <h2 className="text-lg font-semibold text-black">Delivery Information</h2>
                <p className="text-sm text-black/55">
                  Enter your delivery details below. Ship to a different address if
                  needed for this order only.
                </p>
              </div>

              <GlassHighlightCallout
                className="mb-6"
                icon={<Truck className="size-4" aria-hidden />}
                title="Delivery"
                description="Items shipped to your address"
              />

              <CheckoutDeliveryForm
                primaryForm={primaryForm}
                onPrimaryFieldChange={updatePrimaryField}
                alternateForm={alternateForm}
                onAlternateFieldChange={updateAlternateField}
                onSubmit={() => void handlePlaceOrder()}
                usingAlternateAddress={usingAlternateAddress}
                onUsingAlternateAddressChange={handleUsingAlternateAddressChange}
                saveToProfile={saveToProfile}
                onSaveToProfileChange={setSaveToProfile}
                savedProfileDeliveryAvailable={savedProfileDeliveryAvailable}
                usingSavedProfileDelivery={usingSavedProfileDelivery}
                onUsingSavedProfileDeliveryChange={handleUsingSavedProfileDeliveryChange}
                paymentMethod={paymentMethod}
                paymentProofDataUrl={paymentProofDataUrl}
                onPaymentMethodChange={(next) => {
                  setPaymentMethod(next);
                  setFormError(null);
                  if (next === "cod") {
                    setPaymentProofDataUrl(null);
                  }
                }}
                onPaymentProofChange={setPaymentProofDataUrl}
                formError={formError}
              />
            </div>

            <div className={cn(glassPanelFlatClassName, "space-y-5 p-5 sm:p-6")}>
              <h2 className="text-lg font-semibold text-black">
                Order Review ({items.length}{" "}
                {items.length === 1 ? "item" : "items"})
              </h2>

              <OrderLinesList lines={items.map(toLineRow)} mode="display" />

              {hasUnavailable ? (
                <p className="text-sm text-amber-800">
                  Remove unavailable items in your{" "}
                  <Link href="/user/cart" className="underline">
                    cart
                  </Link>{" "}
                  before placing your order.
                </p>
              ) : null}

              <OrderTotalsSummary
                subtotal={subtotal}
                shippingFee={shippingFee}
                total={total}
                shippingNote={
                  shippingFeeStatus === "loading" && shippingFeeFromStore === null
                    ? "Loading shipping fee…"
                    : undefined
                }
              />

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  disabled={
                    isPlacingOrder ||
                    hasUnavailable ||
                    needsPaymentProof ||
                    items.length === 0
                  }
                  onClick={() => void handlePlaceOrder()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-black/90 disabled:opacity-50"
                >
                  {isPlacingOrder ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {checkoutButtonLabel}
                </button>
                <Link
                  href="/user/cart"
                  className="text-center text-sm text-black/50 underline-offset-2 hover:text-black hover:underline"
                >
                  Back To Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardGlassSection>

      <CheckoutOrderPlacedDialog
        open={orderPlaced}
        onOpenChange={(open) => {
          if (!open) {
            setOrderPlaced(false);
            setPlacedOrder(null);
            router.push("/user/orders");
          }
        }}
        order={placedOrder}
        itemLabels={receiptItemLabels}
      />
    </div>
  );
}
