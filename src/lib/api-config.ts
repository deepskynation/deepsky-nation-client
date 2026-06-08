const API_PORT = 8000;

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, "");
}

/** Base URL for the FastAPI backend (no trailing slash). */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.trim();

  // In dev, use the same host the browser opened (localhost or LAN IP).
  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${API_PORT}`;
  }

  if (fromEnv && !fromEnv.includes(",")) {
    return normalizeBaseUrl(fromEnv);
  }

  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${API_PORT}`;
  }

  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}
