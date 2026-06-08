"use client";

import { useCallback, useEffect, useState } from "react";

export function useFilterPanel(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setOpen((value) => !value);
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return { open, setOpen, toggle, close };
}
