import { DEEPSKY_WAYBILL_SHIPPER, type WaybillPrintData } from "@/mock/waybill";
import type {
  AdminShipOrderDetails,
  ApiOrder,
  WaybillLogoType,
  WaybillPaymentMethod,
} from "@/types/order";

function paymentMethodFromValue(
  method: string | null | undefined,
): WaybillPrintData["payment_method"] {
  return method === "online_transfer" ? "online_transfer" : "cod";
}

function consigneeFromOrder(order: ApiOrder): WaybillPrintData["consignee"] {
  const consigneeName =
    (order.customer_username ?? "").trim() ||
    order.delivery_email.trim() ||
    "Customer";

  return {
    name: consigneeName,
    phone: order.delivery_phone,
    email: order.delivery_email,
    address_line: order.delivery_address_line,
    city: order.delivery_city,
    region: order.delivery_region,
    country: order.delivery_country,
    postal_code: order.delivery_postal_code,
    address_type: "HOME",
  };
}

function itemsFromOrder(order: ApiOrder): WaybillPrintData["items"] {
  return order.items.map((item) => ({
    title: item.product_title ?? item.product_code ?? "Item",
    variant_label: item.variant_label,
    quantity: item.quantity,
  }));
}

function logoFlags(logoType: string): Pick<
  WaybillPrintData,
  "isJT" | "isLalamove" | "isDeepsky" | "isCustomize"
> {
  return {
    isJT: logoType === "jt",
    isLalamove: logoType === "lalamove",
    isDeepsky: logoType === "deepsky",
    isCustomize: logoType === "custom",
  };
}

/**
 * Map a live admin order (with waybill fields) to printable waybill data.
 * Returns null when required waybill fields are missing.
 */
export function orderToWaybillPrintData(order: ApiOrder): WaybillPrintData | null {
  const tracking = (order.tracking_number ?? "").trim();
  const courier = (order.courier ?? "").trim();
  const sorting = (order.sorting_code ?? "").trim();
  const hub = (order.hub_code ?? "").trim();
  const logoType = (order.waybill_logo_type ?? "").trim();
  const paymentMethod = (order.waybill_payment_method ?? "").trim();
  const weight = Number(order.package_weight_kg);

  if (!courier || !sorting || !hub || !logoType) {
    return null;
  }
  if (Number.isNaN(weight) || weight <= 0) {
    return null;
  }
  if (logoType === "custom" && !(order.waybill_logo_url ?? "").trim()) {
    return null;
  }
  if (paymentMethod !== "cod" && paymentMethod !== "online_transfer") {
    return null;
  }

  return {
    order_number: order.order_number,
    tracking_number: tracking,
    courier,
    shipped_at: order.shipped_at ?? order.created_at,
    expected_delivery_date: order.expected_delivery_date,
    payment_method: paymentMethodFromValue(paymentMethod),
    weight_kg: weight,
    sorting_code: sorting,
    hub_code: hub,
    shipper: DEEPSKY_WAYBILL_SHIPPER,
    consignee: consigneeFromOrder(order),
    items: itemsFromOrder(order),
    total: order.total,
    ...logoFlags(logoType),
    custom_logo_url: logoType === "custom" ? order.waybill_logo_url : null,
  };
}

/** Public API payload for `GET /api/public/waybill/{order_number}`. */
export type PublicWaybillApiResponse = {
  order_number: string;
  tracking_number: string;
  courier: string;
  shipped_at: string | null;
  expected_delivery_date: string | null;
  payment_method: "cod" | "online_transfer";
  weight_kg: string | number;
  sorting_code: string;
  hub_code: string;
  consignee: {
    name: string;
    phone: string;
    email: string;
    address_line: string;
    city: string;
    region: string;
    country: string;
    postal_code: string;
    address_type?: string;
  };
  items: Array<{
    title: string;
    variant_label?: string | null;
    quantity: number;
  }>;
  total: string;
  waybill_logo_type: WaybillLogoType;
  waybill_logo_url?: string | null;
  created_at: string;
};

/** Map public waybill API response → printable label data. */
export function publicWaybillToPrintData(
  payload: PublicWaybillApiResponse,
): WaybillPrintData {
  const logoType = payload.waybill_logo_type;
  const weight = Number(payload.weight_kg);

  return {
    order_number: payload.order_number,
    tracking_number: payload.tracking_number.trim(),
    courier: payload.courier.trim(),
    shipped_at: payload.shipped_at ?? payload.created_at,
    expected_delivery_date: payload.expected_delivery_date,
    payment_method: paymentMethodFromValue(payload.payment_method),
    weight_kg: Number.isFinite(weight) ? weight : 0,
    sorting_code: payload.sorting_code.trim(),
    hub_code: payload.hub_code.trim(),
    shipper: DEEPSKY_WAYBILL_SHIPPER,
    consignee: {
      name: payload.consignee.name,
      phone: payload.consignee.phone,
      email: payload.consignee.email,
      address_line: payload.consignee.address_line,
      city: payload.consignee.city,
      region: payload.consignee.region,
      country: payload.consignee.country,
      postal_code: payload.consignee.postal_code,
      address_type: payload.consignee.address_type ?? "HOME",
    },
    items: payload.items.map((item) => ({
      title: item.title,
      variant_label: item.variant_label,
      quantity: item.quantity,
    })),
    total: payload.total,
    ...logoFlags(logoType),
    custom_logo_url: logoType === "custom" ? payload.waybill_logo_url : null,
  };
}

/**
 * Live preview while editing waybill fields. Uses draft form values and
 * falls back to placeholders for codes/weight until they are valid.
 */
export function buildWaybillDraftPreview(
  order: ApiOrder,
  draft: Pick<
    AdminShipOrderDetails,
    | "courier"
    | "trackingNumber"
    | "packageWeightKg"
    | "waybillLogoType"
    | "waybillLogoUrl"
    | "waybillPaymentMethod"
  >,
): WaybillPrintData {
  const logoType: WaybillLogoType = draft.waybillLogoType;
  const paymentMethod: WaybillPaymentMethod = draft.waybillPaymentMethod;
  const weight = Number(draft.packageWeightKg);
  const weightKg = !Number.isNaN(weight) && weight > 0 ? weight : 0;

  return {
    order_number: order.order_number,
    tracking_number: draft.trackingNumber.trim(),
    courier: draft.courier.trim() || "Courier",
    shipped_at: order.shipped_at ?? order.created_at,
    expected_delivery_date: order.expected_delivery_date,
    payment_method: paymentMethodFromValue(paymentMethod),
    weight_kg: weightKg,
    sorting_code: (order.sorting_code ?? "").trim() || "---",
    hub_code: (order.hub_code ?? "").trim() || "000",
    shipper: DEEPSKY_WAYBILL_SHIPPER,
    consignee: consigneeFromOrder(order),
    items: itemsFromOrder(order),
    total: order.total,
    ...logoFlags(logoType),
    custom_logo_url: logoType === "custom" ? draft.waybillLogoUrl : null,
  };
}
