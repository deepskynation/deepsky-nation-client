"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { RejectOrderDialog } from "@/components/admin/orders/modules/reject-order-dialog";
import { useAdminOrderActions } from "@/components/admin/orders/modules/use-admin-order-actions";
import { Button } from "@/components/ui/button";
import {
  ADMIN_APPROVAL_LABELS,
  ADMIN_DELIVERY_LABELS,
  canAdminApproveOrReject,
  canAdminMarkShipped,
  getAdminApprovalState,
  getAdminDeliveryState,
  isAdminOrderTerminal,
} from "@/lib/admin-order-status";
import { cn } from "@/lib/utils";
import type { AdminUpdateOrderAction, ApiOrder } from "@/types/order";

type AdminOrderStatusActionsProps = {
  order: Pick<ApiOrder, "id" | "order_number" | "status">;
  isUpdating?: boolean;
  compact?: boolean;
  onActionComplete?: () => void;
};

export function AdminOrderStatusActions({
  order,
  isUpdating: isUpdatingProp = false,
  compact = false,
  onActionComplete,
}: AdminOrderStatusActionsProps) {
  const { runAction } = useAdminOrderActions();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvalState = getAdminApprovalState(order.status);
  const deliveryState = getAdminDeliveryState(order.status);
  const terminal = isAdminOrderTerminal(order.status);
  const canReview = canAdminApproveOrReject(order.status);
  const canShip = canAdminMarkShipped(order.status);
  const isUpdating = isUpdatingProp || isSubmitting;

  const handleAction = async (
    action: AdminUpdateOrderAction,
    rejectionReason?: string,
  ) => {
    setIsSubmitting(true);
    try {
      await runAction(order, action, rejectionReason);
      onActionComplete?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-2",
          compact ? "min-w-[9rem]" : "min-w-[11rem]",
        )}
      >
        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold tracking-wide text-neutral-500 uppercase">
            Order
          </p>
          {canReview ? (
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="xs"
                disabled={isUpdating}
                onClick={() => void handleAction("approve")}
              >
                {isUpdating ? (
                  <Loader2Icon className="size-3 animate-spin" aria-hidden />
                ) : null}
                Approve
              </Button>
              <Button
                type="button"
                size="xs"
                variant="destructive"
                disabled={isUpdating}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
            </div>
          ) : (
            <span className="inline-flex rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700">
              {ADMIN_APPROVAL_LABELS[approvalState]}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-[0.65rem] font-semibold tracking-wide text-neutral-500 uppercase">
            Delivery
          </p>
          {canShip ? (
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="xs"
                variant="outline"
                disabled={isUpdating}
                onClick={() => void handleAction("ship")}
              >
                Mark shipped
              </Button>
            </div>
          ) : (
            <span
              className={cn(
                "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                deliveryState === "shipped"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : deliveryState === "pending"
                    ? "border-amber-200 bg-amber-50 text-amber-900"
                    : "border-neutral-200 bg-neutral-50 text-neutral-600",
              )}
            >
              {ADMIN_DELIVERY_LABELS[deliveryState]}
            </span>
          )}
          {terminal && deliveryState === "none" ? (
            <span className="text-xs text-muted-foreground">Not applicable</span>
          ) : null}
        </div>
      </div>

      <RejectOrderDialog
        orderId={order.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isSubmitting={isUpdating}
        onConfirm={(reason) => void handleAction("reject", reason)}
      />
    </>
  );
}
