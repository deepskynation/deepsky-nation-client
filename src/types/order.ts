import type { CheckoutDeliveryFormState } from "@/lib/checkout-delivery";
import type { CheckoutPaymentMethod } from "@/lib/checkout-payment";
import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";

/** Matches backend `OrderStatus` enum values. */
export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "shipped"
  | "cancelled";

export type CreateOrderLinePayload = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CreateOrderPayload = {
  fromCart?: boolean;
  cartItemIds?: string[];
  items?: CreateOrderLinePayload[];
  productId?: string;
  variantId?: string;
  quantity?: number;
  deliverySource: "profile" | "custom";
  delivery: CheckoutDeliveryFormState;
  paymentMethod: CheckoutPaymentMethod;
  receiptBase64?: string | null;
};

export type ApiOrderItem = {
  id: string;
  variant_id: string | null;
  product_id: string | null;
  product_code?: string | null;
  product_title?: string | null;
  variant_label?: string | null;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type ApiOrderPayment = {
  id: string;
  payment_method: string;
  payment_receipt_url: string | null;
  has_receipt: boolean;
  payment_receipt_uploaded_at: string | null;
};

export type ApiOrder = {
  id: string;
  order_number: string;
  status: string;
  user_id?: string | null;
  customer_username?: string | null;
  rejection_reason?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  shipped_at?: string | null;
  delivery_source: string;
  delivery_email: string;
  delivery_phone: string;
  delivery_address_line: string;
  delivery_city: string;
  delivery_region: string;
  delivery_country: string;
  delivery_postal_code: string;
  subtotal: string;
  shipping_fee: string;
  total: string;
  expected_delivery_date: string | null;
  created_at: string;
  items: ApiOrderItem[];
  payment: ApiOrderPayment;
};

export type PaginatedApiOrders = PaginatedResponse<ApiOrder>;

export type MyOrdersQuery = PaginationQuery & {
  status?: OrderStatus;
  order_number?: string;
  created_from?: string;
  created_to?: string;
};

export type AdminOrderPaymentMethod = "cod" | "online_transfer";

export type AdminOrdersQuery = PaginationQuery & {
  status?: OrderStatus;
  user_id?: string;
  created_from?: string;
  created_to?: string;
  order_number?: string;
  customer?: string;
  payment_method?: AdminOrderPaymentMethod;
};

export type AdminUpdateOrderAction = "approve" | "reject" | "ship";

export type AdminUpdateOrderStatusPayload = {
  orderId: string;
  action: AdminUpdateOrderAction;
  rejectionReason?: string;
};

/** Legacy placeholder — prefer `ApiOrder`. */
export type Order = {
  id: string;
  userId: string;
  items: { productId: string; quantity: number; price: number }[];
  status: OrderStatus;
  total: number;
  createdAt: string;
};
