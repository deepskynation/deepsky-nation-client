import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmail from "@/components/(auth)/VerifyEmail";
import { Loader2Icon } from "lucide-react";

export const metadata: Metadata = {
  title: "Verify Email | Deepsky",
  description: "Confirm your Deepsky account email address",
};

function VerifyEmailFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="flex flex-col items-center gap-3 text-black/50">
        <Loader2Icon className="size-8 motion-safe:animate-spin" aria-hidden />
        <p className="text-sm">Loading verification…</p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmail />
    </Suspense>
  );
}
