"use client";

import {
  formatDeliveryAddress,
  formatMoney,
  formatOrderDateTime,
  formatOrderNumber,
  formatOrderStatus,
  formatPaymentMethod,
  type OrderReceiptLineItem,
} from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";

type OrderReceiptSummaryProps = {
  order: ApiOrder;
  lineItems: OrderReceiptLineItem[];
  className?: string;
  compact?: boolean;
};

export function OrderReceiptSummary({
  order,
  lineItems,
  className,
  compact = false,
}: OrderReceiptSummaryProps) {
  const status = formatOrderStatus(order.status);

  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-black/8 bg-black/[0.02] p-4 text-sm",
        className,
      )}
    >
      <dl className="space-y-2 text-black/65">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
            Receipt
          </dt>
        </div>
        <div>
          <dt className="text-xs font-medium text-black/55">Order Number:</dt>
          <dd className="font-semibold text-black">
            {formatOrderNumber(order.order_number)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-black/55">Date:</dt>
          <dd className="text-xs text-black/70">
            {formatOrderDateTime(order.created_at)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-black/55">Status:</dt>
          <dd className="mt-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                status.className,
              )}
            >
              {status.label}
            </span>
          </dd>
        </div>
      </dl>

      <ul className={cn("space-y-3", compact && "space-y-2")}>
        {lineItems.map((item, index) => (
          <li
            key={`${item.title}-${index}`}
            className="space-y-1 border-b border-black/6 pb-3 last:border-0 last:pb-0"
          >
            <p className="font-medium text-black">{item.title}</p>
            {item.size ? (
              <p className="text-xs text-black/55">Size: {item.size}</p>
            ) : null}
            {item.color ? (
              <p className="text-xs text-black/55">Color: {item.color}</p>
            ) : null}
            <p className="text-xs text-black/55">Qty: {item.quantity}</p>
            <p className="text-xs text-black/55">
              Price: {formatMoney(item.unitPrice)}
            </p>
            <p className="text-xs text-black/55">
              Total:{" "}
              <span className="font-medium tabular-nums text-black">
                {formatMoney(item.lineTotal)}
              </span>
            </p>
          </li>
        ))}
      </ul>

      <dl className="space-y-1.5 text-black/65">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs font-medium text-black/55">Subtotal:</dt>
          <dd className="tabular-nums text-black">{formatMoney(order.subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-xs font-medium text-black/55">Shipping:</dt>
          <dd className="tabular-nums text-black">{formatMoney(order.shipping_fee)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-black/8 pt-2 font-semibold text-black">
          <dt>Total:</dt>
          <dd className="tabular-nums">{formatMoney(order.total)}</dd>
        </div>
      </dl>

      <dl className="space-y-2 border-t border-black/6 pt-3 text-xs text-black/55">
        <div>
          <dt className="font-medium text-black/70">Payment:</dt>
          <dd>{formatPaymentMethod(order.payment.payment_method)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/70">Delivery Address:</dt>
          <dd>{formatDeliveryAddress(order)}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/70">Phone:</dt>
          <dd>{order.delivery_phone}</dd>
        </div>
        <div>
          <dt className="font-medium text-black/70">Email:</dt>
          <dd>{order.delivery_email}</dd>
        </div>
      </dl>
    </div>
  );
}
