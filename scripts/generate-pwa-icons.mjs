import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const logoPath = path.join(publicDir, "deepsky-logo.png");

async function createSquareIcon(size, outputName) {
  const padding = Math.round(size * 0.14);
  const inner = size - padding * 2;

  const resized = await sharp(logoPath)
    .resize({ width: inner, height: inner, fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 },
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, outputName));

  console.log(`Created ${outputName} (${size}x${size})`);
}

await createSquareIcon(192, "icon-192.png");
await createSquareIcon(512, "icon-512.png");
await createSquareIcon(180, "apple-icon.png");
