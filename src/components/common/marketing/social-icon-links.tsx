import Link from "next/link";
import { FacebookIcon, InstagramIcon } from "@/components/common/icons/social-icons";
import { contactUsContent } from "@/mock/contact-us";
import { cn } from "@/lib/utils";

const linkClassName =
  "flex size-11 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-70";

type SocialIconLinksProps = {
  className?: string;
};

export function SocialIconLinks({ className }: SocialIconLinksProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Link
        href={contactUsContent.facebook.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        aria-label={contactUsContent.facebook.label}
      >
        <FacebookIcon />
      </Link>
      <Link
        href={contactUsContent.instagram.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        aria-label={contactUsContent.instagram.label}
      >
        <InstagramIcon />
      </Link>
    </div>
  );
}
