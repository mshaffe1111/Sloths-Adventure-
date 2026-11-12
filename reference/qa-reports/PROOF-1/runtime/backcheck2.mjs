// PROOF-1 auditor: backcheck.mjs's harness (lines 1-47, unchanged) driving the screens it did not reach: the title's Story, a
// guardian stage (1-10) from its start. node backcheck2.mjs head|main
import fs from 'node:fs';
import { chromium, seedDone, IDS, click, sleep, HEAD, MAIN, here, PROBE, playFromMap } from './rtlib.mjs';
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
  await click(page, '.ttl-leaf:has-text("Story")'); await sleep(1500);
  rows.push('  story opened: ' + (await state()) + ' | ' + (await txt()));
  await back('story from title');
  rows.push('  then: ' + (await txt()));
  if (!(await page.locator('.ttl-leaf').count())) { await back('story second back'); rows.push('  then: ' + (await txt())); }
  await sleep(5000); await page.screenshot({ path: here + '/shots/back2-' + which + '-after-story.png' }); await page.locator('.ttl-leaf').first().tap(); await page.locator('.wm-head').waitFor(); await sleep(600);
  await playFromMap(page, '1-10');
  for (let i = 0; i < 6; i++) { await sleep(1000); rows.push(`  1-10 +${i + 1}s: ` + (await state()) + ' | ' + (await txt()).slice(0, 60)); }
  await back('guardian stage opening');
  await sleep(1200);
  rows.push('  then: ' + (await state()) + ' | ' + (await txt()).slice(0, 60));
  await back('guardian second back');
  await sleep(1200);
  rows.push('  then: ' + (await state()) + ' | ' + (await txt()).slice(0, 60));
} catch (e) { rows.push('STOPPED: ' + e.message.split('\n')[0]); }
console.log(rows.join('\n'));
console.log('page errors', errors.length, errors.slice(0, 4));
await browser.close();
