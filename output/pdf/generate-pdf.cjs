const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('@playwright/test');

const htmlPath = path.join(__dirname, 'laboratorio-7-gerald.html');
const pdfPath = path.join(__dirname, 'Laboratorio-7-Gerald.pdf');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images, image => {
        if (image.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', () => reject(new Error(`Image failed: ${image.src}`)), { once: true });
        });
      }));
    });
    const pageCount = await page.locator('section.page').count();
    if (pageCount !== 12) throw new Error(`Expected 12 report sections, found ${pageCount}`);
    const imageState = await page.locator('img').evaluateAll(images => images.map(image => ({
      src: image.getAttribute('src'),
      loaded: image.complete && image.naturalWidth > 0,
      width: image.naturalWidth,
      height: image.naturalHeight,
    })));
    if (imageState.some(image => !image.loaded)) throw new Error('At least one evidence image did not load');
    await page.pdf({ path: pdfPath, format: 'Letter', printBackground: true, preferCSSPageSize: true });
    console.log(JSON.stringify({ pdfPath, pageCount, imageState }));
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
