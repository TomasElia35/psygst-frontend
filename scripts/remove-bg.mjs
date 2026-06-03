/**
 * Script para remover el fondo blanco del logo y guardarlo con transparencia.
 * Usa jimp (pure JS), instalado temporalmente.
 * Umbral configurable para manejar anti-aliasing.
 */
import { createCanvas, loadImage } from 'canvas';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(__dirname, '../public/LogoPsyGst.png');
const outputPath = path.resolve(__dirname, '../public/LogoPsyGst.png');

const THRESHOLD = 240; // píxeles con R,G,B > threshold se vuelven transparentes

const img = await loadImage(inputPath);
const canvas = createCanvas(img.width, img.height);
const ctx = canvas.getContext('2d');

ctx.drawImage(img, 0, 0);

const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];

  if (r > THRESHOLD && g > THRESHOLD && b > THRESHOLD) {
    // Transparencia proporcional: más blanco = más transparente (mejor anti-aliasing)
    const whiteness = Math.min(r, g, b);
    const alpha = Math.round((255 - whiteness) * (255 / (255 - THRESHOLD)));
    data[i + 3] = Math.min(alpha, 255);
  }
}

ctx.putImageData(imageData, 0, 0);

const buffer = canvas.toBuffer('image/png');
writeFileSync(outputPath, buffer);

console.log(`✅ Fondo removido correctamente: ${outputPath}`);
console.log(`   Dimensiones: ${img.width}x${img.height}px`);
