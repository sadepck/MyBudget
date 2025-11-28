/**
 * Script para generar iconos PWA
 * Ejecutar: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// SVG base para el icono - diseño moderno con símbolo de dólar
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="160" fill="rgba(255,255,255,0.15)"/>
  <path d="M256 120 L256 392 M200 180 Q256 140 312 180 Q340 210 312 240 L200 240 Q160 270 200 310 Q256 360 312 320" 
        stroke="white" stroke-width="32" stroke-linecap="round" fill="none"/>
</svg>`;

async function generateIcons() {
  console.log('🎨 Generando iconos PWA para MyBudget...\n');

  const svgBuffer = Buffer.from(svgIcon);

  const icons = [
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const { name, size } of icons) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, name));
    console.log(`✅ ${name} (${size}x${size})`);
  }

  // Crear favicon.ico (usando el PNG de 32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✅ favicon.ico (32x32)');

  // Guardar SVG fuente
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
  console.log('✅ icon.svg (fuente vectorial)');

  console.log('\n🎉 ¡Todos los iconos generados exitosamente!');
  console.log(`📁 Ubicación: ${publicDir}`);
}

generateIcons().catch(err => {
  console.error('❌ Error generando iconos:', err);
  process.exit(1);
});
