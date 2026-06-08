import Link from "next/link";
import type { ReactNode } from "react";
import { glassCardClassName, glassPanelFlatClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export type GlassMessageAction = {
  href: string;
  label: string;
  variant?: "link" | "button";
};

type GlassMessagePanelProps = {
  title: string;
  description?: string;
  action?: GlassMessageAction;
  icon?: ReactNode;
  fullPage?: boolean;
  variant?: "default" | "flat";
  className?: string;
};

const pageBackgroundClassName =
  "min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 px-6 py-14 text-black";

export function GlassMessagePanel({
  title,
  description,
  action,
  icon,
  fullPage = true,
  variant = "default",
  className,
}: GlassMessagePanelProps) {
  const panelSurface =
    variant === "flat" ? glassPanelFlatClassName : glassCardClassName;

  const panel = (
    <div
      className={cn(
        panelSurface,
        "mx-auto max-w-lg space-y-4 p-8 text-center",
        className,
      )}
    >
      {icon ? <div className="flex justify-center">{icon}</div> : null}

      <div className="space-y-2">
        <h1 className="font-serif text-2xl text-black">{title}</h1>
        {description ? (
          <p className="text-sm leading-relaxed text-black/55">{description}</p>
        ) : null}
      </div>

      {action ? (
        <Link
          href={action.href}
          className={cn(
            action.variant === "button"
              ? "inline-flex h-11 items-center rounded-full border border-black bg-black px-8 text-[11px] tracking-[0.22em] text-white uppercase transition-all hover:bg-white hover:text-black"
              : "inline-flex text-sm font-medium text-black underline-offset-4 hover:underline",
          )}
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );

  if (!fullPage) {
    return panel;
  }

  return <div className={pageBackgroundClassName}>{panel}</div>;
}
