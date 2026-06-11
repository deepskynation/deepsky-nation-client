import Image from "next/image";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";

const SIZE_CHART_IMAGE = "/tshirt-sizing.jpg";

export function SizeChartPageContent() {
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
              Use this guide to find the right fit for our tees and tops.
            </p>
          </header>

          <div className="relative mx-auto aspect-[2048/1448] w-full max-w-2xl overflow-hidden rounded-lg border border-black/10 bg-white/50">
            <Image
              src={SIZE_CHART_IMAGE}
              alt="T-shirt size chart"
              width={1000}
              height={1000}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
