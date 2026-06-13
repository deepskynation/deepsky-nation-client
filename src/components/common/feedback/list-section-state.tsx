"use client";

import type { ReactNode } from "react";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type ListSectionStateProps = {
  loading?: boolean;
  loadingMessage?: string;
  loadingClassName?: string;
  empty?: boolean;
  emptyMessage?: ReactNode;
  emptyClassName?: string;
  children: ReactNode;
};

export function ListSectionState({
  loading = false,
  loadingMessage = "Loading…",
  loadingClassName,
  empty = false,
  emptyMessage = "Nothing to show yet.",
  emptyClassName,
  children,
}: ListSectionStateProps) {
  if (loading) {
    return (
      <CenteredLoading
        message={loadingMessage}
        className={cn("py-16", loadingClassName)}
      />
    );
  }

  if (empty) {
    return (
      <div
        className={cn(
          glassCardClassName,
          "border-dashed px-6 py-12 text-center text-sm text-black/50",
          emptyClassName,
        )}
      >
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
