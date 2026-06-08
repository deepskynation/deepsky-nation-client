import Link from "next/link";
import { MailIcon } from "lucide-react";
import { contactUsContent } from "@/mock/contact-us";
import { AnimateInView } from "@/components/LandingPage/dashboard/modules/animate-in-view";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";
import {
  glassCardClassName,
  glassCardHoverClassName,
} from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M13.5 3.5H16V0h-2.5C9.9 0 7.5 2.4 7.5 6v2.5H5v3.5h2.5V24h3.5v-12H14l.5-3.5h-3V6c0-1.4 1.1-2.5 2.5-2.5z" />
    </svg>
  );
}

export function ContactUsSection() {
  return (
    <DashboardGlassSection
      id="contact-us"
      variant="light"
      className="scroll-mt-24 border-t border-white/40"
    >
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12 lg:py-14">
        <AnimateInView>
          <div className="mb-10 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.35em] text-black/45">
              {contactUsContent.label}
            </p>
            <h2 className="font-serif text-2xl font-normal text-black sm:text-3xl">
              {contactUsContent.title}
            </h2>
          </div>
        </AnimateInView>

        <AnimateInView delay={80}>
          <p className="mb-10 max-w-2xl text-base leading-relaxed text-black/65">
            {contactUsContent.description}
          </p>
        </AnimateInView>

        <div className="grid gap-4 sm:grid-cols-2 sm:max-w-2xl">
          <AnimateInView delay={120}>
            <Link
              href={contactUsContent.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                glassCardClassName,
                glassCardHoverClassName,
                "group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:bg-black hover:text-white",
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-black text-white transition-transform duration-300 group-hover:scale-110 group-hover:border-white/20 group-hover:bg-white group-hover:text-black">
                <FacebookIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">
                  {contactUsContent.facebook.label}
                </p>
                <p className="mt-1 text-sm text-black/55 group-hover:text-white/70">
                  Message us on Facebook
                </p>
              </div>
            </Link>
          </AnimateInView>

          <AnimateInView delay={200}>
            <Link
              href={contactUsContent.gmail.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                glassCardClassName,
                glassCardHoverClassName,
                "group flex items-center gap-4 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-black/20 hover:bg-black hover:text-white",
              )}
            >
              <div className="flex size-11 items-center justify-center rounded-full border border-white/40 bg-black text-white transition-transform duration-300 group-hover:scale-110 group-hover:border-white/20 group-hover:bg-white group-hover:text-black">
                <MailIcon className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em]">
                  {contactUsContent.gmail.label}
                </p>
                <p className="mt-1 text-sm text-black/55 group-hover:text-white/70">
                  {contactUsContent.gmail.email}
                </p>
              </div>
            </Link>
          </AnimateInView>
        </div>
      </div>
    </DashboardGlassSection>
  );
}
