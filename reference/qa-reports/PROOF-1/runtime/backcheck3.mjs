// PROOF-1 delta: Android Back on the guardian card reached the REAL way (map -> 1-10 on the shipped build, no dev hooks), and
// whether AudioFocus.want / KeepAwake.set reach the bridge. backcheck.mjs's harness (lines 3-47). node backcheck3.mjs <shipped url> <tag>
import fs from 'node:fs';
import { chromium, seedDone, IDS, click, sleep, HEAD, MAIN, here, PROBE, playFromMap } from './rtlib.mjs';
const which = process.argv[3] ?? 'int2';
const url = process.argv[2]; const tag = process.argv[3] ?? 'int2';
const bridge = fs.readFileSync(`${here}/native-bridge.js`, 'utf8');
const FAKE = `
window.__calls = [];
window.androidBridge = { postMessage(json) { const d = JSON.parse(json); window.__calls.push(d.pluginId + '.' + d.methodName + (d.options && d.options.eventName ? ':' + d.options.eventName : ''));
  if (d.methodName === 'addListener') { if (d.pluginId === 'App' && d.options.eventName === 'backButton') window.__backCb = d.callbackId; return; }
  setTimeout(() => window.Capacitor.fromNative({ callbackId: d.callbackId, pluginId: d.pluginId, methodName: d.methodName, success: true, data: {} }), 0); } };
${bridge}
const M = (n) => ({ name: n, rtype: n === 'addListener' ? 'callback' : 'promise' });
window.Capacitor.PluginHeaders = ['App', 'AudioFocus', 'KeepAwake', 'Filesystem', 'Share'].map((name) => ({ name, methods: ['addListener', 'removeListener', 'removeAllListeners', 'exitApp', 'getInfo', 'getState', 'minimizeApp', 'request', 'abandon', 'keepOn', 'allowSleep', 'set', 'writeFile', 'share'].map(M) }));
window.__back = () => window.Capacitor.fromNative({ callbackId: window.__backCb, pluginId: 'App', methodName: 'addListener', success: true, data: { canGoBack: false }, save: true });
`;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e.message)));
await page.addInitScript(FAKE);
await page.addInitScript(PROBE);
await page.goto(url);
await page.evaluate(seedDone, IDS);
await page.reload();
await page.locator('.ttl-leaf').first().waitFor({ timeout: 30000 });
await sleep(1500);
const native = await page.evaluate(() => ({ native: window.Capacitor.isNativePlatform(), cb: window.__backCb ?? null, calls: window.__calls.slice(0, 12) }));
console.log(which, 'native path:', JSON.stringify(native));
const rows = [];
const state = () => page.evaluate(() => {
  const vis = (s) => !!document.querySelector(s);
  const e = window.__probeEngine?.();
  return [vis('.ttl-leaf') && 'title', vis('.wm-head') && 'map', vis('.ui-saveload') && 'saveload', vis('.st-tab') && 'settings', vis('.sh-tab') && 'satchel',
    vis('.pm-scrim') && 'pause-menu', e && e.isRunning && (e.isPaused ? 'stage(paused)' : 'stage(running)'), vis('[role=dialog]') && 'dialog:' + (document.querySelector('[role=dialog]')?.getAttribute('aria-label') ?? '?')].filter(Boolean).join('+') || document.body.innerText.slice(0, 40).replace(/\s+/g, ' ');
});
async function step(l){ rows.push('  step: '+l+' ['+(await state())+']'); }
async function back(label) {
  const before = await state();
  await page.evaluate(() => window.__back());
  await sleep(900);
  const after = await state();
  rows.push(`${label}: [${before}] -> Back -> [${after}]`);
  await page.screenshot({ path: `${here}/shots/back-${which}-${label.replace(/\W+/g, '_')}.png` });
}
const txt = () => page.evaluate(() => document.body.innerText.slice(0, 90).replace(/\s+/g, ' '));
try {
  await page.locator('.ttl-leaf').first().click(); await page.locator('.wm-head').waitFor({ timeout: 20000 }); await sleep(800);
  for (let i = 0; i < 12; i++) { const t = await page.locator('.wm-prog-w').first().innerText(); if (/World 1 /.test(t)) break; await page.locator('.wm-arrow[aria-label="Previous world"]').click(); await sleep(900); }
  const node = () => page.locator('.map-node[aria-label^="Stage 1-10:"]').first();
  await node().click(); await sleep(2000);
  await page.screenshot({ path: `${here}/shots/back3-${which}-boss-intro.png` });
  await back('guardian intro story (1-10, real path)'); await sleep(1200);
  rows.push(`  then: ${await state()} | ${(await txt()).slice(0, 60)}`);
  if (await page.locator('.wm-head').count()) { await node().click(); await sleep(2000); }
  const skip = page.getByText(/skip to fight/i).first();
  if (await skip.count()) { await skip.click(); rows.push('  tapped Skip to fight'); }
  let shot = false;
  for (let i = 0; i < 12; i++) {
    await sleep(1000);
    const card = await page.locator('.boss-card').count();
    rows.push(`  +${i + 1}s: ${await state()}${card ? ' +boss-card' : ''} | ${(await txt()).slice(0, 50)}`);
    if (card) { shot = true; await page.screenshot({ path: `${here}/shots/back3-${which}-guardian-card.png` }); await back('guardian card (real path)'); await sleep(1200); rows.push(`  then: ${await state()} | boss-card ${await page.locator('.boss-card').count()} | ${(await txt()).slice(0, 60)}`); break; }
  }
  if (!shot) { rows.push('  no .boss-card seen in 12 s after Skip'); await back('whatever is up after Skip'); await sleep(1200); rows.push(`  then: ${await state()} | ${(await txt()).slice(0, 60)}`); }
  await back('next back'); await sleep(1200); rows.push(`  then: ${await state()} | ${(await txt()).slice(0, 60)}`);
  rows.push('bridge calls: ' + JSON.stringify(await page.evaluate(() => [...new Set(window.__calls)])));
} catch (e) { rows.push('STOPPED: ' + e.message.split('\n')[0]); }
console.log(rows.join('\n'));
console.log('page errors', errors.length, errors.slice(0, 4));
await browser.close();
