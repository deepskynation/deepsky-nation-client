export const productCategories = [
  "All",
  "Top",
  "Bottom",
  "Outerwear",
  "Accessories",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const productSortOptions = [
  "Default",
  "Low to High",
  "High To Low",
] as const;

export type ProductSortOption = (typeof productSortOptions)[number];

export type ProductItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: Exclude<ProductCategory, "All">;
  stock: number;
};

export function getProductById(id: number): ProductItem | undefined {
  return productItems.find((product) => product.id === id);
}

export const productItems: ProductItem[] = [
  {
    id: 7,
    name: "MULTICOLOR BLACK",
    price: 120,
    image: "/product-7.jpg",
    description: "DEEPSKY STREETCORE COLLECTION.",
    category: "Top",
    stock: 24,
  },
  {
    id: 3,
    name: "MULTICOLOR BLACK",
    price: 85,
    image: "/product-3.jpg",
    description: "DEEPSKY STREETCORE COLLECTION.",
    category: "Bottom",
    stock: 18,
  },
  {
    id: 4,
    name: "MULTICOLOR BLACK",
    price: 150,
    image: "/product-8.jpg",
    description: "DEEPSKY STREETCORE COLLECTION.",
    category: "Outerwear",
    stock: 9,
  },
  {
    id: 5,
    name: "MULTICOLOR BLACK",
    price: 65,
    image: "/product-9.jpg",
    description: "DEEPSKY STREETCORE COLLECTION.",
    category: "Accessories",
    stock: 42,
  },
  {
    id: 6,
    name: "MULTICOLOR BLACK",
    price: 100,
    image: "/product-6.jpg",
    description: "DEEPSKY STREETCORE COLLECTION.",
    category: "Top",
    stock: 15,
  },
];
