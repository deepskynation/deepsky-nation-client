import { Suspense } from "react";
import { LandingSizeChartPageContent } from "@/components/LandingPage/dashboard/landing-size-chart-page";
import { ToastProvider } from "@/components/common/feedback/toast-provider";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";

export default function SizeChartPage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CenteredLoading message="Loading…" />}>
        <LandingSizeChartPageContent />
      </Suspense>
    </ToastProvider>
  );
}
