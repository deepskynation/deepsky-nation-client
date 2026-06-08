"use client";

import { useState } from "react";
import { AdminOrderDetailDialog } from "@/components/admin/orders/modules/order-detail-dialog";
import { OrderRowActionsMenu } from "@/components/admin/orders/modules/order-row-actions-menu";
import {
  PaymentProofDialog,
} from "@/components/common/orders/payment-proof-dialog";
import { adminTableRowClass } from "@/components/admin/product/modules/admin-product-ui";
import { Button } from "@/components/ui/button";
import { formatAdminCustomerLabel } from "@/lib/admin-order-status";
import {
  formatOrderDate,
  formatOrderDeliveredAt,
  formatOrderItemCount,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
  formatPaymentMethod,
} from "@/lib/order-display";
import type { ApiOrder } from "@/types/order";

type AdminOrdersTableRowProps = {
  order: ApiOrder;
};

export function AdminOrdersTableRow({ order }: AdminOrdersTableRowProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [paymentProofOpen, setPaymentProofOpen] = useState(false);

  const statusMeta = formatOrderStatus(order.status);
  const deliveredAtLabel = formatOrderDeliveredAt(order.delivered_at);

  return (
    <>
      <tr className={adminTableRowClass}>
        <td className="px-4 py-3 font-medium text-neutral-900">
          {formatOrderNumber(order.order_number)}
        </td>
        <td className="max-w-[10rem] px-4 py-3">
          <div className="truncate font-medium text-neutral-900">
            {formatAdminCustomerLabel(order)}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {order.delivery_email}
          </div>
        </td>
        <td className="px-4 py-3 text-neutral-700">{formatOrderItemCount(order)}</td>
        <td className="px-4 py-3 font-medium tabular-nums text-neutral-900">
          {formatOrderTotal(order)}
        </td>
        <td className="px-4 py-3">
          <div className="space-y-1">
            <p className="text-neutral-700">
              {formatPaymentMethod(order.payment.payment_method)}
            </p>
            {order.payment.has_receipt ? (
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={() => setPaymentProofOpen(true)}
              >
                Receipt
              </Button>
            ) : null}
          </div>
        </td>
        <td className="px-4 py-3 text-neutral-600">{formatOrderDate(order.created_at)}</td>
        <td className="px-4 py-3 text-neutral-600">
          {deliveredAtLabel ? (
            <span className="whitespace-nowrap">{deliveredAtLabel}</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.className}`}
          >
            {statusMeta.label}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end">
            <OrderRowActionsMenu
              order={order}
              onViewDetails={() => setDetailOpen(true)}
            />
          </div>
        </td>
      </tr>

      <AdminOrderDetailDialog
        orderId={order.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        previewOrder={order}
      />

      <PaymentProofDialog
        orderId={order.id}
        open={paymentProofOpen}
        onOpenChange={setPaymentProofOpen}
        scope="admin"
      />
    </>
  );
}
