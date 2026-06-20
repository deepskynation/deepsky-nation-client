import { Suspense } from "react";
import { LandingCategoryPageContent } from "@/components/LandingPage/dashboard/landing-category-page";
import { ToastProvider } from "@/components/common/feedback/toast-provider";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";

type LandingCategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
};

export default async function LandingCategoryPage({ params }: LandingCategoryPageProps) {
  const { categorySlug } = await params;

  return (
    <ToastProvider>
      <Suspense fallback={<CenteredLoading message="Loading category…" />}>
        <LandingCategoryPageContent categorySlug={categorySlug} />
      </Suspense>
    </ToastProvider>
  );
}
