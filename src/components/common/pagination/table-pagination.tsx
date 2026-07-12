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
        "flex flex-row flex-wrap items-center justify-between gap-x-3 gap-y-2",
        bordered && "border-t border-black/10 pt-4",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5 text-sm sm:gap-2">
        <label
          htmlFor="table-pagination-page-size"
          className="shrink-0 text-muted-foreground"
        >
          <span className="sm:hidden">Rows:</span>
          <span className="hidden sm:inline">{pageSizeLabel}</span>
        </label>
        <select
          id="table-pagination-page-size"
          value={pageSize}
          disabled={disabled}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={cn(
            "h-8 min-w-[3.75rem] cursor-pointer rounded-lg border border-black/10 bg-background px-2",
            "text-sm font-medium text-foreground tabular-nums sm:min-w-[4.5rem] sm:px-2.5",
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

      <div className="flex items-center gap-1.5 text-sm sm:gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(page - 1)}
          className="px-2.5 sm:px-3"
        >
          <span className="sm:hidden">Prev</span>
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <span
          className="shrink-0 px-1 text-center font-medium text-foreground tabular-nums sm:min-w-[7.5rem] sm:px-2"
          aria-live="polite"
        >
          <span className="sm:hidden">
            {page}/{safeTotalPages}
          </span>
          <span className="hidden sm:inline">
            Page {page} of {safeTotalPages}
          </span>
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canGoNext}
          onClick={() => onPageChange(page + 1)}
          className="px-2.5 sm:px-3"
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
