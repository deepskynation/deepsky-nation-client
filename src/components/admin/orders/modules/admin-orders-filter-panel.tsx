"use client";

import { useEffect, useState } from "react";
import {
  FilterPanelSection,
  ListFilterHeader,
} from "@/components/common/filters/list-filter-panel";
import { useFilterPanel } from "@/components/common/filters/use-list-filter-panel";
import {
  adminFieldClass,
  adminLabelClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { DateRangeFilter } from "@/components/common/filters";
import { AdminOrderStatusTabs } from "@/components/admin/orders/modules/admin-order-status-tabs";
import {
  ADMIN_ORDER_PAYMENT_FILTER_OPTIONS,
  ADMIN_ORDER_STATUS_FILTER_OPTIONS,
} from "@/lib/admin-order-status";
import { adminOrdersHasActiveFilters } from "@/lib/admin-order-filters";
import {
  dateRangeFromBounds,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";
import type { AdminOrderPaymentMethod, AdminOrdersQuery, OrderStatus } from "@/types/order";

const PANEL_ID = "admin-orders-filters-panel";

type FilterDraft = {
  status: "" | OrderStatus;
  order_number: string;
  customer: string;
  payment_method: "" | AdminOrderPaymentMethod;
  dateRange?: DateRangeFilterValue;
};

function draftFromQuery(query: AdminOrdersQuery): FilterDraft {
  return {
    status: query.status ?? "",
    order_number: query.order_number ?? "",
    customer: query.customer ?? "",
    payment_method: query.payment_method ?? "",
    dateRange: dateRangeFromBounds(query.created_from, query.created_to),
  };
}

function draftToQueryPatch(draft: FilterDraft): Partial<AdminOrdersQuery> {
  const { from, to } = resolveDateRangeBounds(draft.dateRange);

  return {
    status: draft.status || undefined,
    order_number: draft.order_number.trim() || undefined,
    customer: draft.customer.trim() || undefined,
    payment_method: draft.payment_method || undefined,
    created_from: from,
    created_to: to,
  };
}

export function AdminOrdersFilterPanel({
  headingSubtitle,
  query,
  disabled,
  onApplyFilters,
  onClearAll,
  onStatusTabChange,
}: {
  headingSubtitle?: string;
  query: AdminOrdersQuery;
  disabled?: boolean;
  onApplyFilters: (patch: Partial<AdminOrdersQuery>) => void;
  onClearAll: () => void;
  onStatusTabChange?: (status?: OrderStatus) => void;
}) {
  const { open, toggle, close } = useFilterPanel();
  const [draft, setDraft] = useState<FilterDraft>(() => draftFromQuery(query));

  useEffect(() => {
    setDraft(draftFromQuery(query));
  }, [query]);

  const hasActive = adminOrdersHasActiveFilters(query);

  const applyDraft = () => {
    onApplyFilters({ page: 1, ...draftToQueryPatch(draft) });
  };

  const clearEverything = () => {
    setDraft({
      status: "",
      order_number: "",
      customer: "",
      payment_method: "",
      dateRange: undefined,
    });
    onClearAll();
    close();
  };

  return (
    <div className="space-y-4">
      <ListFilterHeader
        title="All Orders"
        subtitle={headingSubtitle}
        panelId={PANEL_ID}
        toggleAriaLabel="Search And Filter Orders"
        hasActiveFilters={hasActive}
        open={open}
        onToggle={toggle}
      />

      {onStatusTabChange ? (
        <AdminOrderStatusTabs
          activeStatus={query.status}
          disabled={disabled}
          onStatusChange={onStatusTabChange}
        />
      ) : null}

      <FilterPanelSection
        open={open}
        panelId={PANEL_ID}
        ariaLabel="Search And Filter Orders"
        title="Filter Orders"
        onClose={close}
        onApply={applyDraft}
        onClearAll={clearEverything}
        hasActiveFilters={hasActive}
        disabled={disabled}
        showApplyIcon
        footerHint="Order number supports partial matches. Customer matches username or email."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="space-y-1.5">
            <span className={adminLabelClass}>Placed Date</span>
            <DateRangeFilter
              value={draft.dateRange}
              onChange={(dateRange) => setDraft((prev) => ({ ...prev, dateRange }))}
              placeholder="All time"
              triggerClassName={cn(adminFieldClass, "w-full justify-between text-left")}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-orders-order-number-filter" className={adminLabelClass}>
              Order number
            </label>
            <input
              id="admin-orders-order-number-filter"
              type="text"
              className={adminFieldClass}
              placeholder="e.g. ORD-105230"
              value={draft.order_number}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, order_number: event.target.value }))
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-orders-customer-filter" className={adminLabelClass}>
              Customer
            </label>
            <input
              id="admin-orders-customer-filter"
              type="search"
              className={adminFieldClass}
              placeholder="Username or email"
              value={draft.customer}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, customer: event.target.value }))
              }
              disabled={disabled}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-orders-payment-filter" className={adminLabelClass}>
              Payment
            </label>
            <select
              id="admin-orders-payment-filter"
              className={adminFieldClass}
              value={draft.payment_method}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  payment_method: event.target.value as FilterDraft["payment_method"],
                }))
              }
              disabled={disabled}
            >
              {ADMIN_ORDER_PAYMENT_FILTER_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="admin-orders-status-filter" className={adminLabelClass}>
              Status
            </label>
            <select
              id="admin-orders-status-filter"
              className={adminFieldClass}
              value={draft.status}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  status: event.target.value as FilterDraft["status"],
                }))
              }
              disabled={disabled}
            >
              {ADMIN_ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FilterPanelSection>
    </div>
  );
}
