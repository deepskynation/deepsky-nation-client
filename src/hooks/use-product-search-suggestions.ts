"use client";

import { useEffect, useState } from "react";
import {
  fetchProductSearchPreview,
  PRODUCT_SEARCH_DEBOUNCE_MS,
} from "@/lib/product-search";
import type { ApiProduct } from "@/types/product";

type SearchSuggestionsStatus = "idle" | "loading" | "ready";

export function useProductSearchSuggestions(query: string) {
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [status, setStatus] = useState<SearchSuggestionsStatus>("idle");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setResults([]);
    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      void fetchProductSearchPreview(trimmed, controller.signal)
        .then((rows) => {
          if (controller.signal.aborted) {
            return;
          }
          setResults(rows);
          setStatus("ready");
        })
        .catch(() => {
          if (controller.signal.aborted) {
            return;
          }
          setResults([]);
          setStatus("ready");
        });
    }, PRODUCT_SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return {
    results,
    status,
    isLoading: status === "loading",
  };
}
