import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');
const pngPath = path.resolve(__dirname, '../src/assets/vyntra_logo_cropped.png');

const sourceImage = readFileSync(pngPath);

async function writePng(filename, size, padding = 0) {
  const out = path.join(iconsDir, filename);
  // Ensure we add at least 8% padding to prevent clipping on device home screens
  const safePadding = padding || Math.round(size * 0.08);
  const inner = size - safePadding * 2;
  const png = await sharp(sourceImage)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({
      top: safePadding,
      bottom: safePadding,
      left: safePadding,
      right: safePadding,
      background: { r: 10, g: 10, b: 15, alpha: 1 }, // PWA icons look better with background
    })
    .png()
    .toBuffer();
  writeFileSync(out, png);
  console.log(`Wrote ${filename} (${size}x${size})`);
}

await writePng('icon-192.png', 192);
await writePng('icon-512.png', 512);
await writePng('icon-maskable-512.png', 512, 64);

// Favicon needs to be transparent and padded safely to prevent tab clipping
const favicon = await sharp(sourceImage)
  .resize(26, 26, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: 3,
    bottom: 3,
    left: 3,
    right: 3,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toBuffer();
writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Wrote favicon.ico');
