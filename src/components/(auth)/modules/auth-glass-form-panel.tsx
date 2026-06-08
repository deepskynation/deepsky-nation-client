import type { ReactNode } from "react";
import {
  authGlassFormSideClassName,
  authGlassPanelClassName,
} from "@/components/(auth)/modules/auth-glass-styles";

type AuthGlassFormPanelProps = {
  children: ReactNode;
};

export function AuthGlassFormPanel({ children }: AuthGlassFormPanelProps) {
  return (
    <div className={authGlassFormSideClassName}>
      <div
        className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-black/[0.04] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-black/[0.05] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 blur-2xl"
        aria-hidden
      />

      <div className={authGlassPanelClassName}>{children}</div>
    </div>
  );
}
