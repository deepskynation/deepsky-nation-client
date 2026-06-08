"use client";

import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { glassMediaFlatClassName } from "@/lib/glass-styles";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

export type OrderLineRowData = {
  id: string;
  title: string;
  productCode?: string | null;
  variantLabel?: string | null;
  thumbnailSrc?: string | null;
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
  maxQuantity?: number;
  isAvailable?: boolean;
  unavailableReason?: string;
};

type OrderLineRowProps = {
  line: OrderLineRowData;
  mode?: "display" | "editable";
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onDecrease?: () => void;
  onIncrease?: () => void;
  onRemove?: () => void;
  onImageClick?: (src: string, alt: string) => void;
  isUpdating?: boolean;
  className?: string;
};

export function OrderLineRow({
  line,
  mode = "display",
  selectable = false,
  selected = false,
  onToggleSelect,
  onDecrease,
  onIncrease,
  onRemove,
  onImageClick,
  isUpdating = false,
  className,
}: OrderLineRowProps) {
  const atMax =
    line.maxQuantity !== undefined && line.quantity >= line.maxQuantity;
  const showUnavailable = line.isAvailable === false;
  const canSelect = selectable && line.isAvailable !== false;

  return (
    <div
      className={cn(
        "rounded-xl bg-black/[0.03] px-4 py-3.5",
        showUnavailable && "ring-1 ring-amber-200/80",
        selectable && !selected && "opacity-80",
        className,
      )}
    >
      <div className="flex gap-3">
        {selectable ? (
          <div className="flex shrink-0 items-start pt-1">
            <input
              type="checkbox"
              checked={selected}
              disabled={!canSelect || isUpdating}
              onChange={onToggleSelect}
              aria-label={`Select ${line.title} for checkout`}
              className="size-4 rounded border-black/20 text-black focus:ring-black/20 disabled:opacity-40"
            />
          </div>
        ) : null}

        <div
          className={cn(
            glassMediaFlatClassName,
            "size-14 shrink-0 overflow-hidden",
          )}
        >
          {line.thumbnailSrc ? (
            onImageClick ? (
              <button
                type="button"
                onClick={() =>
                  onImageClick(line.thumbnailSrc!, `${line.title} image`)
                }
                className="size-full cursor-zoom-in transition-opacity hover:opacity-90"
                aria-label={`View Larger Image Of ${line.title}`}
              >
                <img
                  src={line.thumbnailSrc}
                  alt={line.title}
                  className="size-full object-cover"
                />
              </button>
            ) : (
              <img
                src={line.thumbnailSrc}
                alt={line.title}
                className="size-full object-cover"
              />
            )
          ) : (
            <span className="flex size-full items-center justify-center text-black/30">
              <Package className="size-5" aria-hidden />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-medium text-black">{line.title}</p>
          {line.productCode ? (
            <p className="font-mono text-xs text-black/45">{line.productCode}</p>
          ) : null}
          {line.variantLabel ? (
            <p className="text-xs text-black/60">{line.variantLabel}</p>
          ) : null}
          {showUnavailable ? (
            <p className="text-xs text-amber-800">
              {line.unavailableReason ?? "This item is no longer available."}
            </p>
          ) : null}

          {mode === "editable" ? (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onDecrease}
                disabled={isUpdating || line.quantity <= 1}
                className="inline-flex size-8 items-center justify-center rounded-md border border-black/10 text-black/70 transition-colors hover:bg-white disabled:opacity-40"
                aria-label="Decrease Quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-[2ch] text-center text-sm tabular-nums text-black">
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={onIncrease}
                disabled={isUpdating || atMax}
                className="inline-flex size-8 items-center justify-center rounded-md border border-black/10 text-black/70 transition-colors hover:bg-white disabled:opacity-40"
                aria-label="Increase Quantity"
              >
                <Plus className="size-3.5" />
              </button>
              {onRemove ? (
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={isUpdating}
                  className="ml-2 inline-flex items-center gap-1 text-xs text-black/50 transition-colors hover:text-black disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                  Remove
                </button>
              ) : null}
            </div>
          ) : (
            <p className="text-xs text-black/50">Qty {line.quantity}</p>
          )}
        </div>

        <div className="text-right text-sm">
          <p className="font-semibold text-black tabular-nums">
            {formatMoney(line.lineTotal)}
          </p>
          <p className="text-xs text-black/45 tabular-nums">
            {formatMoney(line.unitPrice)} each
          </p>
        </div>
      </div>
    </div>
  );
}
