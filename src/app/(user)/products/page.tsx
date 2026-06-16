import { Suspense } from "react";
import { CenteredLoading } from "@/components/common/feedback/page-state-gate";
import { ProductsList } from "@/components/user/products/list";

export default function UserProductsPage() {
  return (
    <Suspense fallback={<CenteredLoading message="Loading products…" />}>
      <ProductsList />
    </Suspense>
  );
}
