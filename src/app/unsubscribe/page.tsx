import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import { UnsubscribeEmail } from "@/components/common/marketing/unsubscribe-email";

export const metadata: Metadata = {
  title: "Unsubscribe | Deepsky",
  description: "Manage your Deepsky Nation email preferences",
};

function UnsubscribeFallback() {
  return (
    <div className="flex min-h-full items-center justify-center bg-gradient-to-b from-neutral-100 via-white to-neutral-200/90 px-6 py-14">
      <div className="flex flex-col items-center gap-3 text-black/50">
        <Loader2Icon className="size-8 motion-safe:animate-spin" aria-hidden />
        <p className="text-sm">Loading…</p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeFallback />}>
      <UnsubscribeEmail />
    </Suspense>
  );
}
