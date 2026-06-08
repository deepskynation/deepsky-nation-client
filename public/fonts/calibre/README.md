# Calibre webfonts

Place your **licensed** Calibre `.woff2` files here (export from your Klim/Commercial Type kit).

Required filenames:

| File | Weight |
|------|--------|
| `Calibre-Regular.woff2` | 400 |
| `Calibre-RegularItalic.woff2` | 400 italic |
| `Calibre-Medium.woff2` | 500 |
| `Calibre-Semibold.woff2` | 600 |
| `Calibre-Bold.woff2` | 700 |

If your files use different names, rename them to match or update `src/lib/fonts.ts`.

Until files are added, the site falls back to `system-ui`. After adding files, restart `npm run dev` to pick them up.

To drop unused weights, remove the matching `@font-face` blocks in `src/app/globals.css`.
