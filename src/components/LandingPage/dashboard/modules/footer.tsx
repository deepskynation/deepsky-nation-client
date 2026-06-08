import { footerContent } from "@/mock/contact-us";
import { glassFooterClassName } from "@/lib/glass-styles";

export function FooterSection() {
  return (
    <footer className={glassFooterClassName}>
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left md:px-10 lg:px-12">
        <span className="text-sm font-semibold uppercase tracking-[0.18em]">
          {footerContent.brand}
        </span>
        <p className="text-xs tracking-wide text-white/70">
          {footerContent.copyright}
        </p>
      </div>
    </footer>
  );
}
