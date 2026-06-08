import { dateRangeFilterIsActive } from "@/lib/date-range-filter";
import type { AdminOrdersQuery } from "@/types/order";

export function adminOrdersHasActiveFilters(query: AdminOrdersQuery): boolean {
  return Boolean(
    query.status?.trim() ||
      query.user_id?.trim() ||
      query.order_number?.trim() ||
      query.customer?.trim() ||
      query.payment_method?.trim() ||
      dateRangeFilterIsActive({
        from: query.created_from,
        to: query.created_to,
      }),
  );
}
