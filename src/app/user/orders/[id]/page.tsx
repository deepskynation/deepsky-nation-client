import { OrderDetailView } from "@/components/user/orders/order-detail/list";

export default function UserOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <OrderDetailView params={params} />;
}
