/**
 * Generates PWA PNG icons (192×192 and 512×512) from the SVG logo.
 * Run with: node scripts/generate-pwa-icons.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const svgBuffer = readFileSync(resolve(root, 'public', 'logo.svg'));

const sizes = [192, 512];

for (const size of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(root, 'public', `icon-${size}x${size}.png`));

  console.log(`✅  Generated public/icon-${size}x${size}.png`);
}

// Also generate a 180×180 apple-touch-icon
await sharp(svgBuffer)
  .resize(180, 180)
  .png()
  .toFile(resolve(root, 'public', 'apple-touch-icon.png'));

console.log('✅  Generated public/apple-touch-icon.png');
console.log('\n🎉 All PWA icons generated successfully!');
