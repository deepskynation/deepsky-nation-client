"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Copy, Check, ChevronRight, FileText } from "lucide-react";
import { OrderReceiptDialog } from "@/components/common/orders/order-receipt-dialog";
import type { ApiOrder } from "@/types/order";
import {
  formatDeliveryAddress,
  formatOrderDate,
  formatOrderItemCount,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
  ORDERS_TABLE_GRID_CLASS,
} from "@/lib/order-display";
import { cn } from "@/lib/utils";

type OrdersTableRowProps = {
  order: ApiOrder;
  userName: string;
  userAvatarUrl?: string | null;
  className?: string;
};

export function OrdersTableRow({
  order,
  userName: _userName,
  userAvatarUrl: _userAvatarUrl,
  className,
}: OrdersTableRowProps) {
  const [copied, setCopied] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const status = formatOrderStatus(order.status);
  const address = formatDeliveryAddress(order);

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

  const detailHref = `/orders/${order.id}`;

  return (
    <>
      <Link
        href={detailHref}
        role="row"
        className={cn(
          "group",
          ORDERS_TABLE_GRID_CLASS,
          "rounded-xl bg-black/[0.03] px-4 py-3.5 text-sm transition-all",
          "hover:bg-white hover:shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:ring-1 hover:ring-black/6",
          "cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/30",
          className,
        )}
      >
        <div role="cell" className="min-w-0 font-semibold text-black">
          {formatOrderNumber(order.order_number)}
        </div>

        <div role="cell" className="min-w-0 truncate text-black/75">
          {formatOrderItemCount(order)}
        </div>

        <div role="cell" className="min-w-0 font-medium tabular-nums text-black">
          {formatOrderTotal(order)}
        </div>

        <div role="cell" className="group/address flex min-w-0 items-center gap-1.5">
          <span className="truncate text-black/70">{address}</span>
          <button
            type="button"
            onClick={(event) => void handleCopyAddress(event)}
            className={cn(
              "shrink-0 rounded-md p-1 text-black/35 opacity-0 transition-opacity",
              "hover:bg-black/[0.04] hover:text-black/60",
              "group-hover/address:opacity-100 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-black/25",
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

        <div
          role="cell"
          className="flex min-w-0 items-center gap-1.5 text-black/60"
        >
          <Calendar className="size-3.5 shrink-0 text-black/35" aria-hidden />
          <span className="truncate">{formatOrderDate(order.created_at)}</span>
        </div>

        <div role="cell" className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setReceiptOpen(true);
            }}
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-black/55 ring-1 ring-black/10",
              "opacity-0 transition-opacity hover:bg-black/[0.04] hover:text-black",
              "group-hover:opacity-100 focus-visible:opacity-100",
            )}
            aria-label="View Receipt"
          >
            <FileText className="size-3.5" aria-hidden />
            Receipt
          </button>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
              status.className,
            )}
          >
            {status.label}
          </span>
          <ChevronRight
            className="size-4 shrink-0 text-black/30"
            aria-hidden
          />
          <span className="sr-only">View Order Details</span>
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
