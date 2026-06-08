export type ApiCartLine = {
  id: string;
  product_id: string;
  variant_id: string | null;
  quantity: number;
  product_title: string;
  product_code: string;
  variant_label: string | null;
  thumbnail_base64: string | null;
  unit_price: string;
  line_subtotal: string;
  max_quantity: number;
  is_available: boolean;
};

export type ApiCart = {
  id: string;
  item_count: number;
  subtotal: string;
  items: ApiCartLine[];
};

export type AddCartItemPayload = {
  productId: string;
  variantId?: string;
  quantity?: number;
};

export type UpdateCartItemPayload = {
  itemId: string;
  quantity: number;
};
