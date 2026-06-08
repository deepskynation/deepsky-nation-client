"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminEmptyStateClass } from "@/components/admin/product/modules/admin-product-ui";
import { formatMoney } from "@/lib/order-display";
import { cn } from "@/lib/utils";

const CHART_COLORS = {
  revenue: "#059669",
  orders: "#525252",
  pending: "#d97706",
  approved: "#2563eb",
  shipped: "#7c3aed",
  delivered: "#059669",
  rejected: "#dc2626",
  cancelled: "#a3a3a3",
};

type ChartCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div className={cn("space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40 p-5", className)}>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className={cn(adminEmptyStateClass, "py-10")}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

type RevenueTrendChartProps = {
  data: Array<{ label: string; revenue: number }>;
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState message="No sales data for this period." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
            }
          />
          <Tooltip
            formatter={(value) => [
              formatMoney(typeof value === "number" ? value : Number(value) || 0),
              "Revenue",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              fontSize: "12px",
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={CHART_COLORS.revenue}
            strokeWidth={2}
            dot={{ r: 3, fill: CHART_COLORS.revenue }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

type OrderTrendChartProps = {
  data: Array<{
    label: string;
    pending: number;
    approved: number;
    shipped: number;
    delivered: number;
    rejected: number;
    cancelled: number;
  }>;
};

export function OrderTrendChart({ data }: OrderTrendChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState message="No order activity for this period." />;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#737373" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e5e5" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              fontSize: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Bar dataKey="pending" stackId="orders" fill={CHART_COLORS.pending} name="Pending" />
          <Bar dataKey="approved" stackId="orders" fill={CHART_COLORS.approved} name="Approved" />
          <Bar dataKey="shipped" stackId="orders" fill={CHART_COLORS.shipped} name="Shipped" />
          <Bar dataKey="delivered" stackId="orders" fill={CHART_COLORS.delivered} name="Delivered" />
          <Bar dataKey="rejected" stackId="orders" fill={CHART_COLORS.rejected} name="Rejected" />
          <Bar dataKey="cancelled" stackId="orders" fill={CHART_COLORS.cancelled} name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type TopProductsChartProps = {
  data: Array<{ label: string; units: number }>;
};

export function TopProductsChart({ data }: TopProductsChartProps) {
  if (data.length === 0) {
    return <ChartEmptyState message="No product sales for this period." />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#737373" }} />
          <YAxis
            type="category"
            dataKey="label"
            width={120}
            tick={{ fontSize: 11, fill: "#737373" }}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? value : Number(value) || 0,
              "Units Sold",
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e5e5e5",
              fontSize: "12px",
            }}
          />
          <Bar dataKey="units" fill={CHART_COLORS.approved} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
