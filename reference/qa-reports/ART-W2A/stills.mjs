/**
 * ART-W2A stills (from ENG-23's toy, reference/qa-reports/ENG-23/stills.mjs): the painted follow poses on the real page. ENG-23 toy stills (follow.ts on the real page): the little ones walking, paddling, bunching, hiding, and the heron's look, upright 412x915
 * and sideways 915x412 at dsf 2, staged on the hand-built 2-3's own start (World 2's art and its splash-back creek at 458-588). Then the
 * HUD mock-up (SHOW FIRST: the little faces, lit while in cover) composited over the look still. Not a stage: a toy (the builder lays 2-3).
 *
 *   node reference/qa-reports/ENG-23/stills.mjs [outDir]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const out = process.argv[2] || path.join(here, 'stills');
const ONLY = process.env.ORIENT; // (port | land: one orientation)
fs.mkdirSync(out, { recursive: true });
const port = 5199;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);

const browser = await chromium.launch();
const ORIENTS = [
  { id: 'port', viewport: { width: 412, height: 915 } },
  { id: 'land', viewport: { width: 915, height: 412 } },
];
const Y = 580;
for (const o of ORIENTS.filter((q) => !ONLY || q.id === ONLY)) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(2000);
  await page.evaluate(() => window.__play('2-3', 1));
  await sleep(7000);
  // (2-3's own first line holds the stage until it is tapped: tap it away; its pulley room and its lines are not the toy's)
  const bubble = page.getByText("Tap here when you've read it", { exact: false });
  if (await bubble.count()) await bubble.first().click({ force: true });
  await sleep(800);
  const ok = await page.evaluate((Y) => {
    const e = window.__engine();
    if (!e?.currentStage) return false;
    e.kit = null;
    e.stageHint = null;
    if (e.proto) e.proto.hints = [];
    if (e.passTips) e.passTips.length = 0;
    e.enemies.length = 0;
    e.collectibles = e.collectibles.filter((c) => c.type === 'exit_totem');
    e.proto = { ...(e.proto ?? {}), bushes: [{ x: 1010, w: 300, y: Y, kind: 'reeds' }], watch: [{ x0: 900, x1: 1550, calm: [60, 60] }], follow: { pace: { normal: 190, easy: 230 }, gap: 34, scamper: 300, rejoin: 60, home: 200 } };
    const p = e.player;
    Object.assign(p, { x: 640, y: Y, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 });
    e.startFollow();
    // (his path to here: along the near bank, a hop over the creek (458-588) and on; the line stands on the near bank behind it)
    const pts = [];
    const add = (x, y, air) => { const l = pts[pts.length - 1]; const sv = l ? l.s + Math.hypot(x - l.x, y - l.y) : 0; pts.push({ x, y, s: sv, ...(air ? { air: true } : {}) }); };
    for (let x = 40; x <= 440; x += 20) add(x, Y, false);
    for (let k = 1; k < 16; k++) { const u = k / 16; add(440 + 170 * u, Y - 300 * u * (1 - u), true); }
    for (let x = 610; x <= 640; x += 10) add(x, Y, false);
    const T = pts[pts.length - 1].s;
    e.follow.trail = { pts, s: T, held: false };
    const kinds = ['duck', 'otter', 'capy', 'duck', 'otter'];
    // (bunched on the near bank, the first 40 px short of the creek's lip)
    const at = (sv) => { let i = 1; while (i < pts.length - 1 && pts[i].s < sv) i++; const a = pts[i - 1], b = pts[i]; const k = b.s > a.s ? (sv - a.s) / (b.s - a.s) : 0; return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k }; };
    e.follow.line = kinds.map((k, i) => { const sv = 400 - 34 * i; const q = at(sv); return { kind: k, s: sv, x: q.x, y: q.y, moved: false, state: 'follow', facing: 1 }; });
    return true;
  }, Y);
  if (!ok) { console.log(o.id, 'no engine'); continue; }
  const shot = async (name) => { const f = path.join(out, `${name}-${o.id}.png`); await page.screenshot({ path: f }); console.log('shot', f); };
  const st = () => page.evaluate(() => { const e = window.__engine(); const p = e.player; return { x: p.x, g: p.grounded, line: e.follow.line.map((f) => ({ x: f.x, s: f.state, m: f.moved, pad: !!f.paddle, back: !!f.back, fr: Math.floor(f.x / 15) & 1 })) }; });
  const built = await page.evaluate(() => { const e = window.__engine(); return { stage: e.currentStage?.id, w: innerWidth, h: innerHeight, diff: localStorage.getItem('sloth_difficulty') }; });
  console.log('built', JSON.stringify(built));
  for (let k = 0; k < 150; k++) { const s = await st(); if (s.line.filter((f) => f.pad).length >= 2) { await shot('2-paddle'); break; } await sleep(10); }
  await sleep(1500);
  await shot('0-start');
  await page.evaluate(() => window.__engine().input.triggerTouchMove('right'));
  // (the line walking: both waddle frames caught, on the first little one)
  let a = false, b = false;
  for (let k = 0; k < 400; k++) {
    const s = await st();
    if (s.x > 820 && s.line[0].m) {
      if (!a && s.line[0].fr === 0) { await shot('1-walk-frameA'); a = true; }
      else if (a && !b && s.line[0].fr === 1) { await shot('1-walk-frameB'); b = true; }
    }
    if (s.x > 1165) { await page.evaluate(() => window.__engine().input.triggerTouchMove('none')); break; }
    await sleep(15);
  }
  for (let k = 0; k < 200; k++) { const s = await st(); if (s.line.every((f) => !f.m)) break; await sleep(50); }
  await sleep(400);
  await shot('3-bunch-reeds');
  await page.evaluate(() => { const h = window.__engine().follow.herons[0]; Object.assign(h.s, { phase: 'warn', t: 0, dur: 2 }); });
  await sleep(1200);
  await shot('4-warn');
  for (let k = 0; k < 200; k++) { const x = await page.evaluate(() => window.__engine().follow.herons[0].lookX); if (x !== null && x > 950) break; await sleep(30); }
  await shot('5-look');
  await sleep(3800);
  await shot('6-spooked-hiding');
  // (calm again: the plain heron)
  for (let k = 0; k < 400; k++) { const ph = await page.evaluate(() => window.__engine().follow.herons[0].s.phase); if (ph === 'calm') break; await sleep(50); }
  await shot('7-heron-calm');
  // (home: every one home, Happy and hopping at his side)
  await page.evaluate(() => { const e = window.__engine(); const p = e.player; e.follow.line.forEach((f, i) => Object.assign(f, { state: 'home', x: p.x - 60 - i * 34, y: p.y, moved: false, paddle: false })); });
  await sleep(400);
  await shot('8-home');
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch { vite.kill(); }
process.exit(0);
