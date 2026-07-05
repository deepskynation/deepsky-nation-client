"use client";

import {
  createCustomDateRange,
  createDateRangeFromPreset,
  DATE_RANGE_QUICK_FILTER_LABELS,
  DATE_RANGE_QUICK_FILTERS,
  type DateRangeFilterValue,
  type DateRangeQuickFilter,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";

const sectionLabelClass =
  "text-[10px] font-medium uppercase tracking-[0.18em] text-black/45";

const quickFilterButtonClass =
  "rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-medium text-neutral-900 transition-colors hover:border-black/30 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15";

const quickFilterButtonActiveClass =
  "border-black bg-black text-white hover:border-black hover:bg-black";

const dateInputClass =
  "h-10 w-full min-w-0 rounded-lg border border-black/15 bg-white px-3 text-sm text-neutral-900 outline-none transition-[border-color,box-shadow] placeholder:text-neutral-400 focus:border-black/30 focus:ring-2 focus:ring-black/10 [color-scheme:light]";

type DateRangeFilterPanelProps = {
  value: DateRangeFilterValue | undefined;
  onChange: (value: DateRangeFilterValue) => void;
  className?: string;
  id?: string;
};

function DateInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <label htmlFor={id} className={sectionLabelClass}>
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={dateInputClass}
      />
    </div>
  );
}

export function DateRangeFilterPanel({
  value,
  onChange,
  className,
  id,
}: DateRangeFilterPanelProps) {
  const activePreset =
    value?.preset && value.preset !== "custom" ? value.preset : undefined;
  const fromValue = value?.from ?? "";
  const toValue = value?.to ?? "";

  const selectPreset = (preset: DateRangeQuickFilter) => {
    onChange(createDateRangeFromPreset(preset));
  };

  const updateCustomRange = (patch: { from?: string; to?: string }) => {
    const nextFrom = patch.from ?? fromValue;
    const nextTo = patch.to ?? toValue;
    onChange(createCustomDateRange(nextFrom, nextTo));
  };

  return (
    <div
      id={id}
      className={cn(
        "w-[min(100vw-2rem,20rem)] rounded-xl border border-black/15 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      <section aria-label="Quick Filters">
        <p className={sectionLabelClass}>Quick Filters</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DATE_RANGE_QUICK_FILTERS.filter((preset) => preset !== "all-time").map(
            (preset) => {
              const isActive = activePreset === preset;

              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectPreset(preset)}
                  className={cn(
                    quickFilterButtonClass,
                    isActive && quickFilterButtonActiveClass,
                  )}
                >
                  {DATE_RANGE_QUICK_FILTER_LABELS[preset]}
                </button>
              );
            },
          )}
        </div>

        <button
          type="button"
          aria-pressed={activePreset === "all-time"}
          onClick={() => selectPreset("all-time")}
          className={cn(
            quickFilterButtonClass,
            "mt-2 w-full",
            activePreset === "all-time" && quickFilterButtonActiveClass,
          )}
        >
          {DATE_RANGE_QUICK_FILTER_LABELS["all-time"]}
        </button>
      </section>

      <div className="my-4 h-px bg-black/10" role="separator" />

      <section aria-label="Custom Range">
        <p className={sectionLabelClass}>Custom Range</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <DateInput
            id={`${id ?? "date-range"}-from`}
            label="From"
            value={fromValue}
            onChange={(nextFrom) => updateCustomRange({ from: nextFrom })}
          />
          <DateInput
            id={`${id ?? "date-range"}-to`}
            label="To"
            value={toValue}
            onChange={(nextTo) => updateCustomRange({ to: nextTo })}
          />
        </div>
      </section>
    </div>
  );
}
