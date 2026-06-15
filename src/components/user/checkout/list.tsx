"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { CheckoutImagePreviewDialog } from "@/components/user/checkout/modules/checkout-image-preview-dialog";
import { CheckoutOrderPlacedDialog } from "@/components/user/checkout/modules/checkout-order-placed-dialog";
import { CheckoutDeliveryForm } from "@/components/user/checkout/modules/checkout-delivery-form";
import { CheckoutBuyNowSummary } from "@/components/user/checkout/modules/checkout-buy-now-summary";
import {
  checkoutDeliveryToProfilePayload,
  deliveryFormFromUser,
  emptyCheckoutDeliveryForm,
  isCheckoutDeliveryFormEmpty,
  validateCheckoutDeliveryForm,
  type CheckoutDeliveryFormState,
} from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import type { ApiOrder } from "@/types/order";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Truck } from "lucide-react";
import {
  AuthRequiredPage,
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { useToast } from "@/components/common/feedback/toast-provider";
import { GlassHighlightCallout } from "@/components/common/feedback/glass-highlight-callout";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { buildLoginRedirectPath } from "@/lib/auth-redirect";
import { getProductThumbnailSrc } from "@/lib/product-image";
import { findVariant, formatVariantLabel, getVariantUnitPrice } from "@/lib/product-variants";
import { glassPanelFlatClassName } from "@/lib/glass-styles";
import { formatOrderNumber } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import {
  selectAuthInitialized,
  selectAuthUser,
  selectIsAuthenticated,
  updateProfile,
} from "@/store/slices/authSlice";
import { placeOrder, selectPlaceOrderStatus } from "@/store/slices/orderSlice";
import {
  clearProductDetail,
  fetchReleasedProduct,
  selectProductDetail,
  selectProductDetailError,
  selectProductDetailStatus,
} from "@/store/slices/productSlice";
import {
  fetchShippingFee,
  selectShippingFee,
  selectShippingFeeStatus,
} from "@/store/slices/settingsSlice";

const FALLBACK_SHIPPING_FEE = 50;

type CheckoutViewProps = {
  params: Promise<{ id: string }>;
};

function parseQuantity(raw: string | null): number | null {
  if (!raw) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }
  return parsed;
}

export function CheckoutView({ params }: CheckoutViewProps) {
  const { id: productId } = use(params);
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const product = useAppSelector(selectProductDetail);
  const detailStatus = useAppSelector(selectProductDetailStatus);
  const detailError = useAppSelector(selectProductDetailError);
  const authUser = useAppSelector(selectAuthUser);
  const authInitialized = useAppSelector(selectAuthInitialized);
  const placeOrderStatus = useAppSelector(selectPlaceOrderStatus);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const shippingFeeFromStore = useAppSelector(selectShippingFee);
  const shippingFeeStatus = useAppSelector(selectShippingFeeStatus);
  const shippingFee = shippingFeeFromStore ?? FALLBACK_SHIPPING_FEE;

  const variantIdFromUrl = searchParams.get("variantId");
  const quantityFromUrl = parseQuantity(searchParams.get("quantity"));

  const [primaryForm, setPrimaryForm] = useState<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const [alternateForm, setAlternateForm] = useState<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const [usingAlternateAddress, setUsingAlternateAddress] = useState(false);
  const primaryFormRef = useRef<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const alternateFormRef = useRef<CheckoutDeliveryFormState>(
    emptyCheckoutDeliveryForm,
  );
  const profileDeliveryInitializedRef = useRef(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<ApiOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("cod");
  const [paymentProofDataUrl, setPaymentProofDataUrl] = useState<string | null>(null);
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);
  const [imagePreviewAlt, setImagePreviewAlt] = useState("Product Image Preview");

  useEffect(() => {
    void dispatch(fetchReleasedProduct(productId));
    void dispatch(fetchShippingFee());
    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (!authUser) {
      profileDeliveryInitializedRef.current = false;
      setUsingAlternateAddress(false);
      return;
    }

    if (profileDeliveryInitializedRef.current) {
      return;
    }

    profileDeliveryInitializedRef.current = true;

    const prefill = deliveryFormFromUser(authUser);
    setPrimaryForm(prefill);
    primaryFormRef.current = prefill;
    setAlternateForm(emptyCheckoutDeliveryForm);
    alternateFormRef.current = emptyCheckoutDeliveryForm;
    setUsingAlternateAddress(false);
    setSaveToProfile(false);
  }, [authUser]);

  const isLoading = detailStatus === "loading" || (detailStatus === "idle" && !product);
  const isReady = product?.id === productId;
  const loadFailed = detailStatus === "failed";

  const selectedVariant = useMemo(() => {
    if (!product || product.id !== productId) {
      return null;
    }

    if (product.variants.length === 0) {
      return null;
    }

    if (variantIdFromUrl) {
      return product.variants.find((variant) => variant.id === variantIdFromUrl) ?? null;
    }

    return null;
  }, [product, productId, variantIdFromUrl]);

  const hasVariants = (product?.variants.length ?? 0) > 0;
  const missingCheckoutParams =
    isReady &&
    (quantityFromUrl === null ||
      (hasVariants && !variantIdFromUrl) ||
      (hasVariants && !selectedVariant));

  useEffect(() => {
    if (missingCheckoutParams) {
      router.replace(`/user/products/${productId}`);
    }
  }, [missingCheckoutParams, productId, router]);

  if (isLoading && !isReady) {
    return <CenteredLoading message="Loading checkout…" />;
  }

  if (loadFailed || !isReady) {
    return (
      <GlassMessagePanel
        variant="flat"
        title="Product Not Found"
        description={detailError ?? "This item may have been removed or the link is invalid."}
        action={{ href: "/user/products", label: "Back To Products" }}
      />
    );
  }

  if (missingCheckoutParams) {
    return <CenteredLoading message="Returning to product…" />;
  }

  const checkoutReturnPath = `/user/checkout/${productId}?${searchParams.toString()}`;
  const loginHref = buildLoginRedirectPath(checkoutReturnPath);
  const productHref = `/user/products/${productId}`;

  if (!authInitialized) {
    return <CenteredLoading message="Checking your session…" />;
  }

  if (!isAuthenticated) {
    return (
      <AuthRequiredPage
        title="Sign In Required"
        description="Sign in to complete your order. Your size and quantity selection will be kept."
        action={{ href: loginHref, label: "Sign In" }}
        layout="centered"
      />
    );
  }

  const quantity = quantityFromUrl!;
  const thumbnailSrc = getProductThumbnailSrc(product);
  const unitPrice = getVariantUnitPrice(selectedVariant ?? undefined, product.price);
  const maxQuantity = hasVariants
    ? Math.max(selectedVariant?.stock ?? 0, 0)
    : Math.max(product.total_stock, 0);
  const isOutOfStock = hasVariants
    ? !selectedVariant || selectedVariant.stock <= 0
    : product.total_stock <= 0;
  const quantityExceedsStock = quantity > maxQuantity;
  const subtotal = unitPrice * quantity;
  const total = subtotal + shippingFee;

  const updatePrimaryField = (field: keyof CheckoutDeliveryFormState, value: string) => {
    setPrimaryForm((current) => {
      const next = { ...current, [field]: value };
      primaryFormRef.current = next;
      return next;
    });
    setFormError(null);
  };

  const updateAlternateField = (field: keyof CheckoutDeliveryFormState, value: string) => {
    setAlternateForm((current) => {
      const next = { ...current, [field]: value };
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

  const handlePlaceOrder = async () => {
    const deliveryPayload = usingAlternateAddress ? alternateForm : primaryForm;
    const deliveryError = validateCheckoutDeliveryForm(deliveryPayload);
    if (deliveryError) {
      setFormError(deliveryError);
      toast.error(deliveryError);
      return;
    }

    if (isOutOfStock || quantityExceedsStock) {
      const message = quantityExceedsStock
        ? "Selected quantity is no longer available."
        : "This item is out of stock.";
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
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
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

  const isPlacingOrder = placeOrderStatus === "loading";
  const needsPaymentProof = paymentMethod === "non-cod" && !paymentProofDataUrl;
  const checkoutButtonLabel =
    paymentMethod === "cod" ? "Checkout Now (COD)" : "Complete Checkout";

  const orderVariantLabel = selectedVariant ? formatVariantLabel(selectedVariant) : "";
  const handleOrderPlacedDialogChange = (open: boolean) => {
    if (!open) {
      setOrderPlaced(false);
      setPlacedOrder(null);
      router.push("/user/products");
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1" />
            <ol className="flex items-center gap-2 text-xs font-medium text-black/45">
              <li>
                <Link href="/user/products" className="hover:text-black">
                  Products
                </Link>
              </li>
              <li aria-hidden className="text-black/25">
                /
              </li>
              <li>
                <Link href={productHref} className="hover:text-black">
                  Product
                </Link>
              </li>
              <li aria-hidden className="text-black/25">
                /
              </li>
              <li className="text-black">Checkout</li>
            </ol>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
            <div className={cn(glassPanelFlatClassName, "p-5 sm:p-6")}>
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
                description="Item shipped to your address"
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

            <CheckoutBuyNowSummary
              product={product}
              thumbnailSrc={thumbnailSrc}
              quantity={quantity}
              selectedVariant={selectedVariant}
              unitPrice={unitPrice}
              subtotal={subtotal}
              shippingFee={shippingFee}
              total={total}
              shippingFeeLoading={
                shippingFeeStatus === "loading" && shippingFeeFromStore === null
              }
              checkoutButtonLabel={checkoutButtonLabel}
              isPlacingOrder={isPlacingOrder}
              onPlaceOrder={() => void handlePlaceOrder()}
              placeOrderDisabled={
                isPlacingOrder ||
                isOutOfStock ||
                quantityExceedsStock ||
                needsPaymentProof
              }
              productHref={productHref}
            />
          </div>
        </div>
      </DashboardGlassSection>

      <CheckoutOrderPlacedDialog
        open={orderPlaced}
        onOpenChange={handleOrderPlacedDialogChange}
        order={placedOrder}
        productTitle={product.title}
        variantLabel={orderVariantLabel}
      />

      <CheckoutImagePreviewDialog
        open={imagePreviewOpen}
        imageSrc={imagePreviewSrc}
        imageAlt={imagePreviewAlt}
        onOpenChange={(open) => {
          setImagePreviewOpen(open);
          if (!open) {
            setImagePreviewSrc(null);
          }
        }}
      />
    </div>
  );
}
