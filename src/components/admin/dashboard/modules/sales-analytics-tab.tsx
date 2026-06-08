"use client";

import { useMemo, useState } from "react";
import {
  adminAlertErrorClass,
  adminEmptyStateClass,
  adminSectionTitleClass,
  adminTableHeadClass,
  adminTableRowClass,
  adminTableWrapClass,
} from "@/components/admin/product/modules/admin-product-ui";
import {
  ChartCard,
  OrderTrendChart,
  RevenueTrendChart,
  TopProductsChart,
} from "@/components/admin/dashboard/modules/dashboard-charts";
import { Button } from "@/components/ui/button";
import {
  aggregateOrderTrends,
  aggregateSalesTimeSeries,
  formatPeriodLabel,
  inferChartGranularity,
  type ChartGranularity,
} from "@/lib/admin-dashboard-charts";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";
import type { SalesAnalytics } from "@/types/admin-dashboard";

type SalesAnalyticsTabProps = {
  data: SalesAnalytics | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  dateFrom?: string;
  dateTo?: string;
  onRetry: () => void;
};

const GRANULARITY_OPTIONS: { id: ChartGranularity; label: string }[] = [
  { id: "day", label: "Daily" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
];

export function SalesAnalyticsTab({
  data,
  status,
  error,
  dateFrom,
  dateTo,
  onRetry,
}: SalesAnalyticsTabProps) {
  const suggestedGranularity = inferChartGranularity(dateFrom, dateTo);
  const [granularity, setGranularity] = useState<ChartGranularity>(suggestedGranularity);

  const activeGranularity = granularity;

  const timeSeries = useMemo(
    () => aggregateSalesTimeSeries(data?.time_series ?? [], activeGranularity),
    [data?.time_series, activeGranularity],
  );

  const orderTrends = useMemo(
    () => aggregateOrderTrends(data?.order_trends ?? [], activeGranularity),
    [data?.order_trends, activeGranularity],
  );

  const revenueChartData = useMemo(
    () =>
      timeSeries.map((point) => ({
        label: formatPeriodLabel(point.period_start, activeGranularity),
        revenue: Number.parseFloat(point.revenue) || 0,
      })),
    [timeSeries, activeGranularity],
  );

  const orderChartData = useMemo(
    () =>
      orderTrends.map((point) => ({
        label: formatPeriodLabel(point.period_start, activeGranularity),
        pending: point.pending,
        approved: point.approved,
        shipped: point.shipped,
        delivered: point.delivered,
        rejected: point.rejected,
        cancelled: point.cancelled,
      })),
    [orderTrends, activeGranularity],
  );

  const topProductsChartData = useMemo(
    () =>
      (data?.top_products ?? []).slice(0, 8).map((product) => ({
        label: product.product_code || product.title.slice(0, 20),
        units: product.units_sold,
      })),
    [data?.top_products],
  );

  if (status === "loading" && !data) {
    return (
      <div className="space-y-4 p-5 sm:p-6 lg:p-8">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
          <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="space-y-4 p-5 sm:p-6 lg:p-8">
        <div className={adminAlertErrorClass}>{error ?? "Failed to load sales analytics."}</div>
        <Button type="button" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(adminEmptyStateClass, "m-5 sm:m-6 lg:m-8")}>
        <p className="text-sm text-muted-foreground">Sales analytics will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <SummaryTile label="Revenue" value={formatMoney(data.summary.revenue)} />
          <SummaryTile label="Orders" value={data.summary.orders.toLocaleString()} />
          <SummaryTile label="Units Sold" value={data.summary.units_sold.toLocaleString()} />
        </div>

        <div className="inline-flex gap-1 rounded-lg bg-neutral-100/90 p-1">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setGranularity(option.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeGranularity === option.id
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Revenue Trend"
          description={`${activeGranularity.charAt(0).toUpperCase()}${activeGranularity.slice(1)} revenue from completed orders`}
        >
          <RevenueTrendChart data={revenueChartData} />
        </ChartCard>

        <ChartCard
          title="Order Trends"
          description="Order volume by status over time"
        >
          <OrderTrendChart data={orderChartData} />
        </ChartCard>
      </div>

      <ChartCard title="Top-Selling Products" description="By units sold in the selected period">
        <TopProductsChart data={topProductsChartData} />
      </ChartCard>

      <div className="space-y-3">
        <h3 className={adminSectionTitleClass}>Top Products Detail</h3>
        {data.top_products.length === 0 ? (
          <div className={adminEmptyStateClass}>
            <p className="text-sm text-muted-foreground">No product sales in this period.</p>
          </div>
        ) : (
          <div className={adminTableWrapClass}>
            <table className="w-full min-w-[640px]">
              <thead>
                <tr>
                  <th className={cn(adminTableHeadClass, "px-4 py-3")}>Product</th>
                  <th className={cn(adminTableHeadClass, "px-4 py-3")}>Code</th>
                  <th className={cn(adminTableHeadClass, "px-4 py-3 text-right")}>Units</th>
                  <th className={cn(adminTableHeadClass, "px-4 py-3 text-right")}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.top_products.map((product) => (
                  <tr key={product.product_id} className={adminTableRowClass}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{product.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{product.product_code}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{product.units_sold}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatMoney(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-neutral-900">{value}</p>
    </div>
  );
}
