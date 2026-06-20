"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Loader2Icon, Minus, Plus, ShoppingCart } from "lucide-react";
import { CheckoutVariantPicker } from "@/components/user/checkout/modules/checkout-variant-picker";
import { CheckoutImagePreviewDialog } from "@/components/user/checkout/modules/checkout-image-preview-dialog";
import {
  CenteredLoading,
} from "@/components/common/feedback/page-state-gate";
import { GlassMessagePanel } from "@/components/common/feedback/glass-message-panel";
import { useToast } from "@/components/common/feedback/toast-provider";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { usePurchaseAuth } from "@/hooks/use-purchase-auth";
import {
  formatProductDetails,
  getProductThumbnailSrc,
  imagesByRole,
} from "@/lib/product-image";
import { toImagePreviewSrc } from "@/lib/read-image-base64";
import {
  findVariant,
  formatVariantLabel,
  getColorOptionsForSize,
  getVariantUnitPrice,
} from "@/lib/product-variants";
import { getStorefrontCatalogHref } from "@/lib/storefront-categories";
import {
  glassMediaFlatClassName,
  glassPanelFlatClassName,
  glassQuantityButtonClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";
import { addCartItem } from "@/store/slices/cartSlice";
import {
  clearProductDetail,
  fetchReleasedProduct,
  selectProductDetail,
  selectProductDetailError,
  selectProductDetailStatus,
} from "@/store/slices/productSlice";
import { selectIsAuthenticated } from "@/store/slices/authSlice";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { ProductDetailYouMayAlsoLike } from "@/components/user/products/product-detail-view/modules/product-detail-you-may-also-like";
import type { ApiProductImage } from "@/types/product";

function ProductDetailImageTile({
  image,
  alt,
  onPreview,
  className,
}: {
  image: ApiProductImage | undefined;
  alt: string;
  onPreview: (src: string, alt: string) => void;
  className?: string;
}) {
  const tileClassName = cn(
    "aspect-square overflow-hidden rounded-lg border border-black/10 bg-white/50",
    className,
  );

  if (!image?.image_base64) {
    return <div className={cn(tileClassName, "bg-white/30")} aria-hidden />;
  }

  const src = toImagePreviewSrc(image.image_base64);

  return (
    <button
      type="button"
      onClick={() => onPreview(src, alt)}
      className={cn(
        tileClassName,
        "cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40",
      )}
      aria-label={`View Larger Image — ${alt}`}
    >
      <img src={src} alt={alt} className="size-full object-cover" />
    </button>
  );
}

type ProductDetailViewProps = {
  params: Promise<{ id: string }>;
};

function buildCheckoutHref(
  productId: string,
  quantity: number,
  variantId?: string,
): string {
  const search = new URLSearchParams({ quantity: String(quantity) });
  if (variantId) {
    search.set("variantId", variantId);
  }
  return `/checkout/${productId}?${search.toString()}`;
}

export function ProductDetailView({ params }: ProductDetailViewProps) {
  const { id: productId } = use(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const product = useAppSelector(selectProductDetail);
  const detailStatus = useAppSelector(selectProductDetailStatus);
  const detailError = useAppSelector(selectProductDetailError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const catalogHref = getStorefrontCatalogHref(isAuthenticated);
  const { requireAuth } = usePurchaseAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);
  const [imagePreviewAlt, setImagePreviewAlt] = useState("Product Image Preview");

  useEffect(() => {
    void dispatch(fetchReleasedProduct(productId));
    return () => {
      dispatch(clearProductDetail());
    };
  }, [dispatch, productId]);

  useEffect(() => {
    if (!product || product.id !== productId) {
      return;
    }

    if (product.variants.length === 0) {
      setSelectedSize(null);
      setSelectedColorId(null);
      return;
    }

    const firstInStock =
      product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
    setSelectedSize(firstInStock.size);
    setSelectedColorId(firstInStock.color_id);
    setQuantity(1);
    setVariantError(null);
  }, [product, productId]);

  useEffect(() => {
    if (!product || product.id !== productId) {
      return;
    }

    const hasVariants = product.variants.length > 0;
    const variant = findVariant(product.variants, selectedSize, selectedColorId);
    const maxQty = hasVariants
      ? Math.max(variant?.stock ?? 0, 0)
      : Math.max(product.total_stock, 0);

    if (maxQty > 0 && quantity > maxQty) {
      setQuantity(maxQty);
    }
  }, [product, productId, selectedSize, selectedColorId, quantity]);

  const isLoading = detailStatus === "loading" || (detailStatus === "idle" && !product);
  const isReady = product?.id === productId;
  const loadFailed = detailStatus === "failed";

  if (isLoading && !isReady) {
    return <CenteredLoading message="Loading product…" />;
  }

  if (loadFailed || !isReady) {
    return (
      <GlassMessagePanel
        variant="flat"
        title="Product Not Found"
        description={detailError ?? "This item may have been removed or the link is invalid."}
        action={{ href: catalogHref, label: "Back To Shop" }}
      />
    );
  }

  const thumbnailSrc = getProductThumbnailSrc(product);
  const hasVariants = product.variants.length > 0;
  const selectedVariant = findVariant(
    product.variants,
    selectedSize,
    selectedColorId,
  );
  const unitPrice = getVariantUnitPrice(selectedVariant, product.price);
  const maxQuantity = hasVariants
    ? Math.max(selectedVariant?.stock ?? 0, 0)
    : Math.max(product.total_stock, 0);
  const isOutOfStock = hasVariants
    ? !selectedVariant || selectedVariant.stock <= 0
    : product.total_stock <= 0;
  const needsVariantSelection =
    hasVariants && (!selectedSize || !selectedColorId || !selectedVariant);
  const specLines = formatProductDetails(product.details);

  const validateVariantSelection = (): boolean => {
    if (!hasVariants) {
      return true;
    }

    if (needsVariantSelection || !selectedVariant) {
      setVariantError("Please select a size and color.");
      return false;
    }

    if (selectedVariant.stock <= 0) {
      setVariantError("This size and color is out of stock.");
      return false;
    }

    setVariantError(null);
    return true;
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    setVariantError(null);

    const colors = getColorOptionsForSize(product.variants, size);
    const nextColor =
      colors.find((color) => color.color_id === selectedColorId && color.stock > 0) ??
      colors.find((color) => color.stock > 0) ??
      colors[0];

    setSelectedColorId(nextColor?.color_id ?? null);
    setQuantity(1);
  };

  const handleColorChange = (colorId: string) => {
    setSelectedColorId(colorId);
    setVariantError(null);
    setQuantity(1);
  };

  const handleBuyItNow = () => {
    if (!validateVariantSelection() || isOutOfStock) {
      return;
    }

    const checkoutHref = buildCheckoutHref(
      product.id,
      quantity,
      selectedVariant?.id,
    );

    if (!requireAuth(checkoutHref)) {
      return;
    }

    router.push(checkoutHref);
  };

  const handleAddToCart = async () => {
    if (!validateVariantSelection() || isOutOfStock) {
      return;
    }

    if (!requireAuth(`/products/${productId}`)) {
      return;
    }

    setAddingToCart(true);
    const result = await dispatch(
      addCartItem({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      }),
    );
    setAddingToCart(false);

    if (addCartItem.fulfilled.match(result)) {
      toast.success(`${quantity} × ${product.title} added to cart.`);
      return;
    }

    const message =
      typeof result.payload === "string"
        ? result.payload
        : "Could not add item to cart.";
    toast.error(message);
  };

  const openImagePreview = (src: string, alt: string) => {
    setImagePreviewSrc(src);
    setImagePreviewAlt(alt);
    setImagePreviewOpen(true);
  };

  const handlePlaceholderImageClick = (image: ApiProductImage, alt: string) => {
    openImagePreview(toImagePreviewSrc(image.image_base64), `${product.title} — ${alt}`);
  };

  const handleImagePreviewChange = (open: boolean) => {
    setImagePreviewOpen(open);
    if (!open) {
      setImagePreviewSrc(null);
    }
  };

  const placeholderImage = imagesByRole(product.images, "placeholder")[0];
  const modelImage = imagesByRole(product.images, "model")[0];
  const sizingImages = imagesByRole(product.images, "sizing");

  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-6xl px-6 py-8 lg:px-12 lg:py-10">
          <ol className="mb-8 flex items-center gap-2 text-xs font-medium text-black/45">
            <li>
              <Link href={catalogHref} className="hover:text-black">
                Products
              </Link>
            </li>
            <li aria-hidden className="text-black/25">
              /
            </li>
            <li className="max-w-[12rem] truncate text-black sm:max-w-xs">
              {product.title}
            </li>
          </ol>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-10">
            <div className={cn(glassPanelFlatClassName, "p-5 sm:p-6")}>
              <div
                className={cn(
                  glassMediaFlatClassName,
                  "aspect-square w-full overflow-hidden rounded-xl",
                )}
              >
                {thumbnailSrc ? (
                  <button
                    type="button"
                    onClick={() =>
                      openImagePreview(thumbnailSrc, `${product.title} product image`)
                    }
                    className="size-full cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
                    aria-label={`View Larger Image Of ${product.title}`}
                  >
                    <img
                      src={thumbnailSrc}
                      alt={product.title}
                      className="size-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex size-full items-center justify-center bg-white/40 text-4xl font-semibold text-black/30">
                    {product.title.slice(0, 1)}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <ProductDetailImageTile
                  image={placeholderImage}
                  alt="Product View 1"
                  onPreview={openImagePreview}
                />
                <ProductDetailImageTile
                  image={modelImage}
                  alt="Product View 2"
                  onPreview={openImagePreview}
                />
              </div>

              <div className="mt-3">
                {sizingImages.length > 0 ? (
                  <div className="space-y-2">
                    {sizingImages.map((image) => {
                      const src = toImagePreviewSrc(image.image_base64);
                      return (
                        <button
                          key={image.id}
                          type="button"
                          onClick={() =>
                            handlePlaceholderImageClick(image, "Size Chart")
                          }
                          className="block w-full cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-white/50 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
                          aria-label="View Size Chart"
                        >
                          <img
                            src={src}
                            alt="Size Chart"
                            className="w-full object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="min-h-32 w-full rounded-lg border border-black/10 bg-white/30"
                    aria-hidden
                  />
                )}
              </div>
            </div>

            <div className={cn(glassPanelFlatClassName, "p-5 sm:p-6")}>
              <div className="space-y-1">
                <p className="text-xs text-black/45">
                  {product.category_name ?? "Uncategorized"}
                </p>
                <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
                  {product.title}
                </h1>
                <p className="text-lg font-semibold tabular-nums text-black">
                  PHP{" "}
                  {unitPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              {product.description ? (
                <p className="mt-4 text-sm leading-relaxed text-black/65">
                  {product.description}
                </p>
              ) : null}

              {specLines.length > 0 ? (
                <ul className="mt-4 list-disc space-y-1 pl-4 text-sm text-black/65">
                  {specLines.map((line, index) => (
                    <li key={`detail-${index}`}>{line}</li>
                  ))}
                </ul>
              ) : null}

              {isOutOfStock ? (
                <p className="mt-4 text-sm font-medium text-red-600">Out Of Stock</p>
              ) : null}

              <CheckoutVariantPicker
                variants={product.variants}
                selectedSize={selectedSize}
                selectedColorId={selectedColorId}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
              />

              {variantError ? (
                <p className="mt-3 text-sm text-red-600" role="alert">
                  {variantError}
                </p>
              ) : null}

              {selectedVariant ? (
                <p className="mt-3 text-xs text-black/45">
                  Selected: {formatVariantLabel(selectedVariant)}
                </p>
              ) : null}

              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm font-medium text-black/70">Quantity</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    disabled={quantity <= 1 || isOutOfStock || needsVariantSelection}
                    aria-label="Decrease Quantity"
                    className={cn(glassQuantityButtonClassName, "size-9")}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((current) => Math.min(maxQuantity, current + 1))
                    }
                    disabled={
                      quantity >= maxQuantity || isOutOfStock || needsVariantSelection
                    }
                    aria-label="Increase Quantity"
                    className={cn(glassQuantityButtonClassName, "size-9")}
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleBuyItNow}
                  disabled={isOutOfStock || needsVariantSelection}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white transition-all hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/30"
                >
                  Buy it now
                </button>
                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  disabled={isOutOfStock || needsVariantSelection || addingToCart}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-white/60 text-sm font-medium text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {addingToCart ? (
                    <Loader2Icon className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <ShoppingCart className="size-4" aria-hidden />
                  )}
                  Add To Cart
                </button>
              </div>

              <Link
                href={catalogHref}
                className="mt-6 inline-flex text-sm text-black/55 transition-colors hover:text-black"
              >
                ← Back To Products
              </Link>
            </div>
          </div>

          <ProductDetailYouMayAlsoLike
            currentProductId={product.id}
            categoryId={product.category_id}
            categoryName={product.category_name}
          />

          <EmailSubscribeSection className="mt-10" />
        </div>
      </DashboardGlassSection>

      <CheckoutImagePreviewDialog
        open={imagePreviewOpen}
        imageSrc={imagePreviewSrc ?? thumbnailSrc}
        imageAlt={imagePreviewAlt}
        onOpenChange={handleImagePreviewChange}
      />
    </div>
  );
}
