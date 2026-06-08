import type { ApiOrder, OrderStatus } from "@/types/order";

export type AdminApprovalState = "awaiting" | "approved" | "rejected" | "cancelled" | "none";

export type AdminDeliveryState = "pending" | "shipped" | "delivered" | "none";

export function getAdminApprovalState(status: string): AdminApprovalState {
  switch (status.toLowerCase()) {
    case "pending":
      return "awaiting";
    case "approved":
    case "shipped":
    case "delivered":
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
    case "delivered":
      return "delivered";
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

export function canAdminMarkDelivered(status: string): boolean {
  return status.toLowerCase() === "shipped";
}

export function isAdminOrderTerminal(status: string): boolean {
  return ["rejected", "cancelled", "delivered"].includes(status.toLowerCase());
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
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
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
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
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
  shipped: "Shipped",
  delivered: "Delivered",
  none: "—",
};

export const ADMIN_APPROVAL_LABELS: Record<AdminApprovalState, string> = {
  awaiting: "Awaiting Review",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
  none: "—",
};
