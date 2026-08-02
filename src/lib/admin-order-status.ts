import type { ApiOrder, OrderStatus } from "@/types/order";

export type AdminApprovalState = "awaiting" | "approved" | "rejected" | "cancelled" | "none";

export type AdminDeliveryState = "pending" | "shipped" | "none";

export function getAdminApprovalState(status: string): AdminApprovalState {
  switch (status.toLowerCase()) {
    case "pending":
      return "awaiting";
    case "approved":
    case "shipped":
      return "approved";
    case "rejected":
      return "rejected";
    case "cancelled":
      return "cancelled";
    default:
      return "none";
  }
}

export function getAdminDeliveryState(status: string): AdminDeliveryState {
  switch (status.toLowerCase()) {
    case "approved":
      return "pending";
    case "shipped":
      return "shipped";
    default:
      return "none";
  }
}

export function canAdminApproveOrReject(status: string): boolean {
  return status.toLowerCase() === "pending";
}

export function canAdminMarkShipped(status: string): boolean {
  return status.toLowerCase() === "approved";
}

export function canAdminEditWaybill(status: string): boolean {
  return status.toLowerCase() === "approved";
}

export function hasAdminWaybillReady(
  order: Pick<
    ApiOrder,
    | "courier"
    | "tracking_number"
    | "package_weight_kg"
    | "waybill_logo_type"
    | "waybill_logo_url"
    | "waybill_payment_method"
  >,
): boolean {
  if (!(order.courier ?? "").trim()) {
    return false;
  }
  const weight = Number(order.package_weight_kg);
  if (!order.package_weight_kg || Number.isNaN(weight) || weight <= 0) {
    return false;
  }
  const logoType = (order.waybill_logo_type ?? "").trim();
  if (!logoType) {
    return false;
  }
  if (logoType === "custom" && !(order.waybill_logo_url ?? "").trim()) {
    return false;
  }
  const paymentMethod = (order.waybill_payment_method ?? "").trim();
  if (paymentMethod !== "cod" && paymentMethod !== "online_transfer") {
    return false;
  }
  return true;
}

export function isAdminOrderTerminal(status: string): boolean {
  return ["rejected", "cancelled", "shipped"].includes(status.toLowerCase());
}

export function formatAdminCustomerLabel(order: ApiOrder): string {
  const username = order.customer_username?.trim();
  if (username) {
    return username;
  }
  return order.delivery_email.trim() || "Customer";
}

export const ADMIN_ORDER_STATUS_FILTER_OPTIONS: {
  value: "" | OrderStatus;
  label: string;
}[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "shipped", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

/** Quick-filter tabs shown above the admin orders table. */
export const ADMIN_ORDER_STATUS_QUICK_TABS: {
  value?: OrderStatus;
  label: string;
}[] = [
  { value: undefined, label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "shipped", label: "Complete" },
];

export const ADMIN_ORDER_PAYMENT_FILTER_OPTIONS: {
  value: "" | "cod" | "online_transfer";
  label: string;
}[] = [
  { value: "", label: "All Payment Methods" },
  { value: "cod", label: "Cash on Delivery (COD)" },
  { value: "online_transfer", label: "Online Transfer" },
];

export const ADMIN_DELIVERY_LABELS: Record<AdminDeliveryState, string> = {
  pending: "Pending",
  shipped: "Complete",
  none: "—",
};

export const ADMIN_APPROVAL_LABELS: Record<AdminApprovalState, string> = {
  awaiting: "Awaiting Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  none: "—",
};
