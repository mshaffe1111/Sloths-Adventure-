/**
 * ENG-26 stills and a clip of the wheel toy on the real page (a dev vite, 2-6's World 2 look under it): the toy's laid stage (dumpToy.ts)
 * swapped into the running engine, its wheel started by the real piece (pieces/wheelPiece.ts, placeholder code shapes: wheelDraw.ts), Pokey
 * set on the jetty, then the game plays: a tap hop in, the ride up, the step off (edge: a tap hop as the bucket comes level; in: the ride
 * sets him down; top: a held jump at the top). Frames every 0.5 s of game play, upright 390x844 and sideways 844x390, dsf 1.
 *   node reference/qa-reports/ENG-26/stills.mjs <outDir> <toy.json> <name> <edge|in|up> [port]
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const [outDir, toyFile, name, street, portArg] = process.argv.slice(2);
const port = Number(portArg || 5207);
fs.mkdirSync(outDir, { recursive: true });
const toy = JSON.parse(fs.readFileSync(toyFile, 'utf8'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
const browser = await chromium.launch();
for (const o of [{ id: 'land', viewport: { width: 844, height: 390 } }, { id: 'port', viewport: { width: 390, height: 844 } }]) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) { if (await page.evaluate(() => typeof window.__play === 'function')) break; await sleep(1000); }
  await sleep(2000);
  await page.evaluate(() => window.__play('2-6'));
  await sleep(5000);
  const info = await page.evaluate((toy) => {
    const e = window.__engine();
    // (the buckets' one wheel, made shared again after JSON)
    const wheels = new Map();
    const plats = toy.platforms.map((p) => {
      if (!p.wheel) { const q = { ...p }; delete q.wheel; return q; }
      const k = `${p.wheel.w.cx},${p.wheel.w.cy}`;
      if (!wheels.has(k)) wheels.set(k, p.wheel.w);
      return { ...p, wheel: { w: wheels.get(k), i: p.wheel.i } };
    });
    e.platforms.length = 0;
    e.platforms.push(...plats);
    e.vines.length = 0;
    e.vines.push(...toy.vines);
    const st = e.currentStage;
    Object.assign(st, { platforms: e.platforms, vines: e.vines, rivers: toy.rivers, collectibles: [], checkpoints: [], zones: [] });
    if (e.collectibles) e.collectibles.length = 0;
    if (e.enemies) e.enemies.length = 0;
    // (as RealPlay.bare: no World 4 or village pieces of the stage under it; the toy's own walls)
    Object.assign(e, { proto: null, w4: null });
    e.walls = e.mode.bounds({ levelWidth: 100000, exit: { x: 0, y: st.exitTotemY }, spawn: { x: st.spawnX, y: st.spawnY } });
    e.startPieces();
    const w = [...wheels.values()][0];
    const jetty = e.platforms.find((p) => p.id === w.lay.jetty);
    const lip = w.way > 0 ? jetty.x + jetty.width : jetty.x;
    const p = e.player;
    Object.assign(p, { x: lip - w.way * 40, y: jetty.y, vx: 0, vy: 0, grounded: true, climbing: false, isVineSwinging: false, hanging: false, invincibleTimer: 1e9 });
    e.standingOnId = jetty.id;
    e.lives = 9;
    return { way: w.way, cx: w.cx, cy: w.cy, R: w.R };
  }, toy);
  console.log(o.id, JSON.stringify(info));
  const dir = info.way > 0 ? 'right' : 'left';
  const press = (ms) => page.evaluate(([d, ms]) => { const e = window.__engine(); e.input.triggerTouchMove(d); e.input.triggerTouchUp(0, ms); }, [dir, ms]);
  const release = () => page.evaluate(() => { const e = window.__engine(); e.input.releaseTouchUp(); e.input.triggerTouchMove('none'); });
  const where = () => page.evaluate(() => { const e = window.__engine(); const q = e.platforms.find((pp) => pp.id === e.standingOnId); const w = e.platforms.find((pp) => pp.wheel)?.wheel?.w; const ph = q?.wheel ? ((((w.V / w.R) * e.gameTime + 2 * Math.PI * q.wheel.i / w.N - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI : null; return { on: q ? (q.wheel ? 'bucket' : q.id === w.lay.streetId ? 'street' : q.id === w.lay.jetty ? 'jetty' : 'p' + q.id) : 'air', past: ph, t: e.gameTime }; });
  // board: a tap hop toward the wheel
  await sleep(800);
  await press(80);
  await sleep(150);
  await release();
  let k = 0, done = false, stepped = false;
  for (let i = 0; i < 34 && !done; i++) {
    const at = await where();
    const f = path.join(outDir, `${name}-${o.id}-${String(k++).padStart(2, '0')}-${at.on}.png`);
    await page.screenshot({ path: f });
    console.log('frame', f, JSON.stringify(at));
    if (at.on === 'street' && stepped !== 'late') { stepped = 'late'; continue; }
    if (stepped === 'late') done = true;
    // the step off inside the flown window: edge a tap hop from past -0.02 (the table's tap), up a held jump from -0.48
    if (at.on === 'bucket' && at.past !== null && !stepped) {
      if (street === 'edge' && at.past > 0.15 && at.past < 0.9) { await press(80); await sleep(120); await release(); stepped = true; }
      if (street === 'up' && at.past > -0.3 && at.past < 0.3) { await press(500); await sleep(450); await release(); stepped = true; }
    }
    await sleep(500);
  }
  await ctx.close();
}
await browser.close();
vite.kill();
