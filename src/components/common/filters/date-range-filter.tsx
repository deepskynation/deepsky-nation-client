"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import {
  createCustomDateRange,
  createDateRangeFromPreset,
  DATE_RANGE_QUICK_FILTER_LABELS,
  DATE_RANGE_QUICK_FILTERS,
  dateRangeFilterIsActive,
  formatDateRangeFilterLabel,
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

const panelClass =
  "w-[min(100vw-2rem,20rem)] rounded-xl border border-black/15 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]";

const triggerClass =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-black/15 bg-white px-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:border-black/30 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15";

const triggerActiveClass = "border-black/35 bg-black/[0.04]";

type MenuPosition = {
  top: number;
  left: number;
  minWidth: number;
};

type DateRangeFilterProps = {
  value: DateRangeFilterValue | undefined;
  onChange: (value: DateRangeFilterValue) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  renderTrigger?: (props: {
    label: string;
    isActive: boolean;
    isOpen: boolean;
  }) => ReactNode;
};

export function DateRangeFilter({
  value,
  onChange,
  placeholder = "All Time",
  label,
  className,
  triggerClassName,
  panelClassName,
  renderTrigger,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const selectedLabel = formatDateRangeFilterLabel(value, placeholder);
  const isActive = dateRangeFilterIsActive(value);
  const triggerText = label ? `${label}: ${selectedLabel}` : selectedLabel;
  const activePreset =
    value?.preset && value.preset !== "custom" ? value.preset : undefined;
  const fromValue = value?.from ?? "";
  const toValue = value?.to ?? "";

  const selectPreset = (preset: DateRangeQuickFilter) => {
    onChange(createDateRangeFromPreset(preset));
  };

  const updateCustomRange = (patch: { from?: string; to?: string }) => {
    onChange(
      createCustomDateRange(patch.from ?? fromValue, patch.to ?? toValue),
    );
  };

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, 320);
    const left = Math.min(rect.left, window.innerWidth - panelWidth - 16);

    setPosition({
      top: rect.bottom + 8,
      left: Math.max(16, left),
      minWidth: panelWidth,
    });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) {
        return;
      }
      if (panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const filterPanel = (
    <div id={panelId} className={cn(panelClass, panelClassName)}>
      <section aria-label="Quick Filters">
        <p className={sectionLabelClass}>Quick Filters</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {DATE_RANGE_QUICK_FILTERS.filter((preset) => preset !== "all-time").map(
            (preset) => (
              <button
                key={preset}
                type="button"
                aria-pressed={activePreset === preset}
                onClick={() => selectPreset(preset)}
                className={cn(
                  quickFilterButtonClass,
                  activePreset === preset && quickFilterButtonActiveClass,
                )}
              >
                {DATE_RANGE_QUICK_FILTER_LABELS[preset]}
              </button>
            ),
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
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={`${panelId}-from`} className={sectionLabelClass}>
              From
            </label>
            <input
              id={`${panelId}-from`}
              type="date"
              value={fromValue}
              onChange={(event) =>
                updateCustomRange({ from: event.target.value })
              }
              className={dateInputClass}
            />
          </div>
          <div className="min-w-0 space-y-1.5">
            <label htmlFor={`${panelId}-to`} className={sectionLabelClass}>
              To
            </label>
            <input
              id={`${panelId}-to`}
              type="date"
              value={toValue}
              onChange={(event) => updateCustomRange({ to: event.target.value })}
              className={dateInputClass}
            />
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Filter By date range"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) {
              updatePosition();
            }
            return next;
          });
        }}
        className={cn(
          triggerClass,
          isActive && triggerActiveClass,
          triggerClassName,
        )}
      >
        {renderTrigger ? (
          renderTrigger({ label: triggerText, isActive, isOpen: open })
        ) : (
          <>
            <Calendar className="size-4 shrink-0 text-black/45" aria-hidden />
            <span className="truncate">{triggerText}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-black/45 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        )}
      </button>
      {open && position
        ? createPortal(
            <div
              ref={panelRef}
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                minWidth: position.minWidth,
                zIndex: 9999,
              }}
            >
              {filterPanel}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
