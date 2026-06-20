"use client";

import { Suspense } from "react";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";
import { UserDashboardPageContent } from "@/components/user/dashboard/list";

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<CenteredLoading message="Loading dashboard…" />}>
      <UserDashboardPageContent />
    </Suspense>
  );
}
