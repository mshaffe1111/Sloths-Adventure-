/**
 * The stone check (Matt, 2026-11-05 10:39 AM ET: "Rocks can't float"): every stone piece the game DRAWS, with what the renderer paints
 * under it. It runs the real game (its own vite dev server, Chromium) and, for each build, draws the world's own layers onto a clear
 * canvas (engine.ts supportProbe) and reads the draw (tools/engine/stoneprobe.js): the art each piece is painted with gives its
 * material, and the paint under it gives its support. A stone piece with open air under it floats.
 *
 *   node tools/engine/stonecheck.mjs                       all 102 stages, layouts 1-4, both settings; gate: fails on any floating stone
 *                                                          not in tools/engine/stoneknown.json (which may only shrink)
 *   STONE_LAYOUTS=16 node tools/engine/stonecheck.mjs      16 layouts (the defect count's measure)
 *   STONE_STAGES=7-1,9-1 STONE_OUT=/tmp/x.json ...         some stages; the raw rows to a file
 *   STONE_STILL=9-1:1:normal:x,y,w,h ...                   also a still of that window (probe draw and the full game draw)
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// (playwright is installed globally in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const NL = +(process.env.STONE_LAYOUTS || 4);
const PAGES = +(process.env.STONE_PAGES || 3);
const SETTINGS = (process.env.STONE_SETTINGS || 'normal,easy').split(',');

const port = await freePort();
const vite = spawn('npx', ['vite', '--port', String(port), '--host', '127.0.0.1', '--strictPort'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], detached: true });
let vout = '';
vite.stdout.on('data', (d) => (vout += d)); vite.stderr.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const stop = () => { try { process.kill(-vite.pid); } catch { /* */ } };
process.on('exit', stop);

// the stage list: the game's own
const ids = process.env.STONE_STAGES ? process.env.STONE_STAGES.split(',') : JSON.parse(await new Promise((res, rej) => {
  const p = spawn('npx', ['tsx', '-e', "import './src/game/headlessDom.ts'; import { generateAllLevels } from './src/game/worldsData.ts'; console.log(JSON.stringify(generateAllLevels().map((l) => l.id)))"], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
  let o = ''; p.stdout.on('data', (d) => (o += d)); p.on('exit', (c) => (c ? rej(new Error('stage list')) : res(o.trim().split('\n').pop())));
}));
const jobs = [];
for (const id of ids) for (const setting of SETTINGS) for (let v = 1; v <= NL; v++) jobs.push({ id, setting, v });

const browser = await chromium.launch();
const probeSrc = fs.readFileSync(path.join(here, 'stoneprobe.js'), 'utf8');
async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(probeSrc);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { if (process.env.STONE_VERBOSE) console.log('pageerror', e.message.slice(0, 160)); });
  await page.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
  for (let t0 = Date.now(); Date.now() - t0 < 300000; await sleep(500)) if (await page.evaluate(() => typeof window.__play === 'function').catch(() => false)) break;
  await sleep(1500);
  return page;
}
async function build(page, j) {
  return page.evaluate(async ({ id, setting, v }) => {
    localStorage.setItem('sloth_difficulty', setting);
    const before = (typeof window.__engine === 'function' ? (typeof window.__engine === 'function' ? window.__engine() : window.__engine) : window.__engine)?.currentStage;
    window.__play(id, v);
    // the stage is built and its sheets are in (stageReady.ts holds the start until they are)
    for (let i = 0; i < 400; i++) {
      await new Promise((r) => setTimeout(r, 50));
      const e = (typeof window.__engine === 'function' ? (typeof window.__engine === 'function' ? window.__engine() : window.__engine) : window.__engine);
      if (e && e.currentStage && e.currentStage !== before && e.currentStage.config.id === id && e.paintKit !== undefined) {
        // (the painted kit and the frames it waits on: protoArtReady, and a beat for the sheets that follow it)
        const art = await import('/src/game/protoArt.ts');
        for (let k = 0; k < 200 && !art.protoArtReady(); k++) await new Promise((r) => setTimeout(r, 50));
        await new Promise((r) => setTimeout(r, 400));
        return true;
      }
    }
    return false;
  }, j);
}
const rows = [];
const crops = {};
let done = 0;
const t0 = Date.now();
async function worker() {
  let page = await newPage();
  for (;;) {
    const j = jobs.shift();
    if (!j) break;
    let r = null;
    for (let tries = 0; tries < 2 && !r; tries++) {
      try {
        if (!(await build(page, j))) throw new Error('stage did not start');
        r = await page.evaluate((crops) => window.__stoneProbe({ scale: 0.5, crops }), !!process.env.STONE_CROPS);
        if (process.env.STONE_CROPS) { const cr = await page.evaluate(() => { const c = window.__stoneCrops || {}; window.__stoneCrops = {}; return c; }); for (const [k, v] of Object.entries(cr)) crops[k] ??= v; }
      } catch (e) {
        r = null;
        if (tries) rows.push({ ...j, error: String(e.message).slice(0, 200) });
        await page.context().close().catch(() => {});
        page = await newPage();
      }
    }
    if (r) rows.push({ ...j, ...r });
    if (++done % 25 === 0) console.log(`  ${done} builds, ${Math.round((Date.now() - t0) / 1000)} s`);
  }
  await page.context().close().catch(() => {});
}
// a still on request (the by-eye proof): probe draw and full draw of a window
if (process.env.STONE_STILL) {
  const page = await newPage();
  for (const spec of process.env.STONE_STILL.split(';')) {
    const [id, v, setting, box, tag] = spec.split(':');
    const [x, y, w, h] = box.split(',').map(Number);
    await build(page, { id, setting, v: +v });
    for (const full of [false, true]) {
      const url = await page.evaluate(({ x, y, w, h, full }) => window.__stoneStill(x, y, w, h, 1, full), { x, y, w, h, full });
      const f = path.join(process.env.STONE_STILL_DIR || '.', `${tag || id + '-' + v}-${full ? 'game' : 'probe'}.png`);
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
      console.log('still', f);
    }
  }
  await browser.close(); stop(); process.exit(0);
}
await Promise.all(Array.from({ length: PAGES }, worker));
await browser.close();
stop();

if (process.env.STONE_OUT) fs.writeFileSync(process.env.STONE_OUT, JSON.stringify(rows));
if (process.env.STONE_CROPS) fs.writeFileSync(process.env.STONE_CROPS, JSON.stringify(crops));
// ---- judge -------------------------------------------------------------------------------------------------------------------
const errs = rows.filter((r) => r.error);
const floats = [];
const byWorld = new Map();
for (const r of rows) {
  if (r.error) continue;
  const w = byWorld.get(r.world) || { builds: 0, stone: 0, float: 0 };
  w.builds++;
  for (const p of r.pieces) if (p.mat === 'stone') { w.stone++; if (!p.held) { w.float++; floats.push(`${r.id} ${r.setting} ${r.v} #${p.id}`); } }
  byWorld.set(r.world, w);
}
console.log(`stone check: ${rows.length - errs.length} builds (${ids.length} stages x ${SETTINGS.length} settings x ${NL} layouts) in ${Math.round((Date.now() - t0) / 1000)} s`);
for (const [w, s] of [...byWorld].sort((a, b) => a[0] - b[0])) console.log(`  W${w}: ${s.stone} stone pieces drawn, ${s.float} with open air under them (${s.builds} builds)`);
for (const e of errs) console.log(`  ✗ ${e.id} ${e.setting} ${e.v}: ${e.error}`);
const knownFile = path.join(here, 'stoneknown.json');
const known = new Set(fs.existsSync(knownFile) ? JSON.parse(fs.readFileSync(knownFile, 'utf8')) : []);
const fresh = floats.filter((k) => !known.has(k));
if (process.env.STONE_WRITE_KNOWN) { fs.writeFileSync(knownFile, JSON.stringify(floats.sort(), null, 0) + '\n'); console.log(`  wrote ${floats.length} known floaters`); }
else if (!process.env.STONE_STAGES && (fresh.length || errs.length)) {
  console.log(`✗ ${fresh.length} floating stone pieces not on the known list` + (fresh.length ? ': ' + fresh.slice(0, 20).join(', ') : ''));
  process.exit(1);
} else console.log(fresh.length ? `  (${fresh.length} floating, a partial run judges nothing)` : '✓ no floating stone off the known list');
