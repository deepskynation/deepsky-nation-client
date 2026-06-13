import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const logoPath = path.join(publicDir, "deepsky-logo.png");

// Space around the logo inside the square (0.14 = 14% on each side).
// Increase for more breathing room, decrease to make the logo larger.
const ANY_PADDING_RATIO = 0.14;

// Extra padding for Android/iOS home-screen masks (circle, squircle, rounded square).
// Keep the logo inside the center ~66% "safe zone" so it is not clipped.
const MASKABLE_PADDING_RATIO = 0.24;

const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

async function createSquareIcon(size, outputName, paddingRatio) {
  const padding = Math.round(size * paddingRatio);
  const inner = size - padding * 2;

  const resized = await sharp(logoPath)
    .resize({ width: inner, height: inner, fit: "inside" })
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BACKGROUND,
    },
  })
    .composite([{ input: resized, gravity: "center" }])
    .png()
    .toFile(path.join(publicDir, outputName));

  console.log(
    `Created ${outputName} (${size}x${size}, padding ${Math.round(paddingRatio * 100)}%)`,
  );
}

await createSquareIcon(192, "icon-192.png", ANY_PADDING_RATIO);
await createSquareIcon(512, "icon-512.png", ANY_PADDING_RATIO);
await createSquareIcon(180, "apple-icon.png", ANY_PADDING_RATIO);
await createSquareIcon(512, "icon-512-maskable.png", MASKABLE_PADDING_RATIO);
await createSquareIcon(192, "icon-192-maskable.png", MASKABLE_PADDING_RATIO);
