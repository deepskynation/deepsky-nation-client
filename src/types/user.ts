export type UserRole = "user" | "admin";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone_number?: string | null;
  home_address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
};
