/** Mock waybill payloads for Component Visual / print preview. */

import type { ApiOrder } from "@/types/order";

export type WaybillPrintItem = {
  title: string;
  variant_label?: string | null;
  quantity: number;
};

export type WaybillShipper = {
  name: string;
  phone: string;
  address_line: string;
  city: string;
  region: string;
  /** Barangay / district label shown on label */
  area?: string;
  country: string;
  postal_code: string;
};

export type WaybillConsignee = {
  name: string;
  phone: string;
  email: string;
  address_line: string;
  city: string;
  region: string;
  area?: string;
  country: string;
  postal_code: string;
  /** e.g. HOME */
  address_type?: string;
};

export type WaybillPrintData = {
  order_number: string;
  tracking_number: string;
  courier: string;
  shipped_at: string;
  /** Expected / promised delivery date for seller footer row */
  expected_delivery_date?: string | null;
  payment_method: "cod" | "online_transfer";
  /** Package weight in kg */
  weight_kg: number;
  /** Large destination sorting code, e.g. 460-410301 */
  sorting_code: string;
  /** Small hub / branch code top-right, e.g. 029 */
  hub_code: string;
  shipper: WaybillShipper;
  consignee: WaybillConsignee;
  items: WaybillPrintItem[];
  total: string;
  /** Courier branding: J&T Express logo */
  isJT: boolean;
  /** Courier branding: Lalamove logo */
  isLalamove: boolean;
  /**
   * When true, print UI may pick a custom logo (`custom_logo_url`)
   * instead of the courier default.
   */
  isCustomize: boolean;
  /** Custom logo path/URL used when `isCustomize` is true */
  custom_logo_url?: string | null;
};

/** Preset logo options for customize-at-print mock. */
export const WAYBILL_LOGO_OPTIONS = [
  { id: "jt", label: "J&T Express", src: "/j%26t-logo.svg?v=2" },
  { id: "lalamove", label: "Lalamove", src: "/lalamove-logo.webp" },
  { id: "deepsky", label: "Deepsky Nation", src: "/deepsky-logo.png" },
] as const;

export type WaybillLogoOptionId = (typeof WAYBILL_LOGO_OPTIONS)[number]["id"];

const DEEPSKY_SHIPPER: WaybillShipper = {
  name: "Deepsky Nation",
  phone: "639170000000",
  address_line: "Unit 12, Cosmic Plaza, 88 Aurora Blvd",
  city: "Quezon City",
  region: "Metro Manila",
  area: "Project 4",
  country: "Philippines",
  postal_code: "1100",
};

/** Default shop shipper used for live waybill print until shop settings expand. */
export const DEEPSKY_WAYBILL_SHIPPER = DEEPSKY_SHIPPER;

/** Prepaid online-transfer sample (J&T). */
export const mockWaybillPrepaid: WaybillPrintData = {
  order_number: "DSN-10042",
  tracking_number: "770180382501",
  courier: "jnt",
  shipped_at: "2026-07-10T15:15:00+08:00",
  expected_delivery_date: "2026-07-14",
  payment_method: "online_transfer",
  weight_kg: 0.45,
  sorting_code: "460-160001",
  hub_code: "018",
  shipper: DEEPSKY_SHIPPER,
  consignee: {
    name: "Alex Reyes",
    phone: "639185550142",
    email: "alex@example.com",
    address_line: "24 Mabini St, Brgy. San Antonio",
    city: "Pasig",
    region: "Metro Manila",
    area: "San Antonio",
    country: "Philippines",
    postal_code: "1600",
    address_type: "HOME",
  },
  items: [
    {
      title: "Nebula Tee",
      variant_label: "M · Black",
      quantity: 1,
    },
    {
      title: "Stellar Cap",
      variant_label: "One Size · Navy",
      quantity: 1,
    },
  ],
  total: "1499.00",
  isJT: true,
  isLalamove: false,
  isCustomize: false,
  custom_logo_url: null,
};

/** COD sample — J&T with COD watermark. */
export const mockWaybillCod: WaybillPrintData = {
  order_number: "DSN-10087",
  tracking_number: "770180382589",
  courier: "jnt",
  shipped_at: "2026-07-22T11:40:00+08:00",
  expected_delivery_date: "2026-07-28",
  payment_method: "cod",
  weight_kg: 0.8,
  sorting_code: "460-600001",
  hub_code: "029",
  shipper: DEEPSKY_SHIPPER,
  consignee: {
    name: "Jordan Cruz",
    phone: "639271118899",
    email: "jordan@example.com",
    address_line: "15 Rizal Ave, Brgy. Centro",
    city: "Cebu City",
    region: "Cebu",
    area: "Centro",
    country: "Philippines",
    postal_code: "6000",
    address_type: "HOME",
  },
  items: [
    {
      title: "Galaxy Hoodie",
      variant_label: "L · Charcoal",
      quantity: 1,
    },
  ],
  total: "2499.00",
  isJT: true,
  isLalamove: false,
  isCustomize: false,
  custom_logo_url: null,
};

/** Lalamove sample. */
export const mockWaybillLalamove: WaybillPrintData = {
  order_number: "DSN-10110",
  tracking_number: "LLMV8829104455",
  courier: "lalamove",
  shipped_at: "2026-07-24T09:20:00+08:00",
  expected_delivery_date: "2026-07-24",
  payment_method: "online_transfer",
  weight_kg: 0.35,
  sorting_code: "MNL-1100",
  hub_code: "011",
  shipper: DEEPSKY_SHIPPER,
  consignee: {
    name: "Sam Ortiz",
    phone: "639171112233",
    email: "sam@example.com",
    address_line: "8 Katipunan Ave, Loyola Heights",
    city: "Quezon City",
    region: "Metro Manila",
    area: "Loyola Heights",
    country: "Philippines",
    postal_code: "1108",
    address_type: "HOME",
  },
  items: [
    {
      title: "Orbit Socks",
      variant_label: "Free Size · Black",
      quantity: 2,
    },
  ],
  total: "599.00",
  isJT: false,
  isLalamove: true,
  isCustomize: false,
  custom_logo_url: null,
};

/** Customize logo sample — print UI can pick logo. */
export const mockWaybillCustomize: WaybillPrintData = {
  order_number: "DSN-10125",
  tracking_number: "CUST9910023344",
  courier: "manual",
  shipped_at: "2026-07-25T14:00:00+08:00",
  expected_delivery_date: "2026-07-29",
  payment_method: "cod",
  weight_kg: 0.6,
  sorting_code: "460-160002",
  hub_code: "021",
  shipper: DEEPSKY_SHIPPER,
  consignee: {
    name: "Riley Tan",
    phone: "639209988776",
    email: "riley@example.com",
    address_line: "55 Shaw Blvd, Brgy. Highway Hills",
    city: "Mandaluyong",
    region: "Metro Manila",
    area: "Highway Hills",
    country: "Philippines",
    postal_code: "1552",
    address_type: "HOME",
  },
  items: [
    {
      title: "Nebula Tee",
      variant_label: "S · White",
      quantity: 1,
    },
  ],
  total: "899.00",
  isJT: false,
  isLalamove: false,
  isCustomize: true,
  custom_logo_url: "/deepsky-logo.png",
};

export const mockWaybills: WaybillPrintData[] = [
  mockWaybillPrepaid,
  mockWaybillCod,
  mockWaybillLalamove,
  mockWaybillCustomize,
];

/** ApiOrder-shaped sample for PrintWaybillDialog / orderToWaybillPrintData. */
export const mockApiOrderWithWaybill: ApiOrder = {
  id: "visual-waybill-order",
  order_number: "ORD-100087",
  status: "approved",
  user_id: "visual-user",
  customer_username: "Jordan Cruz",
  rejection_reason: null,
  approved_at: "2026-07-22T10:00:00+08:00",
  rejected_at: null,
  shipped_at: null,
  courier: "J&T Express",
  tracking_number: "770180382589",
  package_weight_kg: "0.800",
  waybill_logo_type: "jt",
  waybill_logo_url: null,
  waybill_payment_method: "cod",
  sorting_code: "460-600001",
  hub_code: "029",
  delivery_source: "custom",
  delivery_email: "jordan@example.com",
  delivery_phone: "639271118899",
  delivery_address_line: "15 Rizal Ave, Brgy. Centro",
  delivery_city: "Cebu City",
  delivery_region: "Cebu",
  delivery_country: "Philippines",
  delivery_postal_code: "6000",
  subtotal: "2449.00",
  shipping_fee: "50.00",
  total: "2499.00",
  expected_delivery_date: "2026-07-28",
  created_at: "2026-07-21T09:00:00+08:00",
  items: [
    {
      id: "visual-item-1",
      variant_id: "visual-variant-1",
      product_id: "visual-product-1",
      product_code: "PROD-1000001",
      product_title: "Galaxy Hoodie",
      variant_label: "L · Charcoal",
      quantity: 1,
      unit_price: "2449.00",
      line_total: "2449.00",
    },
  ],
  payment: {
    id: "visual-payment-1",
    payment_method: "cod",
    payment_receipt_url: null,
    has_receipt: false,
    payment_receipt_uploaded_at: null,
  },
};
