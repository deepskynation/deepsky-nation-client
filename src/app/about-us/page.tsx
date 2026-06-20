import { Suspense } from "react";
import { LandingAboutUsPageContent } from "@/components/LandingPage/dashboard/landing-about-us-page";
import { ToastProvider } from "@/components/common/feedback/toast-provider";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";

export default function AboutUsPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CenteredLoading message="Loading…" />}>
        <LandingAboutUsPageContent />
      </Suspense>
    </ToastProvider>
  );
}
