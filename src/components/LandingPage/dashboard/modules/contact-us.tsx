import Link from "next/link";
import { MailIcon } from "lucide-react";
import { contactUsContent } from "@/mock/contact-us";
import { AnimateInView } from "@/components/common/animation/animate-in-view";
import { FacebookIcon, InstagramIcon } from "@/components/common/icons/social-icons";
import { DashboardGlassSection } from "@/components/LandingPage/dashboard/modules/dashboard-glass-section";

const contactLinkClassName =
  "flex size-11 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-70";

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

        <AnimateInView delay={120}>
          <div className="flex items-center gap-2">
            <Link
              href={contactUsContent.facebook.href}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClassName}
              aria-label={contactUsContent.facebook.label}
            >
              <FacebookIcon />
            </Link>
            <Link
              href={contactUsContent.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClassName}
              aria-label={contactUsContent.instagram.label}
            >
              <InstagramIcon />
            </Link>
            <Link
              href={contactUsContent.gmail.href}
              target="_blank"
              rel="noopener noreferrer"
              className={contactLinkClassName}
              aria-label={contactUsContent.gmail.label}
            >
              <MailIcon className="size-6" strokeWidth={1.75} />
            </Link>
          </div>
        </AnimateInView>
      </div>
    </DashboardGlassSection>
  );
}
