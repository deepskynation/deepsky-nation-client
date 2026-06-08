"use client";

import { type ReactNode } from "react";
import { ListFilter, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const filterFieldClass =
  "h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200/60";

const filterHintClass = "text-xs text-muted-foreground";

export function FilterPanelToggle({
  panelId,
  ariaLabel,
  hasActiveFilters,
  open,
  onToggle,
  className,
}: {
  panelId: string;
  ariaLabel: string;
  hasActiveFilters: boolean;
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={open || hasActiveFilters ? "secondary" : "outline"}
      size="icon"
      className={cn("relative size-10 shrink-0", className)}
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <ListFilter className="size-4" aria-hidden />
      {hasActiveFilters ? (
        <span
          className="absolute top-1.5 right-1.5 size-2 rounded-full bg-neutral-900 ring-2 ring-white"
          aria-hidden
        />
      ) : null}
    </Button>
  );
}

export function ListFilterHeader({
  title,
  subtitle,
  panelId,
  toggleAriaLabel,
  hasActiveFilters,
  open,
  onToggle,
}: {
  title: string;
  subtitle?: string;
  panelId: string;
  toggleAriaLabel: string;
  hasActiveFilters: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <FilterPanelToggle
        panelId={panelId}
        ariaLabel={toggleAriaLabel}
        hasActiveFilters={hasActiveFilters}
        open={open}
        onToggle={onToggle}
      />
    </div>
  );
}

export function FilterPanelSection({
  open,
  panelId,
  ariaLabel,
  title = "Search & filter",
  description = "The table stays visible below. Apply Filters when ready, or close this panel to see more rows.",
  onClose,
  onApply,
  onClearAll,
  hasActiveFilters,
  disabled,
  footerHint,
  applyLabel = "Apply Filters",
  showApplyIcon = false,
  children,
}: {
  open: boolean;
  panelId: string;
  ariaLabel: string;
  title?: string;
  description?: string;
  onClose: () => void;
  onApply: () => void;
  onClearAll?: () => void;
  hasActiveFilters: boolean;
  disabled?: boolean;
  footerHint?: ReactNode;
  applyLabel?: string;
  showApplyIcon?: boolean;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <section
      id={panelId}
      aria-label={ariaLabel}
      className="w-full rounded-xl border border-neutral-200/90 bg-neutral-50/50 p-4 sm:p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {description ? (
            <p className={cn(filterHintClass, "mt-0.5")}>{description}</p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-neutral-500"
          aria-label={`Close ${title.toLowerCase()} panel`}
          onClick={onClose}
          disabled={disabled}
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="space-y-4">{children}</div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-neutral-200/80 pt-4">
        {footerHint ? (
          <p className={cn(filterHintClass, "mr-auto min-w-0 flex-1 basis-full sm:basis-auto")}>
            {footerHint}
          </p>
        ) : null}
        <Button
          type="button"
          size="sm"
          onClick={onApply}
          disabled={disabled}
          className={showApplyIcon ? "gap-2" : undefined}
        >
          {showApplyIcon ? <Search className="size-4" aria-hidden /> : null}
          {applyLabel}
        </Button>
        {hasActiveFilters && onClearAll ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearAll}
            disabled={disabled}
          >
            Clear All
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={disabled}
        >
          Close
        </Button>
      </div>
    </section>
  );
}

export function FilterSearchField({
  id,
  label,
  value,
  placeholder,
  onChange,
  onClear,
  disabled,
  className,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative max-w-xl", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(filterFieldClass, "bg-white pl-9 pr-9")}
      />
      {value.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-neutral-500"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={onClear}
          disabled={disabled}
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

export function OptionalFilterRow({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200/80 bg-white p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-neutral-800">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-7 shrink-0 text-neutral-500 hover:text-neutral-900"
          aria-label={`Remove ${label} filter`}
          onClick={onRemove}
        >
          <X className="size-3.5" />
        </Button>
      </div>
      {children}
    </div>
  );
}
