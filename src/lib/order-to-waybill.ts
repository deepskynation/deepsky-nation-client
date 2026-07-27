import { DEEPSKY_WAYBILL_SHIPPER, type WaybillPrintData } from "@/mock/waybill";
import type { AdminShipOrderDetails, ApiOrder, WaybillLogoType } from "@/types/order";

function paymentMethodFromOrder(
  method: string,
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
  const weight = Number(order.package_weight_kg);

  if (!tracking || !courier || !sorting || !hub || !logoType) {
    return null;
  }
  if (Number.isNaN(weight) || weight <= 0) {
    return null;
  }
  if (logoType === "custom" && !(order.waybill_logo_url ?? "").trim()) {
    return null;
  }

  return {
    order_number: order.order_number,
    tracking_number: tracking,
    courier,
    shipped_at: order.shipped_at ?? order.created_at,
    expected_delivery_date: order.expected_delivery_date,
    payment_method: paymentMethodFromOrder(order.payment.payment_method),
    weight_kg: weight,
    sorting_code: sorting,
    hub_code: hub,
    shipper: DEEPSKY_WAYBILL_SHIPPER,
    consignee: consigneeFromOrder(order),
    items: itemsFromOrder(order),
    total: order.total,
    isJT: logoType === "jt",
    isLalamove: logoType === "lalamove",
    isCustomize: logoType === "custom",
    custom_logo_url: logoType === "custom" ? order.waybill_logo_url : null,
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
  >,
): WaybillPrintData {
  const logoType: WaybillLogoType = draft.waybillLogoType;
  const weight = Number(draft.packageWeightKg);
  const weightKg = !Number.isNaN(weight) && weight > 0 ? weight : 0;

  return {
    order_number: order.order_number,
    tracking_number: draft.trackingNumber.trim() || "TRACKING",
    courier: draft.courier.trim() || "Courier",
    shipped_at: order.shipped_at ?? order.created_at,
    expected_delivery_date: order.expected_delivery_date,
    payment_method: paymentMethodFromOrder(order.payment.payment_method),
    weight_kg: weightKg,
    sorting_code: (order.sorting_code ?? "").trim() || "---",
    hub_code: (order.hub_code ?? "").trim() || "000",
    shipper: DEEPSKY_WAYBILL_SHIPPER,
    consignee: consigneeFromOrder(order),
    items: itemsFromOrder(order),
    total: order.total,
    isJT: logoType === "jt",
    isLalamove: logoType === "lalamove",
    isCustomize: logoType === "custom",
    custom_logo_url: logoType === "custom" ? draft.waybillLogoUrl : null,
  };
}
