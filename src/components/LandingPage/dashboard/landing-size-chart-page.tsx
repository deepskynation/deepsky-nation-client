"use client";

import { useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { LandingStorefrontHeader } from "@/components/LandingPage/dashboard/modules/landing-storefront-header";
import { SizeChartContent } from "@/components/common/marketing/size-chart-content";

export function LandingSizeChartPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <LandingStorefrontHeader searchQuery={searchQuery} />

      <DashboardGlassSection
        variant="light"
        className="scroll-mt-24 border-t border-white/40"
      >
        <SizeChartContent className="mx-auto max-w-4xl px-6 py-10 lg:px-12 lg:py-14" />
      </DashboardGlassSection>
    </div>
  );
}
