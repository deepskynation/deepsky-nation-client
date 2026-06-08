"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { authGlassInputClassName } from "@/components/(auth)/modules/auth-glass-styles";
import { DateRangeFilter } from "@/components/common/filters";
import { GlassOptionsMenu } from "@/components/common/filters/glass-options-menu";
import {
  dateRangeFromBounds,
  resolveDateRangeBounds,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import {
  myOrdersHasActiveFilters,
  USER_ORDER_STATUS_MENU_LABELS,
  userOrderStatusFromLabel,
  userOrderStatusLabel,
} from "@/lib/user-order-filters";
import { cn } from "@/lib/utils";
import type { MyOrdersQuery } from "@/types/order";

type UserOrdersFilterBarProps = {
  query: MyOrdersQuery;
  disabled?: boolean;
  onApplyFilters: (patch: Partial<MyOrdersQuery>) => void;
  onClearFilters: () => void;
};

export function UserOrdersFilterBar({
  query,
  disabled = false,
  onApplyFilters,
  onClearFilters,
}: UserOrdersFilterBarProps) {
  const [orderNumberDraft, setOrderNumberDraft] = useState(query.order_number ?? "");
  const hasActiveFilters = myOrdersHasActiveFilters(query);

  useEffect(() => {
    setOrderNumberDraft(query.order_number ?? "");
  }, [query.order_number]);

  const applyOrderNumber = () => {
    onApplyFilters({
      page: 1,
      order_number: orderNumberDraft.trim() || undefined,
    });
  };

  const handleDateRangeChange = (value: DateRangeFilterValue) => {
    const { from, to } = resolveDateRangeBounds(value);
    onApplyFilters({
      page: 1,
      created_from: from,
      created_to: to,
    });
  };

  const handleStatusChange = (label: string) => {
    onApplyFilters({
      page: 1,
      status: userOrderStatusFromLabel(label),
    });
  };

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
        <div className="relative w-full shrink-0 lg:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-black/40"
            aria-hidden
          />
          <input
            type="search"
            value={orderNumberDraft}
            onChange={(event) => setOrderNumberDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyOrderNumber();
              }
            }}
            placeholder="Search order number…"
            aria-label="Search By Order Number"
            disabled={disabled}
            className={cn(authGlassInputClassName, "pl-10")}
          />
        </div>

        <DateRangeFilter
          value={dateRangeFromBounds(query.created_from, query.created_to)}
          onChange={handleDateRangeChange}
          label="Date"
          placeholder="All time"
          className="w-full lg:w-auto"
        />

        <GlassOptionsMenu
          options={USER_ORDER_STATUS_MENU_LABELS}
          value={userOrderStatusLabel(query.status)}
          onChange={handleStatusChange}
          ariaLabel="Filter By Order Status"
          menuTitle="Status"
          className="w-full lg:w-auto"
        />

        <button
          type="button"
          onClick={applyOrderNumber}
          disabled={disabled}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Apply
        </button>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-black/55 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          <X className="size-3.5" aria-hidden />
          Clear filters
        </button>
      ) : null}
    </div>
  );
}
