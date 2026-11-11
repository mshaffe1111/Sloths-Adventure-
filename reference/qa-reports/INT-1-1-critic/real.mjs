// real cadence: he holds right and walks off the piece's first log again and again (no teleports after the first placement)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
const report = {};
for (const [setting, idx, k, o] of [['normal', 1, 'w1-log-chain-rise', 'port'], ['easy', 1, 'w1-log-chain-rise', 'land'], ['normal', 10, 'w1-double-teach', 'land'], ['easy', 10, 'w1-double-teach', 'port']]) {
  const tag = `real-${setting}-${idx}-${k}-${o}`;
  const ctx = await browser.newContext({ viewport: o === 'port' ? { width: 412, height: 915 } : { width: 915, height: 412 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [idx, setting]);
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(3000);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(5000);
  const info = await page.evaluate((k) => {
    const e = window.__engine(), s = e.currentStage, pc = s.meta.pieces.find((q) => q.k === k);
    if (!pc) return { none: s.meta.pieces.map((q) => q.k) };
    window.__k = k; window.__said = []; window.__bub = ''; window.__cb = [];
    const cb = e.callbacks; const f = cb.onGuide; cb.onGuide = (...a) => { window.__cb.push([Math.round(e.gameTime * 10) / 10, ...a.map((v) => String(v).slice(0, 50))]); return f(...a); };
    setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t !== window.__bub) window.__said.push([Math.round(e.gameTime * 10) / 10, t]); window.__bub = t; }, 100);
    // the road just before the piece: stand 40 px before its start
    const road = s.platforms.filter((p) => p.type === 'solid' && !p.catch && p.x <= pc.x0 + 60 && p.x + p.width >= pc.x0 + 30).sort((a, b) => a.y - b.y)[0];
    Object.assign(e.player, { x: (road ? Math.max(road.x + 20, pc.x0 + 30) : pc.x0 + 30), y: road ? road.y : 0, vx: 0, vy: 0, grounded: true });
    e.camera.x = e.camera.targetX = Math.max(0, e.player.x - e.camera.viewportWidth * 0.4);
    return { seed: s.gen2.seed, pc, can: e.canGrowAt(pc), move: e.pieceMove(pc), road: road ? [road.x, road.y, road.width] : null };
  }, k);
  report[tag] = { info, errs };
  if (info.none) { await ctx.close(); continue; }
  await sleep(1500);
  await page.keyboard.down('ArrowRight');
  const last = setting === 'easy' ? 8 : 12;
  const counts = [];
  let shot3 = false;
  for (let i = 0; i < 600; i++) {
    await sleep(150);
    const s = await page.evaluate(() => { const e = window.__engine(); return { n: e.help.count(window.__k), t: Math.round(e.gameTime * 10) / 10, asking: !!e.helpState().asking, x: Math.round(e.player.x), grown: e.helpState().grown.length }; });
    if (!counts.length || counts[counts.length - 1][0] !== s.n) counts.push([s.n, s.t, s.x]);
    if (s.n >= 3 && !shot3 && await page.evaluate(() => /Run first|Jump, then|Boing/.test(window.__bub))) { shot3 = true; await page.screenshot({ path: `${out}/${tag}-line.png` }); }
    if (s.asking || s.grown || s.n >= last + 2) break;
  }
  await page.keyboard.up('ArrowRight');
  await sleep(900);
  await page.screenshot({ path: `${out}/${tag}-end.png` });
  Object.assign(report[tag], { counts, lineShown: shot3, bubAtEnd: await page.evaluate(() => window.__bub), offerUp: await page.evaluate(() => !!document.querySelector('.ho-scrim')), cb: await page.evaluate(() => window.__cb), said: await page.evaluate(() => window.__said) });
  if (setting === 'normal') { await page.keyboard.press('Escape'); await sleep(800); }
  await ctx.close();
}
fs.writeFileSync(`${out}/real.json`, JSON.stringify(report, null, 1));
await browser.close();
process.exit(0);
