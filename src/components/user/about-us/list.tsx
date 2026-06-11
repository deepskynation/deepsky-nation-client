import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import { EmailSubscribeSection } from "@/components/common/marketing/email-subscribe-section";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const paragraphs = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla facilisi. Ut fringilla. Suspendisse potenti. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien proin quam etiam ultrices.",
];

export function AboutUsPageContent() {
  return (
    <div className="min-h-full bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 text-black">
      <DashboardGlassSection variant="light" className="min-h-full">
        <div className="mx-auto max-w-3xl px-6 py-8 lg:px-12 lg:py-10">
          <header className="mb-8 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              Deepsky
            </p>
            <h1 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              How it Started
            </h1>
          </header>

          <div className={cn(glassCardClassName, "space-y-5 p-6 sm:p-8")}>
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-base leading-relaxed text-black/65">
                {paragraph}
              </p>
            ))}
          </div>

          <EmailSubscribeSection className="mt-12" />
        </div>
      </DashboardGlassSection>
    </div>
  );
}
