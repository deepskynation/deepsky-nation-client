"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { getPaginationRange } from "@/lib/pagination-range";
import { cn } from "@/lib/utils";

export type TabPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  className?: string;
};

const controlClassName =
  "inline-flex size-9 shrink-0 items-center justify-center text-black/45 transition-colors hover:text-black disabled:pointer-events-none disabled:opacity-30";

const pageClassName =
  "inline-flex min-w-9 items-center justify-center px-2 py-1.5 text-sm tabular-nums transition-colors";

export function TabPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: TabPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const items = getPaginationRange(page, totalPages);
  const canGoPrevious = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex flex-wrap items-center justify-center gap-0.5 sm:gap-1", className)}
    >
      <button
        type="button"
        className={controlClassName}
        disabled={!canGoPrevious}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="size-4" strokeWidth={2} aria-hidden />
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            className="px-1.5 text-sm text-black/35 select-none"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            disabled={disabled}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
            className={cn(
              pageClassName,
              item === page
                ? "border-b-2 border-black font-medium text-black"
                : "text-black/45 hover:text-black",
            )}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        className={controlClassName}
        disabled={!canGoNext}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRightIcon className="size-4" strokeWidth={2} aria-hidden />
      </button>
    </nav>
  );
}
