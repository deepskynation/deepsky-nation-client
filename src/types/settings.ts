export type ShippingFeeResponse = {
  shipping_fee: string;
};

export type ShopSettings = {
  default_shipping_fee: string;
  updated_at: string;
};

export type UpdateShopSettingsPayload = {
  default_shipping_fee: number;
};

export function parseShippingFee(value: string | number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}
