/**
 * Absolute URL encoded in the waybill QR code.
 * Prefer the browser origin; set NEXT_PUBLIC_APP_URL for SSR/print contexts
 * where `window` is unavailable (e.g. production app origin).
 */
export function getWaybillPublicUrl(trackingNumber: string): string {
  const tracking = trackingNumber.trim();
  const path = `/waybill/${encodeURIComponent(tracking)}`;

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }

  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (fromEnv) {
    return `${fromEnv}${path}`;
  }

  return path;
}
