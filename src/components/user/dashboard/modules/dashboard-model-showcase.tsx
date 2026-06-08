"use client";

import { ModelCarousel } from "@/components/LandingPage/dashboard/modules/model-carousel";

/** Static model banner — same as the public landing page showcase. */
export function DashboardModelShowcase() {
  return (
    <section className="relative w-full border-b border-white/5 bg-model-carousel">
      <ModelCarousel variant="banner" />
    </section>
  );
}
