import { Suspense } from "react";
import { CheckoutView } from "@/components/user/checkout/list";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";

export default function UserCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<CenteredLoading message="Loading checkout…" />}>
      <CheckoutView params={params} />
    </Suspense>
  );
}
