/**
 * ENG-23 toy stills (follow.ts on the real page): the little ones walking, paddling, bunching, hiding, and the heron's look, upright 412x915
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
for (const o of ORIENTS) {
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
  // SHOW FIRST (2-3.md Pushback 4, the lead's ruling 4): the HUD's goal sockets as the little ones' faces, each lit while it hides in the
  // reeds, dim out in the open, grey with a '!' once spooked back, gold once home. A mock-up laid over the real HUD's sockets (.vh-slot),
  // drawn from World 2's own Happy paintings; nothing in the game is changed by it.
  const mock = async (name) => {
    await page.evaluate(() => {
      document.querySelectorAll('.eng23-face').forEach((n) => n.remove());
      const e = window.__engine();
      const covers = e.proto.bushes;
      const inCover = (f) => !f.paddle && covers.some((c) => f.x > c.x + 10 && f.x < c.x + c.w - 10 && Math.abs(f.y - c.y) < 10);
      const FR = { duck: [1503, 1262, 185, 260], otter: [1692, 1262, 190, 260], capy: [1317, 1262, 182, 260] };
      const slots = [...document.querySelectorAll('.vh-slot')];
      e.follow.line.forEach((f, i) => {
        const sl = slots[i];
        if (!sl) return;
        const r = sl.getBoundingClientRect();
        const d = Math.round(r.width * 1.12);
        const [fx, fy, fw] = FR[f.kind];
        const k = (d * 1.25) / fw;
        const st = f.state === 'home' ? 'home' : f.state === 'spooked' ? 'spooked' : inCover(f) && !f.moved ? 'hid' : 'open';
        const ring = { hid: '0 0 0 2px #bef264, 0 0 9px 3px rgba(190,242,100,0.85)', open: '0 0 0 2px rgba(120,113,108,0.9)', spooked: '0 0 0 2px #f59e0b', home: '0 0 0 2px #facc15, 0 0 8px 2px rgba(250,204,21,0.8)' }[st];
        const el = document.createElement('div');
        el.className = 'eng23-face';
        Object.assign(el.style, {
          position: 'fixed', left: `${r.left + r.width / 2 - d / 2}px`, top: `${r.top + r.height / 2 - d / 2}px`, width: `${d}px`, height: `${d}px`, borderRadius: '50%',
          backgroundColor: st === 'hid' ? '#365314' : '#3f3a33', backgroundImage: 'url(/src/assets/props/w2-props.webp)', backgroundRepeat: 'no-repeat',
          backgroundSize: `${2048 * k}px ${2166 * k}px`, backgroundPosition: `${-(fx * k) + (d - fw * k) / 2}px ${-(fy * k) + d * 0.08}px`,
          boxShadow: ring, filter: st === 'open' ? 'brightness(0.55) saturate(0.6)' : st === 'spooked' ? 'grayscale(1) brightness(0.8)' : 'none', zIndex: 9999, pointerEvents: 'none',
        });
        if (st === 'spooked') {
          const b = document.createElement('div');
          b.textContent = '!';
          Object.assign(b.style, { position: 'absolute', right: '-3px', top: '-5px', width: `${Math.round(d * 0.45)}px`, height: `${Math.round(d * 0.45)}px`, borderRadius: '50%', background: '#f59e0b', color: '#1c1917', font: `bold ${Math.round(d * 0.38)}px sans-serif`, display: 'flex', alignItems: 'center', justifyContent: 'center' });
          el.appendChild(b);
        }
        document.body.appendChild(el);
      });
    });
    await sleep(300);
    await shot(name);
    await page.evaluate(() => document.querySelectorAll('.eng23-face').forEach((n) => n.remove()));
  };
  const shot = async (name) => { const f = path.join(out, `${name}-${o.id}.png`); await page.screenshot({ path: f }); console.log('shot', f); };
  const st = () => page.evaluate(() => { const e = window.__engine(); const p = e.player; return { x: p.x, g: p.grounded, line: e.follow.line.map((f) => ({ x: f.x, s: f.state, m: f.moved, pad: !!f.paddle, back: !!f.back })) }; });
  // (the line closes up behind him over his hop's path: across the creek, paddling)
  for (let k = 0; k < 150; k++) { const s = await st(); if (s.line.filter((f) => f.pad).length >= 2) { await shot('2-paddle'); break; } await sleep(10); }
  await sleep(1500);
  await shot('0-start');
  await page.evaluate(() => window.__engine().input.triggerTouchMove('right'));
  let walk = false;
  for (let k = 0; k < 400; k++) {
    const s = await st();
    if (!walk && s.x > 900) { await shot('1-walk'); await mock('hud-mock-walk'); walk = true; }
    if (s.x > 1165) { await page.evaluate(() => window.__engine().input.triggerTouchMove('none')); break; }
    await sleep(25);
  }
  // the line bunches in the reeds behind him
  for (let k = 0; k < 200; k++) { const s = await st(); if (s.line.every((f) => !f.m)) break; await sleep(50); }
  await sleep(400);
  await shot('3-bunch');
  await mock('hud-mock-hidden');
  // the tail left out on the mud (he stopped a little short), then the heron's look (its warning, then its sweep)
  await page.evaluate(() => {
    const e = window.__engine();
    const h = e.follow.herons[0];
    Object.assign(h.s, { phase: 'warn', t: 0, dur: 2 });
  });
  await sleep(1200);
  await shot('4-warn');
  for (let k = 0; k < 200; k++) { const x = await page.evaluate(() => window.__engine().follow.herons[0].lookX); if (x !== null && x > 950) break; await sleep(30); }
  await shot('5-look');
  await mock('hud-mock-look');
  await sleep(3800);
  await shot('6-spooked-hiding');
  await mock('hud-mock-spooked');
  await ctx.close();
}
await browser.close();
// (npx's vite is its child: the whole group goes, or this script never ends)
try { process.kill(-vite.pid, 'SIGTERM'); } catch { vite.kill(); }
process.exit(0);
