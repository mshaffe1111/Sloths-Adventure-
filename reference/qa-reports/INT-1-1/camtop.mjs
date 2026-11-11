// INT-1-1 item 7: the sideways camera's top margin at seed 4106's seed-perch high log (x29700, Normal), C1's still: Pokey bounces off
// the mushroom at x29626 (top 635) up past the high log (top 430). Each frame of the bounce reads his drawn top (89 px over his feet,
// heroSprite.ts, D41) and the petals' tops on screen against the HUD plate's bottom (.vh-cplate, the progress bar); the still is the
// frame he is highest on screen. Then he stands on the log. node reference/qa-reports/INT-1-1/camtop.mjs <outdir> <tag>
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = process.cwd(), out = process.argv[2], tag = process.argv[3] ?? 'x', port = 5199;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = ''; vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
const report = {};
for (const o of [{ id: 'sideways', viewport: { width: 915, height: 412 } }, { id: 'upright', viewport: { width: 412, height: 915 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(() => { localStorage.setItem('sloth_difficulty', 'normal'); localStorage.setItem('sloth_coach_done', '1'); });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log(o.id, 'pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate(() => window.__play('1-1', 11)); // (the 11th listed seed: 4106)
  await sleep(6000);
  const seed = await page.evaluate(() => { const e = window.__engine(); const s = e.currentStage; const L = s.platforms.find((p) => p.style === 'log' && p.x > 29600 && p.x < 29800 && p.y < 500); window.__L = L; Object.assign(e.player, { x: L.x + 60, y: L.y, vx: 0, vy: 0, grounded: true }); return { seed: s.gen2.seed, L: [L.x, L.y, L.width] }; });
  await sleep(2500);
  const read = () => page.evaluate(() => {
    const e = window.__engine(), c = e.camera, cv = document.querySelector('canvas'), r = cv.getBoundingClientRect();
    const k = r.height / c.viewportHeight;
    const bar = document.querySelector('.vh-cplate')?.getBoundingClientRect();
    const petals = (e.collectibles ?? []).filter((q) => !q.collected && q.x > 29700 && q.x < 30000).map((q) => Math.round(r.top + (q.y - c.y) * k));
    // (his hands, arms up in a jump: the top of his drawn body, 89 px over his feet: heroSprite.ts, D41)
    return { camY: Math.round(c.y), vh: Math.round(c.viewportHeight), barBottom: bar ? Math.round(bar.bottom) : null, petalTops: petals, petalR: Math.round(18 * k), heroTop: Math.round(r.top + (e.player.y - 89 - c.y) * k), feet: Math.round(r.top + (e.player.y - c.y) * k), grounded: e.player.grounded };
  });
  report[`${o.id}-stand`] = await read();
  await page.screenshot({ path: `${out}/${tag}-${o.id}-stand.png` });
  // (C1's moment: standing on the stone the mushroom sits on, the view settled, he walks right onto its cap and bounces up onto the
  // log; tried from a few spots on the stone until a bounce lands him on the log, as C1's did. Over every frame of that bounce: the least
  // room between the HUD plate and his top, and the petals' tops; the still is the frame he is highest on screen)
  let shot = null;
  for (const dx of [-40, -30, -50, -20, -60, -10]) {
    await page.evaluate((dx) => { const e = window.__engine(); const m = e.currentStage.platforms.find((p) => p.type === 'bouncy' && p.x > 29500 && p.x < 29700); Object.assign(e.player, { x: m.x + dx, y: m.y + m.height, vx: 0, vy: 0, grounded: true }); }, dx);
    await sleep(2500);
    await page.keyboard.down('ArrowRight');
    let best = null, rose = false, onLog = false, minHero = Infinity, minPetal = Infinity;
    for (let i = 0; i < 90; i++) {
      await sleep(20);
      const m = await read();
      const vy = await page.evaluate(() => window.__engine().player.vy);
      if (vy < -300) rose = true;
      if (!rose) continue;
      minHero = Math.min(minHero, m.heroTop - m.barBottom);
      minPetal = Math.min(minPetal, Math.min(...m.petalTops) - m.petalR - m.barBottom);
      if (!best || m.heroTop < best.heroTop) { best = m; await page.screenshot({ path: `${out}/${tag}-${o.id}-bounce.png` }); }
      if (m.grounded) { onLog = await page.evaluate(() => Math.abs(window.__engine().player.y - window.__L.y) < 2); break; }
    }
    await page.keyboard.up('ArrowRight');
    shot = { ...best, dx, onLog, minHeroRoom: minHero, minPetalRoom: minPetal };
    if (onLog) break;
  }
  report[`${o.id}-bounce`] = shot;
  report.seed = seed;
  await ctx.close();
}
fs.writeFileSync(`${out}/${tag}-camtop.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report));
await browser.close();
// (the dev server is npx's child: kill the whole group, or it holds this process open)
process.kill(-vite.pid, 'SIGKILL');
process.exit(0);
