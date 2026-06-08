"use client";

import { useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  fetchOrderPaymentReceipt,
  selectOrderPaymentReceipt,
  type PaymentProofScope,
} from "@/store/slices/orderSlice";

function usePaymentProofImage(
  orderId: string,
  scope: PaymentProofScope,
  enabled: boolean,
) {
  const dispatch = useAppDispatch();
  const { dataUrl, status, error } = useAppSelector(
    selectOrderPaymentReceipt(orderId, scope),
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }
    void dispatch(fetchOrderPaymentReceipt({ orderId, scope }));
  }, [dispatch, enabled, orderId, scope]);

  return {
    src: dataUrl,
    error,
    loading: enabled && status === "loading",
  };
}

type PaymentProofDialogProps = {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: PaymentProofScope;
};

export function PaymentProofDialog({
  orderId,
  open,
  onOpenChange,
  scope,
}: PaymentProofDialogProps) {
  const { src, error, loading } = usePaymentProofImage(orderId, scope, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[calc(100dvh-0.5rem)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden border-black/10 bg-white p-0 sm:max-h-[90vh] sm:w-full sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b border-black/8 px-4 pt-5 pb-4 text-left sm:px-6 sm:pt-6">
          <DialogTitle className="font-serif text-xl text-black">
            Payment Receipt
          </DialogTitle>
          <DialogDescription className="text-sm text-black/55">
            Uploaded proof of online transfer for this order.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {loading ? (
            <div className="flex min-h-[200px] items-center justify-center gap-2 text-sm text-black/55">
              <Loader2Icon className="size-4 animate-spin" aria-hidden />
              Loading receipt…
            </div>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {error}
            </p>
          ) : null}

          {src ? (
            <div className="overflow-hidden rounded-xl border border-black/10 bg-neutral-50">
              <img
                src={src}
                alt="Payment Transfer Receipt"
                className="mx-auto h-auto max-h-[min(calc(100dvh-12rem),60vh)] w-full max-w-full object-contain"
              />
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type PaymentProofPreviewProps = {
  orderId: string;
  scope: PaymentProofScope;
  className?: string;
  onClick?: () => void;
};

export function PaymentProofPreview({
  orderId,
  scope,
  className,
  onClick,
}: PaymentProofPreviewProps) {
  const { src, error, loading } = usePaymentProofImage(orderId, scope, true);

  if (loading) {
    return (
      <div
        className={cn(
          "flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-black/10 bg-neutral-50 text-sm text-black/45",
          className,
        )}
      >
        <Loader2Icon className="size-4 animate-spin" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <p className={cn("text-sm text-red-700", className)} role="alert">
        {error}
      </p>
    );
  }

  if (!src) {
    return null;
  }

  const image = (
    <img
      src={src}
      alt="Payment Transfer Receipt"
      className="max-h-56 w-full object-contain"
    />
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "block w-full overflow-hidden rounded-xl border border-black/10 bg-neutral-50 transition-opacity hover:opacity-90",
          className,
        )}
      >
        {image}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-black/10 bg-neutral-50",
        className,
      )}
    >
      {image}
    </div>
  );
}
