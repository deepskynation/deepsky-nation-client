export function AuthGlassTestimonialPanel() {
  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
      <div
        className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-black to-neutral-800"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-16 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white/[0.07] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col justify-between bg-black/25 p-10 text-white backdrop-blur-2xl xl:p-12">
        <div className="space-y-5">
          <p className="font-serif text-5xl leading-none text-white/30">“</p>
          <blockquote className="max-w-md text-2xl leading-snug font-medium text-white/95">
            DeepSky pieces help me stand out — bold designs, clean fit,
            and quality that feels built for the streets.
          </blockquote>
          <div className="space-y-1">
            <p className="text-base font-semibold">Joshua Gerald</p>
            <p className="text-xs text-white/60">Streetwear Collector</p>
            <p className="pt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/90">
              DeepSky
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-[10px] tracking-[0.22em] text-white/50">
              TRUSTED BY
            </span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-semibold tracking-[0.14em] text-white/75 uppercase">
            <span>Creators</span>
            <span>Collectors</span>
            <span>Stylists</span>
            <span>Communities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
