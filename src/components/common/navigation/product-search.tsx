"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Search, XIcon } from "lucide-react";
import { useProductSearchSuggestions } from "@/hooks/use-product-search-suggestions";
import { useAppSelector } from "@/hooks";
import {
  buildProductSuggestionHref,
  clearProductSearchQueryParam,
  resolveSearchSubmitHref,
} from "@/lib/product-search";
import { getProductThumbnailSrc } from "@/lib/product-image";
import { selectShopCategories } from "@/store/slices/categorySlice";
import { cn } from "@/lib/utils";
import type { ApiProduct } from "@/types/product";

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

type ProductSearchIconButtonProps = {
  onOpen: () => void;
  className?: string;
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

type ProductSearchSuggestionRowProps = {
  product: ApiProduct;
  basePath: string;
  onSelect: () => void;
};

function ProductSearchSuggestionRow({
  product,
  basePath,
  onSelect,
}: ProductSearchSuggestionRowProps) {
  const thumbnailSrc = getProductThumbnailSrc(product);

  return (
    <li>
      <Link
        href={buildProductSuggestionHref(basePath, product)}
        onClick={onSelect}
        className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-black/[0.03]"
      >
        <div className="size-10 shrink-0 overflow-hidden bg-neutral-100">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt=""
              className="block size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs font-semibold text-black/25">
              {product.title.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <span className="min-w-0 flex-1 text-[11px] leading-snug font-normal uppercase tracking-wide text-black">
          {product.title}
        </span>
      </Link>
    </li>
  );
}

type ProductSearchResultsPanelProps = {
  query: string;
  basePath: string;
  dropdownId: string;
  onNavigate: () => void;
};

function ProductSearchResultsPanel({
  query,
  basePath,
  dropdownId,
  onNavigate,
}: ProductSearchResultsPanelProps) {
  const router = useRouter();
  const categories = useAppSelector(selectShopCategories);
  const trimmed = query.trim();
  const { results, isLoading } = useProductSearchSuggestions(trimmed);

  const goToSearchPage = () => {
    router.push(resolveSearchSubmitHref(basePath, trimmed, results, categories));
    onNavigate();
  };

  if (!trimmed) {
    return null;
  }

  return (
    <div id={dropdownId} className="border-t border-black/10">
      <p className="px-4 pt-3 pb-1 text-[10px] font-normal uppercase tracking-[0.16em] text-black/40">
        Products
      </p>

      {isLoading && results.length === 0 ? (
        <p className="px-4 py-3 text-xs text-black/45">Searching…</p>
      ) : null}

      {!isLoading && results.length === 0 ? (
        <p className="px-4 py-3 text-xs text-black/45">No matching products.</p>
      ) : null}

      {results.length > 0 ? (
        <ul className="py-1">
          {results.map((product) => (
            <ProductSearchSuggestionRow
              key={product.id}
              product={product}
              basePath={basePath}
              onSelect={onNavigate}
            />
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={goToSearchPage}
        className="flex w-full items-center justify-between border-t border-black/10 px-4 py-3.5 text-left text-sm text-black/45 transition-colors hover:bg-black/[0.03]"
      >
        <span>Search for &ldquo;{trimmed}&rdquo;</span>
        <ArrowRight className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      </button>
    </div>
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const dropdownId = useId();
  const [query, setQuery] = useState(initialQuery);
  const categories = useAppSelector(selectShopCategories);
  const trimmedQuery = query.trim();
  const { results: suggestionResults } = useProductSearchSuggestions(trimmedQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const clearSearchFromUrl = () => {
    const currentQuery = (searchParams.get("q") ?? "").trim();
    if (!currentQuery) {
      return;
    }
    router.replace(clearProductSearchQueryParam(pathname, searchParams));
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      clearSearchFromUrl();
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      clearSearchFromUrl();
      onClose();
      return;
    }
    router.push(
      resolveSearchSubmitHref(basePath, trimmed, suggestionResults, categories),
    );
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-[680px]", className)}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          <div
            className={cn(
              "border border-black bg-white",
              trimmedQuery && "border-b-0",
            )}
          >
            <div className="flex items-center gap-2 px-4 py-3">
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                enterKeyHint="search"
                value={query}
                onChange={(event) => handleQueryChange(event.target.value)}
                autoComplete="off"
                placeholder="Search"
                aria-label="Search products"
                aria-expanded={trimmedQuery.length > 0}
                aria-controls={trimmedQuery.length > 0 ? dropdownId : undefined}
                className="min-w-0 flex-1 bg-transparent text-sm text-black outline-none placeholder:text-black/35"
              />
              <button
                type="submit"
                className="shrink-0 border-0 bg-transparent p-0 shadow-none text-black transition-opacity hover:opacity-70"
                aria-label="Submit search"
              >
                <Search className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {trimmedQuery ? (
            <div className="border border-t-0 border-black bg-white">
              <ProductSearchResultsPanel
                query={query}
                basePath={basePath}
                dropdownId={dropdownId}
                onNavigate={onClose}
              />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 shrink-0 border-0 bg-transparent p-0 shadow-none text-black transition-opacity hover:opacity-70"
          aria-label="Close search"
        >
          <XIcon className="size-5" strokeWidth={1.75} />
        </button>
      </div>
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

/** Centered header search overlay (offhigh-style). */
export function HeaderProductSearch({
  open,
  onClose,
  basePath,
  initialQuery = "",
  panelClassName,
  children,
}: HeaderProductSearchProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollY = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <>
      {/* Preserve header height; extend white bar with pb when search is open. */}
      <div className={cn(open && "invisible pb-4 md:pb-5")}>{children}</div>

      {open
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close search overlay"
                className="fixed inset-0 z-[45] bg-black/40"
                onClick={onClose}
              />
              <div
                className={cn(
                  "pointer-events-auto fixed inset-x-0 top-0 z-[51] flex justify-center px-4 pt-4 md:px-6 md:pt-5",
                  panelClassName,
                )}
              >
                <ProductSearchBar
                  basePath={basePath}
                  initialQuery={initialQuery}
                  onClose={onClose}
                />
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  );
}

/** Preset trigger styles for the user app header (beside orders/cart). */
export const userHeaderProductSearchTriggerClassName =
  "size-7 rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:opacity-100";

export const userHeaderProductSearchIconClassName = "size-5";

/** Preset trigger styles for the mobile user app header. */
export const userHeaderProductSearchMobileTriggerClassName =
  "size-9 rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:opacity-100";
