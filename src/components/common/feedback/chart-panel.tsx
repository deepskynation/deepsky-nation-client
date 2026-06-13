import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

type ChartEmptyStateProps = {
  message: string;
  className?: string;
};

const chartEmptyStateClassName =
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-10 text-center";

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/40 p-5",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function ChartEmptyState({ message, className }: ChartEmptyStateProps) {
  return (
    <div className={cn(chartEmptyStateClassName, className)}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
