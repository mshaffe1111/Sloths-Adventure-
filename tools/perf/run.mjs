/**
 * Perf harness: plays the same spots in one build of the game and records, for every frame, what the canvas was asked to do.
 *
 *   node tools/perf/run.mjs <name> <worktree dir> <port> <out dir> [scenario,scenario...] [port|land]
 *
 * Setup (one worktree per build, sharing node_modules):
 *   git worktree add --detach /home/user/perfwt/v6 192cd165 && ln -s $PWD/node_modules /home/user/perfwt/v6/node_modules
 * It starts `npx vite --port <port>` in the worktree itself and stops it at the end.
 *
 * Each scenario (the control test with ?ctest=1&mix=14 / &mix=8, and stages through window.__play) is opened upright 400x880 at
 * deviceScaleFactor 3 and sideways 880x400. Pokey is teleported to evenly spaced standing spots along the stage and pinned there;
 * at each spot, after a settle, three passes:
 *   time   nothing wrapped: render() CPU ms on the real clock, and render+flush (a 1-pixel read that waits for the raster)
 *   count  Canvas 2D wrapped (instrument.js): every call counted per call site and per layer of Engine.render
 * The game runs on Playwright's fake clock (frames only advance when told), so the frame governor never sees a slow frame and the
 * picture stays at q0; quality is forced to 0 at every spot anyway. Requests to script.google.com are blocked.
 * Writes <out dir>/<name>.json; call sites are mapped back to the .ts source through Vite's inline source maps.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// (playwright is installed globally in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = require('playwright');
const { SourceMapConsumer } = require(path.join(here, '..', '..', 'node_modules', 'source-map-js'));

const [name, dir, portStr, outDir, scenArg, orientArg] = process.argv.slice(2);
const port = Number(portStr);
const SCENARIOS = [
  { id: 'ctest-mix14', stage: '1-2', q: 'ctest=1&mix=14', spots: 14 },
  { id: 'ctest-mix8', stage: '1-2', q: 'ctest=1&mix=8', spots: 14 },
  ...['1-1', '1-3', '2-1', '3-2', '4-1', '5-1', '6-1', '7-1'].map((s) => ({ id: s, stage: s, q: '', spots: 8 })),
].filter((s) => !scenArg || scenArg.split(',').includes(s.id));
const ORIENTS = [
  { id: 'port', viewport: { width: 400, height: 880 } },
  { id: 'land', viewport: { width: 880, height: 400 } },
].filter((o) => !orientArg || o.id === orientArg);
const SETTLE_MS = 1500, TIME_FRAMES = 20, COUNT_FRAMES = 8;

const log = (...a) => console.log(`[${name} ${new Date().toISOString().slice(11, 19)}]`, ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function startVite() {
  const p = spawn('npx', ['vite', '--port', String(port), '--host', '127.0.0.1', '--strictPort'], { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let out = '';
  p.stdout.on('data', (d) => (out += d));
  p.stderr.on('data', (d) => (out += d));
  for (let i = 0; i < 120; i++) {
    await sleep(500);
    if (/Local:|ready in/.test(out)) return p;
  }
  throw new Error('vite did not start: ' + out);
}

async function playOne(browser, scen, orient) {
  const ctx = await browser.newContext({ viewport: orient.viewport, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript({ path: path.join(here, 'instrument.js') });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
  const T0 = Date.UTC(2026, 9, 30, 12);
  await page.clock.install({ time: T0 });
  await page.clock.pauseAt(T0 + 1000);
  const url = `http://127.0.0.1:${port}/?layout=1&lessons=off${scen.q ? '&' + scen.q : ''}`;
  await page.goto(url, { timeout: 180000 });
  for (let i = 0; i < 120; i++) {
    await page.clock.runFor(200);
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(250);
  }
  await page.evaluate((id) => window.__play(id), scen.stage);
  // load: the sheets arrive on the real clock, the game moves on the fake one
  for (let i = 0; i < 12; i++) { await page.clock.runFor(250); await sleep(300); }

  // the harness's render(): pin Pokey, then time, count or just draw
  const info = await page.evaluate(({ n }) => {
    const e = window.__engine();
    if (!e) return { error: 'no engine' };
    const S = window.__perf;
    const R = Object.getPrototypeOf(e).render;
    S.mode = 'plain';
    S.times = [];
    e.render = function () {
      const pin = S.pin;
      if (pin && this.player) {
        const p = this.player;
        p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0;
        try { if (this.lives < 5) this.lives = 9; } catch { /* */ }
      }
      if (S.mode === 'time') {
        const t0 = S.realNow();
        R.call(this);
        const t1 = S.realNow();
        this.ctx.getImageData(0, 0, 1, 1);
        S.times.push({ spot: S.spot, render: t1 - t0, flush: S.realNow() - t1 });
      } else if (S.mode === 'count') {
        S.beginFrame({ spot: S.spot });
        R.call(this);
        S.endFrame();
      } else R.call(this);
    };
    S.main = e.canvas;
    const st = e.currentStage;
    const plats = (st.platforms || []).filter((p) => p.type === 'solid' && p.width >= 60 && !p.broken);
    const xs = plats.map((p) => p.x), ys = plats.map((p) => p.y);
    const spanX = Math.max(...xs) - Math.min(...xs), spanY = Math.max(...ys) - Math.min(...ys);
    const vertical = spanY > spanX * 0.8;
    // along the stage (left to right, or bottom to top on a climb), evenly spaced by platform order, from the spawn on
    const sorted = [...plats].sort((a, b) => (vertical ? b.y - a.y : a.x - b.x));
    const spots = [];
    for (let i = 0; i < n; i++) {
      const p = sorted[Math.min(sorted.length - 1, Math.round((i * (sorted.length - 1)) / Math.max(1, n - 1)))];
      if (p) spots.push({ x: Math.round(p.x + p.width / 2), y: p.y });
    }
    return {
      stageName: st.config && st.config.name, objective: st.config && st.config.objectiveType, nPlatforms: (st.platforms || []).length, vertical,
      spawn: [st.spawnX, st.spawnY], exit: [st.exitTotemX, st.exitTotemY], spots,
      dotRun: !!e.dotRun, slideRun: !!e.slideRun, proto: !!e.proto,
    };
  }, { n: scen.spots });
  if (info.error) { await ctx.close(); return { scenario: scen.id, orient: orient.id, error: info.error, errors }; }

  const spotsOut = [];
  for (let si = 0; si < info.spots.length; si++) {
    const spot = info.spots[si];
    await page.evaluate(({ spot, si }) => {
      const S = window.__perf, e = window.__engine();
      S.pin = spot; S.spot = si; S.mode = 'plain';
      if (e.quality !== 0) { e.quality = 0; e.resizeCanvas(); }
    }, { spot, si });
    for (let k = 0; k < 3; k++) { await page.clock.runFor(SETTLE_MS / 3); await sleep(200); }
    const state = await page.evaluate(() => {
      const e = window.__engine();
      if (e.quality !== 0) { e.quality = 0; e.resizeCanvas(); }
      return { quality: e.quality, canvas: `${e.canvas.width}x${e.canvas.height}`, cam: [Math.round(e.camera.x), Math.round(e.camera.y)], paused: !!e.isPaused, running: !!e.isRunning, px: Math.round(e.player.x), py: Math.round(e.player.y) };
    });
    await page.evaluate(() => { window.__perf.mode = 'time'; });
    await page.clock.runFor(TIME_FRAMES * 33.4);
    await page.evaluate(() => { window.__perf.install(); window.__perf.mode = 'count'; });
    await page.clock.runFor(COUNT_FRAMES * 33.4);
    await page.evaluate(() => { window.__perf.mode = 'plain'; window.__perf.uninstall(); });
    spotsOut.push({ ...spot, ...state });
  }
  const dump = await page.evaluate(() => {
    const d = window.__perf.dump();
    return { ...d, times: window.__perf.times };
  });
  const shot = path.join(outDir, 'shots', `${name}-${scen.id}-${orient.id}.png`);
  fs.mkdirSync(path.dirname(shot), { recursive: true });
  await page.screenshot({ path: shot, scale: 'css' }).catch(() => {});
  await ctx.close();
  return { scenario: scen.id, orient: orient.id, info, spots: spotsOut, ...dump, errors };
}

// ---- source maps: generated /src/x.ts:line:col -> x.ts:line (and the line's text) ----------------------------------------------
async function mapSites(results) {
  const files = new Set();
  for (const r of results) for (const s of r.sites || []) for (const k of ['site', 'caller', 'layer']) if (s[k] && s[k].startsWith('/src/')) files.add(s[k].replace(/:\d+:\d+$/, ''));
  const maps = {};
  for (const f of files) {
    try {
      const code = await (await fetch(`http://127.0.0.1:${port}${f}`)).text();
      const m = code.match(/sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([A-Za-z0-9+/=]+)/);
      if (m) maps[f] = new SourceMapConsumer(JSON.parse(Buffer.from(m[1], 'base64').toString('utf8')));
    } catch { /* unmapped */ }
  }
  const srcLines = {};
  const lineText = (f, line) => {
    if (!srcLines[f]) { try { srcLines[f] = fs.readFileSync(path.join(dir, f), 'utf8').split('\n'); } catch { srcLines[f] = []; } }
    return (srcLines[f][line - 1] || '').trim().slice(0, 140);
  };
  const cache = new Map();
  const map = (s) => {
    if (!s || !s.startsWith('/src/')) return s;
    if (cache.has(s)) return cache.get(s);
    const mm = s.match(/^(.*):(\d+):(\d+)$/);
    let out = s;
    if (mm && maps[mm[1]]) {
      const o = maps[mm[1]].originalPositionFor({ line: Number(mm[2]), column: Number(mm[3]) - 1 });
      if (o && o.line) out = `${mm[1].slice(1)}:${o.line}`;
    }
    cache.set(s, out);
    return out;
  };
  for (const r of results) for (const s of r.sites || []) {
    s.site = map(s.site); s.caller = map(s.caller); s.layer = map(s.layer);
    const m = s.site.match(/^(.*):(\d+)$/);
    s.siteText = m ? lineText('/' + m[1], Number(m[2])) : '';
    const l = s.layer.match(/^(.*):(\d+)$/);
    s.layerText = l ? lineText('/' + l[1], Number(l[2])) : '';
  }
}

const vite = await startVite();
log('vite up on', port);
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
const results = [];
try {
  for (const scen of SCENARIOS) for (const orient of ORIENTS) {
    const t = Date.now();
    try {
      results.push(await playOne(browser, scen, orient));
      const r = results[results.length - 1];
      log(scen.id, orient.id, `${((Date.now() - t) / 1000).toFixed(0)}s`, r.error || `${r.spots.length} spots, ${r.frames.length} counted frames, ${r.sites.length} sites`, r.errors.length ? `errors: ${r.errors.slice(0, 2).join(' / ')}` : '');
    } catch (e) {
      log(scen.id, orient.id, 'FAILED', e.message.slice(0, 300));
      results.push({ scenario: scen.id, orient: orient.id, error: e.message.slice(0, 500) });
    }
  }
  await mapSites(results);
} finally {
  await browser.close();
  try { process.kill(-vite.pid); } catch { /* */ }
}
fs.mkdirSync(outDir, { recursive: true });
const gitRev = (() => { try { return fs.readFileSync(path.join(dir, '.git'), 'utf8').trim(); } catch { return ''; } })();
fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify({ build: name, dir, gitRev, settleMs: SETTLE_MS, timeFrames: TIME_FRAMES, countFrames: COUNT_FRAMES, results }));
log('wrote', path.join(outDir, `${name}.json`));
