"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_AXIS_TICK,
  CHART_COLORS,
  CHART_GRID_STROKE,
  CHART_TOOLTIP_STYLE,
} from "@/lib/chart-theme";
import { ChartEmptyState } from "@/components/common/feedback/chart-panel";

type OrderTrendChartProps = {
  data: Array<{
    label: string;
    pending: number;
    approved: number;
    shipped: number;
    rejected: number;
    cancelled: number;
  }>;
};

export function OrderTrendChart({ data }: OrderTrendChartProps) {
  return (
    <>
      {data.length === 0 ? (
        <ChartEmptyState message="No order activity for this period." />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="label"
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
              />
              <YAxis
                allowDecimals={false}
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
              />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="pending"
                stackId="orders"
                fill={CHART_COLORS.pending}
                name="Pending"
              />
              <Bar
                dataKey="approved"
                stackId="orders"
                fill={CHART_COLORS.approved}
                name="Approved"
              />
              <Bar
                dataKey="shipped"
                stackId="orders"
                fill={CHART_COLORS.shipped}
                name="Complete"
              />
              <Bar
                dataKey="rejected"
                stackId="orders"
                fill={CHART_COLORS.rejected}
                name="Rejected"
              />
              <Bar
                dataKey="cancelled"
                stackId="orders"
                fill={CHART_COLORS.cancelled}
                name="Cancelled"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
