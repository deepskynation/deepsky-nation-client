"use client";

import { Minus, Package, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

export type CartItemCardData = {
  id: string;
  title: string;
  productCode?: string | null;
  variantLabel?: string | null;
  thumbnailSrc?: string | null;
  quantity: number;
  lineTotal: string | number;
  maxQuantity?: number;
  isAvailable?: boolean;
  unavailableReason?: string;
};

type CartItemCardProps = {
  item: CartItemCardData;
  selected?: boolean;
  onToggleSelect?: () => void;
  onDecrease?: () => void;
  onIncrease?: () => void;
  onRemove?: () => void;
  isUpdating?: boolean;
  className?: string;
};

function parseVariantLabel(label: string | null | undefined) {
  if (!label?.trim()) {
    return null;
  }
  return label
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" · ");
}

export function CartItemCard({
  item,
  selected = false,
  onToggleSelect,
  onDecrease,
  onIncrease,
  onRemove,
  isUpdating = false,
  className,
}: CartItemCardProps) {
  const atMax =
    item.maxQuantity !== undefined && item.quantity >= item.maxQuantity;
  const showUnavailable = item.isAvailable === false;
  const canSelect = item.isAvailable !== false;
  const variantText = parseVariantLabel(item.variantLabel);

  return (
    <article
      className={cn(
        "flex items-center gap-3 border-b border-black/8 py-3 last:border-b-0",
        !showUnavailable && !selected && onToggleSelect && "opacity-70",
        showUnavailable && "opacity-60",
        className,
      )}
    >
      {onToggleSelect ? (
        <input
          type="checkbox"
          checked={selected}
          disabled={!canSelect || isUpdating}
          onChange={onToggleSelect}
          aria-label={`Select ${item.title} for checkout`}
          className="size-3.5 shrink-0 rounded border-black/20 text-black focus:ring-black/20 disabled:opacity-40"
        />
      ) : null}

      <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {item.thumbnailSrc ? (
          <img
            src={item.thumbnailSrc}
            alt={item.title}
            className="size-full object-cover"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-black/25">
            <Package className="size-5" aria-hidden />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-black">{item.title}</p>
            {variantText ? (
              <p className="truncate text-xs text-black/45">{variantText}</p>
            ) : null}
            {showUnavailable ? (
              <p className="text-xs text-amber-800">
                {item.unavailableReason ?? "Unavailable"}
              </p>
            ) : null}
          </div>
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              disabled={isUpdating}
              aria-label={`Remove ${item.title}`}
              className="shrink-0 text-red-500 hover:text-red-600 disabled:opacity-40"
            >
              <Trash2 className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </div>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold tabular-nums text-black">
            {formatMoney(item.lineTotal)}
          </span>
          <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-1">
            <button
              type="button"
              onClick={onDecrease}
              disabled={isUpdating || item.quantity <= 1}
              className="text-black/60 hover:text-black disabled:opacity-30"
              aria-label="Decrease Quantity"
            >
              <Minus className="size-3" />
            </button>
            <span className="min-w-[1ch] text-center text-xs font-medium tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              disabled={isUpdating || atMax}
              className="text-black/60 hover:text-black disabled:opacity-30"
              aria-label="Increase Quantity"
            >
              <Plus className="size-3" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
