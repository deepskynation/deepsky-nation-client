"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import {
  CheckIcon,
  EyeIcon,
  Loader2Icon,
  MoreVertical,
  PackageCheckIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";
import { RejectOrderDialog } from "@/components/admin/orders/modules/reject-order-dialog";
import { useAdminOrderActions } from "@/components/admin/orders/modules/use-admin-order-actions";
import { Button } from "@/components/ui/button";
import {
  canAdminApproveOrReject,
  canAdminMarkDelivered,
  canAdminMarkShipped,
} from "@/lib/admin-order-status";
import { cn } from "@/lib/utils";
import type { ApiOrder } from "@/types/order";

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

export function OrderRowActionsMenu({
  order,
  onViewDetails,
  disabled = false,
}: OrderRowActionsMenuProps) {
  const { runAction } = useAdminOrderActions();
  const [open, setOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const canReview = canAdminApproveOrReject(order.status);
  const canShip = canAdminMarkShipped(order.status);
  const canDeliver = canAdminMarkDelivered(order.status);
  const hasStatusActions = canReview || canShip || canDeliver;

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
    action: "approve" | "reject" | "ship" | "deliver",
    rejectionReason?: string,
  ) => {
    setOpen(false);
    setIsSubmitting(true);
    try {
      await runAction(order, action, rejectionReason);
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

            {canShip || canDeliver ? (
              <>
                <div className="my-1 border-t border-neutral-100" role="separator" />
                {canShip ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    disabled={isSubmitting}
                    onClick={() => void runStatusAction("ship")}
                  >
                    <TruckIcon className="size-4 shrink-0" />
                    Mark As Shipped
                  </button>
                ) : null}
                {canDeliver ? (
                  <button
                    type="button"
                    role="menuitem"
                    className={menuItemClass}
                    disabled={isSubmitting}
                    onClick={() => void runStatusAction("deliver")}
                  >
                    <PackageCheckIcon className="size-4 shrink-0" />
                    Mark As Delivered
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
        onConfirm={(reason) => void runStatusAction("reject", reason)}
      />
    </>
  );
}
