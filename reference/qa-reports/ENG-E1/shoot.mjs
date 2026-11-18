/**
 * ENG-E1: the kit eagle on the REAL game (dev page, the engine's own draw: no mock). 1-1's opening bank with its own animals taken off,
 * and ONE eagle laid the way World 1's still table lays it (w1Cast.ts eagleOver, imported from the dev server) over a 1100 px stretch
 * with two bushes (proto.bushes, the covers castPlay hides a still sloth in). The whole action, D63:
 *   pass 1 (its free first pass): he stands still in the OPEN: it screeches, its shadow sweeps, it sees him, dives and pulls up short;
 *   pass 2: he walks into a bush and holds still: the moss comes over him, the shadow sweeps right over him, nothing happens;
 *   pass 3: he stands still in the open again: the real dive, a heart.
 *   node reference/qa-reports/ENG-E1/shoot.mjs <sha> [port]        stills at deviceScaleFactor 2 (labelled from the game)
 *   CLIP=1 node reference/qa-reports/ENG-E1/shoot.mjs <sha> [port] the clip, from the page's own frames (ENG-S1's way)
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..', '..');
const [sha = '?', portArg] = process.argv.slice(2);
const port = Number(portArg || 5227);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = path.join(here, 'shots');
fs.mkdirSync(out, { recursive: true });
const clip = !!process.env.CLIP;

const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
console.log('vite up', /Local:|ready in/.test(vout));
const browser = await chromium.launch();
const PHONES = (process.env.PHONES || '412x915,915x412').split(',').map((s) => s.split('x').map(Number));
for (const [w, h] of PHONES) {
  const tag = `${w > h ? 'sideways' : 'upright'}-${w}x${h}`;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: clip ? 1 : 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-1'));
  await sleep(5000);
  const set = await page.evaluate(async () => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const m = await import('/src/game/gen2/worlds/w1Cast.ts');
    const p = e.player;
    const g = e.platforms.filter((q) => q.type !== 'fragile' && p.x >= q.x && p.x <= q.x + q.width && q.y >= p.y - 4).sort((a, b) => a.y - b.y)[0];
    // (a flat test bank: the shot is about the eagle, so the bank under him runs on long and level, and nothing else stands on it)
    const x0 = Math.round(p.x - 40);
    const bank = { ...g, id: 99901, x: x0 - 300, width: 1800 };
    e.platforms = e.platforms.filter((q) => !(q.x < x0 + 1500 && q.x + q.width > x0 - 300 && Math.abs(q.y - g.y) < 260));
    e.platforms.push(bank);
    if (e.currentStage.platforms) e.currentStage.platforms = e.platforms;
    e.enemies = [];
    e.collectibles = e.collectibles.filter((c) => c.x > x0 + 1600 || c.x < x0 - 300);
    const bushes = [{ x: x0 + 420, w: 110, y: bank.y, kind: 'tall' }, { x: x0 + 760, w: 160, y: bank.y, kind: 'wide' }];
    e.proto.bushes = bushes;
    const eagle = m.eagleOver({ x0, x1: x0 + 1100, calm: [5, 5], freeFirst: true }, bank.y, 9901);
    e.enemies.push(eagle);
    e.proto.cast = { kinds: ['eagle'], traps: [] };
    e.startCast();
    p.x = x0 + 230; p.vx = 0;
    window.__set = { x0, y: bank.y, bushes, open: x0 + 230 };
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: e.currentStage.config?.id ?? '', diff, easy: !!e.easy, x0, ground: bank.y, cast: e.cast ? e.cast.members.length : -1 };
  });
  console.log(tag, 'set', JSON.stringify(set));
  const state = () => page.evaluate(() => {
    const e = window.__engine(), m = e.cast.members[0], s = m.s, p = e.player;
    return { phase: s.phase, t: +s.t.toFixed(2), eye: Math.round(s.eyeX), passes: s.passes, x: Math.round(p.x), hearts: p.hp, moss: +e.cast.calmNow(e.easy).toFixed(2), camx: Math.round(e.camera.x), vw: Math.round(e.camera.viewportWidth) };
  });
  const stamp = (text) => page.evaluate((text) => {
    let d = document.getElementById('__lab');
    if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '4px', bottom: '4px', right: '4px', zIndex: 99999, font: '11px/1.3 monospace', color: '#fff', background: 'rgba(0,0,0,.6)', padding: '3px 5px', pointerEvents: 'none' }); document.body.appendChild(d); }
    d.textContent = text;
  }, text);
  const label = (what, v) => `${what} | ${tag} | built ${set.stage} (${set.diff}${set.easy ? ', easy on' : ''}) + one laid eagle | t-eng-e1@${sha} | kit ${v.phase} eye ${v.eye} pass ${v.passes} | Pokey x ${v.x}, moss ${v.moss}, hearts ${v.hearts}`;
  const frames = [];
  let sampling = clip;
  const sampler = (async () => {
    const t0 = Date.now();
    while (sampling) frames.push({ t: Date.now() - t0, buf: await page.screenshot({ type: 'jpeg', quality: 80 }) });
  })();
  const shot = async (name, what) => {
    const v = await state();
    await stamp(label(what, v));
    if (!clip) await page.screenshot({ path: path.join(out, `${tag}-${name}.png`) });
    console.log(tag, name, JSON.stringify(v));
    return v;
  };
  const until = async (ok, ms = 20000) => { const t0 = Date.now(); let v; while (Date.now() - t0 < ms) { v = await state(); if (ok(v)) return v; await sleep(25); } return v; };
  const walkTo = async (x) => {
    const v0 = await state();
    await page.evaluate((r) => { window.__engine().input.state[r ? 'right' : 'left'] = true; }, x > v0.x);
    await until((v) => (x > v0.x ? v.x >= x : v.x <= x), 6000);
    await page.evaluate(() => { const s = window.__engine().input.state; s.right = s.left = false; });
  };
  // pass 1, the free one: still in the open
  await until((v) => v.phase === 'hunt', 12000);
  await sleep(700);
  await shot('1-warn', 'PASS 1 (free): the screech, in from the edge (he stands still in the OPEN)');
  await until((v) => v.phase === 'hunt' && Math.abs(v.eye - v.x) < 220, 8000);
  await shot('2-shadow-open', 'PASS 1: the shadow sweeping toward him in the open');
  await until((v) => v.phase === 'tell', 6000);
  await sleep(500);
  await shot('3-free-dive', 'PASS 1: it SAW him: the free pass dives and pulls up short');
  await until((v) => v.phase === 'rest', 6000);
  // pass 2: into the bush, still
  await walkTo(set.x0 + 475);
  await sleep(900);
  await shot('4-moss', 'IN THE BUSH, STILL: the moss over him');
  await until((v) => v.phase === 'hunt' && Math.abs(v.eye - v.x) < 60, 16000);
  await shot('5-shadow-over', 'PASS 2: the shadow right over him in the bush: unseen');
  await until((v) => v.phase === 'rest', 8000);
  // pass 3: out into the open, still: the real dive
  await walkTo(set.x0 + 620);
  await until((v) => v.phase === 'tell', 16000);
  await sleep(450);
  await shot('6-dive', 'PASS 3: seen in the open: the REAL dive');
  await until((v) => v.phase === 'recover' || v.phase === 'rest', 4000);
  await sleep(250);
  await shot('7-after', 'after the strike: it climbs away; a heart gone');
  await sleep(1200);
  sampling = false;
  await sampler;
  if (clip && frames.length > 10) {
    const dir = path.join(out, `${tag}-frames`);
    fs.mkdirSync(dir, { recursive: true });
    frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
    const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
    await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${tag}-eagle.mp4`)]).on('exit', res));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(tag, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps');
  }
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
