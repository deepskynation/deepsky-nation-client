import { Suspense } from "react";
import DashboardList from "@/components/LandingPage/dashboard/list";
import { ToastProvider } from "@/components/common/feedback/toast-provider";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";

export default function HomePage() {
  return (
    <ToastProvider>
      <Suspense fallback={<CenteredLoading message="Loading…" />}>
        <DashboardList />
      </Suspense>
    </ToastProvider>
  );
}
