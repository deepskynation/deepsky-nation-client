"use client";

import { useState } from "react";
import Image from "next/image";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { CheckoutImagePreviewDialog } from "@/components/user/checkout/modules/checkout-image-preview-dialog";

const SIZE_CHART_IMAGE = "/tshirt-sizing.jpg";
const SIZE_CHART_ALT = "T-shirt size chart";

export function SizeChartPageContent() {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  return (
    <div className="min-h-full from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-4xl px-6 py-8 lg:px-12 lg:py-10">
          <header className="mb-8 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Deepsky
            </p>
            <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              Size Chart
            </h1>
            <p className="text-sm text-black/55">
              Use this guide to find the right fit for our tees and tops. Tap the chart
              to zoom in.
            </p>
          </header>

          <button
            type="button"
            onClick={() => setImagePreviewOpen(true)}
            aria-label="View size chart full size"
            className="relative mx-auto block aspect-[2048/1448] w-full max-w-2xl cursor-zoom-in overflow-hidden rounded-lg border border-black/10 bg-white/50 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40"
          >
            <Image
              src={SIZE_CHART_IMAGE}
              alt={SIZE_CHART_ALT}
              width={1000}
              height={1000}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-full w-full object-contain"
              priority
            />
          </button>

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>

      <CheckoutImagePreviewDialog
        open={imagePreviewOpen}
        imageSrc={SIZE_CHART_IMAGE}
        imageAlt={SIZE_CHART_ALT}
        onOpenChange={setImagePreviewOpen}
      />
    </div>
  );
}
