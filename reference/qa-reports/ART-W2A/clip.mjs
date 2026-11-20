/**
 * ART-W2A walk clip (no foot-slide check): a recorded video of the line walking (sideways, dsf 1) and a strip of 16 consecutive game
 * frames cropped round the first little one at 2x, each labelled with its waddle frame (A/B) and x. Same toy as stills.mjs.
 *   ORIENT=land node reference/qa-reports/ART-W2A/clip.mjs [outDir]
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
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, recordVideo: { dir: out, size: o.viewport } });
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
  const st = () => page.evaluate(() => { const e = window.__engine(); const p = e.player; const f = e.follow.line[0]; return { x: p.x, fx: f.x, fy: f.y, m: f.moved, fr: Math.floor(f.x / 15) & 1, cam: e.camera.x, camy: e.camera.y, z: e.camera.zoom ?? 1 }; });
  await sleep(1500);
  await page.evaluate(() => window.__engine().input.triggerTouchMove('right'));
  const strip = [];
  for (let k = 0; k < 400 && strip.length < 16; k++) {
    const s = await st();
    if (s.x > 760 && s.m) {
      // (the first little one's box on screen, from the canvas's own world-to-screen: found by its x in the page's draw)
      const box = await page.evaluate(() => { const e = window.__engine(); const f = e.follow.line[0]; const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); const sx = r.width / e.camera.viewportWidth; return { x: r.left + (f.x - e.camera.x) * sx, y: r.top + (f.y - e.camera.y) * sx, k: sx }; });
      const f = path.join(out, `strip-${String(strip.length).padStart(2, '0')}.png`);
      await page.screenshot({ path: f, clip: { x: Math.max(0, box.x - 60), y: Math.max(0, box.y - 70), width: 120, height: 84 } });
      strip.push({ f, fx: Math.round(s.fx), fr: s.fr });
    }
    if (s.x > 1165) break;
    await sleep(5);
  }
  await page.evaluate(() => window.__engine().input.triggerTouchMove('none'));
  fs.writeFileSync(path.join(out, 'strip.json'), JSON.stringify(strip));
  console.log('strip', strip.length);
  await sleep(500);
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch { vite.kill(); }
process.exit(0);
