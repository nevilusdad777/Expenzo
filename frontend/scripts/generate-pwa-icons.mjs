import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const iconsDir = path.join(publicDir, 'icons');
const svgPath = path.join(iconsDir, 'icon-source.svg');

if (!existsSync(iconsDir)) mkdirSync(iconsDir, { recursive: true });

const svg = readFileSync(svgPath);

async function writePng(filename, size, padding = 0) {
  const out = path.join(iconsDir, filename);
  const inner = size - padding * 2;
  const png = await sharp(svg)
    .resize(inner, inner, { fit: 'contain', background: { r: 10, g: 10, b: 15, alpha: 1 } })
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: { r: 10, g: 10, b: 15, alpha: 1 },
    })
    .png()
    .toBuffer();
  writeFileSync(out, png);
  console.log(`Wrote ${filename} (${size}x${size})`);
}

await writePng('icon-192.png', 192);
await writePng('icon-512.png', 512);
await writePng('icon-maskable-512.png', 512, 64);

const favicon = await sharp(svg).resize(32, 32).png().toBuffer();
writeFileSync(path.join(publicDir, 'favicon.ico'), favicon);
console.log('Wrote favicon.ico');
