/**
 * FEEL-PAIR stills and clips (R-165.170): the vine pair test room in the real game (a dev build: a QA build, so the room exists), upright
 * 390x844 and sideways 844x390, played with the keyboard's real input path (ArrowUp held climbs, J by the sign is the tap).
 *
 *   node reference/qa-reports/FEEL-PAIR/shoot.mjs <outDir> [port] [dsf]
 *
 * Writes <orient>-<what>.jpg stills, and <orient>-<climb>.mp4 clips (each climb from its foot to standing on the bough), plus the
 * Settings card's About page with the room's row (the entry Matt uses) both ways.
 */
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [outDir, portArg, dsfArg] = process.argv.slice(2);
const port = Number(portArg || 5207);
const dsf = Number(dsfArg || 1);
fs.mkdirSync(outDir, { recursive: true });
const vidDir = path.join(outDir, '.vid');
fs.mkdirSync(vidDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);

const browser = await chromium.launch();
const ORIENTS = [
  { id: 'land', viewport: { width: 844, height: 390 } },
  { id: 'port', viewport: { width: 390, height: 844 } },
];
const eng = () => (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: dsf, isMobile: true, hasTouch: true, recordVideo: { dir: vidDir, size: o.viewport } });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  // (the game's wide mode asks for full screen at a stage's start; headless, that shrank the recorded frames to two thirds with a grey
  // band under them: the recording only, the stills were whole. A phone's full screen is not what is judged here)
  await ctx.addInitScript(() => { Element.prototype.requestFullscreen = function () { return Promise.resolve(); }; });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const at = () => (Date.now() - t0) / 1000;
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 160)));
  // the title first: Settings, its About page, the room's row (Matt's way in)
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  await page.waitForSelector('[data-menu="true"]', { timeout: 300000 });
  await sleep(6000);
  await page.click('[data-menu="true"]');
  await sleep(800);
  await page.click('[role="tab"][aria-label="About"]');
  await sleep(800);
  await page.screenshot({ path: path.join(outDir, `${o.id}-entry.jpg`), quality: 85 });
  // and in: its Play button
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  for (let t = Date.now(); Date.now() - t < 60000; ) {
    if (await page.evaluate(() => { const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine); return !!(e && e.currentStage && e.currentStage.feelRoom); })) break;
    await sleep(500);
  }
  await sleep(4000);
  const room = await page.evaluate(() => { const e = window.__engine(); return { ...e.currentStage.feelRoom, floor: e.currentStage.vines[0].bottomY, single: e.currentStage.vines[0].x, pair: e.currentStage.vines[1].x }; });
  const place = (x) => page.evaluate((x) => { const e = window.__engine(); Object.assign(e.player, { x, y: e.currentStage.vines[0].bottomY, vx: 0, vy: 0, grounded: true, climbing: false }); }, x);
  await place(room.sign.x - 150);
  await sleep(2500);
  await page.screenshot({ path: path.join(outDir, `${o.id}-room.jpg`), quality: 85 });
  const segs = [];
  /** one climb, foot to bough, held up on the keyboard; a still part way up */
  const climb = async (x, name) => {
    await place(x);
    await sleep(1200);
    const s0 = at();
    await page.keyboard.down('ArrowUp');
    await sleep(name === 'single' ? 1500 : 800);
    await page.screenshot({ path: path.join(outDir, `${o.id}-${name}-mid.jpg`), quality: 85 });
    await sleep(name === 'single' ? 2600 : 1500);
    await page.keyboard.up('ArrowUp');
    await sleep(1500);
    segs.push({ name, from: Math.max(0, s0 - 0.6), to: at() });
    const p = await page.evaluate(() => { const e = window.__engine(); return { y: e.player.y, grounded: e.player.grounded }; });
    console.log(o.id, name, 'top y', Math.round(p.y), 'grounded', p.grounded);
  };
  await climb(room.single, 'single');
  await page.screenshot({ path: path.join(outDir, `${o.id}-top.jpg`), quality: 85 });
  await climb(room.pair, 'pair2x');
  // to the sign: a tap by it (J, the punch key) switches the pair to 1.6x
  await place(room.sign.x - 25);
  await sleep(900);
  // (held a frame or more: a press and release inside one frame is lost to the keyboard's own handling, inputEngine.ts keyup)
  await page.keyboard.down('KeyJ');
  await sleep(150);
  await page.keyboard.up('KeyJ');
  await sleep(350);
  await page.screenshot({ path: path.join(outDir, `${o.id}-sign.jpg`), quality: 85 });
  const sp = await page.evaluate(() => { const e = window.__engine(); return { speed: e.currentStage.vines[1].climbSpeed, punching: e.player.punching }; });
  console.log(o.id, 'after the tap: pair speed', sp.speed, 'punching', sp.punching);
  await sleep(800);
  await climb(room.pair, 'pair16x');
  await page.screenshot({ path: path.join(outDir, `${o.id}-clock.jpg`), quality: 85 });
  const vid = await page.video().path();
  await ctx.close();
  for (const s of segs) {
    const out = path.join(outDir, `${o.id}-${s.name}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', s.from.toFixed(2), '-to', s.to.toFixed(2), '-i', vid, '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-r', '30', out]);
    console.log('clip', out);
  }
}
await browser.close();
vite.kill();
fs.rmSync(vidDir, { recursive: true, force: true });
