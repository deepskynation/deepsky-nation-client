import type { ApiOrder } from "@/types/order";

export type ApiOrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "shipped"
  | "cancelled";

const STATUS_META: Record<
  ApiOrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  approved: {
    label: "Approved",
    className: "bg-amber-50 text-amber-800 ring-amber-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-neutral-100 text-neutral-600 ring-neutral-200/80",
  },
  shipped: {
    label: "Complete",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-neutral-100 text-neutral-600 ring-neutral-200/80",
  },
};

export function formatOrderNumber(orderNumber: string): string {
  const trimmed = orderNumber.trim();
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
}

export function formatOrderStatus(status: string): {
  label: string;
  className: string;
} {
  const key = status.toLowerCase() as ApiOrderStatus;
  return STATUS_META[key] ?? {
    label: status.replace(/_/g, " "),
    className: "bg-neutral-100 text-neutral-600 ring-neutral-200/80",
  };
}

export function formatMoney(value: string | number): string {
  const amount = typeof value === "number" ? value : Number.parseFloat(value);
  if (!Number.isFinite(amount)) {
    return typeof value === "string" ? value : "—";
  }
  return `PHP ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatOrderDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/** Formatted completion timestamp (when shipped), or null when not yet complete. */
export function formatOrderCompletedAt(
  iso: string | null | undefined,
): string | null {
  if (!iso?.trim()) {
    return null;
  }
  const formatted = formatOrderDateTime(iso);
  return formatted === "—" ? null : formatted;
}

export function formatPaymentMethod(method: string): string {
  if (method === "cod") {
    return "Cash on Delivery (COD)";
  }
  if (method === "online_transfer") {
    return "Online Transfer";
  }
  return method.replace(/_/g, " ");
}

export function formatPaymentMethodShort(method: string): string {
  if (method === "cod") {
    return "COD";
  }
  if (method === "online_transfer") {
    return "Transfer";
  }
  return method.replace(/_/g, " ");
}

export function formatDeliverySource(source: string): string {
  if (source === "profile") {
    return "Profile";
  }
  if (source === "custom") {
    return "Custom Address";
  }
  return source;
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 45) {
    return "Just now";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return diffMin === 1 ? "A minute ago" : `${diffMin} minutes ago`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (date >= startOfToday) {
    return "Today";
  }
  if (date >= startOfYesterday) {
    return "Yesterday";
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDeliveryAddress(order: ApiOrder): string {
  const line = order.delivery_address_line.trim();
  const city = order.delivery_city.trim();
  if (line && city) {
    return `${line}, ${city}`;
  }
  return line || city || "—";
}

export function canUserCancelOrder(status: string): boolean {
  return status.toLowerCase() === "pending";
}

export type OrderReceiptItemLabel = {
  title: string;
  size?: string;
  color?: string;
  /** Fallback when size/color are unavailable (e.g. "S · White"). */
  variantLabel?: string;
};

export type OrderReceiptLineItem = {
  title: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
};

function parseDotVariantLabel(
  label: string | undefined,
): Pick<OrderReceiptLineItem, "size" | "color"> {
  if (!label?.trim()) {
    return {};
  }

  const parts = label
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return { size: parts[0], color: parts[1] };
  }
  if (parts.length === 1) {
    return { size: parts[0] };
  }
  return {};
}

function resolveReceiptVariantParts(
  label: OrderReceiptItemLabel | undefined,
  item: ApiOrder["items"][number],
): Pick<OrderReceiptLineItem, "size" | "color"> {
  if (label?.size?.trim() || label?.color?.trim()) {
    return {
      size: label.size?.trim() || undefined,
      color: label.color?.trim() || undefined,
    };
  }

  return parseDotVariantLabel(
    label?.variantLabel?.trim() || item.variant_label?.trim() || undefined,
  );
}

export function formatLabeledVariantLine(
  size?: string,
  color?: string,
): string | null {
  const parts: string[] = [];
  if (size?.trim()) {
    parts.push(`Size: ${size.trim()}`);
  }
  if (color?.trim()) {
    parts.push(`Color: ${color.trim()}`);
  }
  return parts.length > 0 ? parts.join(", ") : null;
}

export function buildOrderReceiptLineItems(
  order: ApiOrder,
  labelsByProductId: Record<string, OrderReceiptItemLabel> = {},
): OrderReceiptLineItem[] {
  return order.items.map((item) => {
    const productId = item.product_id ?? "";
    const label =
      labelsByProductId[item.id] ?? labelsByProductId[productId];
    const title =
      label?.title?.trim() ||
      item.product_title?.trim() ||
      (productId ? "Product" : "Order Item");
    const { size, color } = resolveReceiptVariantParts(label, item);

    return {
      title,
      size,
      color,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
    };
  });
}

export function formatOrderItemCount(order: ApiOrder): string {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const noun = itemCount === 1 ? "item" : "items";
  return `${itemCount} ${noun}`;
}

export function formatOrderTotal(order: ApiOrder): string {
  return formatMoney(order.total);
}

/** Qty + total in one string (e.g. compact summaries). */
export function formatOrderSummary(order: ApiOrder): string {
  return `${formatOrderItemCount(order)} · ${formatOrderTotal(order)}`;
}

export function getUserInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Shared grid for header + row columns (sample UI layout). */
export const ORDERS_TABLE_GRID_CLASS =
  "grid grid-cols-[minmax(7rem,0.9fr)_minmax(9rem,1.1fr)_minmax(8rem,1fr)_minmax(10rem,1.25fr)_minmax(7rem,0.95fr)_minmax(6.5rem,auto)] items-center gap-x-4 gap-y-2";
