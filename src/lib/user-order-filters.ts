import { dateRangeFilterIsActive } from "@/lib/date-range-filter";
import type { MyOrdersQuery, OrderStatus } from "@/types/order";

export const USER_ORDER_STATUS_FILTER_OPTIONS: {
  value: "" | OrderStatus;
  label: string;
}[] = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "shipped", label: "Complete" },
  { value: "cancelled", label: "Cancelled" },
];

export const USER_ORDER_STATUS_MENU_LABELS = USER_ORDER_STATUS_FILTER_OPTIONS.map(
  (option) => option.label,
) as readonly string[];

export function userOrderStatusLabel(status?: OrderStatus): string {
  return (
    USER_ORDER_STATUS_FILTER_OPTIONS.find((option) => option.value === (status ?? ""))
      ?.label ?? "All Statuses"
  );
}

export function userOrderStatusFromLabel(label: string): OrderStatus | undefined {
  const match = USER_ORDER_STATUS_FILTER_OPTIONS.find((option) => option.label === label);
  return match?.value || undefined;
}

export function myOrdersHasActiveFilters(query: MyOrdersQuery): boolean {
  return Boolean(
    query.status?.trim() ||
      query.order_number?.trim() ||
      dateRangeFilterIsActive({
        from: query.created_from,
        to: query.created_to,
      }),
  );
}
