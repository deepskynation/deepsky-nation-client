import type { PurchaseActivityToastItem } from "@/types/purchase-activity";

const MOCK_TIMESTAMP = new Date(Date.now() - 3 * 60 * 1000).toISOString();

/** Demo purchase activity toasts for ComponentVisual. */
export const mockPurchaseActivityItems: PurchaseActivityToastItem[] = [
  {
    toastId: "mock-purchase-1",
    order_id: "order-mock-1",
    buyer_display_name: "Alex M.",
    region: "Metro Manila",
    product_name: "Stellar Map Print ",
    price: "1299.00",
    product_image_base64: null,
    purchased_at: MOCK_TIMESTAMP,
  },
  {
    toastId: "mock-purchase-2",
    order_id: "order-mock-2",
    buyer_display_name: "Jamie R.",
    region: "Cebu",
    product_name: "Nebula Poster Set",
    price: "2499.00",
    product_image_base64: null,
    purchased_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    toastId: "mock-purchase-3",
    order_id: "order-mock-3",
    buyer_display_name: "Sam K.",
    region: "Davao",
    product_name: "Deep Sky Hoodie",
    price: "1899.00",
    product_image_base64: null,
    purchased_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];
