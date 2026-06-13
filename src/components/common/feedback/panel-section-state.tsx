"use client";

import type { ReactNode } from "react";
import { Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { alertErrorClassName } from "@/lib/panel-styles";
import { cn } from "@/lib/utils";

type PanelSectionStateAction = {
  label: string;
  onClick: () => void;
};

type PanelSectionStateProps = {
  loading?: boolean;
  loadingMessage?: string;
  loadingClassName?: string;
  error?: string | null;
  errorAction?: PanelSectionStateAction;
  errorClassName?: string;
  children: ReactNode;
};

export function PanelSectionState({
  loading = false,
  loadingMessage = "Loading…",
  loadingClassName,
  error = null,
  errorAction,
  errorClassName,
  children,
}: PanelSectionStateProps) {
  return (
    <>
      {loading ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center gap-2 py-16 text-sm text-muted-foreground",
            loadingClassName,
          )}
        >
          <Loader2Icon className="size-6 animate-spin" aria-hidden />
          {loadingMessage}
        </div>
      ) : error ? (
        <div className={cn("space-y-4 py-8", errorClassName)}>
          <p className={alertErrorClassName} role="alert">
            {error}
          </p>
          {errorAction ? (
            <Button type="button" variant="outline" onClick={errorAction.onClick}>
              {errorAction.label}
            </Button>
          ) : null}
        </div>
      ) : (
        children
      )}
    </>
  );
}
