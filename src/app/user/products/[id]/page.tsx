import { ProductDetailView } from "@/components/user/products/product-detail-view/list";

export default function UserProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <ProductDetailView params={params} />;
}
