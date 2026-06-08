"use client";

import {
  CheckIcon,
  ClockIcon,
  PackageCheckIcon,
  TruckIcon,
  XIcon,
} from "lucide-react";
import {
  adminSegmentListClass,
  adminSegmentTabClass,
} from "@/components/admin/product/modules/admin-product-ui";
import { ADMIN_ORDER_STATUS_QUICK_TABS } from "@/lib/admin-order-status";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const TAB_ICONS = {
  pending: ClockIcon,
  approved: CheckIcon,
  rejected: XIcon,
  shipped: TruckIcon,
  delivered: PackageCheckIcon,
} as const satisfies Partial<Record<OrderStatus, typeof ClockIcon>>;

function statusTabIcon(status: OrderStatus) {
  return TAB_ICONS[status as keyof typeof TAB_ICONS];
}

export function AdminOrderStatusTabs({
  activeStatus,
  disabled,
  onStatusChange,
}: {
  activeStatus?: OrderStatus;
  disabled?: boolean;
  onStatusChange: (status?: OrderStatus) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter Orders By Status"
      className={adminSegmentListClass}
    >
      {ADMIN_ORDER_STATUS_QUICK_TABS.map((tab) => {
        const isActive = (activeStatus ?? undefined) === tab.value;
        const Icon = tab.value ? statusTabIcon(tab.value) : null;

        return (
          <button
            key={tab.label}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            onClick={() => onStatusChange(tab.value)}
            className={cn(
              adminSegmentTabClass(isActive),
              "inline-flex items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {Icon ? <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden /> : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
