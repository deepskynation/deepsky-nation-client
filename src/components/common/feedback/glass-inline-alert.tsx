"use client";

import type { ReactNode } from "react";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const GLASS_VARIANT_STYLES = {
  error: "border-red-200/80 bg-red-50/80 text-red-700",
  warning: "border-amber-200/80 bg-amber-50/80 text-amber-950",
  info: "border-blue-200/80 bg-blue-50/80 text-blue-950",
  success: "border-emerald-200/80 bg-emerald-50/80 text-emerald-950",
} as const;

const PLAIN_VARIANT_STYLES = {
  error: "text-red-600",
  warning: "text-amber-700",
  info: "text-blue-600",
  success: "text-emerald-700",
} as const;

export type GlassInlineAlertVariant = keyof typeof GLASS_VARIANT_STYLES;
export type GlassInlineAlertSurface = "glass" | "plain";

type GlassInlineAlertProps = {
  message?: ReactNode | null;
  variant?: GlassInlineAlertVariant;
  surface?: GlassInlineAlertSurface;
  centered?: boolean;
  className?: string;
};

export function GlassInlineAlert({
  message,
  variant = "error",
  surface = "glass",
  centered = true,
  className,
}: GlassInlineAlertProps) {
  if (!message) {
    return null;
  }

  const isGlass = surface === "glass";

  return (
    <p
      className={cn(
        "text-sm",
        isGlass && glassCardClassName,
        isGlass && "px-6 py-4",
        isGlass ? GLASS_VARIANT_STYLES[variant] : PLAIN_VARIANT_STYLES[variant],
        centered && isGlass && "text-center",
        className,
      )}
      role="alert"
    >
      {message}
    </p>
  );
}
