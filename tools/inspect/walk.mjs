/**
 * The stage walk: every stage end to end, the way a player sees it, upright and sideways, with the seam detector run on every frame.
 * (Matt, 2026-10-29 4:08 PM ET: "what we lack the most is seams and putting that extra cleanness on things". Helpers proved their work
 * with shots at spots they chose; this walks all of it.)
 *
 *   npx tsx tools/inspect/walk.mjs --stages 1-2,5-1            one or a few stages (a few minutes each)
 *   npx tsx tools/inspect/walk.mjs --worlds 1-10 --jobs 3      the lot (every stage, the boss lairs and the specials 4-D and 5-M)
 * Options: --orient up,side (default both) --seed N (the layout roll, default 1) --out DIR (default /tmp/walk) --clip S (seconds of
 * 30 fps clip from the middle of each stage, default 4; 0 for none) --step F (a frame every F screen widths, default 0.5)
 * --dist DIR (a dev build to reuse; default: build one) --no-detect (frames only) --jobs N (stages at once, default 2) --dprocs N
 * (detector processes per stage, default 2) --keep-canvas (keep the canvas pictures after the detector has read them) --skip-done
 * (leave out walks the detector has already read: carry on a stopped sweep).
 *
 * How it plays: it starts the stage in a development build of the game (window.__play), stops the game's own frame loop and runs
 * the engine one 30 fps frame at a time itself (so the picture stays at full quality however slow the machine is). Pokey follows
 * the inspector's main route (route.ts, worked out from the stage exactly as the game built it) at a brisk run: walks, climbs, hops
 * and swings as straight moves along it. He takes no damage and never blinks (hurt and lives are switched off). A stage the route
 * cannot finish is walked along its ground instead, and the report says so. Boss lairs and the specials (4-D, 5-M, 7-4's slide) are
 * walked across, or left to run, on a clock.
 *
 * Each frame is saved twice: the canvas alone (what the detector reads) with a log of every draw call (walkHook.js), and the screen
 * as the phone shows it, HUD and Dot included (the contact sheets). The HUD check is done on the page itself: anything cut off by
 * the screen's edges, or text on top of other text.
 *
 * Needs: the pre-installed Playwright Chromium, ffmpeg, and for the detector python3 with numpy, Pillow, opencv-python-headless and
 * scipy (pip install opencv-python-headless scipy).
 */
import { spawn, execFile, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync, readdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRoute } from './route.ts';
import { sampleRoute } from './beats.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const arg = (k, d) => {
  const i = process.argv.indexOf('--' + k);
  return i < 0 ? d : process.argv[i + 1];
};
const flag = (k) => process.argv.includes('--' + k);

const OUT = arg('out', '/tmp/walk');
const SEED = +arg('seed', '1');
const CLIP = +arg('clip', '4');
const STEP = +arg('step', '0.5');
const JOBS = +arg('jobs', '2');
const DPROCS = +arg('dprocs', '2');
const PORT = +arg('port', String(4400 + Math.floor(Math.random() * 400)));
const ORIENTS = arg('orient', 'up,side').split(',');
const SIZES = { up: [390, 844], side: [844, 390] };
const RUN_SPEED = 330; // world px a second along the route (a brisk run)
const DT = 1 / 30;

// ─── which stages ───
const range = (s) => s.split(',').flatMap((p) => {
  const [a, b] = p.split('-').map(Number);
  return b ? Array.from({ length: b - a + 1 }, (_, i) => a + i) : [a];
});
const all = generateAllLevels();
let ids = [];
if (arg('stages')) ids = arg('stages').split(',');
else {
  const worlds = range(arg('worlds', '1-10'));
  for (const c of all) if (worlds.includes(c.worldIndex)) ids.push(c.id);
  if (worlds.includes(4)) ids.splice(ids.indexOf('4-9'), 0, '4-D');
  if (worlds.includes(5)) ids.splice(ids.indexOf('5-9'), 0, '5-M');
}
const kindOf = (id) => {
  if (id === '4-D' || id === '7-4') return 'clock';
  const c = all.find((l) => l.id === id);
  return c?.objectiveType === 'boss_lair' ? 'lair' : 'route';
};

// ─── a dev build and a server ───
let dist = arg('dist') ? resolve(arg('dist')) : undefined;
if (!dist || !existsSync(join(dist, 'index.html'))) {
  dist = dist || join(OUT, '_build');
  console.log(`building a development build into ${dist} ...`);
  // (unminified, so the log can name the function that made each code-drawn canvas; the offline-cache step then refuses the big
  // unminified bundle and the build exits with an error after the game itself is written, which is all a walk needs)
  try {
    execFileSync('npx', ['vite', 'build', '--minify', 'false', '--outDir', dist, '--emptyOutDir'], { cwd: ROOT, stdio: 'ignore', env: { ...process.env, NODE_ENV: 'development' } });
  } catch (err) {
    if (!existsSync(join(dist, 'index.html'))) throw err;
  }
}
mkdirSync(OUT, { recursive: true });
const server = spawn(join(ROOT, 'node_modules', '.bin', 'vite'), ['preview', '--outDir', dist, '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
const base = `http://127.0.0.1:${PORT}`;
for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(base)).ok) break;
  } catch {}
  await new Promise((r) => setTimeout(r, 500));
}

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs'));
}
const browser = await chromium.launch();
const HOOK = readFileSync(join(HERE, 'walkHook.js'), 'utf8');

// ─── in the page ───
const freeze = () => {
  const e = window.__weng();
  e.loop = () => {};
  if (e.animFrameId) cancelAnimationFrame(e.animFrameId);
  e.gov.feed = () => false;
  e.gov.takeUp = () => false;
  if (e.slowWatch) e.slowWatch.feed = () => false;
  e.damagePlayer = () => {};
  e.loseLife = () => {};
  if (e.callbacks) {
    e.callbacks.onVictory = () => {};
    e.callbacks.onDefeat = () => {};
  }
  e.quality = 0;
  e.resizeCanvas();
  window.__wmain = e.canvas;
  const seen = new WeakSet();
  const json = JSON.stringify(e.currentStage, (k, v) => {
    if (typeof v === 'function') return undefined;
    if (v && typeof v === 'object') {
      if (typeof HTMLElement !== 'undefined' && (v instanceof HTMLElement || v instanceof ImageBitmap)) return undefined;
      if (seen.has(v)) return undefined;
      seen.add(v);
    }
    return v;
  });
  return { json, w: innerWidth, h: innerHeight, dpr: e.renderDpr(), cssW: e.viewCssW, cssH: e.viewCssH, diff: localStorage.getItem('sloths_difficulty') };
};

/** step the engine n frames with Pokey put on (x, y), facing dir */
const step = ([pts, mode]) => {
  const e = window.__weng();
  const p = e.player;
  for (const q of pts) {
    if (mode === 'route') {
      p.x = q.x;
      p.y = q.y;
      p.vx = q.dx * 240;
      p.vy = 0;
      p.facing = q.dx < 0 ? -1 : 1;
      p.grounded = !q.air;
      p.climbing = !!q.climb;
    }
    p.invincibleTimer = 0;
    p.hp = p.maxHp;
    e.update(1 / 30);
    if (mode === 'route') {
      p.x = q.x;
      p.y = q.y;
      p.invincibleTimer = 0;
    }
  }
  return { x: p.x, y: p.y, cx: e.camera.x, cy: e.camera.y, vw: e.camera.viewportWidth, vh: e.camera.viewportHeight };
};

/** draw one frame with the log on, and send back the canvas, the log and what is around */
const grab = () => {
  const e = window.__weng();
  window.__wcam = [e.camera.x, e.camera.y];
  Object.assign(e.ctx, { __clip: null, __ws: [], __w: false });
  e.camera.trauma = 0;
  window.__wlog = [];
  e.render();
  const log = window.__wlog;
  window.__wlog = null;
  const dpr = e.renderDpr();
  const s = dpr * e.zoom;
  const cam = e.camera;
  const W = e.canvas.width, H = e.canvas.height;
  const inView = (b) => b && b[2] > 0 && b[0] < W && b[3] > 0 && b[1] < H;
  const draws = [];
  for (const d of log) {
    if (!inView(d.b)) continue;
    if (d.k === 'img') {
      const bw = d.b[2] - d.b[0], bh = d.b[3] - d.b[1];
      if (bw >= 6 && bh >= 6 && !d.rot) d.edge = window.__wedges(d._img, ...d.s);
      delete d._img;
    }
    d.b = d.b.map((v) => Math.round(v * 10) / 10);
    draws.push(d);
  }
  const toC = (x, y) => [(x - cam.x) * s, (y - cam.y) * s];
  const plats = [];
  for (const pl of e.platforms) {
    if (pl.broken) continue;
    const [x0, y0] = toC(pl.x, pl.y);
    const [x1, y1] = toC(pl.x + pl.width, pl.y + (pl.height || 20));
    if (x1 < 0 || x0 > W || y1 < 0 || y0 > H) continue;
    plats.push({ b: [x0, y0, x1, y1].map((v) => Math.round(v)), type: pl.type, oneWay: !!pl.oneWay || pl.type === 'branch' || pl.type === 'cloud' });
  }
  // the HUD: anything with words or a picture that the screen's edges cut, or words on top of other words
  const hud = [];
  const vw = innerWidth, vh = innerHeight;
  const els = [...document.querySelectorAll('body *')].filter((el) => {
    if (el === e.canvas || el.tagName === 'CANVAS' && el.width > 600) return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) return false;
    const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    return own || el.tagName === 'IMG' || el.tagName === 'svg' || el.tagName === 'BUTTON';
  });
  const boxes = els.map((el) => ({ el, r: el.getBoundingClientRect(), text: [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join(' ').slice(0, 40) }));
  for (const { r, text, el } of boxes) {
    const cut = r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1;
    if (cut && r.right > 0 && r.left < vw && r.bottom > 0 && r.top < vh) hud.push({ k: 'cut', text: text || el.tagName.toLowerCase(), b: [r.left, r.top, r.right, r.bottom].map(Math.round) });
  }
  const texts = boxes.filter((q) => q.text.length > 1);
  for (let i = 0; i < texts.length; i++)
    for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      const oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
      if (ox > 4 && oy > 4 && ox * oy > 0.2 * Math.min(a.r.width * a.r.height, b.r.width * b.r.height))
        hud.push({ k: 'overlap', text: `${a.text} / ${b.text}`, b: [Math.max(a.r.left, b.r.left), Math.max(a.r.top, b.r.top), Math.min(a.r.right, b.r.right), Math.min(a.r.bottom, b.r.bottom)].map(Math.round) });
    }
  return {
    png: e.canvas.toDataURL('image/png'),
    meta: { W, H, s, dpr, zoom: e.zoom, cam: { x: cam.x, y: cam.y, vw: cam.viewportWidth, vh: cam.viewportHeight }, player: { x: e.player.x, y: e.player.y, ...Object.fromEntries([toC(e.player.x, e.player.y)].map(([a, b]) => [['cx', a], ['cy', b]]).flat()) }, gameTime: e.gameTime, plats, draws, hud, cssW: innerWidth, cssH: innerHeight },
  };
};

// ─── the path ───
/** points one frame apart along the route, at a brisk run */
function pathFrom(stage) {
  let samples = [];
  let how = 'route';
  try {
    const r = findRoute(stage);
    if (r.segs.length && r.traced !== 'failed') {
      samples = sampleRoute(r).map((s) => ({ x: s.x, y: s.y, kind: s.seg.kind }));
      how = `route (${r.traced}${r.presumedHops ? `, ${r.presumedHops} presumed hops` : ''})`;
    }
  } catch (err) {
    how = 'ground (route failed: ' + String(err.message).slice(0, 80) + ')';
  }
  if (samples.length < 2) {
    // along the ground: the platform top nearest the last height, every 24 px from the start to the door
    if (how === 'route') how = 'ground (no route)';
    const plats = (stage.platforms || []).filter((p) => p.type !== 'moving' && p.width > 20);
    const x1 = stage.exitTotemX > 0 ? stage.exitTotemX : Math.max(...plats.map((p) => p.x + p.width));
    let y = stage.spawnY;
    for (let x = stage.spawnX; x <= x1; x += 24) {
      const under = plats.filter((p) => x >= p.x && x <= p.x + p.width);
      if (under.length) y = under.reduce((a, p) => (Math.abs(p.y - y) < Math.abs(a - y) ? p.y : a), under[0].y);
      samples.push({ x, y, kind: 'walk' });
    }
  }
  // stop short of the door so the stage does not end
  const door = stage.exitTotemX;
  const pts = [];
  let carry = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1], b = samples[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len < 0.01) continue;
    const air = !['walk', 'climb'].includes(b.kind);
    let u = carry;
    while (u < len) {
      const x = a.x + ((b.x - a.x) * u) / len, y = a.y + ((b.y - a.y) * u) / len;
      if (door > 0 && Math.abs(x - door) < 70 && i > samples.length * 0.8) return { pts, how };
      pts.push({ x, y, dx: Math.sign(b.x - a.x) || 0.001, air: air && b.kind !== 'drop', climb: b.kind === 'climb' });
      u += RUN_SPEED * DT;
    }
    carry = u - len;
  }
  return { pts, how };
}

// ─── one stage, one way up ───
async function walkOne(id, orient) {
  const [w, h] = SIZES[orient];
  const dir = join(OUT, id, orient);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(join(dir, 'canvas'), { recursive: true });
  mkdirSync(join(dir, 'screen'), { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript(HOOK);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => { if (!/AudioParam|AudioContext|play\(\)/.test(e.message)) errors.push(e.message); });
  const t0 = Date.now();
  await page.goto(`${base}/?nodemo=1`);
  await page.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 30000 });
  await page.evaluate(([id, seed]) => window.__play(id, seed), [id, SEED]);
  await page.waitForFunction(() => window.__weng && window.__weng() && window.__weng().currentStage, null, { timeout: 30000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2500);
  // the goal card goes to its counter on a timer or on the first touch; a walk does not wait on either
  for (let k = 0; k < 20; k++) {
    if (await page.evaluate(() => !document.documentElement.dataset.hudCard)) break;
    await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' })));
    await page.waitForTimeout(400);
  }
  if (kindOf(id) === 'clock') {
    // its own run: past its title card with a tap, then hold the way on (right) the whole time
    await page.touchscreen.tap(w / 2, h / 2).catch(() => {});
    await page.waitForTimeout(1500);
    await page.keyboard.down('ArrowRight');
  }
  const info = await page.evaluate(freeze);
  const stage = JSON.parse(info.json);
  const kind = kindOf(id);
  let pts = [], how = kind;
  if (kind === 'route') ({ pts, how } = pathFrom(stage));
  else if (kind === 'lair') {
    // across the arena and back, on the floor
    const a = stage.arena || { left: stage.spawnX, right: stage.spawnX + 1600 };
    const y = stage.spawnY;
    for (let x = a.left + 60; x < a.right - 60; x += RUN_SPEED * DT) pts.push({ x, y, dx: 1 });
    how = 'arena walk';
  } else {
    for (let t = 0; t < 70; t += DT) pts.push({ t });
    how = 'clock (its own run, 70 s)';
  }
  const mode = kind === 'clock' ? 'clock' : 'route';
  const frames = [];
  const prof = { grab: 0, shot: 0, step: 0 };
  const save = async (i, why) => {
    let t = Date.now();
    const { png, meta } = await page.evaluate(grab);
    prof.grab += Date.now() - t;
    const name = String(i).padStart(3, '0');
    writeFileSync(join(dir, 'canvas', name + '.png'), Buffer.from(png.split(',')[1], 'base64'));
    t = Date.now();
    await page.screenshot({ path: join(dir, 'screen', name + '.jpg'), type: 'jpeg', quality: 82 });
    prof.shot += Date.now() - t;
    writeFileSync(join(dir, 'canvas', name + '.json'), JSON.stringify(meta));
    frames.push({ i, why, x: Math.round(meta.player.x), y: Math.round(meta.player.y) });
  };
  // settle the camera on the start
  await page.evaluate(step, [Array(20).fill(pts[0] || { x: stage.spawnX, y: stage.spawnY, dx: 1 }), mode]);
  let pos = await page.evaluate(step, [[pts[0] || { x: stage.spawnX, y: stage.spawnY, dx: 1 }], mode]);
  let n = 0;
  await save(n++, 'start');
  let last = { x: pos.x, y: pos.y, t: 0 };
  const clipAt = Math.floor(pts.length / 2);
  const CH = 6;
  for (let i = 1; i < pts.length; i += CH) {
    const chunk = pts.slice(i, i + CH);
    const t1 = Date.now();
    pos = await page.evaluate(step, [chunk, mode]);
    prof.step += Date.now() - t1;
    const t = i * DT;
    const far = mode === 'clock' ? t - last.t >= 3 : Math.abs(pos.x - last.x) >= STEP * pos.vw || Math.abs(pos.y - last.y) >= STEP * pos.vh;
    if (far) {
      await save(n++, `x${Math.round(pos.x)}`);
      last = { x: pos.x, y: pos.y, t };
    }
    if (CLIP > 0 && i <= clipAt && clipAt < i + CH) {
      // the clip: CLIP seconds at 30 fps from here, every frame drawn and shot (no blink: he cannot be hurt)
      mkdirSync(join(dir, 'clip'), { recursive: true });
      const m = Math.round(CLIP * 30);
      const extra = mode === 'clock' ? Array(m).fill({}) : pts.slice(i + CH, i + CH + m);
      for (let f = 0; f < extra.length; f++) {
        await page.evaluate(step, [[extra[f]], mode]);
        await page.evaluate(() => window.__weng().render());
        await page.screenshot({ path: join(dir, 'clip', `${String(f).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 78, scale: 'css' });
      }
      try {
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', join(dir, 'clip', '%04d.jpg'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', '-crf', '24', join(dir, 'clip.mp4')]);
        rmSync(join(dir, 'clip'), { recursive: true, force: true });
      } catch {}
      i += extra.length;
      if (mode === 'route' && pts[i]) pos = await page.evaluate(step, [[pts[i]], mode]);
      last = { x: pos.x, y: pos.y, t: i * DT };
    }
  }
  await save(n++, 'end');
  writeFileSync(join(dir, 'walk.json'), JSON.stringify({ id, orient, seed: SEED, how, dist, size: [w, h], dpr: info.dpr, difficulty: info.diff, frames, errors, secs: Math.round((Date.now() - t0) / 1000) }, null, 1));
  await ctx.close();
  console.log(`${id} ${orient}: ${frames.length} frames, ${how}, ${Math.round((Date.now() - t0) / 1000)} s (play ${Math.round(prof.step / 1000)} s, grab ${Math.round(prof.grab / 1000)} s, shots ${Math.round(prof.shot / 1000)} s)${errors.length ? `, ${errors.length} page errors` : ''}`);
}

// (--skip-done: a walk already read by the detector is not walked again, so a stopped sweep can carry on)
const queue = ids.flatMap((id) => ORIENTS.map((o) => [id, o])).filter(([id, o]) => !flag('skip-done') || !existsSync(join(OUT, id, o, 'seams.json')));
const failed = [];
await Promise.all(Array.from({ length: Math.min(JOBS, queue.length) }, async () => {
  while (queue.length) {
    const [id, o] = queue.shift();
    try {
      await walkOne(id, o);
      if (!flag('no-detect')) {
        // the detector on this walk straight away, then the canvas pictures go (about 1.5 GB a world otherwise)
        const dir = join(OUT, id, o);
        await new Promise((res) => execFile('python3', [join(HERE, 'seams.py'), OUT, '--one', dir, '--procs', String(DPROCS)], { maxBuffer: 1 << 26 }, (err, _o, e) => {
          if (err) console.log(`${id} ${o}: detector failed ${String(e || err.message).split('\n').slice(-3).join(' ')}`);
          else process.stdout.write(String(e));
          res();
        }));
        if (!flag('keep-canvas')) for (const f of readdirSync(join(dir, 'canvas'))) if (f.endsWith('.png')) rmSync(join(dir, 'canvas', f));
      }
    } catch (err) {
      failed.push(`${id} ${o}: ${String(err.message).split('\n')[0]}`);
      console.log(`${id} ${o}: FAILED ${String(err.message).split('\n')[0]}`);
    }
  }
}));
await browser.close();
server.kill();
if (failed.length) writeFileSync(join(OUT, 'failed.txt'), failed.join('\n') + '\n');

if (!flag('no-detect')) execFileSync('python3', [join(HERE, 'seams.py'), OUT, '--report-only'], { stdio: 'inherit' });
