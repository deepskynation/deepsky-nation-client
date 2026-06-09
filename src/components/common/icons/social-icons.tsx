import { cn } from "@/lib/utils";

type SocialIconProps = {
  className?: string;
};

export function FacebookIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0", className)}
    >
      <rect width="24" height="24" rx="2" fill="#000" />
      <g transform="translate(24 24) scale(0.88) translate(-24 -24)">
        <path
          fill="#fff"
          d="M13.5 3.5H16V0h-2.5C9.9 0 7.5 2.4 7.5 6v2.5H5v3.5h2.5V24h3.5v-12H14l.5-3.5h-3V6c0-1.4 1.1-2.5 2.5-2.5z"
        />
      </g>
    </svg>
  );
}

export function InstagramIcon({ className }: SocialIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn("size-6 shrink-0 text-black", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
