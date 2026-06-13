import { cn } from "@/lib/utils";

/** Solid panel UI tokens — forms, tables, dashboards, and detail views */

export const fieldClassName =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60";

export const textareaClassName =
  "min-h-[96px] w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60";

export const labelClassName = "text-sm font-medium text-neutral-800";

export const hintClassName = "text-xs text-muted-foreground";

export const cardClassName =
  "overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm";

export const sectionClassName =
  "space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-5 sm:p-6";

export const sectionTitleClassName = "text-sm font-semibold tracking-tight text-neutral-900";

export const tableWrapClassName =
  "overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm";

export const tableHeadClassName =
  "border-b border-neutral-200 bg-neutral-50/90 text-left text-[0.7rem] font-semibold tracking-wider text-neutral-500 uppercase";

export const tableRowClassName =
  "border-b border-neutral-100 text-sm transition-colors last:border-b-0 hover:bg-neutral-50/80";

export function segmentTabClassName(active: boolean) {
  return cn(
    "rounded-md px-3.5 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
    active
      ? "bg-white text-neutral-900 shadow-sm"
      : "text-neutral-600 hover:text-neutral-900",
  );
}

export const segmentListClassName =
  "inline-flex flex-wrap gap-1 rounded-lg bg-neutral-100/90 p-1";

export const chipClassName =
  "inline-flex items-center rounded-md border border-neutral-200/80 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 shadow-sm";

export const emptyStateClassName =
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-14 text-center";

export const alertErrorClassName =
  "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800";

export const alertSuccessClassName =
  "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800";

export const alertWarningClassName =
  "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900";
