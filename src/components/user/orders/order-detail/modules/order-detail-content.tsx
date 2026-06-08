"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Banknote, FileText, MapPin, Package, Truck } from "lucide-react";
import { CheckoutImagePreviewDialog } from "@/components/user/checkout/modules/checkout-image-preview-dialog";
import { GlassHighlightCallout } from "@/components/common/feedback/glass-highlight-callout";
import { OrderProductImages } from "@/components/user/orders/order-detail/modules/order-product-images";
import { getProductThumbnailSrc } from "@/lib/product-image";
import { glassMediaFlatClassName, glassPanelFlatClassName } from "@/lib/glass-styles";
import { CancelOrderButton } from "@/components/user/orders/modules/cancel-order-button";
import { PaymentProofPreview } from "@/components/common/orders/payment-proof-dialog";
import { OrderReceiptDialog } from "@/components/user/orders/modules/order-receipt-dialog";
import {
  formatDeliveryAddress,
  formatDeliverySource,
  formatMoney,
  formatOrderDateTime,
  formatOrderDeliveredAt,
  formatOrderNumber,
  formatOrderStatus,
  formatPaymentMethod,
  type OrderReceiptItemLabel,
} from "@/lib/order-display";
import { formatVariantLabel } from "@/lib/product-variants";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";
import type { ApiProduct } from "@/types/product";

type OrderDetailContentProps = {
  order: ApiOrder;
  orderProducts?: Record<string, ApiProduct>;
};

function DetailSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(glassPanelFlatClassName, "space-y-4 p-5 sm:p-6", className)}>
      <h2 className="text-sm font-semibold text-black">{title}</h2>
      {children}
    </section>
  );
}

function buildReceiptItemLabels(
  order: ApiOrder,
  orderProducts: Record<string, ApiProduct>,
): Record<string, OrderReceiptItemLabel> {
  const labels: Record<string, OrderReceiptItemLabel> = {};
  for (const item of order.items) {
    const productId = item.product_id ?? "";
    const product = productId ? orderProducts[productId] : undefined;
    const variant =
      item.variant_id && product
        ? product.variants.find((entry) => entry.id === item.variant_id)
        : undefined;
    labels[item.id] = {
      title:
        product?.title ??
        item.product_title?.trim() ??
        (productId ? "Product" : "Order Item"),
      size: variant?.size,
      color: variant?.color_name,
      variantLabel:
        !variant && item.variant_label?.trim()
          ? item.variant_label.trim()
          : undefined,
    };
  }
  return labels;
}

export function OrderDetailContent({
  order: initialOrder,
  orderProducts = {},
}: OrderDetailContentProps) {
  const [order, setOrder] = useState(initialOrder);

  useEffect(() => {
    setOrder(initialOrder);
  }, [initialOrder]);

  const receiptItemLabels = useMemo(
    () => buildReceiptItemLabels(order, orderProducts),
    [order, orderProducts],
  );

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState<string | null>(null);
  const [imagePreviewAlt, setImagePreviewAlt] = useState("Product Image Preview");

  const status = formatOrderStatus(order.status);
  const deliveredAtLabel = formatOrderDeliveredAt(order.delivered_at);
  const fullAddress = [
    order.delivery_address_line,
    order.delivery_city,
    order.delivery_region,
    order.delivery_postal_code,
    order.delivery_country,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");

  const openImagePreview = (src: string, alt = "Product Image Preview") => {
    setImagePreviewSrc(src);
    setImagePreviewAlt(alt);
    setImagePreviewOpen(true);
  };

  const handleImagePreviewChange = (open: boolean) => {
    setImagePreviewOpen(open);
    if (!open) {
      setImagePreviewSrc(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Order Details
            </p>
            <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              {formatOrderNumber(order.order_number)}
            </h1>
            <p className="text-sm text-black/55">
              Placed {formatOrderDateTime(order.created_at)}
            </p>
          </div>
          <div className="flex w-full flex-row flex-wrap items-center justify-end gap-2 sm:w-auto">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset",
                status.className,
              )}
            >
              {status.label}
            </span>
            <button
              type="button"
              onClick={() => setReceiptOpen(true)}
              aria-label="View Receipt"
              className="inline-flex size-10 shrink-0 items-center justify-center text-black transition-colors hover:bg-white"
            >
              <FileText className="size-4 text-black/50" aria-hidden />
            </button>
          </div>
        </div>

        {order.status === "rejected" && order.rejection_reason ? (
          <p className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-black/75">
            <span className="font-medium text-black">Rejection Reason: </span>
            {order.rejection_reason}
          </p>
        ) : null}

        {deliveredAtLabel ? (
          <p className="text-sm text-black/60">
            Delivered on{" "}
            <span className="font-medium text-black">{deliveredAtLabel}</span>
          </p>
        ) : order.expected_delivery_date ? (
          <p className="text-sm text-black/60">
            Expected delivery:{" "}
            <span className="font-medium text-black">
              {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
                new Date(order.expected_delivery_date),
              )}
            </span>
          </p>
        ) : null}

        <GlassHighlightCallout
          icon={<Truck className="size-4" aria-hidden />}
          title="Delivery"
          description={formatDeliveryAddress(order)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <DetailSection title="Items">
              <ul className="space-y-3">
                {order.items.map((item) => {
                  const productId = item.product_id ?? "";
                  const product = productId ? orderProducts[productId] : undefined;
                  const thumbnailSrc = product ? getProductThumbnailSrc(product) : null;
                  const variant =
                    item.variant_id && product
                      ? product.variants.find((entry) => entry.id === item.variant_id)
                      : undefined;
                  const variantLabel = variant ? formatVariantLabel(variant) : null;

                  return (
                    <li
                      key={item.id}
                      className="space-y-3 rounded-xl bg-black/[0.03] px-4 py-3.5"
                    >
                      <div className="flex gap-3">
                        <div
                          className={cn(
                            glassMediaFlatClassName,
                            "size-14 shrink-0 overflow-hidden",
                          )}
                        >
                          {thumbnailSrc ? (
                            <button
                              type="button"
                              onClick={() =>
                                openImagePreview(
                                  thumbnailSrc,
                                  `${product?.title ?? "Product"} image`,
                                )
                              }
                              className="size-full cursor-zoom-in transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
                              aria-label={`View Larger Image Of ${product?.title ?? "product"}`}
                            >
                              <img
                                src={thumbnailSrc}
                                alt={product?.title ?? ""}
                                className="size-full object-cover"
                              />
                            </button>
                          ) : (
                            <span className="flex size-full items-center justify-center text-black/30">
                              <Package className="size-5" aria-hidden />
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="font-medium text-black">
                            {product?.title ??
                              item.product_title?.trim() ??
                              (productId ? "Product" : "Order Item")}
                          </p>
                          {item.product_code ? (
                            <p className="font-mono text-xs text-black/45">
                              {item.product_code}
                            </p>
                          ) : product?.product_code ? (
                            <p className="font-mono text-xs text-black/45">
                              {product.product_code}
                            </p>
                          ) : null}
                          {productId && product ? (
                            <Link
                              href={`/user/products/${productId}`}
                              className="text-xs text-black/50 underline-offset-2 hover:text-black hover:underline"
                            >
                              Buy again
                            </Link>
                          ) : null}
                          {variantLabel || item.variant_label ? (
                            <p className="text-xs text-black/60">
                              {variantLabel ?? item.variant_label}
                            </p>
                          ) : null}
                          <p className="text-xs text-black/50">Qty {item.quantity}</p>
                        </div>

                        <div className="text-right text-sm">
                          <p className="font-semibold text-black">
                            {formatMoney(item.line_total)}
                          </p>
                          <p className="text-xs text-black/45">
                            {formatMoney(item.unit_price)} each
                          </p>
                        </div>
                      </div>

                      {product ? (
                        <OrderProductImages
                          product={product}
                          onImagePreview={openImagePreview}
                          className="border-t border-black/6 pt-3"
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </DetailSection>
          </div>

          <div className="space-y-6">
            <DetailSection title="Delivery Information">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-xs font-medium text-black/45">Source</dt>
                  <dd className="mt-0.5 text-black">
                    {formatDeliverySource(order.delivery_source)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Email</dt>
                  <dd className="mt-0.5 text-black">{order.delivery_email}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Phone</dt>
                  <dd className="mt-0.5 text-black">{order.delivery_phone}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-black/45">Address</dt>
                  <dd className="mt-0.5 flex gap-2 text-black/80">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-black/35" aria-hidden />
                    <span>{fullAddress || "—"}</span>
                  </dd>
                </div>
              </dl>
            </DetailSection>

            <DetailSection title="Payment">
              <GlassHighlightCallout
                className="mb-0"
                icon={<Banknote className="size-4" aria-hidden />}
                title={formatPaymentMethod(order.payment.payment_method)}
                description={
                  order.payment.has_receipt
                    ? "Payment Receipt Uploaded"
                    : order.payment.payment_method === "cod"
                      ? "Pay when your order arrives"
                      : "Receipt required for prepaid orders"
                }
              />
              {order.payment.payment_receipt_uploaded_at ? (
                <p className="text-xs text-black/50">
                  Receipt uploaded{" "}
                  {formatOrderDateTime(order.payment.payment_receipt_uploaded_at)}
                </p>
              ) : null}
              {order.payment.has_receipt ? (
                <PaymentProofPreview orderId={order.id} scope="user" className="mt-3" />
              ) : null}
            </DetailSection>

            <DetailSection title="Order Total">
              <dl className="space-y-2.5 text-sm">
                <div className="flex justify-between text-black/60">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-black">{formatMoney(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-black/60">
                  <dt>Shipping</dt>
                  <dd className="font-medium text-black">{formatMoney(order.shipping_fee)}</dd>
                </div>
                <div className="flex justify-between border-t border-black/8 pt-3 text-base">
                  <dt className="font-semibold text-black">Total</dt>
                  <dd className="font-semibold text-black">{formatMoney(order.total)}</dd>
                </div>
              </dl>

              <CancelOrderButton
              order={order}
              onCancelled={setOrder}
              className="sm:min-w-[10rem]"
            />

            </DetailSection>
          </div>
        </div>
      </div>

      <OrderReceiptDialog
        order={order}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        itemLabels={receiptItemLabels}
      />

      <CheckoutImagePreviewDialog
        open={imagePreviewOpen}
        imageSrc={imagePreviewSrc}
        imageAlt={imagePreviewAlt}
        onOpenChange={handleImagePreviewChange}
      />
    </>
  );
}
