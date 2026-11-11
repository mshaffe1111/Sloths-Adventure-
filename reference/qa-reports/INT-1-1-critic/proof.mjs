// proof shots: he holds right, walking off the first log of w1-log-chain-rise (seed 982) again and again; after the engine sends Dot's
// move line at 3, a still at +1, +2.5, +4, +6 s and every .dg-* element's text. node proof.mjs <port> <out> <setting> <port|land> <waitMs>
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, setting, o, W] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const idx = 1, k = 'w1-log-chain-rise', tag = `proof${process.env.LINE ? '-step' : ''}-${setting}-${o}-W${W}`;
const ctx = await browser.newContext({ viewport: o === 'port' ? { width: 412, height: 915 } : { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [idx, setting]);
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
await sleep(2500);
await page.evaluate((i) => window.__play('1-1', i + 1), idx);
for (let t = Date.now(); Date.now() - t < 60000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && !!window.__engine()?.currentStage?.meta?.pieces)) break; await sleep(500); }
await sleep(4500);
await page.evaluate(([k, RE]) => {
  const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
  window.__k = k; window.__sent = null; window.__log = []; window.__re = RE;
  for (const h of e.proto?.hints ?? []) h.shown = true;
  const cb = e.callbacks; const f = cb.onGuide; cb.onGuide = (...a) => { if (new RegExp(window.__re).test(a[0]) && !a[2]) window.__sent = e.gameTime; window.__log.push([+e.gameTime.toFixed(1), 'onGuide', String(a[0]).slice(0, 30), a[2] ? 'passed' : '']); return f(...a); };
  let last = '';
  setInterval(() => { const t = document.querySelector('.dg-bub-body')?.textContent.trim() ?? ''; if (t !== last) { last = t; window.__log.push([+e.gameTime.toFixed(1), 'bubble', t || '(none)']); } }, 80);
  const road = s.platforms.filter((p) => p.type === 'solid' && !p.catch && p.x <= pc.x0 + 60 && p.x + p.width >= pc.x0 + 30).sort((a, b) => a.y - b.y)[0];
  Object.assign(e.player, { x: road.x + road.width - 140, y: road.y, vx: 0, vy: 0, grounded: true });
  e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
}, [k, process.env.LINE ?? 'Run first']);
await sleep(1500);
let n = 0; const shots = process.env.LINE ? [1, 3, 6, 10, 14] : [1, 2.5, 4, 6]; let si = 0;
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 900 && si < shots.length; i++) {
  await sleep(50);
  const s = await page.evaluate(() => { const e = window.__engine(); return { n: e.help.count(window.__k), t: e.gameTime, sent: window.__sent }; });
  if (process.env.LINE && s.sent != null && !globalThis.__stood) { globalThis.__stood = true; await page.keyboard.up('ArrowRight'); }
  if (s.n !== n && !(process.env.LINE && s.sent != null)) { n = s.n; await page.evaluate((n) => window.__log.push([+window.__engine().gameTime.toFixed(1), 'setBack', n]), n); if (+W) { await page.keyboard.up('ArrowRight'); await sleep(+W); if (!(process.env.LINE && (await page.evaluate(() => window.__sent)) != null)) await page.keyboard.down('ArrowRight'); } }
  if (s.sent != null && s.t - s.sent >= shots[si]) { await page.screenshot({ path: `${out}/${tag}-plus${shots[si]}.png` }); si++; }
}
await page.keyboard.up('ArrowRight');
const log = await page.evaluate(() => window.__log);
fs.writeFileSync(`${out}/${tag}.json`, JSON.stringify(log));
console.log(tag, log.map((l) => l.join(' ')).join('\n'));
await browser.close();
process.exit(0);
