const SEEN_IDS_KEY = "purchase-activity:seen-ids";
const LATEST_AT_KEY = "purchase-activity:latest-at";
const SKIP_IDS_KEY = "purchase-activity:skip-ids";

function readJsonArray(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function writeJsonArray(key: string, values: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(key, JSON.stringify(Array.from(new Set(values))));
}

export function readPurchaseActivitySeenIds(): Set<string> {
  return new Set(readJsonArray(SEEN_IDS_KEY));
}

export function writePurchaseActivitySeenIds(ids: Set<string>) {
  writeJsonArray(SEEN_IDS_KEY, Array.from(ids));
}

export function readPurchaseActivityLatestAt(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.sessionStorage.getItem(LATEST_AT_KEY);
}

export function writePurchaseActivityLatestAt(iso: string) {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(LATEST_AT_KEY, iso);
}

export function readPurchaseActivitySkipIds(): Set<string> {
  return new Set(readJsonArray(SKIP_IDS_KEY));
}

export function skipPurchaseActivityOrder(orderId: string) {
  const skipIds = readPurchaseActivitySkipIds();
  skipIds.add(orderId);
  writeJsonArray(SKIP_IDS_KEY, Array.from(skipIds));
}

export function isPurchaseActivityOrderSkipped(orderId: string): boolean {
  return readPurchaseActivitySkipIds().has(orderId);
}

export function maxPurchasedAt(items: { purchased_at: string }[]): string | null {
  if (items.length === 0) {
    return null;
  }

  return items.reduce((latest, item) => {
    return item.purchased_at > latest ? item.purchased_at : latest;
  }, items[0]!.purchased_at);
}
