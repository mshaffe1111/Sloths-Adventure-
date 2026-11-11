// Critic's play-check of INT-1-1 (dsf 1): node play.mjs <port> <outdir> [only]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const report = {};
const VP = { port: { width: 412, height: 915 }, land: { width: 915, height: 412 } };
async function open(tag, { setting = 'normal', o = 'port', idx = 1, fresh = false, lessons = false, help } = {}) {
  const ctx = await browser.newContext({ viewport: VP[o], deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([i, s, fresh, help]) => {
    if (sessionStorage.getItem('__init')) return; sessionStorage.setItem('__init', '1');
    const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)];
    localStorage.setItem('sloth_difficulty', s);
    if (!fresh) localStorage.setItem('sloth_coach_done', '1');
    if (help) localStorage.setItem('sloth_dot_help', help);
    localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 }));
  }, [idx, setting, fresh, help ?? null]);
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message.slice(0, 200)));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(`http://127.0.0.1:${port}/?layout=1${lessons ? '' : '&lessons=off'}`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(5000);
  await page.evaluate(() => {
    window.__said = []; window.__bub = '';
    setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t && t !== window.__bub) window.__said.push([Math.round(window.__engine().gameTime * 10) / 10, t]); window.__bub = t; }, 200);
  });
  report[tag] = { errs };
  return { ctx, page, errs };
}
const shot = (page, name) => page.screenshot({ path: `${out}/${name}.png` });
// (a staged put-back at a piece: the builder's way, off the end of the piece's first long log into the gap)
async function aim(page, k) {
  return page.evaluate((k) => {
    const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
    if (!pc) return { none: s.meta.pieces.map((q) => q.k) };
    const logs = s.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= pc.x0 - 2 && p.x + p.width <= pc.x1 + 2).sort((a, b) => a.x - b.x);
    const L = logs[0]; window.__L = L;
    Object.assign(e.player, { x: L.x + 120, y: L.y, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
    return { seed: s.gen2.seed, L: [L.x, L.y, L.width], pc, can: e.canGrowAt(pc) };
  }, k);
}
async function putBack(page) {
  await page.evaluate(() => { const e = window.__engine(); const p = e.player; p.x = window.__L.x + window.__L.width + 150; p.y = window.__L.y + 420; p.vy = 300; p.grounded = false; });
  for (let i = 0; i < 20; i++) { await sleep(150); if (await page.evaluate(() => window.__engine().player.grounded || !!window.__engine().helpState().asking)) break; }
  await sleep(450);
}
const st = (page) => page.evaluate(() => { const e = window.__engine(); const h = e.helpState(); return { asking: h.asking, paused: h.paused, grown: h.grown.map((g) => [Math.round(g.x), Math.round(g.y), g.width, Math.round(g.height), g.style, g.cut]), offer: !!document.querySelector('.ho-scrim'), pm: !!document.querySelector('.pm-card'), bub: document.querySelector('.dg-bub-body')?.textContent.trim() ?? '', px: Math.round(e.player.x), py: Math.round(e.player.y), t: Math.round(e.gameTime * 10) / 10 }; });
const tapSel = async (page, sel) => { const b = await page.locator(sel).boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); return b; };
const run = (name) => !only || name.includes(only);

// S1/S2: Normal, both ways: offer at 12, tap NO with a finger, nothing said; re-ask at 20, tap YES: steps grow; shots
for (const o of ['port', 'land']) {
  if (!run('offer')) break;
  const tag = `offer-${o}`;
  const { ctx, page } = await open(tag, { o });
  const R = report[tag];
  R.aim = await aim(page, 'w1-log-chain-rise');
  await sleep(1200);
  for (let n = 1; n <= 12; n++) await putBack(page);
  await page.locator('.ho-scrim').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await sleep(700);
  R.at12 = await st(page);
  R.yesBox = await page.locator('.ho-yes').boundingBox(); R.noBox = await page.locator('.ho-no').boundingBox(); R.card = await page.locator('.ho-card').boundingBox();
  await shot(page, `${tag}-12-offer`);
  // taps that must do nothing: the scrim outside the card, the HUD menu leaf under it
  await page.touchscreen.tap(20, VP[o].height - 20); await sleep(300);
  await page.touchscreen.tap(VP[o].width - 28, 40); await sleep(500);
  R.afterStrayTaps = await st(page);
  if (process.env.BG) {
  // the app goes to the background and comes back while the offer is up
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('blur')); });
  await sleep(600);
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); window.dispatchEvent(new Event('focus')); });
  await sleep(900);
  R.afterBackground = await st(page);
  await shot(page, `${tag}-12-after-background`);
  }
  if (await page.locator('.ho-no').count()) { await tapSel(page, '.ho-no'); }
  await sleep(1500);
  R.afterNo = await st(page);
  await shot(page, `${tag}-12-after-no`);
  // does play go on by itself after the no? (time moves)
  const t0 = (await st(page)).t; await sleep(1000); R.timeMovesAfterNo = (await st(page)).t - t0;
  for (let n = 13; n <= 20; n++) await putBack(page);
  await page.locator('.ho-scrim').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  await sleep(700);
  R.at20 = await st(page);
  await shot(page, `${tag}-20-reask`);
  if (await page.locator('.ho-yes').count()) await tapSel(page, '.ho-yes');
  await sleep(1800);
  R.afterYes = await st(page);
  await shot(page, `${tag}-20-after-yes`);
  // he walks it on plain jumps? (not flown here: the tests do) stand on the first grown step for a close look
  await page.evaluate(() => { const e = window.__engine(); const g = e.helpState().grown[0]; if (g) Object.assign(e.player, { x: g.x + g.width / 2, y: g.y, vx: 0, vy: 0, grounded: true }); });
  await sleep(1500);
  await shot(page, `${tag}-20-on-step`);
  // 4 more put-backs after the yes: never asked again
  for (let n = 21; n <= 30; n++) await putBack(page);
  R.after30 = await st(page);
  R.said = await page.evaluate(() => window.__said);
  await ctx.close();
}

// S3: the grown steps' look at the pieces the A/B table names, each setting; the camera a little back
for (const [idx, setting, k] of (process.env.GROWS ? process.env.GROWS.split(',').map((g) => { const [i, s, k] = g.split(':'); return [+i, s, k]; }) : [[0, 'easy', 'w1-mushroom-bank-teach'], [10, 'normal', 'w1-dip-double-teach'], [0, 'normal', 'w1-canopy-rungs-level']])) {
  if (!run('grow')) break;
  for (const o of ['land', 'port']) {
    const tag = `grow-${idx}-${setting}-${k}-${o}`;
    const { ctx, page } = await open(tag, { o, setting, idx });
    const R = report[tag];
    R.info = await page.evaluate((k) => {
      const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
      if (!pc) return { none: s.meta.pieces.map((q) => q.k) };
      const can = e.canGrowAt(pc);
      e.growSteps(pc);
      const g = e.helpState().grown;
      if (!g.length) return { can, grown: 0 };
      const pl = g.find((q) => q.style === 'log');
      const gx = pl ? pl.x : g.reduce((a, q) => Math.min(a, q.x), Infinity), gy = g.reduce((a, q) => Math.max(a, q.y + q.height), -Infinity);
      // stand just left of the first grown box, on whatever is under there
      const sx = gx - 60;
      const under = e.platforms.filter((q) => (q.type === 'solid') && !g.includes(q) && sx >= q.x && sx <= q.x + q.width).sort((a, b) => a.y - b.y)[0];
      Object.assign(e.player, { x: sx, y: under ? under.y : gy, vx: 0, vy: 0, grounded: true });
      e.camera.x = e.camera.targetX = Math.max(0, sx - e.camera.viewportWidth * 0.3);
      return { seed: s.gen2.seed, can, grown: g.map((q) => [Math.round(q.x), Math.round(q.y), q.width, Math.round(q.height), q.style, q.cut]), stoodOn: under ? [under.x, under.y] : null };
    }, k);
    await sleep(2500);
    await shot(page, tag);
    await ctx.close();
  }
}

// S4: a fresh save's first seconds (coach and lessons on), both settings and ways; then 3 and 8/12 put-backs with the lessons on
for (const setting of ['easy', 'normal']) for (const o of ['port', 'land']) {
  if (!run('fresh')) break;
  const tag = `fresh-${setting}-${o}`;
  const { ctx, page } = await open(tag, { o, setting, idx: 10, fresh: true, lessons: true });
  const R = report[tag];
  await shot(page, `${tag}-0`);
  await sleep(4000);
  await shot(page, `${tag}-1`);
  // (any piece a step can grow at: he stands on the road before it, then drops below it inside the piece)
  R.aim = await page.evaluate(() => {
    const e = window.__engine(), s = e.currentStage;
    const pc = s.meta.pieces.slice(2).find((q) => e.canGrowAt(q));
    const road = s.platforms.filter((p) => p.type === 'solid' && !p.catch && p.x <= pc.x0 - 20 && p.x + p.width >= pc.x0 - 40).sort((a, b) => a.y - b.y)[0];
    window.__L = { x: pc.x0 - 100, width: 0, y: road.y + 200 };
    Object.assign(e.player, { x: pc.x0 - 40, y: road.y, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
    return { k: pc.k, seed: s.gen2.seed };
  });
  await sleep(1500);
  for (let n = 1; n <= 3; n++) await putBack(page);
  await sleep(2500);
  R.at3 = await st(page);
  await shot(page, `${tag}-3`);
  const last = setting === 'easy' ? 8 : 12;
  for (let n = 4; n <= last; n++) await putBack(page);
  await sleep(1500);
  R.atLast = await st(page);
  await shot(page, `${tag}-${last}`);
  R.said = await page.evaluate(() => window.__said);
  await ctx.close();
}
fs.writeFileSync(`${out}/play${only ? '-' + only : ''}.json`, JSON.stringify(report, null, 1));
await browser.close();
process.exit(0);
