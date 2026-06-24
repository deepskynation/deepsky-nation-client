"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";
import {
  PaymentProofDialog,
  PaymentProofPreview,
} from "@/components/common/orders/payment-proof-dialog";
import { AdminOrderStatusActions } from "@/components/admin/orders/modules/order-status-actions";
import {
  alertErrorClassName,
  sectionClassName,
  sectionTitleClassName,
} from "@/lib/panel-styles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { formatAdminCustomerLabel } from "@/lib/admin-order-status";
import {
  formatDeliveryAddress,
  formatMoney,
  formatOrderDateTime,
  formatOrderCompletedAt,
  formatOrderNumber,
  formatOrderStatus,
  formatPaymentMethod,
} from "@/lib/order-display";
import {
  clearAdminOrderDetail,
  fetchAdminOrderDetail,
  resetAdminOrderUpdate,
  selectAdminOrderDetail,
  selectAdminOrderDetailError,
  selectAdminOrderDetailStatus,
} from "@/store/slices/orderSlice";
import type { ApiOrder } from "@/types/order";

type AdminOrderDetailDialogProps = {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional list row snapshot while detail loads. */
  previewOrder?: ApiOrder | null;
};

export function AdminOrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  previewOrder = null,
}: AdminOrderDetailDialogProps) {
  const dispatch = useAppDispatch();
  const [paymentProofOpen, setPaymentProofOpen] = useState(false);
  const detailOrder = useAppSelector(selectAdminOrderDetail);
  const detailStatus = useAppSelector(selectAdminOrderDetailStatus);
  const detailError = useAppSelector(selectAdminOrderDetailError);

  useEffect(() => {
    if (!open || !orderId) {
      return;
    }
    void dispatch(fetchAdminOrderDetail(orderId));
  }, [dispatch, open, orderId]);

  useEffect(() => {
    if (!open) {
      dispatch(clearAdminOrderDetail());
      dispatch(resetAdminOrderUpdate());
    }
  }, [dispatch, open]);

  const order = detailOrder ?? previewOrder;
  const isLoading = detailStatus === "loading" && !detailOrder;
  const completedAtLabel = order ? formatOrderCompletedAt(order.shipped_at) : null;

  const refreshDetail = () => {
    if (orderId) {
      void dispatch(fetchAdminOrderDetail(orderId));
    }
  };

  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
  };

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>
            {order ? formatOrderNumber(order.order_number) : "Order Details"}
          </DialogTitle>
          <DialogDescription>
            Review payment, delivery details, and update fulfillment status.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            Loading order…
          </div>
        ) : null}

        {detailError && !order ? (
          <p className={alertErrorClassName} role="alert">
            {detailError}
          </p>
        ) : null}

        {order ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const statusMeta = formatOrderStatus(order.status);
                return (
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusMeta.className}`}
                  >
                    {statusMeta.label}
                  </span>
                );
              })()}
              <span className="text-xs text-muted-foreground">
                Placed {formatOrderDateTime(order.created_at)}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <section className={sectionClassName}>
                <h3 className={sectionTitleClassName}>Customer</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Name</dt>
                    <dd className="font-medium text-neutral-900">
                      {formatAdminCustomerLabel(order)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{order.delivery_email}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{order.delivery_phone}</dd>
                  </div>
                </dl>
              </section>

              <section className={sectionClassName}>
                <h3 className={sectionTitleClassName}>Payment</h3>
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Method</dt>
                    <dd>{formatPaymentMethod(order.payment.payment_method)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Total</dt>
                    <dd className="font-medium tabular-nums">
                      {formatMoney(order.total)}
                    </dd>
                  </div>
                  {order.payment.has_receipt ? (
                    <div>
                      <dt className="mb-2 text-muted-foreground">Payment Proof</dt>
                      <dd className="space-y-2">
                        <PaymentProofPreview
                          orderId={order.id}
                          scope="admin"
                          onClick={() => setPaymentProofOpen(true)}
                        />
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </div>

            <section className={sectionClassName}>
              <h3 className={sectionTitleClassName}>
                Items ({order.items.length})
              </h3>
              <ul className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-md border border-neutral-200/80 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900">
                        {item.product_title?.trim() || "Order Item"}
                      </p>
                      {item.product_code ? (
                        <p className="font-mono text-xs text-muted-foreground">
                          {item.product_code}
                        </p>
                      ) : null}
                      {item.variant_label ? (
                        <p className="text-xs text-muted-foreground">
                          {item.variant_label}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right tabular-nums">
                      <p className="font-medium">{formatMoney(item.line_total)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatMoney(item.unit_price)} each
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1 border-t border-neutral-200/80 pt-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <dt>Shipping</dt>
                  <dd className="tabular-nums">{formatMoney(order.shipping_fee)}</dd>
                </div>
                <div className="flex justify-between font-medium text-neutral-900">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(order.total)}</dd>
                </div>
              </dl>
            </section>

            <section className={sectionClassName}>
              <h3 className={sectionTitleClassName}>Delivery</h3>
              {completedAtLabel ? (
                <p className="mb-3 text-sm font-medium text-emerald-800">
                  Completed on {completedAtLabel}
                </p>
              ) : null}
              <p className="text-sm text-neutral-800">
                {formatDeliveryAddress(order)}
              </p>
              <p className="text-sm text-muted-foreground">
                {[
                  order.delivery_address_line,
                  order.delivery_city,
                  order.delivery_region,
                  order.delivery_postal_code,
                  order.delivery_country,
                ]
                  .map((part) => part.trim())
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </section>

            {order.rejection_reason ? (
              <section className={sectionClassName}>
                <h3 className={sectionTitleClassName}>Rejection Reason</h3>
                <p className="text-sm text-neutral-800">{order.rejection_reason}</p>
              </section>
            ) : null}

            <section className={sectionClassName}>
              <h3 className={sectionTitleClassName}>Fulfillment Actions</h3>
              <AdminOrderStatusActions
                order={order}
                onActionComplete={refreshDetail}
              />
            </section>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>

    {order?.payment.has_receipt ? (
      <PaymentProofDialog
        orderId={order.id}
        open={paymentProofOpen}
        onOpenChange={setPaymentProofOpen}
        scope="admin"
      />
    ) : null}
    </>
  );
}
