/** Shared helpers for Redux slice `fetch` calls — not domain API modules. */

type ApiErrorBody = {
  detail?: string | { msg?: string }[];
  message?: string;
};

export async function readApiError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail)) {
      const parts = body.detail
        .map((item) => item.msg)
        .filter((msg): msg is string => Boolean(msg));
      if (parts.length > 0) {
        return parts.join(", ");
      }
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // ignore JSON parse errors
  }
  return "Something went wrong. Please try again.";
}
