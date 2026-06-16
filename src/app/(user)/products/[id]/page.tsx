import { ProductDetailView } from "@/components/user/products/product-detail-view/list";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return <ProductDetailView params={params} />;
}
