// import { footerContent } from "@/mock/contact-us";
import { glassFooterClassName } from "@/lib/glass-styles";

export function FooterSection() {
  return (
<footer className="flex h-16 items-center justify-center border-t border-gray-200 bg-white">
      <div>
        {/* <span className="text-sm font-semibold uppercase tracking-[0.18em]">
          {footerContent.brand}
        </span> */}
        <p className="text-xs text-center tracking-wide text-gray-500">
        © <span className="">DEEPSKY</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
