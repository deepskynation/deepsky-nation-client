export type DashboardDateRange = {
  from?: string;
  to?: string;
};

export type DashboardStatistics = {
  total_items: number;
  total_sales: string;
  total_not_released_products: number;
  total_released_products: number;
  total_orders: number;
  date_range: DashboardDateRange;
};

export type SalesAnalyticsSummary = {
  revenue: string;
  orders: number;
  units_sold: number;
};

export type SalesTimeSeriesPoint = {
  period_start: string;
  revenue: string;
  orders: number;
  units_sold: number;
};

export type TopSellingProduct = {
  product_id: string;
  title: string;
  product_code: string;
  units_sold: number;
  revenue: string;
};

export type OrderTrendPoint = {
  period_start: string;
  total: number;
  pending: number;
  approved: number;
  shipped: number;
  rejected: number;
  cancelled: number;
};

export type SalesAnalyticsGranularity = "day" | "week" | "month";

export type SalesAnalytics = {
  summary: SalesAnalyticsSummary;
  time_series: SalesTimeSeriesPoint[];
  top_products: TopSellingProduct[];
  order_trends: OrderTrendPoint[];
  granularity: SalesAnalyticsGranularity;
};

export type FsnClassification = "fast_moving" | "slow_moving" | "non_moving";

export type FsnProductRow = {
  product_id: string;
  title: string;
  product_code: string;
  units_sold: number;
  current_stock: number;
  classification: FsnClassification;
};

export type FsnAnalysis = {
  summary: {
    fast_moving: number;
    slow_moving: number;
    non_moving: number;
  };
  products: {
    fast_moving: FsnProductRow[];
    slow_moving: FsnProductRow[];
    non_moving: FsnProductRow[];
  };
  thresholds: {
    fast_moving_min_units: number;
  };
};

export type DashboardDateQuery = {
  from?: string;
  to?: string;
};
