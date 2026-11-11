// how long must he stand still after a set-back before Dot's line at 3 shows? real walk-offs, W ms of standing after each put-back
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, mode = 'walk'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const report = {};
for (const setting of (process.env.SETS ?? 'normal,easy').split(',')) for (const W of (process.env.WS ?? '0,600,1200').split(',').map(Number)) {
  const idx = 1, k = 'w1-log-chain-rise';
  const tag = `${mode}-${setting}-W${W}`;
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); if (location.search.includes('finished')) { localStorage.setItem('sloth_lvl_1-1', JSON.stringify({ completed: true, bestTime: 200, stars: 2 })); localStorage.setItem('sloth_lvl_1-2', JSON.stringify({ completed: true })); } localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [idx, setting]);
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off${process.env.SAVE ? '&' + process.env.SAVE : ''}`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2500);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(4500);
  await page.evaluate((k) => {
    const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
    window.__k = k; window.__said = []; window.__bub = ''; window.__cb = [];
    // (the stage's own double tip is marked heard: he would have met it at the double teach before this piece)
    for (const h of e.proto?.hints ?? []) h.shown = true;
    const cb = e.callbacks; const f = cb.onGuide; cb.onGuide = (...a) => { window.__cb.push([Math.round(e.gameTime * 10) / 10, ...a.map((v) => String(v).slice(0, 40))]); return f(...a); };
    setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t !== window.__bub) window.__said.push([Math.round(e.gameTime * 10) / 10, t]); window.__bub = t; }, 100);
    const road = s.platforms.filter((p) => p.type === 'solid' && !p.catch && p.x <= pc.x0 + 60 && p.x + p.width >= pc.x0 + 30).sort((a, b) => a.y - b.y)[0];
    Object.assign(e.player, { x: road.x + road.width - 140, y: road.y, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
  }, k);
  await sleep(1500);
  const last = setting === 'easy' ? 8 : 12;
  let n = 0; const counts = [];
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 700 && n < last; i++) {
    await sleep(60);
    const s = await page.evaluate(() => { const e = window.__engine(); const p = e.player; return { n: e.help.count(window.__k), t: Math.round(e.gameTime * 10) / 10, g: p.grounded, asking: !!e.helpState().asking, edge: p.grounded && window.__engine().platforms.every((q) => !(q.type === 'solid' && Math.abs(q.y - p.y) < 4 && p.x + 46 >= q.x && p.x + 46 <= q.x + q.width)) }; });
    if (mode === 'jump' && s.edge) { await page.keyboard.down('Space'); await sleep(120); await page.keyboard.up('Space'); }
    if (s.n !== n) {
      n = s.n; counts.push([n, s.t]);
      if (s.asking) break;
      if (W) { await page.keyboard.up('ArrowRight'); await sleep(W); await page.keyboard.down('ArrowRight'); }
    }
  }
  await page.keyboard.up('ArrowRight');
  await sleep(setting === 'easy' ? 12000 : 700);
  const said = await page.evaluate(() => window.__said), cb = await page.evaluate(() => window.__cb);
  const shown = (re) => { const i = said.findIndex((x) => re.test(x[1])); if (i < 0) return null; const end = said[i + 1]; return [said[i][0], end ? +(end[0] - said[i][0]).toFixed(1) : 'still up']; };
  report[tag] = { cycle: counts.length > 3 ? +((counts[counts.length - 1][1] - counts[0][1]) / (counts.length - 1)).toFixed(2) : null, sentAt: cb.filter((c) => /Run first|A step/.test(c[1])).map((c) => [c[0], c[1].slice(0, 12), c[3] ?? '']), moveLine: shown(/Run first/), stepLine: shown(/A step/), all: said.filter((x) => x[1]).map((x) => `${x[0]} ${x[1]}`), backs: counts.map((c) => c[1]), offerUp: await page.evaluate(() => !!document.querySelector('.ho-scrim')) };
  console.log(tag, JSON.stringify(report[tag]));
  await ctx.close();
}
fs.writeFileSync(`${out}/wait-${mode}.json`, JSON.stringify(report, null, 1));
await browser.close();
process.exit(0);
