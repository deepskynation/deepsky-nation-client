import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  glassHeroBgClassName,
  glassSectionLightClassName,
  glassSectionMutedClassName,
} from "@/lib/glass-styles";

type DashboardGlassSectionProps = {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "light" | "muted";
  id?: string;
};

const variantClassNames = {
  hero: glassHeroBgClassName,
  light: glassSectionLightClassName,
  muted: glassSectionMutedClassName,
};

export function DashboardGlassSection({
  children,
  className,
  variant = "muted",
  id,
}: DashboardGlassSectionProps) {
  return (
    <div id={id} className={cn(variantClassNames[variant], className)}>
      <div
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-black/[0.04] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-black/[0.05] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/60 blur-2xl"
        aria-hidden
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
