"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState } from "react";
import { EyeIcon, MoreVertical, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductRowActionsMenuProps = {
  onView: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  disabled?: boolean;
};

type MenuPosition = {
  top: number;
  right: number;
  minWidth: number;
};

export function ProductRowActionsMenu({
  onView,
  onEdit,
  onDelete,
  disabled = false,
}: ProductRowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
      minWidth: 148,
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
      if (menuRef.current?.contains(target)) {
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

  const runAction = (action: () => void) => {
    setOpen(false);
    action();
  };

  const menuItemClass =
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100";

  const menu =
    open && position
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Product Actions"
            style={{
              position: "fixed",
              top: position.top,
              right: position.right,
              minWidth: position.minWidth,
              zIndex: 9999,
            }}
            className="rounded-lg border border-neutral-200/90 bg-white p-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => runAction(onView)}
            >
              <EyeIcon className="size-4 shrink-0" />
              View Details
            </button>
            {onEdit && (
              <button
                type="button"
                role="menuitem"
                className={menuItemClass}
                onClick={() => runAction(onEdit)}
              >
                <PencilIcon className="size-4 shrink-0" />
                Edit
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={cn(
                menuItemClass,
                "text-red-600 hover:bg-red-50 hover:text-red-700",
              )}
              onClick={() => runAction(onDelete)}
            >
              <Trash2Icon className="size-4 shrink-0" />
              Delete
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={disabled}
        aria-label="Product Actions"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="text-neutral-600 hover:text-neutral-900"
      >
        <MoreVertical className="size-4" />
      </Button>
      {menu}
    </>
  );
}
