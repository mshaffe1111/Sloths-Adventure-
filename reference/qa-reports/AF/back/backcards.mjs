// AF: Android Back on the guardian card and the victory card (PROOF-1 "not proven": its driver never reached them). Capacitor's real
// native bridge (from @capacitor/android) with a fake androidBridge, as PROOF-1 backcheck2.mjs; the cards opened with the development
// build's hooks (window.__story, __win), as clipcheck does. node backcards.mjs <dev build url> <out dir>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const bridge = fs.readFileSync(require.resolve('@capacitor/android/capacitor/src/main/assets/native-bridge.js'), 'utf8');
const FAKE = `
window.__calls = [];
window.androidBridge = { postMessage(json) { const d = JSON.parse(json); window.__calls.push(d.pluginId + '.' + d.methodName + (d.options && d.options.eventName ? ':' + d.options.eventName : '') + (d.options && 'on' in d.options ? ':' + d.options.on : ''));
  if (d.methodName === 'addListener') { if (d.pluginId === 'App' && d.options.eventName === 'backButton') window.__backCb = d.callbackId; return; }
  setTimeout(() => window.Capacitor.fromNative({ callbackId: d.callbackId, pluginId: d.pluginId, methodName: d.methodName, success: true, data: {} }), 0); } };
${bridge}
const M = (n) => ({ name: n, rtype: n === 'addListener' ? 'callback' : 'promise' });
window.Capacitor.PluginHeaders = ['App', 'AudioFocus', 'KeepAwake', 'Filesystem', 'Share'].map((name) => ({ name, methods: ['addListener', 'removeListener', 'removeAllListeners', 'exitApp', 'getInfo', 'getState', 'minimizeApp', 'want', 'set', 'writeFile', 'share'].map(M) }));
window.__back = () => window.Capacitor.fromNative({ callbackId: window.__backCb, pluginId: 'App', methodName: 'addListener', success: true, data: { canGoBack: false }, save: true });
`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const rows = [];
let errorsAll = 0;
for (const [vid, viewport] of [['up', { width: 412, height: 915 }], ['side', { width: 915, height: 412 }]]) {
  const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  await page.addInitScript(FAKE);
  await page.goto(`${url}/?lessons=off`);
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_coach_done', '1'); });
  await page.goto(`${url}/?lessons=off`);
  await page.waitForFunction(() => typeof window.__story === 'function' && typeof window.__win === 'function' && window.__backCb != null, null, { timeout: 60000 });
  const state = () => page.evaluate(() => {
    const v = (s) => !!document.querySelector(s);
    return [v('.ttl-leaf') && 'title', v('.wm-head') && 'map', v('.boss-card') && 'guardian card', v('.clr-card.clr-won') && 'victory card', v('.sp-next') && 'story', v('.pm-scrim') && 'pause menu'].filter(Boolean).join('+') || document.body.innerText.slice(0, 50).replace(/\s+/g, ' ');
  });
  const back = async (label) => {
    const before = await state();
    await page.evaluate(() => window.__back());
    await sleep(1200);
    const after = await state();
    rows.push(`${vid} ${label}: [${before}] -> Back -> [${after}]`);
    await page.screenshot({ path: `${out}/back-${vid}-${label.replace(/\W+/g, '_')}.png` });
    return after;
  };
  // the guardian's card (the card before a guardian fight)
  await page.evaluate(() => window.__story('10-10', 'boss_card'));
  await page.locator('.boss-card').first().waitFor({ state: 'visible', timeout: 20000 });
  await sleep(900);
  let s = await back('guardian card');
  for (let i = 0; i < 2 && /guardian card/.test(s); i++) s = await back(`guardian card, Back again ${i + 2}`);
  // the victory card
  await page.evaluate((m) => window.__win('1-2', 3, m), ['rainforest_legend', 'cleared_10']);
  await page.locator('.clr-card.clr-won').first().waitFor({ state: 'visible', timeout: 20000 });
  await sleep(1500);
  s = await back('victory card');
  for (let i = 0; i < 3 && /victory card/.test(s); i++) s = await back(`victory card, Back again ${i + 2}`);
  if (/map/.test(s)) await back('then the map');
  const calls = await page.evaluate(() => window.__calls.filter((c) => /KeepAwake|AudioFocus/.test(c)));
  rows.push(`${vid} native calls (KeepAwake / AudioFocus) reached: ${JSON.stringify(calls)}`);
  rows.push(`${vid} page errors: ${errors.length} ${JSON.stringify(errors.slice(0, 3))}`);
  errorsAll += errors.length;
  await ctx.close();
}
console.log(rows.join('\n'));
await browser.close();
process.exit(errorsAll ? 1 : 0);
