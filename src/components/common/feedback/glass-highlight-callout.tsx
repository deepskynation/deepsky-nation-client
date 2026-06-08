import type { ReactNode } from "react";
import { glassHighlightFlatClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

type GlassHighlightCalloutProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  className?: string;
  iconClassName?: string;
};

export function GlassHighlightCallout({
  icon,
  title,
  description,
  className,
  iconClassName,
}: GlassHighlightCalloutProps) {
  return (
    <div className={cn(glassHighlightFlatClassName, className)}>
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg bg-black text-white",
          iconClassName,
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-black">{title}</p>
        {description ? (
          <p className="text-xs text-black/50">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
