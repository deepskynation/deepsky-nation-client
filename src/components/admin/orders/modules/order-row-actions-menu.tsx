"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  EyeIcon,
  FileTextIcon,
  Loader2Icon,
  MoreVertical,
  PrinterIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";
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
  canAdminApproveOrReject,
  canAdminEditWaybill,
  canAdminMarkShipped,
  hasAdminWaybillReady,
} from "@/lib/admin-order-status";
import { cn } from "@/lib/utils";
import type {
  AdminShipOrderDetails,
  AdminUpdateOrderAction,
  ApiOrder,
  WaybillLogoType,
} from "@/types/order";

type OrderRowActionsMenuProps = {
  order: ApiOrder;
  onViewDetails: () => void;
  disabled?: boolean;
};

type MenuPosition = {
  top: number;
  right: number;
  minWidth: number;
};

function isWaybillLogoType(value: string | null | undefined): value is WaybillLogoType {
  return value === "jt" || value === "lalamove" || value === "custom";
}

export function OrderRowActionsMenu({
  order,
  onViewDetails,
  disabled = false,
}: OrderRowActionsMenuProps) {
  const { runAction } = useAdminOrderActions();
  const [open, setOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [waybillOpen, setWaybillOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [shipConfirmOpen, setShipConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const canReview = canAdminApproveOrReject(order.status);
  const canEditWaybill = canAdminEditWaybill(order.status);
  const canShip = canAdminMarkShipped(order.status);
  const waybillReady = hasAdminWaybillReady(order);
  const hasStatusActions = canReview || canEditWaybill || canShip || waybillReady;

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
    };
  }, [order, waybillReady]);

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      minWidth: 196,
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const runStatusAction = async (
    action: AdminUpdateOrderAction,
    options?: {
      rejectionReason?: string;
      shippingDetails?: AdminShipOrderDetails;
    },
  ) => {
    setOpen(false);
    setIsSubmitting(true);
    try {
      await runAction(order, action, options);
    } finally {
      setIsSubmitting(false);
    }
  };

  const runMenuAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const menuItemClass =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50";

  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Order Actions"
            style={{
              position: "fixed",
              top: position.top,
              right: position.right,
              minWidth: position.minWidth,
              zIndex: 9999,
            }}
            className="rounded-lg border border-neutral-200/90 bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              disabled={isSubmitting}
              onClick={() => runMenuAction(onViewDetails)}
            >
              <EyeIcon className="size-4 shrink-0" />
              View Order Details
            </button>

            {canReview ? (
              <>
                <div className="my-1 border-t border-neutral-100" role="separator" />
                <button
                  type="button"
                  role="menuitem"
                  className={menuItemClass}
                  disabled={isSubmitting}
                  onClick={() => void runStatusAction("approve")}
                >
                  <CheckIcon className="size-4 shrink-0 text-emerald-600" />
                  Approve Order
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={cn(
                    menuItemClass,
                    "text-red-600 hover:bg-red-50 hover:text-red-700",
                  )}
                  disabled={isSubmitting}
                  onClick={() => runMenuAction(() => setRejectOpen(true))}
                >
                  <XIcon className="size-4 shrink-0" />
                  Reject Order
                </button>
              </>
            ) : null}

            {canEditWaybill || canShip || waybillReady ? (
              <>
                <div className="my-1 border-t border-neutral-100" role="separator" />
                {canEditWaybill ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    disabled={isSubmitting}
                    onClick={() => runMenuAction(() => setWaybillOpen(true))}
                  >
                    <FileTextIcon className="size-4 shrink-0" />
                    {waybillReady ? "Edit Waybill" : "Set Up Waybill"}
                  </button>
                ) : null}
                {waybillReady ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    disabled={isSubmitting}
                    onClick={() => runMenuAction(() => setPrintOpen(true))}
                  >
                    <PrinterIcon className="size-4 shrink-0" />
                    Print Waybill
                  </button>
                ) : null}
                {canShip ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    disabled={isSubmitting || !waybillReady}
                    title={
                      waybillReady
                        ? undefined
                        : "Set up the waybill before marking as shipped"
                    }
                    onClick={() => runMenuAction(() => setShipConfirmOpen(true))}
                  >
                    <TruckIcon className="size-4 shrink-0" />
                    Mark As Shipped
                  </button>
                ) : null}
              </>
            ) : null}

            {!hasStatusActions ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No status actions available.
              </p>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled || isSubmitting}
        aria-label="Order Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="text-neutral-600 hover:text-neutral-900"
      >
        {isSubmitting ? (
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
        ) : (
          <MoreVertical className="size-4" />
        )}
      </Button>
      {menu}

      <RejectOrderDialog
        orderId={order.id}
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        isSubmitting={isSubmitting}
        onConfirm={(reason) =>
          void runStatusAction("reject", { rejectionReason: reason })
        }
      />
      <ShipOrderDialog
        order={order}
        open={waybillOpen}
        onOpenChange={setWaybillOpen}
        isSubmitting={isSubmitting}
        mode={waybillReady ? "edit" : "create"}
        initialValues={waybillInitialValues}
        onConfirm={(details) =>
          void runStatusAction("set_waybill", { shippingDetails: details })
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
              disabled={isSubmitting}
              onClick={() => setShipConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setShipConfirmOpen(false);
                void runStatusAction("ship");
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
