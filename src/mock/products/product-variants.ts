import type { ApiProductVariant } from "@/types/product";

const MOCK_TIMESTAMP = "2026-01-01T00:00:00.000Z";

/** Demo variants for ComponentVisual and local UI testing. */
export const mockSizePickerVariants: ApiProductVariant[] = [
  {
    id: "mock-s-black",
    size: "S",
    color_id: "black",
    color_name: "Black",
    hex_code: "#111111",
    stock: 12,
    price: null,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  },
  {
    id: "mock-m-black",
    size: "M",
    color_id: "black",
    color_name: "Black",
    hex_code: "#111111",
    stock: 8,
    price: null,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  },
  {
    id: "mock-l-black",
    size: "L",
    color_id: "black",
    color_name: "Black",
    hex_code: "#111111",
    stock: 5,
    price: null,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  },
  {
    id: "mock-xl-black",
    size: "XL",
    color_id: "black",
    color_name: "Black",
    hex_code: "#111111",
    stock: 0,
    price: null,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  },
  {
    id: "mock-xxl-black",
    size: "XXL",
    color_id: "black",
    color_name: "Black",
    hex_code: "#111111",
    stock: 0,
    price: null,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  },
];
