import Image from "next/image";
import { aboutUsContent } from "@/mock/about-us";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import {
  glassCardClassName,
  glassCardHoverClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

export function AboutUsSection() {
  return (
    <DashboardGlassSection
      id="about-us"
      variant="muted"
      className="scroll-mt-24 border-t border-white/40"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <AnimateInView>
          <div className="mb-10 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              {aboutUsContent.label}
            </p>
            <h2 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              About DeepSky
            </h2>
          </div>
        </AnimateInView>

        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <AnimateInView direction="left">
            <div
              className={cn(
                glassCardClassName,
                "space-y-6 p-6 sm:p-8",
              )}
            >
              <h3 className="font-serif text-3xl leading-tight text-black sm:text-4xl">
                {aboutUsContent.title}
              </h3>
              {aboutUsContent.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="max-w-lg text-base leading-relaxed text-black/65"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </AnimateInView>

          <AnimateInView direction="right" delay={120}>
            <div className="flex justify-center lg:justify-end">
              <div
                className={cn(
                  glassCardClassName,
                  glassCardHoverClassName,
                  "w-full max-w-[280px] overflow-hidden p-3 motion-safe:hover:scale-[1.02] sm:max-w-xs",
                )}
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-white/40">
                  <Image
                    src={aboutUsContent.image}
                    alt="DeepSky brand"
                    fill
                    sizes="(max-width: 1024px) 80vw, 320px"
                    className="object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </AnimateInView>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:mt-16">
          {aboutUsContent.values.map((value, index) => (
            <AnimateInView key={value.title} delay={index * 100}>
              <div
                className={cn(
                  glassCardClassName,
                  glassCardHoverClassName,
                  "p-5 motion-safe:hover:-translate-y-1",
                )}
              >
                <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-black">
                  {value.title}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-black/55">
                  {value.description}
                </p>
              </div>
            </AnimateInView>
          ))}
        </div>
      </div>
    </DashboardGlassSection>
  );
}
