/** Frosted glass UI tokens — shared across dashboard, product cards, and other surfaces */

export const glassCardClassName =
  "rounded-xl border border-white/50 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-2xl";

export const glassCardHoverClassName =
  "motion-safe:transition-all motion-safe:duration-300 hover:border-white/70 hover:bg-white/55 hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]";

export const glassHeaderClassName =
  "sticky top-0 z-50 border-b border-white/40 bg-white/65 shadow-sm backdrop-blur-xl supports-backdrop-filter:bg-white/55";

export const glassHeroBgClassName =
  "relative overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-neutral-200/90";

export const glassSectionLightClassName =
  "relative overflow-hidden bg-gradient-to-b from-white via-neutral-50/90 to-neutral-100/80";

export const glassSectionMutedClassName =
  "relative overflow-hidden bg-gradient-to-br from-neutral-100 via-white to-neutral-200/90";

export const glassFooterClassName =
  "border-t border-white/10 bg-black/85 text-white backdrop-blur-xl";

export const glassButtonClassName =
  "rounded-full border border-white/50 bg-white/45 px-10 text-[11px] tracking-[0.22em] text-black uppercase shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/70 hover:bg-white/65 hover:shadow-md";

export const glassPriceClassName =
  "rounded-sm border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-black shadow-sm backdrop-blur-md transition-all hover:bg-white/70";

export const glassMediaFrameClassName =
  "relative overflow-hidden rounded-lg border border-white/40 bg-white/30";

export const glassIconButtonClassName =
  "flex items-center justify-center rounded-full border border-white/50 bg-white/40 text-black shadow-sm backdrop-blur-md transition-all hover:bg-white/65";

export const glassFilterPillClassName =
  "shrink-0 rounded-full border border-white/50 bg-white/45 px-4 py-2 text-xs font-medium text-black/70 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/70 hover:bg-white/65 hover:shadow-md";

export const glassFilterPillActiveClassName =
  "border-black bg-black text-white hover:bg-black hover:text-white";

export const glassFilterPillSimpleClassName =
  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-black/55 transition-colors hover:bg-black/5 hover:text-black";

export const glassFilterPillSimpleActiveClassName =
  "bg-black/10 font-medium text-black";

export const glassOptionsMenuPanelClassName =
  "overflow-hidden rounded-xl border border-white/60 bg-white/92 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.1)] backdrop-blur-xl";

export const glassOptionsMenuItemClassName =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-black/75 transition-all duration-200 hover:bg-black/[0.04] hover:text-black";

export const glassOptionsMenuItemActiveClassName =
  "bg-black/[0.06] font-medium text-black hover:bg-black/[0.06]";

/** Flat panels — no border or shadow (checkout, simple forms) */
export const glassPanelFlatClassName = "rounded-xl";

export const glassInputFlatClassName =
  "h-10 w-full rounded-lg bg-black/[0.04] px-3 text-sm text-black outline-none transition-colors placeholder:text-black/35 focus:bg-black/[0.06]";

export const glassHighlightFlatClassName =
  "flex items-center gap-3 rounded-xl bg-black/[0.04] px-4 py-3";

export const glassMediaFlatClassName =
  "relative overflow-hidden rounded-lg bg-black/[0.04]";

export const glassQuantityButtonClassName =
  "flex items-center justify-center rounded-full bg-black/[0.05] text-black transition-colors hover:bg-black/10 disabled:cursor-not-allowed disabled:opacity-40";
