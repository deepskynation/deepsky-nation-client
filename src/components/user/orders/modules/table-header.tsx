import { ORDERS_TABLE_GRID_CLASS } from "@/lib/order-display";
import { cn } from "@/lib/utils";

type OrdersTableHeaderProps = {
  className?: string;
};

export function OrdersTableHeader({ className }: OrdersTableHeaderProps) {
  return (
    <div
      role="row"
      className={cn(
        ORDERS_TABLE_GRID_CLASS,
        "px-4 pb-2 text-xs font-medium text-black/45",
        className,
      )}
    >
      <div role="columnheader">Order ID</div>
      {/* <div role="columnheader">User</div> */}
      <div role="columnheader">Order Qty</div>
      <div role="columnheader">Total</div>
      <div role="columnheader">Address</div>
      <div role="columnheader">Date</div>
      <div role="columnheader" className="text-right">
        Status
      </div>
    </div>
  );
}
