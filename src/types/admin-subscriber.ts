import type { PaginatedResponse, PaginationQuery } from "@/types/pagination";

export type AdminSubscriberTab = "subscribers" | "unsubscribers";

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

export type AdminUnsubscriberListItem = {
  id: string;
  email: string;
  subscribed_at: string;
  unsubscribed_at: string;
  created_at: string;
};

export type AdminUnsubscribersListResponse =
  PaginatedResponse<AdminUnsubscriberListItem>;

export type AdminUnsubscribersQuery = PaginationQuery & {
  search?: string;
  unsubscribed_from?: string;
  unsubscribed_to?: string;
};
