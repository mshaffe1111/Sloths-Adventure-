// (f) Android Back, through the REAL native path: a fake androidBridge + Capacitor's own native-bridge.js (as the Android WebView injects
// it), so App.tsx registers its 'backButton' listener exactly as on a phone; Back is fired as the native side fires it (fromNative).
import fs from 'node:fs';
import { chromium, seedDone, IDS, click, sleep, HEAD, MAIN, here, PROBE } from './rtlib.mjs';
const which = process.argv[2] ?? 'head';
const url = which === 'main' ? MAIN : HEAD;
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
async function back(label) {
  const before = await state();
  await page.evaluate(() => window.__back());
  await sleep(900);
  const after = await state();
  rows.push(`${label}: [${before}] -> Back -> [${after}]`);
  await page.screenshot({ path: `${here}/shots/back-${which}-${label.replace(/\W+/g, '_')}.png` });
}
try {
  await back('title');
  if (await page.locator('[role=dialog], .nv-scrim').count()) await back('title leave-question');
  await click(page, '.ttl-token[aria-label="Settings"]'); await back('settings');
  await click(page, '.ttl-token[aria-label="Settings"]'); await click(page, '.st-tab[aria-label="Saves"]'); await click(page, '.st-row:has-text("Save / Load") .st-btn'); await back('save-load over settings'); await back('settings after save-load');
  if (await page.locator('.ttl-leaf:has-text("How to Play")').count()) { await click(page, '.ttl-leaf:has-text("How to Play")'); await back('how to play'); }
  await click(page, '.ttl-leaf-satchel'); await back('satchel');
  await click(page, '.ttl-leaf >> nth=0'); await page.locator('.wm-head').waitFor(); await sleep(600);
  await click(page, '.wm-name'); await back('worlds pop-up');
  await back('map');
  await click(page, '.ttl-leaf >> nth=0'); await page.locator('.wm-head').waitFor(); await sleep(600);
  for (let i = 0; i < 4; i++) await click(page, '.wm-arrow[aria-label="Next world"]');
  await click(page, '.map-node[aria-label^="Stage 5-2:"]'); await click(page, '.wm-play');
  for (let i = 0; i < 40 && !(await page.evaluate(() => !!window.__probeEngine?.()?.isRunning)); i++) await sleep(500);
  await sleep(2500);
  await back('stage playing');
  await back('pause menu');
  await page.evaluate(() => { const e = window.__probeEngine(); for (let i = 0; i < 12 && e.lives > 0; i++) e.loseLife('pit'); });
  await sleep(3500);
  await back('after losing every life (game over)');
  await sleep(800);
  rows.push('end state: ' + (await state()));
} catch (e) { rows.push('STOPPED: ' + e.message.split('\n')[0]); }
console.log(rows.join('\n'));
console.log('page errors', errors.length, errors.slice(0, 3));
await browser.close();
