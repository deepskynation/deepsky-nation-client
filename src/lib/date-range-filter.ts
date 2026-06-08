export const DATE_RANGE_QUICK_FILTERS = [
  "this-month",
  "last-month",
  "last-3-months",
  "last-6-months",
  "this-year",
  "last-year",
  "all-time",
] as const;

export type DateRangeQuickFilter = (typeof DATE_RANGE_QUICK_FILTERS)[number];

export type DateRangeFilterValue = {
  /** Preset selection. Omitted or `"custom"` when the user picks manual dates. */
  preset?: DateRangeQuickFilter | "custom";
  /** Inclusive start date (`YYYY-MM-DD`). */
  from?: string;
  /** Inclusive end date (`YYYY-MM-DD`). */
  to?: string;
};

export const DATE_RANGE_QUICK_FILTER_LABELS: Record<DateRangeQuickFilter, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  "last-3-months": "Last 3 Months",
  "last-6-months": "Last 6 Months",
  "this-year": "This Year",
  "last-year": "Last Year",
  "all-time": "All Time",
};

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getQuickFilterRange(
  preset: DateRangeQuickFilter,
  referenceDate: Date = new Date(),
): Pick<DateRangeFilterValue, "from" | "to"> {
  const today = toISODate(referenceDate);

  switch (preset) {
    case "this-month":
      return { from: toISODate(startOfMonth(referenceDate)), to: today };
    case "last-month": {
      const lastMonth = addMonths(referenceDate, -1);
      return {
        from: toISODate(startOfMonth(lastMonth)),
        to: toISODate(endOfMonth(lastMonth)),
      };
    }
    case "last-3-months":
      return { from: toISODate(addMonths(referenceDate, -3)), to: today };
    case "last-6-months":
      return { from: toISODate(addMonths(referenceDate, -6)), to: today };
    case "this-year":
      return { from: `${referenceDate.getFullYear()}-01-01`, to: today };
    case "last-year": {
      const year = referenceDate.getFullYear() - 1;
      return { from: `${year}-01-01`, to: `${year}-12-31` };
    }
    case "all-time":
      return {};
  }
}

export function createDateRangeFromPreset(
  preset: DateRangeQuickFilter,
  referenceDate: Date = new Date(),
): DateRangeFilterValue {
  return { preset, ...getQuickFilterRange(preset, referenceDate) };
}

export function resolveDateRangeBounds(
  value: DateRangeFilterValue | undefined,
): { from?: string; to?: string } {
  if (!value) {
    return {};
  }

  if (value.preset && value.preset !== "custom") {
    return getQuickFilterRange(value.preset);
  }

  return {
    from: value.from || undefined,
    to: value.to || undefined,
  };
}

export function dateRangeFilterIsActive(value: DateRangeFilterValue | undefined): boolean {
  if (!value) {
    return false;
  }

  if (value.preset && value.preset !== "custom") {
    return value.preset !== "all-time";
  }

  return Boolean(value.from || value.to);
}

function formatDisplayDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) {
    return isoDate;
  }

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateRangeFilterLabel(
  value: DateRangeFilterValue | undefined,
  placeholder = "All Time",
): string {
  if (!value || !dateRangeFilterIsActive(value)) {
    return placeholder;
  }

  if (value.preset && value.preset !== "custom") {
    return DATE_RANGE_QUICK_FILTER_LABELS[value.preset];
  }

  const { from, to } = resolveDateRangeBounds(value);

  if (from && to) {
    return `${formatDisplayDate(from)} – ${formatDisplayDate(to)}`;
  }

  if (from) {
    return `From ${formatDisplayDate(from)}`;
  }

  if (to) {
    return `Until ${formatDisplayDate(to)}`;
  }

  return placeholder;
}

export function detectQuickFilter(
  from: string | undefined,
  to: string | undefined,
  referenceDate: Date = new Date(),
): DateRangeQuickFilter | "custom" | undefined {
  if (!from && !to) {
    return "all-time";
  }

  for (const preset of DATE_RANGE_QUICK_FILTERS) {
    const range = getQuickFilterRange(preset, referenceDate);
    if (range.from === from && range.to === to) {
      return preset;
    }
  }

  return "custom";
}

export function createCustomDateRange(
  from: string,
  to: string,
  referenceDate: Date = new Date(),
): DateRangeFilterValue {
  return {
    preset: detectQuickFilter(from || undefined, to || undefined, referenceDate),
    from: from || undefined,
    to: to || undefined,
  };
}

export function dateRangeFromBounds(
  from?: string,
  to?: string,
): DateRangeFilterValue | undefined {
  if (!from && !to) {
    return undefined;
  }

  return createCustomDateRange(from ?? "", to ?? "");
}
