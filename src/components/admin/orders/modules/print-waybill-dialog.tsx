"use client";

import { useMemo } from "react";
import PrintOrderDetails from "@/components/admin/orders/modules/print-order-details";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { orderToWaybillPrintData } from "@/lib/order-to-waybill";
import type { ApiOrder } from "@/types/order";

type PrintWaybillDialogProps = {
  order: ApiOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrintWaybillDialog({
  order,
  open,
  onOpenChange,
}: PrintWaybillDialogProps) {
  const printData = useMemo(() => orderToWaybillPrintData(order), [order]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="no-print max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Print waybill</DialogTitle>
          <DialogDescription>
            Preview the shipping label, then print. Use A6 / 4×6 paper size if
            prompted.
          </DialogDescription>
        </DialogHeader>

        {printData ? (
          <div className="flex justify-center overflow-x-auto py-2">
            <PrintOrderDetails data={printData} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Waybill data is incomplete. Set up the waybill first.
          </p>
        )}

        <DialogFooter className="no-print">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
          <Button
            type="button"
            disabled={!printData}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
