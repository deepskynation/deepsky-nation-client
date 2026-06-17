import { CircleHelpIcon } from "lucide-react";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { GlassHighlightCallout } from "@/components/common/feedback/glass-highlight-callout";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { SupportChannelLinks } from "@/components/common/marketing/support-channel-links";
import { customerServiceContent } from "@/mock/contact-us";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export function CustomerServicePageContent() {
  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-3xl px-6 py-8 lg:px-12 lg:py-10">
          <header className="mb-8 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              {customerServiceContent.label}
            </p>
            <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              {customerServiceContent.title}
            </h1>
            <p className="text-sm text-black/55">{customerServiceContent.description}</p>
          </header>

          <div className={cn(glassCardClassName, "space-y-6 p-6 sm:p-8")}>
            <SupportChannelLinks />

            <GlassHighlightCallout
              icon={<CircleHelpIcon className="size-4" strokeWidth={1.75} />}
              title="Refund requests"
              description={customerServiceContent.refundNote}
            />
          </div>

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
