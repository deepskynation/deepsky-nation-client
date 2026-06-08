"use client";

import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminAlertErrorClass } from "@/components/admin/product/modules/admin-product-ui";

type DeleteCatalogItemDialogProps = {
  itemLabel: string;
  itemName: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  error: string | null;
};

export function DeleteCatalogItemDialog({
  itemLabel,
  itemName,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  error,
}: DeleteCatalogItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete {itemLabel.toLowerCase()}</DialogTitle>
          <DialogDescription>
            {itemName ? (
              <>
                Permanently delete{" "}
                <span className="font-medium text-neutral-900">{itemName}</span>?
                Products using this {itemLabel.toLowerCase()} may be affected. This
                cannot be undone.
              </>
            ) : (
              `This ${itemLabel.toLowerCase()} will be permanently removed.`
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className={adminAlertErrorClass} role="alert">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
