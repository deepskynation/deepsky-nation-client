"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/pagination";

export type TablePaginationProps = {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
  pageSizeOptions?: readonly number[];
  pageSizeLabel?: string;
  /** Top divider above controls (default on for admin tables). */
  bordered?: boolean;
  className?: string;
};

export function TablePagination({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  disabled = false,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSizeLabel = "Rows per page:",
  bordered = true,
  className,
}: TablePaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const canGoPrevious = page > 1 && !disabled;
  const canGoNext = page < safeTotalPages && !disabled;
  const sizeOptions = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        bordered && "border-t border-black/10 pt-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label htmlFor="table-pagination-page-size" className="text-muted-foreground">
          {pageSizeLabel}
        </label>
        <select
          id="table-pagination-page-size"
          value={pageSize}
          disabled={disabled}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={cn(
            "h-8 min-w-[4.5rem] cursor-pointer rounded-lg border border-black/10 bg-background px-2.5",
            "text-sm font-medium text-foreground tabular-nums",
            "outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span
          className="min-w-[7.5rem] px-2 text-center font-medium text-foreground tabular-nums"
          aria-live="polite"
        >
          Page {page} of {safeTotalPages}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
