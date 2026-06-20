"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductSearchBaseProps = {
  basePath?: string;
  className?: string;
};

export function useProductSearch(...resetDeps: unknown[]) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, resetDeps);

  return {
    open,
    openSearch: () => setOpen(true),
    closeSearch: () => setOpen(false),
  };
}

type ProductSearchIconButtonProps = ProductSearchBaseProps & {
  onOpen: () => void;
  iconClassName?: string;
};

export function ProductSearchIconButton({
  onOpen,
  className,
  iconClassName = "size-6",
}: ProductSearchIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Search products"
      className={cn(
        "inline-flex size-10 items-center justify-center text-black transition-opacity hover:opacity-70",
        className,
      )}
    >
      <Search className={iconClassName} strokeWidth={1.75} />
    </button>
  );
}

type ProductSearchBarProps = ProductSearchBaseProps & {
  onClose: () => void;
  initialQuery?: string;
};

export function ProductSearchBar({
  basePath = "/dashboard",
  onClose,
  initialQuery = "",
  className,
}: ProductSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    const params = trimmed ? `?q=${encodeURIComponent(trimmed)}` : "";
    router.push(`${basePath}${params}`);
    onClose();
    setQuery("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full max-w-xl items-center gap-3", className)}
    >
      <div className="relative min-w-0 flex-1">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          placeholder="Search"
          aria-label="Search products"
          className="h-12 w-full rounded-none border border-black bg-white px-3 pr-10 text-sm text-black outline-none placeholder:text-black/35 focus:border-black"
        />
        <button
          type="submit"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-black transition-opacity hover:opacity-70"
          aria-label="Submit search"
        >
          <Search className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="inline-flex size-8 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-70"
        aria-label="Close search"
      >
        <XIcon className="size-5" strokeWidth={1.75} />
      </button>
    </form>
  );
}

type HeaderProductSearchProps = {
  open: boolean;
  onClose: () => void;
  basePath: string;
  initialQuery?: string;
  panelClassName?: string;
  children: ReactNode;
};

/** Swaps header content for the centered search bar when open. */
export function HeaderProductSearch({
  open,
  onClose,
  basePath,
  initialQuery = "",
  panelClassName,
  children,
}: HeaderProductSearchProps) {
  if (open) {
    return (
      <div className={cn("flex items-center justify-center py-5", panelClassName)}>
        <ProductSearchBar
          basePath={basePath}
          initialQuery={initialQuery}
          onClose={onClose}
        />
      </div>
    );
  }

  return <>{children}</>;
}

/** Preset trigger styles for the user app header (beside orders/cart). */
export const userHeaderProductSearchTriggerClassName =
  "size-7 rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:opacity-100";

export const userHeaderProductSearchIconClassName = "size-5";

/** Preset trigger styles for the mobile user app header. */
export const userHeaderProductSearchMobileTriggerClassName =
  "size-9 rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:opacity-100";
