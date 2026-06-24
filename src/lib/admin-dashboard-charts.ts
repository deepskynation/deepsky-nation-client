import type { OrderTrendPoint, SalesTimeSeriesPoint } from "@/types/admin-dashboard";

export type ChartGranularity = "day" | "week" | "month";

export function inferChartGranularity(from?: string, to?: string): ChartGranularity {
  if (!from || !to) {
    return "month";
  }
  const start = new Date(from);
  const end = new Date(to);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays <= 31) {
    return "day";
  }
  if (diffDays <= 180) {
    return "week";
  }
  return "month";
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diff);
  return result;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function bucketKey(date: Date, granularity: ChartGranularity): string {
  if (granularity === "day") {
    return formatIsoDate(date);
  }
  if (granularity === "week") {
    return formatIsoDate(startOfWeek(date));
  }
  return formatIsoDate(startOfMonth(date));
}

export function aggregateSalesTimeSeries(
  points: SalesTimeSeriesPoint[],
  granularity: ChartGranularity,
): SalesTimeSeriesPoint[] {
  if (granularity === "day") {
    return points;
  }

  const buckets = new Map<
    string,
    { revenue: number; orders: number; units_sold: number }
  >();

  for (const point of points) {
    const key = bucketKey(parseIsoDate(point.period_start), granularity);
    const existing = buckets.get(key) ?? { revenue: 0, orders: 0, units_sold: 0 };
    existing.revenue += Number.parseFloat(point.revenue) || 0;
    existing.orders += point.orders;
    existing.units_sold += point.units_sold;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period_start, values]) => ({
      period_start,
      revenue: values.revenue.toFixed(2),
      orders: values.orders,
      units_sold: values.units_sold,
    }));
}

export function aggregateOrderTrends(
  points: OrderTrendPoint[],
  granularity: ChartGranularity,
): OrderTrendPoint[] {
  if (granularity === "day") {
    return points;
  }

  const buckets = new Map<string, Omit<OrderTrendPoint, "period_start">>();

  for (const point of points) {
    const key = bucketKey(parseIsoDate(point.period_start), granularity);
    const existing = buckets.get(key) ?? {
      total: 0,
      pending: 0,
      approved: 0,
      shipped: 0,
      rejected: 0,
      cancelled: 0,
    };
    existing.total += point.total;
    existing.pending += point.pending;
    existing.approved += point.approved;
    existing.shipped += point.shipped;
    existing.rejected += point.rejected;
    existing.cancelled += point.cancelled;
    buckets.set(key, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period_start, values]) => ({
      period_start,
      ...values,
    }));
}

export function formatPeriodLabel(iso: string, granularity: ChartGranularity): string {
  const date = parseIsoDate(iso);
  if (granularity === "month") {
    return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }
  if (granularity === "week") {
    return `Week of ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
