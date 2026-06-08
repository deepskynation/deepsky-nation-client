import { mockAccounts } from "@/mock/auth/mock-accounts";
import type { Product, User } from "@/types";

export { mockAccounts, authenticateMockAccount } from "@/mock/auth/mock-accounts";

export const mockUsers: User[] = mockAccounts.map(
  ({ id, email, name, role }) => ({
    id,
    email,
    name,
    role,
  }),
);

export const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Stellar Map Print",
    price: 29.99,
    description: "High-resolution deep-sky chart for your wall.",
  },
  {
    id: "prod-2",
    name: "Nebula Poster Set",
    price: 49.99,
    description: "Three curated nebula images on archival paper.",
  },
];
