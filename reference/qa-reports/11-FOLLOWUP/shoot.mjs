// 11-FOLLOWUP stills (R-165.115, R-165.119, R-165.122) on the first run's seed 9652, upright 390x844 and sideways 844x390, Easy and
// Normal, dsf 2, the dev server (window.__engine, window.__play):
//   cache-<s>-<o>.png   Pokey on a fork's high-road end: the cache over it (gen2.fills 'cache')
//   wall-<s>-<o>.png    three single jumps at the double teach's wall (real key input, never a fall): Dot's line in her bubble, read
//                       from .dg-bub-body, with the try count the engine recorded
//   rock-<s>-<o>-<before|after>.png   a plain walk into the same hop rock: before (BASE=<dir of the base checkout>, its own dev server)
//                       he is inside it; after, stopped at its face
// node reference/qa-reports/11-FOLLOWUP/shoot.mjs <outdir>   (BASE=<base checkout> for the before stills)
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const out = process.argv[2];
const SEED = 9652;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const listIndex = (root) => { const t = fs.readFileSync(`${root}/src/game/gen2/provenSeeds.ts`, 'utf8'); return JSON.parse(t.slice(t.indexOf('= {') + 2, t.lastIndexOf('}') + 1))['1-1'].seeds.indexOf(SEED); };
async function server(root, port) {
  const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let v = ''; vite.stdout.on('data', (d) => (v += d));
  for (let i = 0; i < 120 && !/Local:|ready in/.test(v); i++) await sleep(500);
  return vite;
}
const VIEWS = [{ id: 'upright', viewport: { width: 390, height: 844 } }, { id: 'sideways', viewport: { width: 844, height: 390 } }];
const report = {};
const browser = await chromium.launch();
async function open(port, idx, setting, view) {
  const ctx = await browser.newContext({ viewport: view.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([i, s]) => { const order = [i, ...Array.from({ length: 200 }, (_, j) => j).filter((j) => j !== i)]; localStorage.setItem('sloth_difficulty', s); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_play11_order', JSON.stringify({ n: 200, order, i: 0 })); }, [idx, setting]);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2500);
  await page.evaluate((i) => window.__play('1-1', i + 1), idx);
  await sleep(5000);
  const seed = await page.evaluate(() => window.__engine().currentStage.gen2?.seed);
  if (seed !== SEED) throw new Error(`playing seed ${seed}, not ${SEED}`);
  await page.evaluate(() => { window.__bub = ''; window.__said = []; setInterval(() => { const b = document.querySelector('.dg-bub-body'); const t = b ? b.textContent.trim() : ''; if (t && t !== window.__bub) window.__said.push(t); window.__bub = t; }, 200); });
  return { ctx, page };
}
const place = (page, x, y) => page.evaluate(([x, y]) => { const e = window.__engine(); Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true }); e.camera.x = e.camera.targetX = Math.max(0, x - e.camera.viewportWidth * 0.45); }, [x, y]);

const vite = await server(process.cwd(), 5291);
const base = process.env.BASE ? await server(process.env.BASE, 5292) : null;
const idxNew = listIndex(process.cwd()), idxBase = process.env.BASE ? listIndex(process.env.BASE) : -1;
for (const setting of ['easy', 'normal']) for (const view of VIEWS) {
  const tag = `${setting}-${view.id}`;
  const { ctx, page } = await open(5291, idxNew, setting, view);
  // (1) the cache: on the high-road end, looking at it
  const cache = await page.evaluate(() => {
    const e = window.__engine(), s = e.currentStage;
    const f = s.gen2.fills.find((q) => q.what === 'cache');
    const pc = s.platforms.filter((p) => f.x >= p.x && f.x <= p.x + p.width && p.y >= f.y && p.y - f.y <= 110).sort((a, b) => a.y - b.y)[0];
    const petals = s.collectibles.filter((c) => c.type === 'flower' && c.x >= pc.x && c.x <= pc.x + pc.width && c.y < pc.y && c.y >= pc.y - 110).length;
    return { x: pc.x, y: pc.y, w: pc.width, petals, section: s.gen2.sections.find((q) => q.uid === f.section)?.template };
  });
  await place(page, cache.x + 20, cache.y);
  await sleep(1500);
  await page.screenshot({ path: `${out}/cache-${tag}.png` });
  report[`cache-${tag}`] = cache;
  // (2) the wall: the double teach's face, three single jumps at it, held right, never a fall
  const wall = await page.evaluate(() => {
    const e = window.__engine(), s = e.currentStage;
    const pc = s.meta.pieces.find((q) => /double-teach/.test(q.k));
    const solid = s.platforms.filter((p) => p.type === 'solid' && p.x + p.width >= pc.x0 && p.x <= pc.x1);
    for (const q of solid) {
      if (q.height < 50) continue;
      const f = solid.find((g) => Math.abs(g.x + g.width - q.x) <= 2 && g.y - q.y >= 110 && g.y - q.y <= 150);
      if (f) return { x: q.x, y: f.y, rise: f.y - q.y };
    }
    return null;
  });
  report[`wall-${tag}`] = { wall };
  if (wall) {
    await place(page, wall.x - 60, wall.y);
    await sleep(600);
    await page.keyboard.down('ArrowRight');
    let tries = 0;
    for (let j = 0; j < 3; j++) {
      await page.keyboard.down('Space'); await sleep(350); await page.keyboard.up('Space');
      for (let i = 0; i < 20; i++) { await sleep(100); if (await page.evaluate(() => window.__engine().player.grounded)) break; }
      await sleep(250);
    }
    const line = await (async () => { for (let i = 0; i < 40; i++) { const t = await page.evaluate(() => window.__bub); if (/again in the air/.test(t)) return t; await sleep(250); } return page.evaluate(() => window.__bub); })();
    await page.keyboard.up('ArrowRight');
    await sleep(400);
    await page.screenshot({ path: `${out}/wall-${tag}.png` });
    report[`wall-${tag}`] = { wall, bubble: line, said: await page.evaluate(() => window.__said), x: await page.evaluate(() => Math.round(window.__engine().player.x)), help: await page.evaluate(() => window.__engine().helpState().on) };
  }
  // (3) a hop rock: a plain walk into it, held right for 1.5 s
  const rock = await page.evaluate(() => {
    const e = window.__engine(), s = e.currentStage, P = s.platforms.filter((p) => p.type === 'solid');
    const near = (k) => s.platforms.some((m) => m.type === 'bouncy' && m.x < k.x + k.width + 100 && m.x + m.width > k.x - 120);
    const k = P.find((k) => k.height >= 50 && k.height <= 56 && k.width <= 230 && k.x > 2000 && !near(k) && P.some((f) => f !== k && Math.abs(f.y - (k.y + k.height)) <= 1 && f.x <= k.x - 80 && f.x + f.width >= k.x + k.width + 80));
    const f = P.find((f) => f !== k && Math.abs(f.y - (k.y + k.height)) <= 1 && f.x <= k.x - 80);
    return { x: k.x, w: k.width, h: k.height, floorY: f.y };
  });
  await place(page, rock.x - 58, rock.floorY);
  await sleep(500);
  await page.keyboard.down('ArrowRight'); await sleep(1500);
  report[`rock-${tag}-after`] = { ...rock, px: await page.evaluate(() => Math.round(window.__engine().player.x)) };
  await page.screenshot({ path: `${out}/rock-${tag}-after.png` });
  await page.keyboard.up('ArrowRight');
  await ctx.close();
  if (base) {
    const b = await open(5292, idxBase, setting, view);
    const r0 = await b.page.evaluate((x) => { const s = window.__engine().currentStage; const k = s.platforms.find((p) => p.type === 'solid' && p.x === x); const f = s.platforms.find((g) => g !== k && g.type === 'solid' && Math.abs(g.y - (k.y + k.height)) <= 1 && g.x <= k.x - 80); return k && f ? { x: k.x, w: k.width, h: k.height, floorY: f.y } : null; }, rock.x);
    if (r0) {
      await place(b.page, r0.x - 58, r0.floorY);
      await sleep(500);
      await b.page.keyboard.down('ArrowRight');
      for (let i = 0; i < 40; i++) { await sleep(50); if (await b.page.evaluate((m) => window.__engine().player.x >= m, r0.x + r0.w / 2 - 10)) break; }
      report[`rock-${tag}-before`] = { ...r0, px: await b.page.evaluate(() => Math.round(window.__engine().player.x)) };
      await b.page.screenshot({ path: `${out}/rock-${tag}-before.png` });
      await b.page.keyboard.up('ArrowRight');
    } else report[`rock-${tag}-before`] = 'no rock at that x on the base build';
    await b.ctx.close();
  }
  console.log(tag, JSON.stringify({ cache: report[`cache-${tag}`], wall: report[`wall-${tag}`]?.bubble, rock: report[`rock-${tag}-after`], before: report[`rock-${tag}-before`] }));
}
fs.writeFileSync(`${out}/stills.json`, JSON.stringify(report, null, 1));
await browser.close();
process.kill(-vite.pid, 'SIGKILL');
if (base) process.kill(-base.pid, 'SIGKILL');
process.exit(0);
