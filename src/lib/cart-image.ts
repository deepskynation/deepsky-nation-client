import { toImagePreviewSrc } from "@/lib/read-image-base64";

export function getCartLineThumbnailSrc(
  thumbnailBase64: string | null | undefined,
): string | null {
  if (!thumbnailBase64?.trim()) {
    return null;
  }
  return toImagePreviewSrc(thumbnailBase64);
}
