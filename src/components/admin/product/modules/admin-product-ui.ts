import { cn } from "@/lib/utils";

/** Shared field styles for admin product flows */
export const adminFieldClass =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60";

export const adminTextareaClass =
  "min-h-[96px] w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60";

export const adminLabelClass = "text-sm font-medium text-neutral-800";

export const adminHintClass = "text-xs text-muted-foreground";

export const adminCardClass =
  "overflow-hidden rounded-2xl border border-neutral-200/90 bg-white shadow-sm";

export const adminSectionClass =
  "space-y-4 rounded-xl border border-neutral-200/80 bg-neutral-50/50 p-5 sm:p-6";

export const adminSectionTitleClass = "text-sm font-semibold tracking-tight text-neutral-900";

export const adminTableWrapClass =
  "overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-sm";

export const adminTableHeadClass =
  "border-b border-neutral-200 bg-neutral-50/90 text-left text-[0.7rem] font-semibold tracking-wider text-neutral-500 uppercase";

export const adminTableRowClass =
  "border-b border-neutral-100 text-sm transition-colors last:border-b-0 hover:bg-neutral-50/80";

export function adminSegmentTabClass(active: boolean) {
  return cn(
    "rounded-md px-3.5 py-2 text-sm font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-neutral-300",
    active
      ? "bg-white text-neutral-900 shadow-sm"
      : "text-neutral-600 hover:text-neutral-900",
  );
}

export const adminSegmentListClass =
  "inline-flex flex-wrap gap-1 rounded-lg bg-neutral-100/90 p-1";

export const adminChipClass =
  "inline-flex items-center rounded-md border border-neutral-200/80 bg-white px-2.5 py-1 text-xs font-medium text-neutral-800 shadow-sm";

export const adminEmptyStateClass =
  "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50/60 px-6 py-14 text-center";

export const adminAlertErrorClass =
  "rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800";

export const adminAlertSuccessClass =
  "rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800";

export const adminAlertWarningClass =
  "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900";
