import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

type OrderTotalsSummaryProps = {
  subtotal: string | number;
  shippingFee: string | number;
  total: string | number;
  shippingNote?: string;
  className?: string;
};

export function OrderTotalsSummary({
  subtotal,
  shippingFee,
  total,
  shippingNote,
  className,
}: OrderTotalsSummaryProps) {
  return (
    <dl className={cn("space-y-2.5 text-sm", className)}>
      <div className="flex justify-between text-black/60">
        <dt>Subtotal</dt>
        <dd className="font-medium text-black tabular-nums">{formatMoney(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-black/60">
        <dt>Shipping</dt>
        <dd className="font-medium text-black tabular-nums">
          {formatMoney(shippingFee)}
        </dd>
      </div>
      {shippingNote ? (
        <p className="text-xs text-black/45">{shippingNote}</p>
      ) : null}
      <div className="flex justify-between border-t border-black/8 pt-3 text-base">
        <dt className="font-semibold text-black">Total</dt>
        <dd className="font-semibold text-black tabular-nums">{formatMoney(total)}</dd>
      </div>
    </dl>
  );
}
