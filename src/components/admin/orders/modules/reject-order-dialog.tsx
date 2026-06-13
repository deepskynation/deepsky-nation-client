"use client";

import { useState } from "react";
import {
  fieldClassName,
  labelClassName,
} from "@/lib/panel-styles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type RejectOrderDialogProps = {
  orderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting?: boolean;
  onConfirm: (reason: string) => void;
};

export function RejectOrderDialog({
  orderId,
  open,
  onOpenChange,
  isSubmitting = false,
  onConfirm,
}: RejectOrderDialogProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setRejectReason("");
      setRejectError(null);
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setRejectError("Please provide a reason for rejecting this order.");
      return;
    }
    setRejectError(null);
    onConfirm(trimmed);
    setRejectReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Reject Order</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Provide a reason so the rejection is recorded
            on the order.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label htmlFor={`reject-reason-${orderId}`} className={labelClassName}>
            Rejection Reason
          </label>
          <textarea
            id={`reject-reason-${orderId}`}
            className={fieldClassName.replace("h-10", "min-h-[96px] py-2")}
            rows={4}
            value={rejectReason}
            onChange={(event) => {
              setRejectReason(event.target.value);
              if (rejectError) {
                setRejectError(null);
              }
            }}
            placeholder="e.g. Payment Receipt could not be verified."
          />
          {rejectError ? (
            <p className="text-xs text-red-600" role="alert">
              {rejectError}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            Reject Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
