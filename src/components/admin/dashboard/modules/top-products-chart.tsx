"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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

type TopProductsChartProps = {
  data: Array<{ label: string; units: number }>;
};

export function TopProductsChart({ data }: TopProductsChartProps) {
  return (
    <>
      {data.length === 0 ? (
        <ChartEmptyState message="No product sales for this period." />
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={CHART_GRID_STROKE}
                horizontal={false}
              />
              <XAxis
                type="number"
                allowDecimals={false}
                tick={CHART_AXIS_TICK}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={120}
                tick={CHART_AXIS_TICK}
              />
              <Tooltip
                formatter={(value) => [
                  typeof value === "number" ? value : Number(value) || 0,
                  "Units Sold",
                ]}
                contentStyle={CHART_TOOLTIP_STYLE}
              />
              <Bar
                dataKey="units"
                fill={CHART_COLORS.approved}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
