"use client";

import { useMemo, useState } from "react";
import { OrderTrendChart } from "@/components/admin/dashboard/modules/order-trend-chart";
import { RevenueTrendChart } from "@/components/admin/dashboard/modules/revenue-trend-chart";
import { TopProductsChart } from "@/components/admin/dashboard/modules/top-products-chart";
import { ChartCard } from "@/components/common/feedback/chart-panel";
import { SalesAnalyticsTopProductsTable } from "@/components/admin/dashboard/modules/sales-analytics-top-products-table";
import { ChartPanelsSkeleton } from "@/components/common/feedback/chart-panels-skeleton";
import {
  alertErrorClassName,
  emptyStateClassName,
} from "@/lib/panel-styles";
import { Button } from "@/components/ui/button";
import {
  aggregateOrderTrends,
  aggregateSalesTimeSeries,
  formatPeriodLabel,
  inferChartGranularity,
  type ChartGranularity,
} from "@/lib/admin-dashboard-charts";
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
  const isInitialLoading = status === "loading" && !data;

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

  return (
    <>
      {isInitialLoading ? (
        <ChartPanelsSkeleton />
      ) : status === "failed" ? (
        <div className="space-y-4 p-5 sm:p-6 lg:p-8">
          <div className={alertErrorClassName}>{error ?? "Failed to load sales analytics."}</div>
          <Button type="button" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : !data ? (
        <div className={cn(emptyStateClassName, "m-5 sm:m-6 lg:m-8")}>
          <p className="text-sm text-muted-foreground">Sales analytics will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SalesAnalyticsTopProductsTable section="summary" summary={data.summary} />

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

            <ChartCard title="Order Trends" description="Order volume by status over time">
              <OrderTrendChart data={orderChartData} />
            </ChartCard>
          </div>

          <ChartCard title="Top-Selling Products" description="By units sold in the selected period">
            <TopProductsChart data={topProductsChartData} />
          </ChartCard>

          <SalesAnalyticsTopProductsTable section="detail" products={data.top_products} />
        </div>
      )}
    </>
  );
}
