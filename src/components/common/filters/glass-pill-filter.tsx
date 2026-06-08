"use client";

import {
  glassFilterPillActiveClassName,
  glassFilterPillClassName,
  glassFilterPillSimpleActiveClassName,
  glassFilterPillSimpleClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type GlassPillFilterProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  className?: string;
  variant?: "default" | "simple";
};

export function GlassPillFilter<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Filter options",
  className,
  variant = "default",
}: GlassPillFilterProps<T>) {
  const isSimple = variant === "simple";
  const pillClassName = isSimple
    ? glassFilterPillSimpleClassName
    : glassFilterPillClassName;
  const pillActiveClassName = isSimple
    ? glassFilterPillSimpleActiveClassName
    : glassFilterPillActiveClassName;
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 scrollbar-hide",
        className,
      )}
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={isActive}
            className={cn(pillClassName, isActive && pillActiveClassName)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
