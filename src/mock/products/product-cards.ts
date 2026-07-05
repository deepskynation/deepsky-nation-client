import type { ApiProduct, ApiProductImage } from "@/types/product";
import { mockColorPickerVariants } from "@/mock/products/product-variants";

const MOCK_TIMESTAMP = "2026-01-01T00:00:00.000Z";

function mockImage(
  id: string,
  role: ApiProductImage["role"],
  src: string,
): ApiProductImage {
  return {
    id,
    image_base64: src,
    role,
    created_at: MOCK_TIMESTAMP,
    updated_at: MOCK_TIMESTAMP,
  };
}

const baseProduct = {
  product_code: "DS-MOCK-001",
  category_id: "cat-tops",
  category_name: "Top",
  description: "Demo product for ComponentVisual.",
  details: null,
  visibility: "released" as const,
  is_featured: false,
  created_at: MOCK_TIMESTAMP,
  updated_at: MOCK_TIMESTAMP,
};

/** Demo products for ComponentVisual ProductCard previews. */
export const mockProductCards: ApiProduct[] = [
  {
    ...baseProduct,
    id: "mock-product-regular",
    title: "Deep Sky Logo Tee",
    price: "1299.00",
    sale_price: null,
    sale: false,
    images: [mockImage("mock-img-1", "placeholder", "/product-3.jpg")],
    variants: mockColorPickerVariants,
    total_stock: 29,
  },
  {
    ...baseProduct,
    id: "mock-product-sale",
    product_code: "DS-MOCK-002",
    title: "Nebula Hoodie",
    price: "2499.00",
    sale_price: "1899.00",
    sale: true,
    images: [
      mockImage("mock-img-2a", "placeholder", "/product-4.jpg"),
      mockImage("mock-img-2b", "model", "/product-5.jpg"),
      mockImage("mock-img-2c", "gallery", "/product-6.jpg"),
    ],
    variants: mockColorPickerVariants,
    total_stock: 17,
  },
  {
    ...baseProduct,
    id: "mock-product-sold-out",
    product_code: "DS-MOCK-003",
    title: "Orion Cap",
    price: "899.00",
    sale_price: null,
    sale: false,
    images: [mockImage("mock-img-3", "placeholder", "/product-7.jpg")],
    variants: mockColorPickerVariants.map((variant) => ({ ...variant, stock: 0 })),
    total_stock: 0,
  },
];
