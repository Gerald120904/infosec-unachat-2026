const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const baseUrl = process.env.VERCEL_CHAT_URL || 'https://infosec-unachat-2026.vercel.app';
const evidenceDir = __dirname;
const runStamp = new Date().toISOString();

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const context1 = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    const context2 = await browser.newContext({ viewport: { width: 1365, height: 900 } });
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const ws1 = [];
    const ws2 = [];
    page1.on('websocket', socket => ws1.push(socket.url()));
    page2.on('websocket', socket => ws2.push(socket.url()));

    await Promise.all([
      page1.goto(baseUrl, { waitUntil: 'domcontentloaded' }),
      page2.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    ]);
    await Promise.all([
      page1.locator('#m').waitFor({ state: 'visible' }),
      page2.locator('#m').waitFor({ state: 'visible' })
    ]);
    await Promise.all([
      page1.waitForFunction(() => document.querySelector('#empty-state') !== null, null, { timeout: 15000 }),
      page2.waitForFunction(() => document.querySelector('#empty-state') !== null, null, { timeout: 15000 })
    ]);
    assert(ws1.some(url => url.includes('transport=websocket')), 'client 1 did not establish Socket.IO WebSocket transport');
    assert(ws2.some(url => url.includes('transport=websocket')), 'client 2 did not establish Socket.IO WebSocket transport');

    const firstMessage = 'Vercel Socket.IO comprobado en producción';
    await page1.locator('#nombre').fill('Cliente Vercel 1');
    await page1.locator('#m').fill(firstMessage);
    await page1.getByRole('button', { name: 'Send' }).click();
    await Promise.all([
      page1.waitForFunction(text => document.querySelector('#messages')?.innerText.includes(text), firstMessage),
      page2.waitForFunction(text => document.querySelector('#messages')?.innerText.includes(text), firstMessage)
    ]);

    const secondMessage = 'Difusión real entre dos clientes Vercel';
    await page2.locator('#nombre').fill('Cliente Vercel 2');
    await page2.locator('#m').fill(secondMessage);
    await page2.getByRole('button', { name: 'Send' }).click();
    await Promise.all([
      page1.waitForFunction(text => document.querySelector('#messages')?.innerText.includes(text), secondMessage),
      page2.waitForFunction(text => document.querySelector('#messages')?.innerText.includes(text), secondMessage)
    ]);

    await page1.screenshot({ path: path.join(evidenceDir, '01-vercel-chat-funcionando-2026-10-30.png'), fullPage: true });
    await page2.screenshot({ path: path.join(evidenceDir, '02-vercel-dos-clientes-2026-10-30.png'), fullPage: true });
    fs.writeFileSync(path.join(evidenceDir, 'vercel-chat-test-2026-10-30.txt'), [
      `Fecha: ${runStamp}`,
      `Entorno: Vercel production alias ${baseUrl}`,
      `Cliente 1 WebSocket: ${ws1.some(url => url.includes('transport=websocket')) ? 'conectado' : 'fallido'}`,
      `Cliente 2 WebSocket: ${ws2.some(url => url.includes('transport=websocket')) ? 'conectado' : 'fallido'}`,
      `Mensaje 1 recibido por ambos: ${firstMessage}`,
      `Mensaje 2 recibido por ambos: ${secondMessage}`,
      'Resultado: OK; la aplicación entregó ambos mensajes mediante Socket.IO sobre WebSocket.'
    ].join('\n') + '\n', 'utf8');
    console.log('OK: two public Vercel clients connected over WebSocket and received both broadcasts.');
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
