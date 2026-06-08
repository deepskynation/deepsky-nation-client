const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

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

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read image."));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
}

export function toImagePreviewSrc(base64: string): string {
  if (base64.startsWith("data:")) {
    return base64;
  }
  return `data:image/jpeg;base64,${base64}`;
}
