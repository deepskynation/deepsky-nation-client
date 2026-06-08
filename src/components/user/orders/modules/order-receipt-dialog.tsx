"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderReceiptSummary } from "@/components/user/orders/modules/order-receipt-summary";
import { apiUrl } from "@/lib/api-config";
import {
  buildOrderReceiptLineItems,
  type OrderReceiptItemLabel,
} from "@/lib/order-display";
import type { ApiOrder } from "@/types/order";
import type { ApiProduct } from "@/types/product";

type OrderReceiptDialogProps = {
  order: ApiOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional labels when product catalog is already loaded (e.g. checkout). */
  itemLabels?: Record<string, OrderReceiptItemLabel>;
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

function variantPartsFromProduct(
  product: ApiProduct,
  variantId: string | null,
): Pick<OrderReceiptItemLabel, "size" | "color"> {
  if (!variantId) {
    return {};
  }
  const variant = product.variants.find((entry) => entry.id === variantId);
  if (!variant) {
    return {};
  }
  return {
    size: variant.size,
    color: variant.color_name,
  };
}

export function OrderReceiptDialog({
  order,
  open,
  onOpenChange,
  itemLabels,
}: OrderReceiptDialogProps) {
  const [resolvedLabels, setResolvedLabels] = useState<
    Record<string, OrderReceiptItemLabel>
  >(itemLabels ?? {});

  useEffect(() => {
    if (itemLabels) {
      setResolvedLabels(itemLabels);
    }
  }, [itemLabels]);

  useEffect(() => {
    if (!open || !order || itemLabels) {
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
          const item = order.items.find((row) => row.product_id === productId);
          if (!product) {
            return [
              productId,
              {
                title: item?.product_title?.trim() || "Product",
                variantLabel: item?.variant_label?.trim() || undefined,
              },
            ] as const;
          }
          const variantParts = item
            ? variantPartsFromProduct(product, item.variant_id)
            : {};
          return [
            productId,
            {
              title: product.title,
              size: variantParts.size,
              color: variantParts.color,
              variantLabel:
                !variantParts.size && !variantParts.color
                  ? item?.variant_label?.trim() || undefined
                  : undefined,
            },
          ] as const;
        }),
      );

      if (cancelled) {
        return;
      }

      setResolvedLabels(Object.fromEntries(entries));
    })();

    return () => {
      cancelled = true;
    };
  }, [open, order, itemLabels]);

  const lineItems = useMemo(
    () => (order ? buildOrderReceiptLineItems(order, resolvedLabels) : []),
    [order, resolvedLabels],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] gap-0 overflow-y-auto border-black/10 bg-white p-0 sm:max-w-[480px]"
      >
        <DialogHeader className="border-b border-black/8 px-6 pt-6 pb-4 text-left">
          <DialogTitle className="font-serif text-xl text-black">
            Order Receipt
          </DialogTitle>
          <DialogDescription className="text-sm text-black/55">
            Save or print this summary anytime from your order history.
          </DialogDescription>
        </DialogHeader>

        {order ? (
          <div className="px-6 py-5">
            <OrderReceiptSummary order={order} lineItems={lineItems} />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
