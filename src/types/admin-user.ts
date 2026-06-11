import type { PaginationQuery } from "@/types/pagination";

export type AdminUserActivityStatus = "active" | "inactive";

export type AdminUserRole = "user" | "admin";

export type AdminUserStatistics = {
  registered_users: number;
  active_users: number;
  inactive_users: number;
};

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserActivityStatus;
  last_login_at: string | null;
};

export type AdminUsersListResponse = {
  statistics: AdminUserStatistics;
  users: AdminUserListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type AdminUserSessionSummary = {
  id: string;
  created_at: string;
  expires_at: string;
  revoked_at: string | null;
  last_seen_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
};

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  is_email_verified: boolean;
  status: AdminUserActivityStatus;
  phone_number: string | null;
  home_address: string | null;
  country: string | null;
  postal_code: string | null;
  city: string | null;
  region: string | null;
  last_login_at: string | null;
  created_at: string;
  active_session_count: number;
  recent_sessions: AdminUserSessionSummary[];
};

export type AdminUsersQuery = PaginationQuery & {
  status?: AdminUserActivityStatus;
  search?: string;
  role?: AdminUserRole;
  created_from?: string;
  created_to?: string;
};

export type AdminUsersListState = {
  rows: AdminUserListItem[];
  statistics: AdminUserStatistics | null;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
};

export type CreateAdminAccountPayload = {
  email: string;
  role: AdminUserRole;
};

export type CreateAdminAccountResponse = {
  message: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: AdminUserRole;
    is_email_verified: boolean;
  };
};
