"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Check, ChevronRight, Copy, FileText } from "lucide-react";
import { OrderReceiptDialog } from "@/components/common/orders/order-receipt-dialog";
import {
  formatDeliveryAddress,
  formatOrderDate,
  formatOrderItemCount,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
} from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";

type OrderCardProps = {
  order: ApiOrder;
  className?: string;
};

export function OrderCard({ order, className }: OrderCardProps) {
  const [copied, setCopied] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const status = formatOrderStatus(order.status);
  const address = formatDeliveryAddress(order);
  const detailHref = `/user/orders/${order.id}`;

  const handleCopyAddress = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <Link
        href={detailHref}
        className={cn(
          "group block rounded-xl border border-white/50 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all",
          "hover:border-white/70 hover:bg-white/55 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="font-semibold text-black">{formatOrderNumber(order.order_number)}</p>
            <p className="text-sm text-black/70">
              {formatOrderItemCount(order)} · {formatOrderTotal(order)}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              status.className,
            )}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1.5 text-sm text-black/60">
          <Calendar className="size-3.5 shrink-0 text-black/35" aria-hidden />
          <span>{formatOrderDate(order.created_at)}</span>
        </div>

        <div className="mt-2 flex min-w-0 items-start gap-1.5 text-sm text-black/70">
          <p className="min-w-0 flex-1 leading-snug">{address}</p>
          <button
            type="button"
            onClick={(event) => void handleCopyAddress(event)}
            className={cn(
              "shrink-0 rounded-md p-1 text-black/35 transition-colors",
              "hover:bg-black/[0.04] hover:text-black/60",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black/25",
            )}
            aria-label={copied ? "Address Copied" : "Copy Address"}
          >
            {copied ? (
              <Check className="size-3.5 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="size-3.5" aria-hidden />
            )}
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-black/6 pt-3">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setReceiptOpen(true);
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-black/55 ring-1 ring-black/10",
              "transition-colors hover:bg-black/[0.04] hover:text-black",
            )}
            aria-label="View Receipt"
          >
            <FileText className="size-3.5" aria-hidden />
            Receipt
          </button>

          <span className="inline-flex items-center gap-1 text-xs font-medium text-black/45 transition-colors group-hover:text-black/70">
            View details
            <ChevronRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>

      <OrderReceiptDialog
        order={order}
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
      />
    </>
  );
}
