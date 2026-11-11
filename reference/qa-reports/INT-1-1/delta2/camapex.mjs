// Critic's camera check (INT-1-1 item 7): per engine frame, not polled. node cam.mjs <port> <outdir> <tag>
// 1. seed 4106 (11th listed), Normal, the bounce beside the seed-perch high log: per frame, his drawn top and every collectible's top
//    against the HUD plate's bottom, sideways and upright.
// 2. a double jump on flat ground (the widest flat log/ground near the start), sideways: does the view move, how much per frame.
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const report = {};
const TRACE = () => {
  window.__tr = []; let last = -1;
  const tick = () => {
    const e = window.__engine?.();
    if (e && e.gameTime !== last && window.__on) {
      last = e.gameTime;
      const c = e.camera, cv = document.querySelector('canvas'), r = cv.getBoundingClientRect(), k = r.height / c.viewportHeight;
      const bar = document.querySelector('.vh-cplate')?.getBoundingClientRect();
      const p = e.player;
      const items = (e.collectibles ?? []).filter((q) => !q.collected && Math.abs(q.x - p.x) < 500).map((q) => ({ id: q.id, type: q.type, v: q.botanicalVariant, x: Math.round(q.x), top: Math.round(r.top + (q.y - c.y) * k - 18 * k) }));
      window.__tr.push({ t: +e.gameTime.toFixed(3), x: Math.round(p.x), y: +p.y.toFixed(1), vy: Math.round(p.vy), g: p.grounded, camY: +c.y.toFixed(1), tgt: +c.targetY.toFixed(1), heroTop: Math.round(r.top + (p.y - 89 - c.y) * k), bar: bar ? Math.round(bar.bottom) : null, barL: bar ? Math.round(bar.left) : null, barR: bar ? Math.round(bar.right) : null, heroSx: Math.round(r.left + (p.x - c.x) * (r.width / c.viewportWidth)), items });
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
for (const o of [{ id: 'sideways', viewport: { width: 915, height: 412 } }, { id: 'upright', viewport: { width: 412, height: 915 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem('sloth_difficulty', 'normal'); localStorage.setItem('sloth_coach_done', '1'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(o.id, 'pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate(() => window.__play('1-1', 11));
  await sleep(6000);
  await page.evaluate(TRACE);
  const seed = await page.evaluate(() => window.__engine().currentStage.gen2.seed);
  // 1. the bounce
  const tries = [];
  for (const dx of [-40, -30, -50, -20, -60, -10]) {
    await page.evaluate((dx) => { const e = window.__engine(); const m = e.currentStage.platforms.find((p) => p.type === 'bouncy' && p.x > 29500 && p.x < 29700); Object.assign(e.player, { x: m.x + dx, y: m.y + m.height, vx: 0, vy: 0, grounded: true }); }, dx);
    await sleep(2500);
    await page.evaluate(() => { window.__tr.length = 0; window.__on = true; });
    await page.keyboard.down('ArrowRight');
    let shot = false, apex = false, up = false;
    for (let i = 0; i < 60; i++) {
      await sleep(40);
      const st = await page.evaluate(() => { const t = window.__tr; const l = t[t.length - 1]; return l ? { g: l.g, n: t.length, vy: l.vy, under: l.items.some((q) => q.top < l.bar) } : null; });
      if (st && st.vy < -300) up = true;
      if (st && up && st.vy > -60 && !apex) { apex = true; await page.screenshot({ path: `${out}/${tag}-${o.id}-apex-dx${dx}.png` }); }
      if (st && st.n > 20 && st.g && i > 15) break;
    }
    await page.keyboard.up('ArrowRight');
    const tr = await page.evaluate(() => { window.__on = false; return window.__tr.slice(); });
    const rose = tr.findIndex((f) => f.vy < -300);
    const air = rose >= 0 ? tr.slice(rose) : [];
    const byItem = {};
    for (const f of air) for (const q of f.items) { const key = `${q.type}${q.v ? ':' + q.v : ''}@${q.x}`; byItem[key] = Math.min(byItem[key] ?? Infinity, q.top - f.bar); }
    const dcam = air.slice(1).map((f, i) => +(f.camY - air[i].camY).toFixed(1));
    tries.push({ dx, trace: air.map((f) => [f.t, f.y, f.vy, f.camY, f.heroTop, f.heroSx, f.g ? 1 : 0, f.items.map((q) => [q.type, q.x, q.top])]), frames: air.length, minHeroRoom: Math.min(...air.map((f) => f.heroTop - f.bar)), itemsMinRoom: byItem, maxCamStep: dcam.length ? Math.min(...dcam) : null, dcam: dcam.slice(0, 40), endY: tr.length ? tr[tr.length - 1].y : null, bar: air[0] ? [air[0].barL, air[0].barR, air[0].bar] : null });
  }
  report[`${o.id}-bounce`] = tries;
  // 2. a double jump on flat ground: the first wide solid top after x 600
  const flat = await page.evaluate(() => { const e = window.__engine(); const f = e.currentStage.platforms.filter((p) => p.type === 'solid' && p.width >= 500 && p.x > 300 && !e.currentStage.platforms.some((q) => q !== p && q.type === 'solid' && q.y < p.y && q.y > p.y - 400 && q.x < p.x + p.width && q.x + q.width > p.x)).sort((a, b) => a.x - b.x)[0]; Object.assign(e.player, { x: f.x + f.width / 2, y: f.y, vx: 0, vy: 0, grounded: true }); return [f.x, f.y, f.width]; });
  await sleep(3000);
  await page.evaluate(() => { window.__tr.length = 0; window.__on = true; });
  await page.keyboard.down('Space'); await sleep(260); await page.keyboard.up('Space'); await sleep(60);
  await page.keyboard.down('Space'); await sleep(300); await page.keyboard.up('Space');
  await sleep(1800);
  const tr = await page.evaluate(() => { window.__on = false; return window.__tr.slice(); });
  const dc = tr.slice(1).map((f, i) => +(f.camY - tr[i].camY).toFixed(1));
  report[`${o.id}-double-flat`] = { flat, rise: Math.round(tr[0].y - Math.min(...tr.map((f) => f.y))), camMin: Math.min(...tr.map((f) => f.camY)), cam0: tr[0].camY, camEnd: tr[tr.length - 1].camY, minHeroRoom: Math.min(...tr.map((f) => f.heroTop - f.bar)), dcam: dc.filter((v) => v !== 0).slice(0, 60), ys: tr.map((f) => Math.round(f.y)).slice(0, 50), trace: tr.map((f) => [f.t, f.y, f.vy, f.camY, f.heroTop, f.heroSx, f.g ? 1 : 0]), bar: [tr[0].barL, tr[0].barR, tr[0].bar] };
  report.seed = seed;
  await ctx.close();
}
fs.writeFileSync(`${out}/${tag}-cam.json`, JSON.stringify(report, null, 1));
await browser.close();
process.exit(0);
