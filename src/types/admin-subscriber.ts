import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";

export type AdminSubscriberListItem = {
  id: string;
  email: string;
  created_at: string;
};

export type AdminSubscribersListResponse = PaginatedResponse<AdminSubscriberListItem>;

export type AdminSubscribersQuery = PaginationQuery & {
  search?: string;
  created_from?: string;
  created_to?: string;
};
