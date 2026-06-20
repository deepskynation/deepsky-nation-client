"use client";

import { useSearchParams } from "next/navigation";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { LandingStorefrontHeader } from "@/components/LandingPage/dashboard/modules/landing-storefront-header";
import { AboutUsContent } from "@/components/common/marketing/about-us-content";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";

export function LandingAboutUsPageContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <LandingStorefrontHeader searchQuery={searchQuery} />

      <DashboardGlassSection
        variant="light"
        className="scroll-mt-24 border-t border-white/40"
      >
        <div className="mx-auto max-w-3xl px-6 py-10 lg:px-12 lg:py-14">
          <AboutUsContent />
          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
