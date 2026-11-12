/**
 * The measuring stick (R-150.4 / R-150.1, GL0 2026-11-12): where a frame's draw time goes, layer by layer, on a slowed-down CPU.
 *
 *   node tools/perf/layerstick.mjs <out dir> [stages=1-1,3-2,8-1] [port|land] [--ab "<js A>" "<js B>"] [--rates 1,4,6] [--spots 4]
 *
 * For each stage, upright (400x880) and sideways (880x400) at deviceScaleFactor 3 (the game draws q0 = 2x), Pokey is pinned at evenly
 * spaced standing spots (the perf harness's own spots, run.mjs) and the SAME frozen spot is drawn FRAMES times per reading by the
 * game's own loop on Playwright's fake clock. Each layer's time is read by the game's layer clock (src/game/layerClock.ts: sky, far,
 * mid, ground, props, creatures, pokey, front, hud, and the span 'squares' inside ground), on the REAL clock, at each CPU rate
 * (Chrome's CPU throttle, x1 x4 x6), two ways:
 *   cpu    our JS and the canvas calls as recorded;
 *   flush  each layer ends with a one-pixel read, so its raster is inside its time (ranks layers; the read's own cost is printed).
 * A reading is the median of FRAMES frames at a spot; a row is the mean of its spots' medians.
 *
 * It PROVES ITSELF every run: a planted 5 ms busy wait inside 'ground' must show up in 'ground' (+5 ms, within 1.5) and in no other
 * layer (under 1 ms), or the run fails. src/game/layerClock.test.ts proves the arithmetic and that the marks sit where the names say.
 *
 * --ab: two snippets run in the page (A then B) before each reading at every spot, so two ways of drawing are measured back to back
 * in ONE page on the SAME frozen frame (two page loads never land on the same frame: webgl.md). Rows come out as A, B and B - A.
 *
 * It starts its own dev server (the tool reaches the layer clock as a module: nothing is added to window or to a player's build).
 * This container has no phone GPU (SwiftShader): the numbers rank layers and prove a before/after here; they are not phone numbers.
 * Writes <out>/layerstick.json, <out>/layerstick.md and a still per spot (<out>/stills/).
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const opt = (name, n = 1) => { const i = argv.indexOf(name); return i < 0 ? null : argv.splice(i, n + 1).slice(1); };
const ab = opt('--ab', 2);
const RATES = (opt('--rates')?.[0] || '1,4,6').split(',').map(Number);
const SPOTS = Number(opt('--spots')?.[0] || 4);
const FRAMES = Number(opt('--frames')?.[0] || 20);
const [outDir, stagesArg, orientArg] = argv;
if (!outDir) { console.error('usage: node tools/perf/layerstick.mjs <out dir> [stages] [port|land] [--ab "<js A>" "<js B>"]'); process.exit(2); }
const STAGES = (stagesArg && stagesArg !== '-' ? stagesArg : '1-1,3-2,8-1').split(',');
const ORIENTS = [{ id: 'port', viewport: { width: 400, height: 880 } }, { id: 'land', viewport: { width: 880, height: 400 } }].filter((o) => !orientArg || o.id === orientArg);
const VARIANTS = ab ? [{ id: 'A', js: ab[0] }, { id: 'B', js: ab[1] }] : [{ id: 'now', js: '' }];
const LAYERS = ['sky', 'far', 'mid', 'ground', 'props', 'creatures', 'pokey', 'front', 'hud'];
const PLANT_MS = 5;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[stick ${new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false })} ET]`, ...a);
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });

async function startVite(port) {
  const p = spawn('npx', ['vite', '--port', String(port), '--host', '127.0.0.1', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (out += d));
  for (let i = 0; i < 120; i++) { await sleep(500); if (/Local:|ready in/.test(out)) return p; }
  throw new Error('vite did not start: ' + out);
}

/** FRAMES frames of the frozen spot, read by the layer clock in `mode`; the per-layer medians */
async function read(page, mode, plant = null) {
  await page.evaluate(({ mode, plant }) => { const s = window.__stick.stick; s.take(); s.plant = plant || {}; s.mode = mode; }, { mode, plant });
  // (two frames first: a reading never starts on a frame that painted or uploaded something new)
  await page.clock.runFor(2 * 33.4);
  await page.evaluate(() => void window.__stick.stick.take());
  await page.clock.runFor(FRAMES * 33.4);
  return page.evaluate(() => {
    const { stick, stickMedians } = window.__stick;
    const frames = stick.take();
    stick.mode = 'off';
    stick.plant = {};
    return { ...stickMedians(frames), flushes: frames[0]?.flushes ?? 0 };
  });
}

async function playOne(browser, base, stage, orient) {
  const ctx = await browser.newContext({ viewport: orient.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript({ path: path.join(here, 'instrument.js') });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  const cdp = await ctx.newCDPSession(page);
  const T0 = Date.UTC(2026, 9, 30, 12);
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1000);
  await page.goto(`${base}/?layout=1&lessons=off`, { timeout: 180000 });
  for (let t0 = Date.now(); Date.now() - t0 < 300000; ) {
    await page.clock.runFor(200);
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  for (let i = 0; i < 6; i++) { await page.clock.runFor(500); await sleep(200); }
  for (let tries = 0; tries < 3; tries++) {
    await page.evaluate((id) => window.__play(id), stage);
    for (let i = 0; i < 12; i++) { await page.clock.runFor(250); await sleep(300); }
    if (await page.evaluate(() => !!window.__perf.engine())) break;
  }
  const info = await page.evaluate(async ({ n }) => {
    const e = window.__perf.engine();
    if (!e) return { error: 'no engine' };
    const S = window.__perf;
    // (the game's own module instance: the dev server serves one copy of it to the game and to this import)
    window.__stick = await import('/src/game/layerClock.ts');
    window.__stick.stick.now = S.realNow;
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = S.pin;
      if (pin && this.player) {
        const p = this.player;
        p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0;
        try { if (this.lives < 5) this.lives = 9; } catch { /* */ }
      }
      R.call(this);
    };
    if (e.gov) { e.gov.takeUp = () => false; e.gov.feed = () => false; }
    const st = e.currentStage;
    const plats = (st.platforms || []).filter((p) => p.type === 'solid' && p.width >= 60 && !p.broken);
    const xs = plats.map((p) => p.x), ys = plats.map((p) => p.y);
    const vertical = Math.max(...ys) - Math.min(...ys) > (Math.max(...xs) - Math.min(...xs)) * 0.8;
    const sorted = [...plats].sort((a, b) => (vertical ? b.y - a.y : a.x - b.x));
    const spots = [];
    for (let i = 0; i < n; i++) {
      // (inside the stage: the first and last platforms are the spawn and the goal, where half the view is the stage's end wall)
      const p = sorted[Math.min(sorted.length - 1, Math.round(((i + 0.5) * (sorted.length - 1)) / n))];
      if (p) spots.push({ x: Math.round(p.x + p.width / 2), y: p.y });
    }
    const gl = document.createElement('canvas').getContext('webgl2');
    const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info');
    return { stageName: st.config && st.config.name, spots, own: !!e.dotRun || !!e.slideRun, gpu: gl ? String(gl.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : gl.RENDERER)) : 'no webgl2' };
  }, { n: SPOTS });
  if (info.error) { await ctx.close(); return { stage, orient: orient.id, error: info.error, errors }; }

  const rows = [];
  let plantCheck = null;
  for (let si = 0; si < info.spots.length; si++) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await page.evaluate(({ spot }) => {
      const S = window.__perf, e = S.engine();
      S.pin = spot;
      if (e.quality !== 0) { e.quality = 0; e.resizeCanvas(); }
    }, { spot: info.spots[si] });
    // (settle: the camera arrives, the ground's squares paint a few a frame, the creatures' sheets bake)
    for (let k = 0; k < 4; k++) { await page.clock.runFor(500); await sleep(150); }
    const state = await page.evaluate(() => {
      const e = window.__perf.engine();
      return { quality: e.quality, canvas: `${e.canvas.width}x${e.canvas.height}`, cam: [Math.round(e.camera.x), Math.round(e.camera.y)] };
    });
    // the stick proves itself, once a page: a planted 5 ms in 'ground' lands in 'ground' and nowhere else
    if (si === 0) {
      const a = await read(page, 'cpu');
      const b = await read(page, 'cpu', { ground: PLANT_MS });
      const moved = Object.fromEntries(LAYERS.map((l) => [l, +(b.layers[l] - a.layers[l]).toFixed(2)]));
      const others = Math.max(...LAYERS.filter((l) => l !== 'ground').map((l) => Math.abs(moved[l])));
      plantCheck = { planted: PLANT_MS, moved, ok: Math.abs(moved.ground - PLANT_MS) <= 1.5 && others < 1 };
    }
    for (const v of VARIANTS) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      if (v.js) {
        await page.evaluate(v.js);
        for (let k = 0; k < 3; k++) { await page.clock.runFor(300); await sleep(100); }
      }
      const still = path.join(outDir, 'stills', `${stage}-${orient.id}-spot${si}${ab ? '-' + v.id : ''}.png`);
      fs.mkdirSync(path.dirname(still), { recursive: true });
      await page.screenshot({ path: still }).catch(() => {});
      for (const rate of RATES) {
        await cdp.send('Emulation.setCPUThrottlingRate', { rate });
        const cpu = await read(page, 'cpu');
        const flush = await read(page, 'flush');
        // the pixel read's own cost with nothing waiting to be drawn (it is inside every flush-mode layer once)
        const flushCost = await page.evaluate(() => {
          const e = window.__perf.engine(), now = window.__perf.realNow, v = [];
          e.ctx.getImageData(0, 0, 1, 1);
          for (let i = 0; i < 15; i++) { const t = now(); e.ctx.getImageData(0, 0, 1, 1); v.push(now() - t); }
          return v.sort((a, b) => a - b)[7];
        });
        rows.push({ stage, orient: orient.id, spot: si, variant: v.id, rate, cpu, flush, flushCost, still: path.relative(outDir, still) });
      }
    }
    Object.assign(info.spots[si], state);
  }
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();
  return { stage, orient: orient.id, info, plantCheck, rows, errors };
}

// ---- the table -------------------------------------------------------------------------------------------------------------------
const mean = (v) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);
const f = (n) => (Math.abs(n) < 0.005 ? '0' : n.toFixed(2));
function table(results) {
  const out = [];
  const cols = [...LAYERS, 'total', 'squares'];
  const val = (r, mode, c) => (c === 'total' ? r[mode].total : c === 'squares' ? r[mode].spans.squares ?? 0 : r[mode].layers[c]);
  for (const mode of ['flush', 'cpu']) {
    out.push(`\n### ${mode === 'flush' ? 'With each layer\'s raster (flush): ms a frame' : 'Our JS and the recorded canvas calls only (cpu): ms a frame'}\n`);
    out.push(`| Stage | Way up | CPU | ${ab ? 'Draw | ' : ''}${cols.join(' | ')} |${mode === 'flush' ? ' read cost |' : ''}`);
    out.push(`|---|---|---|${ab ? '---|' : ''}${cols.map(() => '---:').join('|')}|${mode === 'flush' ? '---:|' : ''}`);
    for (const res of results) {
      if (res.error) { out.push(`| ${res.stage} | ${res.orient} | FAILED: ${res.error} |`); continue; }
      for (const rate of RATES) {
        const byV = {};
        for (const v of VARIANTS) {
          const rs = res.rows.filter((r) => r.rate === rate && r.variant === v.id);
          byV[v.id] = Object.fromEntries(cols.map((c) => [c, mean(rs.map((r) => val(r, mode, c)))]));
          byV[v.id].read = mean(rs.map((r) => r.flushCost));
          out.push(`| ${res.stage} | ${res.orient === 'port' ? 'upright' : 'sideways'} | x${rate} | ${ab ? v.id + ' | ' : ''}${cols.map((c) => f(byV[v.id][c])).join(' | ')} |${mode === 'flush' ? ` ${f(byV[v.id].read)} |` : ''}`);
        }
        if (ab) out.push(`| ${res.stage} | ${res.orient === 'port' ? 'upright' : 'sideways'} | x${rate} | **B - A** | ${cols.map((c) => { const d = byV.B[c] - byV.A[c]; return `**${d > 0 ? '+' : ''}${f(d)}**`; }).join(' | ')} |${mode === 'flush' ? ' |' : ''}`);
      }
    }
  }
  return out.join('\n');
}

const port = await freePort();
const vite = await startVite(port);
const base = `http://127.0.0.1:${port}`;
log('dev server on', port, '| stages', STAGES.join(','), '| rates', RATES.join(','), '|', SPOTS, 'spots x', FRAMES, 'frames', ab ? '| A/B' : '');
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
{
  // (a first page that only loads the game: a fresh dev server optimizes its dependencies on the first load and reloads the page)
  const page = await browser.newPage();
  await page.goto(`${base}/?lessons=off`, { timeout: 180000 }).catch(() => {});
  for (let t0 = Date.now(); Date.now() - t0 < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function').catch(() => false)) break; await sleep(1000); }
  await sleep(4000);
  await page.close();
}
const results = [];
let bad = 0;
try {
  for (const stage of STAGES) for (const orient of ORIENTS) {
    const t = Date.now();
    let r = await playOne(browser, base, stage, orient).catch((e) => ({ stage, orient: orient.id, error: e.message.slice(0, 300) }));
    if (r.error) { log(stage, orient.id, 'retrying after', r.error.slice(0, 120)); r = await playOne(browser, base, stage, orient).catch((e) => ({ stage, orient: orient.id, error: e.message.slice(0, 300) })); }
    results.push(r);
    if (r.error) { bad++; log(stage, orient.id, 'FAILED', r.error); continue; }
    if (!r.plantCheck?.ok) bad++;
    if (r.errors.length) bad++;
    log(stage, orient.id, `${((Date.now() - t) / 1000).toFixed(0)}s`, `${r.info.spots.length} spots`, r.info.own ? '(a stage with its own screen: no layers)' : '',
      `| planted ${PLANT_MS} ms in ground: ${r.plantCheck?.ok ? 'PASS' : 'FAIL'} ${JSON.stringify(r.plantCheck?.moved)}`, r.errors.length ? `| page errors: ${r.errors.slice(0, 2).join(' / ')}` : '');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'layerstick.json'), JSON.stringify({ rates: RATES, frames: FRAMES, variants: VARIANTS, results }, null, 1));
  }
} finally {
  await browser.close();
  try { process.kill(-vite.pid); } catch { /* */ }
}
const gpu = results.find((r) => r.info)?.info.gpu;
const md = `# Layer stick\n\n${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET. Chromium (headless), graphics: ${gpu}. q0 (2x), ${SPOTS} spots a stage, median of ${FRAMES} frames a spot, mean of the spots.\n` +
  (ab ? `\nA: \`${ab[0]}\`\nB: \`${ab[1]}\`\n` : '') + table(results) +
  `\n\nThe stick's own proof (a planted ${PLANT_MS} ms inside 'ground'): ${results.map((r) => `${r.stage} ${r.orient} ${r.error ? 'FAILED' : r.plantCheck?.ok ? 'PASS' : 'FAIL'}`).join(', ')}.\n`;
fs.writeFileSync(path.join(outDir, 'layerstick.md'), md);
console.log(md);
if (bad) { console.error(`layer stick: ${bad} run(s) failed (a page error, a stage that did not open, or the planted cost landed in the wrong layer)`); process.exit(1); }
