const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const JPEG_QUALITY = 0.82;

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",", 2)[1] : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);

  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Could not read image."));
      image.src = objectUrl;
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function compressImageFile(file: File): Promise<string> {
  const image = await loadImageElement(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale =
    longestSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / longestSide : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not process image.");
  }

  context.drawImage(image, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);

  while (estimateDataUrlBytes(dataUrl) > MAX_IMAGE_BYTES && quality > 0.5) {
    quality -= 0.08;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (estimateDataUrlBytes(dataUrl) > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large after compression. Try a smaller photo.");
  }

  return dataUrl;
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      reject(new Error("Image must be 5 MB or smaller."));
      return;
    }

    void compressImageFile(file).then(resolve).catch(reject);
  });
}

const PUBLIC_IMAGE_PATH =
  /^\/[\w./-]+\.(?:avif|gif|jpe?g|png|webp)(?:\?[\w=&%-]*)?(?:#[\w-]*)?$/i;

function isPublicImagePath(value: string): boolean {
  return PUBLIC_IMAGE_PATH.test(value);
}

export function toImagePreviewSrc(base64: string): string {
  if (base64.startsWith("data:")) {
    return base64;
  }
  if (
    base64.startsWith("http://") ||
    base64.startsWith("https://") ||
    isPublicImagePath(base64)
  ) {
    return base64;
  }
  return `data:image/jpeg;base64,${base64}`;
}
