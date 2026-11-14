/**
 * BUILD-17 Step 0 redo 1: the perched eagle clear of the HUD by >= 24 px both ways; every caption prints the eagle's top on screen
 * ((homeY - 338/3 - camera.y) x zoom) against the HUD's bottom over it (the progress sign's DOM rect (.vh-cplate, VineHud.tsx), and every [data-hud-keepout] over its x).
 * ENG-E2 (from ENG-E1's shooter): the moss cover and the PERCHED eagle on the REAL game (dev page, the engine's own draw: no mock). 1-1's opening bank with its own animals taken off,
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
const port = Number(portArg || 5242);
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
  await page.evaluate(() => { try { localStorage.removeItem('sloth_difficulty'); } catch {} });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(1500);
  await page.evaluate(() => window.__play('1-1'));
  await sleep(5000);
  const set = await page.evaluate(async () => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const m = await import('/src/game/gen2/worlds/w1Cast.ts');
    const p = e.player;
    const g = e.platforms.filter((q) => q.type !== 'fragile' && p.x >= q.x && p.x <= q.x + q.width && q.y >= p.y - 4).sort((a, b) => a.y - b.y)[0];
    const x0 = Math.round(p.x - 40);
    const bank = { ...g, id: 99901, x: x0 - 300, width: 1800 };
    e.platforms = e.platforms.filter((q) => !(q.x < x0 + 1500 && q.x + q.width > x0 - 300 && Math.abs(q.y - g.y) < 400));
    e.platforms.push(bank);
    if (e.currentStage.platforms) e.currentStage.platforms = e.platforms;
    e.enemies = [];
    e.collectibles = e.collectibles.filter((c) => c.x > x0 + 1600 || c.x < x0 - 300);
    // (World 1's still table's own moss rows: a carpet two strips long and a patch, laid where a section's hide sockets would put them)
    const bushes = [{ x: x0 + 300, w: 346, y: bank.y, kind: 'moss' }, { x: x0 + 800, w: 169, y: bank.y, kind: 'mossPatch' }];
    e.proto.bushes = bushes;
    // (one eagle PERCHED on a snag between them, its gaze over the whole stretch; its first look free, as where it is taught)
    const eagle = m.eagleOver({ x0, x1: x0 + 1100, calm: [5, 5], freeFirst: true }, bank.y, 9901, { x: x0 + 690 });
    e.enemies.push(eagle);
    e.proto.cast = { kinds: ['eagle'], traps: [] };
    e.startCast();
    p.x = x0 + 150; p.vx = 0;
    window.__set = { x0, y: bank.y };
    let diff = '?';
    try { diff = localStorage.getItem('sloth_difficulty') || '(unset: Normal)'; } catch {}
    return { stage: e.currentStage.config?.id ?? '', diff, easy: !!e.easy, x0, ground: bank.y, cast: e.cast ? e.cast.members.length : -1, perched: !!e.cast?.members[0]?.s.perched };
  });
  console.log(tag, 'set', JSON.stringify(set));
  const state = () => page.evaluate(() => {
    const e = window.__engine(), m = e.cast.members[0], s = m.s, p = e.player;
    const z = e.zoom, cx = e.camera.x, cy = e.camera.y;
    const top = (s.homeY - 338 / 3 - cy) * z, ex0 = (s.x - 70 - cx) * z, ex1 = (s.x + 60 - cx) * z;
    const sign = document.querySelector('.vh-cplate');
    const signB = sign ? sign.getBoundingClientRect().bottom : -1;
    let hud = 0;
    for (const el of document.querySelectorAll('[data-hud-keepout]')) { const r = el.getBoundingClientRect(); if (r.width && r.right > ex0 && r.left < ex1 && r.top < innerHeight / 2) hud = Math.max(hud, r.bottom); }
    return { phase: s.phase, t: +s.t.toFixed(2), eye: Math.round(s.eyeX), passes: s.passes, bx: Math.round(s.x), x: Math.round(p.x), hearts: p.hp, moss: +e.cast.calmNow(e.easy).toFixed(2), perched: s.x === s.homeX && s.y === s.homeY, eagleTop: Math.round(top), signBottom: Math.round(signB), hudOver: Math.round(hud), clear: Math.round(top - Math.max(signB, hud)), zoom: +z.toFixed(3) };
  });
  const stamp = (text) => page.evaluate((text) => {
    let d = document.getElementById('__lab');
    if (!d) { d = document.createElement('div'); d.id = '__lab'; Object.assign(d.style, { position: 'fixed', left: '4px', bottom: '4px', right: '4px', zIndex: 99999, font: '11px/1.3 monospace', color: '#fff', background: 'rgba(0,0,0,.6)', padding: '3px 5px', pointerEvents: 'none' }); document.body.appendChild(d); }
    d.textContent = text;
  }, text);
  const label = (what, v) => `${what} | ${tag} | built ${set.stage} (${set.diff}${set.easy ? ', easy on' : ''}) + laid moss + one PERCHED eagle | t-build-17@${sha} | kit ${v.phase} eye ${v.eye} body ${v.bx} pass ${v.passes} | Pokey x ${v.x}, moss ${v.moss}, hearts ${v.hearts} | perched ${v.perched}: eagle top ${v.eagleTop}px, sign bottom ${v.signBottom}px, HUD over it ${v.hudOver}px, zoom ${v.zoom}, CLEAR ${v.clear}px ${v.clear >= 24 ? 'PASS' : 'FAIL'}`;
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
  await sleep(600);
  await shot('1-perched', 'the eagle PERCHED on its snag, looking away; Pokey on bare bark (the moss carpet and patch laid)');
  // look 1, the free one: he stands still in the open
  await until((v) => v.phase === 'hunt', 12000);
  await sleep(500);
  await shot('2-head-turn', 'LOOK 1 (free): the screech, its HEAD TURNS (the warn); its gaze shadow at the stretch start');
  await until((v) => v.phase === 'tell', 8000);
  await sleep(350);
  await shot('3-free-dive', 'LOOK 1: it SAW him in the open: it leaves the snag (free: pulls up short)');
  await until((v) => v.phase === 'act', 3000);
  await sleep(200);
  await shot('3b-free-act', 'LOOK 1: the free dive at him, from the snag');
  await until((v) => v.phase === 'rest' && Math.abs(v.bx - (set.x0 + 690)) < 3, 8000);
  // into the carpet, still
  await walkTo(set.x0 + 470);
  await sleep(900);
  await shot('4-carpet-still', 'ON THE MOSS CARPET, STILL: the moss over him; the eagle back on its snag');
  await until((v) => v.phase === 'hunt' && Math.abs(v.eye - v.x) < 60, 16000);
  await shot('5-gaze-on-him', 'LOOK 2: its gaze right on him in the moss: it looks down and BLINKS; unseen');
  await until((v) => v.phase === 'rest', 8000);
  await walkTo(set.x0 + 885);
  await sleep(900);
  await shot('6-patch-still', 'IN THE MOSS PATCH, STILL: the moss over him');
  // look 3: he steps out into the open as its gaze comes: the real dive from the snag
  await until((v) => v.phase === 'hunt' && v.eye > set.x0 + 700, 16000);
  await walkTo(set.x0 + 1030);
  await until((v) => v.phase === 'tell' || v.phase === 'act', 8000);
  await sleep(300);
  await shot('7-dive', 'LOOK 3: seen in the OPEN: the REAL dive off the snag');
  await until((v) => v.phase === 'recover' || v.phase === 'rest', 4000);
  await until((v) => v.phase === 'rest' && Math.abs(v.bx - (set.x0 + 690)) > 40, 3000);
  await shot('8-back', 'after the strike: it flies back to its snag; a heart gone');
  await sleep(1500);
  sampling = false;
  await sampler;
  if (clip && frames.length > 10) {
    const dir = path.join(out, `${tag}-frames`);
    fs.mkdirSync(dir, { recursive: true });
    frames.forEach((f, i) => fs.writeFileSync(path.join(dir, `f${String(i).padStart(4, '0')}.jpg`), f.buf));
    const fps = ((frames.length - 1) * 1000) / (frames[frames.length - 1].t - frames[0].t);
    await new Promise((res) => spawn('ffmpeg', ['-v', 'error', '-y', '-framerate', fps.toFixed(2), '-i', path.join(dir, 'f%04d.jpg'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', path.join(out, `${tag}-perch.mp4`)]).on('exit', res));
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(tag, 'clip', frames.length, 'frames at', fps.toFixed(1), 'fps');
  }
  await ctx.close();
}
await browser.close();
try { process.kill(-vite.pid, 'SIGTERM'); } catch {}
await sleep(1500);
process.exit(0);
