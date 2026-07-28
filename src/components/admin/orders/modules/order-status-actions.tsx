"use client";

import { useMemo, useState } from "react";
import { Loader2Icon } from "lucide-react";
import { PrintWaybillDialog } from "@/components/admin/orders/modules/print-waybill-dialog";
import { RejectOrderDialog } from "@/components/admin/orders/modules/reject-order-dialog";
import { ShipOrderDialog } from "@/components/admin/orders/modules/ship-order-dialog";
import { useAdminOrderActions } from "@/components/admin/orders/modules/use-admin-order-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ADMIN_APPROVAL_LABELS,
  ADMIN_DELIVERY_LABELS,
  canAdminApproveOrReject,
  canAdminEditWaybill,
  canAdminMarkShipped,
  getAdminApprovalState,
  getAdminDeliveryState,
  hasAdminWaybillReady,
  isAdminOrderTerminal,
} from "@/lib/admin-order-status";
import { cn } from "@/lib/utils";
import type {
  AdminShipOrderDetails,
  AdminUpdateOrderAction,
  ApiOrder,
  WaybillLogoType,
} from "@/types/order";

type AdminOrderStatusActionsProps = {
  order: ApiOrder;
  isUpdating?: boolean;
  compact?: boolean;
  onActionComplete?: () => void;
};

function isWaybillLogoType(value: string | null | undefined): value is WaybillLogoType {
  return value === "jt" || value === "lalamove" || value === "custom";
}

export function AdminOrderStatusActions({
  order,
  isUpdating: isUpdatingProp = false,
  compact = false,
  onActionComplete,
}: AdminOrderStatusActionsProps) {
  const { runAction } = useAdminOrderActions();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [waybillOpen, setWaybillOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [shipConfirmOpen, setShipConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approvalState = getAdminApprovalState(order.status);
  const deliveryState = getAdminDeliveryState(order.status);
  const terminal = isAdminOrderTerminal(order.status);
  const canReview = canAdminApproveOrReject(order.status);
  const canEditWaybill = canAdminEditWaybill(order.status);
  const canShip = canAdminMarkShipped(order.status);
  const waybillReady = hasAdminWaybillReady(order);
  const isUpdating = isUpdatingProp || isSubmitting;

  const waybillInitialValues = useMemo((): Partial<AdminShipOrderDetails> | null => {
    if (!waybillReady) {
      return null;
    }
    return {
      courier: order.courier ?? undefined,
      trackingNumber: order.tracking_number ?? undefined,
      packageWeightKg: order.package_weight_kg ?? undefined,
      waybillLogoType: isWaybillLogoType(order.waybill_logo_type)
        ? order.waybill_logo_type
        : undefined,
      waybillLogoUrl: order.waybill_logo_url ?? null,
      waybillPaymentMethod:
        order.waybill_payment_method === "cod" ||
        order.waybill_payment_method === "online_transfer"
          ? order.waybill_payment_method
          : undefined,
    };
  }, [order, waybillReady]);

  const handleAction = async (
    action: AdminUpdateOrderAction,
    options?: {
      rejectionReason?: string;
      shippingDetails?: AdminShipOrderDetails;
    },
  ) => {
    setIsSubmitting(true);
    try {
      await runAction(order, action, options);
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
          {canEditWaybill || canShip || waybillReady ? (
            <div className="flex flex-wrap gap-1.5">
              {canEditWaybill ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => setWaybillOpen(true)}
                >
                  {waybillReady ? "Edit waybill" : "Set up waybill"}
                </Button>
              ) : null}
              {waybillReady ? (
                <Button
                  type="button"
                  size="xs"
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() => setPrintOpen(true)}
                >
                  Print waybill
                </Button>
              ) : null}
              {canShip ? (
                <Button
                  type="button"
                  size="xs"
                  disabled={isUpdating || !waybillReady}
                  title={
                    waybillReady
                      ? undefined
                      : "Set up the waybill before marking as shipped"
                  }
                  onClick={() => setShipConfirmOpen(true)}
                >
                  Mark shipped
                </Button>
              ) : null}
              {!canEditWaybill && !canShip && waybillReady ? (
                <span
                  className={cn(
                    "inline-flex rounded-md border px-2 py-1 text-xs font-medium",
                    deliveryState === "shipped"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-neutral-200 bg-neutral-50 text-neutral-600",
                  )}
                >
                  {ADMIN_DELIVERY_LABELS[deliveryState]}
                </span>
              ) : null}
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
          {canEditWaybill && !waybillReady ? (
            <span className="text-xs text-muted-foreground">
              Waybill required before shipping
            </span>
          ) : null}
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
        onConfirm={(reason) =>
          void handleAction("reject", { rejectionReason: reason })
        }
      />
      <ShipOrderDialog
        order={order}
        open={waybillOpen}
        onOpenChange={setWaybillOpen}
        isSubmitting={isUpdating}
        mode={waybillReady ? "edit" : "create"}
        initialValues={waybillInitialValues}
        onConfirm={(details) =>
          void handleAction("set_waybill", { shippingDetails: details })
        }
      />
      <PrintWaybillDialog
        order={order}
        open={printOpen}
        onOpenChange={setPrintOpen}
      />
      <Dialog open={shipConfirmOpen} onOpenChange={setShipConfirmOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Ship this order?</DialogTitle>
            <DialogDescription>
              This marks the order as shipped using the saved waybill and notifies
              the customer by email. Waybill details can no longer be edited after
              shipping.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isUpdating}
              onClick={() => setShipConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isUpdating}
              onClick={() => {
                setShipConfirmOpen(false);
                void handleAction("ship");
              }}
            >
              Mark shipped
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
