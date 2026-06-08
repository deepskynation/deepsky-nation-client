"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  MoreVertical,
  SlidersHorizontal,
} from "lucide-react";
import {
  glassOptionsMenuItemActiveClassName,
  glassOptionsMenuItemClassName,
  glassOptionsMenuPanelClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type GlassOptionsMenuProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  menuTitle?: string;
  className?: string;
};

type MenuPosition = {
  top: number;
  right: number;
  minWidth: number;
};

function getOptionIcon(option: string): ReactNode {
  const iconClassName = "size-4 shrink-0 text-black/45";

  if (option === "Low to High" || option.includes("Low to High")) {
    return <ArrowUp className={iconClassName} aria-hidden />;
  }

  if (option === "High To Low" || option.includes("High To Low")) {
    return <ArrowDown className={iconClassName} aria-hidden />;
  }

  if (option === "Default") {
    return <SlidersHorizontal className={iconClassName} aria-hidden />;
  }

  return null;
}

export function GlassOptionsMenu<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "More options",
  menuTitle,
  className,
}: GlassOptionsMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
      minWidth: Math.max(rect.width, 220),
    });
  };

  useEffect(() => {
    if (!open) return;

    updatePosition();

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const selectOption = (option: T) => {
    onChange(option);
    setOpen(false);
  };

  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            style={{
              position: "fixed",
              top: position.top,
              right: position.right,
              minWidth: position.minWidth,
              zIndex: 9999,
            }}
            className={glassOptionsMenuPanelClassName}
          >
            {menuTitle ? (
              <p className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-[0.22em] text-black/40">
                {menuTitle}
              </p>
            ) : null}

            <div className="space-y-0.5">
              {options.map((option) => {
                const isActive = value === option;
                const icon = getOptionIcon(option);

                return (
                  <button
                    key={option}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isActive}
                    onClick={() => selectOption(option)}
                    className={cn(
                      glassOptionsMenuItemClassName,
                      isActive && glassOptionsMenuItemActiveClassName,
                    )}
                  >
                    {icon ? (
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md bg-black/[0.03]",
                          isActive && "bg-white text-black shadow-sm",
                        )}
                      >
                        {icon}
                      </span>
                    ) : null}

                    <span className="min-w-0 flex-1">{option}</span>

                    {isActive ? (
                      <Check
                        className="size-4 shrink-0 text-black"
                        strokeWidth={2.5}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={cn("relative shrink-0", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          setOpen((current) => {
            const next = !current;
            if (next) updatePosition();
            return next;
          });
        }}
        className={cn(
          "flex size-10 items-center justify-center rounded-lg text-black/55 transition-colors hover:bg-black/5 hover:text-black",
          open && "bg-black/10 text-black",
        )}
      >
        <MoreVertical className="size-5" aria-hidden />
      </button>
      {menu}
    </div>
  );
}
