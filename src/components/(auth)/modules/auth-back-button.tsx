import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthBackButtonProps = {
  className?: string;
};

export function AuthBackButton({ className }: AuthBackButtonProps) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-black/10 bg-white/90 px-3 py-2 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all hover:border-black/20 hover:bg-white hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:px-4 sm:py-2.5",
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-full border border-black/8 bg-neutral-50 text-black/70 transition-all group-hover:-translate-x-0.5 group-hover:border-black/15 group-hover:bg-black group-hover:text-white">
        <ArrowLeftIcon className="size-3.5" strokeWidth={2} />
      </span>
      <span className="pr-0.5 text-[11px] font-medium uppercase tracking-[0.2em] text-black/55 transition-colors group-hover:text-black">
        Back to Home
      </span>
    </Link>
  );
}
