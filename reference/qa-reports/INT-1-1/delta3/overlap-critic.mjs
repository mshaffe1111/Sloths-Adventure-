// While a ladder line is up: how much of Pokey does Dot cover, and does her bubble cover a grown step? Real walk-offs at a 2 s wait.
// node overlap.mjs <port> <setting> <port|land> <line regex>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, setting, o, RE] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const idx = 1, k = 'w1-log-chain-rise';
const ctx = await browser.newContext({ viewport: o === 'port' ? { width: 412, height: 915 } : { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [idx, setting]);
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
await sleep(2500);
await page.evaluate((i) => window.__play('1-1', i + 1), idx);
for (let t = Date.now(); Date.now() - t < 90000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && !!window.__engine()?.currentStage?.meta?.pieces)) break; await sleep(500); }
await sleep(4500);
await page.evaluate(([k, RE]) => {
  const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
  window.__k = k; window.__sent = null; window.__rows = [];
  for (const h of e.proto?.hints ?? []) h.shown = true;
  const cb = e.callbacks; const f = cb.onGuide; cb.onGuide = (...a) => { if (new RegExp(RE).test(a[0]) && !a[2]) window.__sent = e.gameTime; return f(...a); };
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  setInterval(() => {
    const body = document.querySelector('.dg-bub-body');
    if (!body || !new RegExp(RE).test(body.textContent)) return;
    const c = e.camera, cv = document.querySelector('canvas'), r = cv.getBoundingClientRect(), kx = r.width / c.viewportWidth, ky = r.height / c.viewportHeight;
    const p = e.player;
    const hero = { left: r.left + (p.x - c.x) * kx - 24 * kx, right: r.left + (p.x - c.x) * kx + 24 * kx, top: r.top + (p.y - 80 - c.y) * ky, bottom: r.top + (p.y - c.y) * ky };
    const vis = (el) => { if (!el) return null; const q = el.getBoundingClientRect(); const st = getComputedStyle(el); return q.width > 2 && st.visibility !== 'hidden' && +st.opacity > 0.2 ? q : null; };
    const dot = vis(document.querySelector('.dg-dot')) ?? vis(document.querySelector('.dg-perch'));
    const bub = (body.closest('[class*="dg-bub"]')?.parentElement ?? body).getBoundingClientRect();
    const heroA = (hero.right - hero.left) * (hero.bottom - hero.top);
    const rocks = e.helpState().grown.map((g) => ({ left: r.left + (g.x - c.x) * kx, right: r.left + (g.x + g.width - c.x) * kx, top: r.top + (g.y - 30 - c.y) * ky, bottom: r.top + (g.y + g.height - c.y) * ky })).filter((q) => q.right > 0 && q.left < r.width && q.bottom > 0 && q.top < r.height);
    window.__rows.push({ t: +(e.gameTime - window.__sent).toFixed(1), hurt: p.invincibleTimer > 0, dotOnHero: dot ? +(inter(dot, hero) / heroA).toFixed(2) : null, dotW: dot ? Math.round(dot.width) : null, bubOnHero: +(inter(bub, hero) / heroA).toFixed(2), rocksOnScreen: rocks.length, bubOnRock: rocks.length ? +Math.max(...rocks.map((q) => inter(bub, q) / ((q.right - q.left) * (q.bottom - q.top)))).toFixed(2) : null });
  }, 100);
  const road = s.platforms.filter((p) => p.type === 'solid' && !p.catch && p.x <= pc.x0 + 60 && p.x + p.width >= pc.x0 + 30).sort((a, b) => a.y - b.y)[0];
  Object.assign(e.player, { x: road.x + road.width - 140, y: road.y, vx: 0, vy: 0, grounded: true });
  e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
}, [k, RE]);
await sleep(1500);
let n = 0, stood = false;
await page.keyboard.down('ArrowRight');
for (let i = 0; i < 900; i++) {
  await sleep(60);
  const s = await page.evaluate(() => { const e = window.__engine(); return { n: e.help.count(window.__k), t: e.gameTime, sent: window.__sent }; });
  if (s.sent != null && !stood) { stood = true; await page.keyboard.up('ArrowRight'); }
  if (s.sent != null && s.t - s.sent > 8) break;
  if (s.n !== n && s.sent == null) { n = s.n; await page.keyboard.up('ArrowRight'); await sleep(2000); if ((await page.evaluate(() => window.__sent)) == null) await page.keyboard.down('ArrowRight'); }
}
const rows = await page.evaluate(() => window.__rows);
const settled = rows.filter((x) => !x.hurt && x.t > 1.5);
const mx = (a, f) => (a.length ? Math.max(...a.map((x) => x[f] ?? 0)) : null), md = (a, f) => { const v = a.map((x) => x[f] ?? 0).sort((p, q) => p - q); return v.length ? v[v.length >> 1] : null; };
console.log(JSON.stringify({ port, setting, o, RE, samples: rows.length, settled: settled.length, dotOnHero: { median: md(settled, 'dotOnHero'), max: mx(settled, 'dotOnHero') }, bubOnHero: mx(rows, 'bubOnHero'), rocksOnScreen: mx(rows, 'rocksOnScreen'), bubOnRock: { median: md(settled, 'bubOnRock'), max: mx(rows, 'bubOnRock') } }));
await browser.close();
process.exit(0);
