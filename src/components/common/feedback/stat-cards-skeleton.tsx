import { cn } from "@/lib/utils";

type StatCardsSkeletonRow = {
  count: number;
  columns?: 2 | 3 | 4;
};

type StatCardsSkeletonProps = {
  rows?: StatCardsSkeletonRow[];
};

const DEFAULT_ROWS: StatCardsSkeletonRow[] = [
  { count: 3, columns: 3 },
  { count: 2, columns: 2 },
];

const GRID_COLUMNS_CLASS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
} as const;

export function StatCardsSkeleton({ rows = DEFAULT_ROWS }: StatCardsSkeletonProps) {
  return (
    <>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={cn(
            "grid gap-4",
            row.columns ? GRID_COLUMNS_CLASS[row.columns] : undefined,
          )}
        >
          {Array.from({ length: row.count }, (_, cardIndex) => (
            <div
              key={cardIndex}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-neutral-200" />
                <div className="h-8 w-16 animate-pulse rounded bg-neutral-200" />
                <div className="h-3 w-40 animate-pulse rounded bg-neutral-100" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}
