"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/common/feedback/toast-provider";
import { useAppDispatch } from "@/hooks";
import { canUserCancelOrder, formatOrderNumber } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import { cancelMyOrder } from "@/store/slices/orderSlice";
import type { ApiOrder } from "@/types/order";

type CancelOrderButtonProps = {
  order: ApiOrder;
  onCancelled?: (order: ApiOrder) => void;
  className?: string;
  variant?: "default" | "destructive-outline";
};

export function CancelOrderButton({
  order,
  onCancelled,
  className,
  variant = "destructive-outline",
}: CancelOrderButtonProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!canUserCancelOrder(order.status)) {
    return null;
  }

  const orderLabel = formatOrderNumber(order.order_number);

  const handleConfirmCancel = async () => {
    setLoading(true);
    setError(null);

    const result = await dispatch(cancelMyOrder(order.id));

    setLoading(false);

    if (cancelMyOrder.fulfilled.match(result)) {
      setConfirmOpen(false);
      toast.success(`${orderLabel} cancelled.`);
      onCancelled?.(result.payload);
      return;
    }

    const message =
      typeof result.payload === "string"
        ? result.payload
        : "Could not cancel this order.";
    toast.error(message);
    setError(message);
  };

  const handleOpenChange = (open: boolean) => {
    if (loading) {
      return;
    }
    setConfirmOpen(open);
    if (!open) {
      setError(null);
    }
  };

  const buttonClassName =
    variant === "destructive-outline"
      ? "h-10 w-full rounded-md border border-red-200 bg-red-50/80 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      : "h-10 w-full rounded-md bg-red-600 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className={cn("space-y-2", className)}>
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={loading}
        className={buttonClassName}
      >
        Cancel order
      </button>

      {error && !confirmOpen ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <Dialog open={confirmOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={!loading}
          className="border-black/10 bg-white sm:max-w-[400px]"
        >
          <DialogHeader className="text-left">
            <DialogTitle className="font-serif text-lg text-black">
              Cancel this order?
            </DialogTitle>
            <DialogDescription className="text-black/60">
              You are about to cancel {orderLabel}. This only works while the
              order is still pending — once an admin approves it, cancellation
              is no longer available. We will email you a cancellation notice.
            </DialogDescription>
          </DialogHeader>

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter className="border-black/8 bg-transparent sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="h-10 rounded-md border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep Order
            </button>
            <button
              type="button"
              onClick={() => void handleConfirmCancel()}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2Icon
                    className="size-4 motion-safe:animate-spin"
                    aria-hidden
                  />
                  Cancelling…
                </>
              ) : (
                "Yes, Cancel Order"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
