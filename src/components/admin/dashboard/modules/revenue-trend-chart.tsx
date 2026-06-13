"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import { formatMoney } from "@/lib/order-display";

type RevenueTrendChartProps = {
  data: Array<{ label: string; revenue: number }>;
};

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <>
      {data.length === 0 ? (
        <ChartEmptyState message="No sales data for this period." />
      ) : (
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_STROKE} />
              <XAxis
                dataKey="label"
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
              />
              <YAxis
                tick={CHART_AXIS_TICK}
                tickLine={false}
                axisLine={{ stroke: CHART_GRID_STROKE }}
                tickFormatter={(value: number) =>
                  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
                }
              />
              <Tooltip
                formatter={(value) => [
                  formatMoney(typeof value === "number" ? value : Number(value) || 0),
                  "Revenue",
                ]}
                contentStyle={CHART_TOOLTIP_STYLE}
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
      )}
    </>
  );
}
