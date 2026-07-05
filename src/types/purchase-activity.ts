export type RecentPurchaseActivityItem = {
  order_id: string;
  buyer_display_name: string;
  region: string;
  product_name: string;
  price: string;
  product_image_base64: string | null;
  purchased_at: string;
};

export type RecentPurchaseActivityResponse = {
  items: RecentPurchaseActivityItem[];
};

export type PurchaseActivityToastItem = RecentPurchaseActivityItem & {
  toastId: string;
};
