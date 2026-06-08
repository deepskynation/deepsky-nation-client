import type { UserRole } from "@/types";

export type MockAccount = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

/** Dummy accounts for local development (mock auth only) */
export const mockAccounts: MockAccount[] = [
  {
    id: "admin-1",
    email: "admin@deepsky.nation",
    password: "admin123",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "user-1",
    email: "demo@deepsky.nation",
    password: "demo123",
    name: "Demo User",
    role: "user",
  },
];

export function authenticateMockAccount(
  email: string,
  password: string,
): MockAccount | null {
  const normalizedEmail = email.trim().toLowerCase();

  return (
    mockAccounts.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail &&
        account.password === password,
    ) ?? null
  );
}
