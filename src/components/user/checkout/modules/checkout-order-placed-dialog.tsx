"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CancelOrderButton } from "@/components/user/orders/modules/cancel-order-button";
import { OrderReceiptSummary } from "@/components/common/orders/order-receipt-summary";
import {
  buildOrderReceiptLineItems,
  type OrderReceiptItemLabel,
} from "@/lib/order-display";
import type { ApiOrder } from "@/types/order";

type CheckoutOrderPlacedDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ApiOrder | null;
  productTitle?: string;
  variantLabel?: string;
  itemLabels?: Record<string, OrderReceiptItemLabel>;
};

export function CheckoutOrderPlacedDialog({
  open,
  onOpenChange,
  order,
  productTitle = "",
  variantLabel = "",
  itemLabels: itemLabelsProp,
}: CheckoutOrderPlacedDialogProps) {
  const [displayOrder, setDisplayOrder] = useState<ApiOrder | null>(order);

  const activeOrder = displayOrder ?? order;

  const itemLabels = useMemo(() => {
    if (itemLabelsProp) {
      return itemLabelsProp;
    }
    if (!activeOrder?.items[0]?.product_id) {
      return {};
    }
    const productId = activeOrder.items[0].product_id;
    return {
      [productId]: {
        title: productTitle,
        variantLabel: variantLabel.trim() || undefined,
      },
    };
  }, [activeOrder, itemLabelsProp, productTitle, variantLabel]);

  const lineItems = useMemo(
    () => (activeOrder ? buildOrderReceiptLineItems(activeOrder, itemLabels) : []),
    [activeOrder, itemLabels],
  );

  const handleOpenChange = (next: boolean) => {
    if (next && order) {
      setDisplayOrder(order);
    }
    if (!next) {
      setDisplayOrder(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[92vh] gap-0 overflow-y-auto border-black/10 bg-white p-0 shadow-[0_24px_80px_rgba(0,0,0,0.14)] ring-black/8 sm:max-w-[520px]"
      >
        <div className="relative border-b border-black/8 bg-gradient-to-b from-neutral-50 to-white px-6 pt-8 pb-6 text-center">
          <div
            className="pointer-events-none absolute -top-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-black/[0.03] blur-2xl"
            aria-hidden
          />

          <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-black text-white shadow-[0_4px_20px_rgba(0,0,0,0.12)]">
            <Check className="size-6" strokeWidth={2.5} aria-hidden />
          </div>

          <DialogHeader className="relative items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-black/40">
              DeepSky
            </p>
            <DialogTitle className="font-serif text-[1.65rem] leading-tight font-medium text-black">
              Order Details
            </DialogTitle>
            <DialogDescription className="max-w-[22rem] text-center text-sm leading-relaxed text-black/55">
              Your receipt is below. A copy was sent to your email. You can cancel
              anytime before admin approval.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="space-y-4 px-6 py-5">
          {activeOrder ? (
            <OrderReceiptSummary
              order={activeOrder}
              lineItems={lineItems}
              compact
            />
          ) : null}

          {activeOrder ? (
            <CancelOrderButton
              order={activeOrder}
              onCancelled={(updated) => setDisplayOrder(updated)}
            />
          ) : null}

          <div className="flex flex-col gap-2 border-t border-black/8 pt-4">
            <Link
              href="/orders"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-md bg-black text-sm font-medium text-white transition-colors hover:bg-black/90"
            >
              View my orders
            </Link>
            <Link
              href="/products"
              className="flex h-11 w-full cursor-pointer items-center justify-center rounded-md border border-black/15 bg-white text-sm font-medium text-black transition-colors hover:bg-neutral-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
