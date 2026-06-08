"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { DateRangeFilterPanel } from "@/components/common/filters/date-range-filter-panel";
import {
  dateRangeFilterIsActive,
  formatDateRangeFilterLabel,
  type DateRangeFilterValue,
} from "@/lib/date-range-filter";
import { cn } from "@/lib/utils";

type MenuPosition = {
  top: number;
  left: number;
  minWidth: number;
};

type DateRangeFilterProps = {
  value: DateRangeFilterValue | undefined;
  onChange: (value: DateRangeFilterValue) => void;
  /** Label shown on the trigger when no range is selected. */
  placeholder?: string;
  /** Optional prefix before the selected label (e.g. "Date"). */
  label?: string;
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  /** Custom trigger content. Receives the formatted label and active state. */
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

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const panelWidth = Math.max(rect.width, 320);
    const left = Math.min(
      rect.left,
      window.innerWidth - panelWidth - 16,
    );

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

  const panel =
    open && position
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              minWidth: position.minWidth,
              zIndex: 9999,
            }}
          >
            <DateRangeFilterPanel
              id={panelId}
              value={value}
              onChange={onChange}
              className={panelClassName}
            />
          </div>,
          document.body,
        )
      : null;

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
          "inline-flex h-10 items-center gap-2 rounded-lg border border-[#E0E0E0] bg-white px-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:border-[#7D7489]/40 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A235A]/30",
          isActive && "border-[#4A235A]/35 bg-[#4A235A]/[0.04]",
          triggerClassName,
        )}
      >
        {renderTrigger ? (
          renderTrigger({ label: triggerText, isActive, isOpen: open })
        ) : (
          <>
            <Calendar className="size-4 shrink-0 text-[#7D7489]" aria-hidden />
            <span className="truncate">{triggerText}</span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-[#7D7489] transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </>
        )}
      </button>
      {panel}
    </div>
  );
}

export { DateRangeFilterPanel } from "@/components/common/filters/date-range-filter-panel";
export type { DateRangeFilterValue, DateRangeQuickFilter } from "@/lib/date-range-filter";
export {
  createDateRangeFromPreset,
  dateRangeFilterIsActive,
  formatDateRangeFilterLabel,
  resolveDateRangeBounds,
} from "@/lib/date-range-filter";
