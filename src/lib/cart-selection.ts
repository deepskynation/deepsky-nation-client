import type { ApiCart, ApiCartLine } from "@/types/cart";

export function availableCartItemIds(items: ApiCartLine[]): string[] {
  return items.filter((item) => item.is_available).map((item) => item.id);
}

export function syncCartSelection(
  currentSelection: string[],
  items: ApiCartLine[],
): string[] {
  const existingIds = new Set(items.map((item) => item.id));
  const availableIds = availableCartItemIds(items);

  if (currentSelection.length === 0) {
    return availableIds;
  }

  const kept = currentSelection.filter((id) => existingIds.has(id));
  if (kept.length === 0 && availableIds.length > 0) {
    return availableIds;
  }

  return kept;
}

export function selectedCartSubtotal(
  items: ApiCartLine[],
  selectedIds: string[],
): string {
  const selected = new Set(selectedIds);
  const total = items
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + Number.parseFloat(item.line_subtotal), 0);
  return total.toFixed(2);
}

export function selectedCartItemCount(
  items: ApiCartLine[],
  selectedIds: string[],
): number {
  const selected = new Set(selectedIds);
  return items
    .filter((item) => selected.has(item.id))
    .reduce((sum, item) => sum + item.quantity, 0);
}

export function pruneCartAfterOrder(cart: ApiCart, orderedItemIds: string[]): ApiCart {
  const ordered = new Set(orderedItemIds);
  const remaining = cart.items.filter((item) => !ordered.has(item.id));
  return {
    ...cart,
    items: remaining,
    item_count: remaining.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: remaining
      .reduce((sum, item) => sum + Number.parseFloat(item.line_subtotal), 0)
      .toFixed(2),
  };
}
