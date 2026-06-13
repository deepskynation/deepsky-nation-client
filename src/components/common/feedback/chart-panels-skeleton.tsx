import { cn } from "@/lib/utils";

type ChartPanelsSkeletonProps = {
  chartCount?: number;
  columns?: 1 | 2;
  showHeaderBar?: boolean;
};

const GRID_COLUMNS_CLASS = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
} as const;

export function ChartPanelsSkeleton({
  chartCount = 2,
  columns = 2,
  showHeaderBar = true,
}: ChartPanelsSkeletonProps) {
  return (
    <div className="space-y-4 p-5 sm:p-6 lg:p-8">
      {showHeaderBar ? (
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-200" />
      ) : null}
      <div className={cn("grid gap-4", GRID_COLUMNS_CLASS[columns])}>
        {Array.from({ length: chartCount }, (_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
    </div>
  );
}
