import Link from "next/link";
import { MailIcon } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/common/icons/social-icons";
import { contactUsContent } from "@/mock/contact-us";
import { glassCardClassName } from "@/lib/glass-styles";
import { cn } from "@/lib/utils";

const channelLinkClassName = cn(
  glassCardClassName,
  "flex items-center gap-4 p-4 transition-opacity hover:opacity-90 sm:p-5",
);

type SupportChannelLinksProps = {
  className?: string;
};

export function SupportChannelLinks({ className }: SupportChannelLinksProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:gap-4", className)}>
      <Link
        href={contactUsContent.facebook.href}
        target="_blank"
        rel="noopener noreferrer"
        className={channelLinkClassName}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
          <FacebookIcon />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium text-black">
            Official Facebook Page
          </span>
          <span className="block text-xs text-black/50">
            Message us for inquiries and order concerns
          </span>
        </span>
      </Link>

      <Link
        href={contactUsContent.instagram.href}
        target="_blank"
        rel="noopener noreferrer"
        className={channelLinkClassName}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
          <InstagramIcon />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium text-black">
            Official Instagram Page
          </span>
          <span className="block text-xs text-black/50">
            Follow us and send a direct message
          </span>
        </span>
      </Link>

      <Link
        href={contactUsContent.gmail.href}
        target="_blank"
        rel="noopener noreferrer"
        className={channelLinkClassName}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-black/[0.05]">
          <MailIcon className="size-5" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 text-left">
          <span className="block text-sm font-medium text-black">
            Official Email
          </span>
          <span className="block truncate text-xs text-black/50">
            {contactUsContent.gmail.email}
          </span>
        </span>
      </Link>
    </div>
  );
}
