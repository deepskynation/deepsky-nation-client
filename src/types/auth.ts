import type { User, UserRole } from "@/types/user";

export type AuthStatus = "idle" | "loading" | "authenticated" | "error";

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
  initialized: boolean;
  profileUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  profileUpdateError: string | null;
  accountUpdateStatus: "idle" | "loading" | "succeeded" | "failed";
  accountUpdateError: string | null;
};

export type ApiUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
  phone_number?: string | null;
  home_address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type EmailVerifyCodeCredentials = {
  email: string;
  code: string;
};

export type MessageResponse = {
  message: string;
};

export type GoogleSendCodeResponse = {
  message: string;
  email: string;
};

export type GoogleVerifyCodeCredentials = {
  credential: string;
  code: string;
};

export type SignupCredentials = {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  home_address: string;
  city: string;
  region: string;
  country: string;
  postal_code: string;
};

export type SignupResponse = {
  message: string;
  user: ApiUser;
};

export type UpdateProfilePayload = {
  phone_number?: string | null;
  home_address?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  postal_code?: string | null;
};

export type UpdateAccountPayload = {
  username?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
};
