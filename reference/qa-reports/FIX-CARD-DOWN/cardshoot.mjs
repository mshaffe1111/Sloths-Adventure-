// FIX-CARD-DOWN stills (R-165.456): 3-1's first stop on the way down, Dot's "Too dark to see..." card up, upright and sideways.
// ENG-DARK's mouthshoot.mjs harness (the vite rule, CI #78: refuse a busy port, check the served tree, kill it after). Pokey is pinned
// on the ledge he starts on, at its lip toward the nearest ledge below, and the line is said the way the engine says it (engineLine).
// It prints the card's box, his, and the ledge below, and whether the card covers that ledge or sits under his feet.
// node cardshoot.mjs <worktree> <outDir> <port> <tag>
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [root, outDir, portArg, tag] = process.argv.slice(2);
const port = Number(portArg);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
try { execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`); console.log('PORT BUSY', port); process.exit(3); } catch {}
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
process.on('exit', () => { try { vite.kill('SIGTERM'); execSync(`fuser -k ${port}/tcp 2>/dev/null`); } catch {} });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
vite.stderr.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
// (the served tree is the one asked for: the dev server's dotGuidePerch.ts is the worktree's, byte for byte)
const served = await (await fetch(`http://127.0.0.1:${port}/src/game/dotGuidePerch.ts?raw`)).text();
const mine = fs.readFileSync(path.join(root, 'src/game/dotGuidePerch.ts'), 'utf8');
const lpid = execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`).toString().trim().split('\n')[0];
const lcwd = lpid ? fs.readlinkSync(`/proc/${lpid}/cwd`) : '';
const fixed = mine.includes("v.travel === 'down'");
if (!served.includes(fixed ? "v.travel === 'down'" : 'export function aheadZone') || path.resolve(lcwd) !== path.resolve(root)) { console.log('SERVED TREE MISMATCH', lcwd); process.exit(4); }
console.log('served', lcwd, 'pid', lpid, 'fix in tree', fixed);

const browser = await chromium.launch();
const ORIENTS = [
  { id: 'port', viewport: { width: 390, height: 844 } },
  { id: 'land', viewport: { width: 844, height: 390 } },
];
const id = '3-1';
const out = [];
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { globalThis.__GEN2_DRAFT = d; }, id);
  await ctx.route(/\/src\/main\.tsx(\?.*)?$/, async (r) => {
    const resp = await r.fetch();
    r.fulfill({ response: resp, body: `import "/tools/engine/draftBoot.ts";\n${await resp.text()}` });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((s) => window.__play(s, 1), id);
    await sleep(5000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(o.id, 'no engine'); continue; }
  // (the stage's opening lines first: Dot quiet for 1.5 s)
  for (let i = 0, quiet = 0; i < 160 && quiet < 6; i++) {
    await sleep(250);
    quiet = (await page.evaluate(() => !document.querySelector('.dg-bub.in'))) ? quiet + 1 : 0;
  }
  const pk = await page.evaluate(() => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const sx = s.spawnX;
    const solid = e.platforms.filter((q) => !q.broken && q.type !== 'oneway');
    const g = solid.filter((q) => q.x <= sx + 20 && q.x + q.width >= sx + 20 && q.y >= s.spawnY - 20).sort((a, c) => a.y - c.y)[0];
    if (!g) return null;
    // (the nearest ledge below the one he starts on: the way on)
    const cx = g.x + g.width / 2;
    const next = solid.filter((q) => q.y > g.y + 60 && q.y < g.y + 700).sort((a, c) => Math.hypot(a.x + a.width / 2 - cx, a.y - g.y) - Math.hypot(c.x + c.width / 2 - cx, c.y - g.y))[0];
    if (!next) return null;
    const facing = next.x + next.width / 2 < cx ? -1 : 1;
    const x = facing > 0 ? g.x + g.width - e.player.width - 40 : g.x + 40;
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) {
        const p = this.player; p.x = pin.x; p.y = pin.y; p.vx = 0; p.vy = 0; p.grounded = true; p.facing = pin.facing;
        if (this.lives < 5) this.lives = 9;
      }
      R.call(this);
    };
    window.__pin = { x, y: g.y, facing };
    return { travel: s.config.travel, seed: s.gen2?.seed, ledge: { x: g.x, y: g.y, w: g.width }, next: { x: next.x, y: next.y, w: next.width }, pin: window.__pin };
  });
  console.log(o.id, JSON.stringify(pk));
  if (!pk) { await ctx.close(); continue; }
  await sleep(2500);
  await page.evaluate(() => window.__dotRun.engineLine('Too dark to see. Stand still and listen...', 4000));
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    await sleep(100);
    up = await page.evaluate(() => { const b = document.querySelector('.dg-bub.in'); return !!b && b.innerText.includes('Too dark') && Number(getComputedStyle(b).opacity) > 0.95; });
  }
  await sleep(1200);
  const file = path.join(outDir, `${id}-${o.id}-${tag}.png`);
  await page.screenshot({ path: file });
  const r = await page.evaluate((pk) => {
    const e = window.__engine();
    const v = e.guideView({});
    const b = document.querySelector('.dg-bub.in');
    const br = b ? b.getBoundingClientRect() : null;
    const sx = (x) => (x - v.camX) * v.zoom;
    const sy = (y) => (y - v.camY) * v.zoom;
    const card = br && { x0: Math.round(br.left), y0: Math.round(br.top - 14), x1: Math.round(br.right), y1: Math.round(br.bottom) };
    const him = { x0: Math.round(sx(v.px)), y0: Math.round(sy(v.py - v.ph)), x1: Math.round(sx(v.px + v.pw)), y1: Math.round(sy(v.py)) };
    const n = pk.next;
    const below = { x0: Math.round(sx(n.x)), y0: Math.round(sy(n.y) - 80 * v.zoom), x1: Math.round(sx(n.x + n.w)), y1: Math.round(sy(n.y) + 14 * v.zoom) };
    const ov = (a, c) => a.x0 < c.x1 && a.x1 > c.x0 && a.y0 < c.y1 && a.y1 > c.y0;
    return { travel: v.travel, text: b?.innerText.split('\n')[1] ?? null, card, him, below, coversBelow: !!card && ov(card, below), underFeet: !!card && card.y0 >= him.y1, aboveHead: !!card && card.y1 <= him.y0 };
  }, pk);
  console.log(o.id, tag, up ? 'UP' : 'NOT UP', JSON.stringify(r));
  out.push({ orient: o.id, tag, file, ...r });
  await ctx.close();
}
fs.writeFileSync(path.join(outDir, `cards-${tag}.json`), JSON.stringify(out, null, 1));
await browser.close();
vite.kill('SIGTERM');
await sleep(1500);
try { execSync(`fuser -k ${port}/tcp`); } catch {}
console.log('done');
process.exit(0);
