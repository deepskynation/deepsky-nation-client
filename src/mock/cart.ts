import type { CartItemCardData } from "@/components/cart/cart-item-card";

/** Demo cart line for ComponentVisual. */
export const mockCartItems: CartItemCardData[] = [
  {
    id: "cart-demo-1",
    title: "Deep Sky Logo Tee",
    productCode: "DS-MOCK-001",
    variantLabel: "M · Black",
    thumbnailSrc: "/product-3.jpg",
    quantity: 2,
    lineTotal: 2598,
    maxQuantity: 8,
    isAvailable: true,
  },
  {
    id: "cart-demo-2",
    title: "Deep Sky Logo Tee",
    productCode: "DS-MOCK-001",
    variantLabel: "M · Black",
    thumbnailSrc: "/product-3.jpg",
    quantity: 2,
    lineTotal: 2598,
    maxQuantity: 8,
    isAvailable: true,
  },
  {
    id: "cart-demo-3",
    title: "Orion Cap",
    productCode: "DS-MOCK-003",
    variantLabel: "One Size · Sand",
    thumbnailSrc: "/product-7.jpg",
    quantity: 1,
    lineTotal: 899,
    maxQuantity: 1,
    isAvailable: false,
    unavailableReason: "Out Of Stock",
  },
];
