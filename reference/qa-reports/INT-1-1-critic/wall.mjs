// He jumps at a wall he cannot climb and never falls (no set-back): what does Dot say in 40 s? node wall.mjs <port> <setting>
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, setting] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript(([s]) => { const i0 = +(new URLSearchParams(location.search).get('idx') ?? 1); const order = [i0, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i0)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [setting]);
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off&idx=${process.env.IDX ?? 1}`, { timeout: 300000 });
for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
await sleep(2500);
await page.evaluate((i) => window.__play('1-1', i + 1), +(process.env.IDX ?? 1));
for (let t = Date.now(); Date.now() - t < 90000; ) { if (await page.evaluate(() => typeof window.__engine === 'function' && !!window.__engine()?.currentStage?.meta?.pieces)) break; await sleep(500); }
await sleep(4500);
const info = await page.evaluate(() => {
  const e = window.__engine(), s = e.currentStage;
  window.__said = []; let last = '';
  for (const h of e.proto?.hints ?? []) h.shown = true;
  setInterval(() => { const t = document.querySelector('.dg-bub-body')?.textContent.trim() ?? ''; if (t !== last) { last = t; if (t) window.__said.push([+e.gameTime.toFixed(1), t]); } }, 100);
  const sol = s.platforms.filter((p) => p.type === 'solid' && !p.catch);
  const top = (x) => { let t = Infinity; for (const q of sol) if (x > q.x && x < q.x + q.width && q.y < t) t = q.y; return t; };
  for (let x = 3000; x < s.config.levelWidth - 600; x += 10) {
    const a = top(x), b = top(x + 12);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a - b < 110 || a - b > 260) continue;
    // flat road for 260 px before the face, no mushroom on it
    let flat = true; for (let k = 20; k <= 260; k += 20) if (Math.abs(top(x - k) - a) > 2) flat = false;
    if (!flat || s.platforms.some((p) => p.type === 'bouncy' && p.x > x - 300 && p.x < x + 20)) continue;
    Object.assign(e.player, { x: x - 120, y: a, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
    const pc = s.meta.pieces.find((q) => x >= q.x0 && x < q.x1);
    return { seed: s.gen2.seed, faceX: x, rise: Math.round(a - b), piece: pc?.k, helpOn: !!e.help, canGrow: pc ? e.canGrowAt(pc) : null };
  }
  return null;
});
console.log(JSON.stringify(info));
if (info) {
  await sleep(1500);
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 40; i++) { if (process.env.MODE === 'walk') { await page.keyboard.up('ArrowRight'); await page.keyboard.down('ArrowLeft'); await sleep(500); await page.keyboard.up('ArrowLeft'); await page.keyboard.down('ArrowRight'); await sleep(500); } else if (process.env.MODE === 'stand') { await sleep(1000); } else { await page.keyboard.down('Space'); await sleep(220); await page.keyboard.up('Space'); await sleep(780); } }
  await page.keyboard.up('ArrowRight');
  const out = await page.evaluate(() => { const e = window.__engine(); return { said: window.__said, x: Math.round(e.player.x), y: Math.round(e.player.y), counts: e.currentStage.meta.pieces.map((q) => e.help.count(q.k)).filter((n) => n > 0), t: +e.gameTime.toFixed(1) }; });
  console.log(JSON.stringify(out));
  await page.screenshot({ path: `wall-${port}-${setting}.png` });
}
await browser.close();
process.exit(0);
