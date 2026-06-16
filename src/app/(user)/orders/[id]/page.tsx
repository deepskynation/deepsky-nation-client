import { OrderDetailView } from "@/components/user/orders/order-detail/list";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  return <OrderDetailView params={params} />;
}
