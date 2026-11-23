/**
 * Stills of a DRAFT stage (ENG-W3a 11-23; stageTable.ts DRAFT_TABLE): real game frames of the draft the game would play once it is
 * listed, upright 390x844 and sideways 844x390, at 2x, Pokey pinned on standable wood at spots along the way (down a shaft: top to floor).
 *   node tools/engine/draftshoot.mjs <outDir> <draft id> [port] [fractions, e.g. 0.1,0.35,0.6,0.9]
 * Starts its own vite (dev: window.__play / __engine), and readies the draft in the page BEFORE the game's entry runs: the page's
 * /src/main.tsx is served with tools/engine/draftBoot.ts imported first (draftReady.ts, the readying the tools use), the draft's id
 * set on the page first. Prints what the game BUILT (D62): its travel, its flow, its seed. Lessons off so no card covers the art.
 * Shoot it on a frozen tree (D115). No stage is named in this file: it is handed one.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
// (playwright is global in the container: require() finds it through NODE_PATH, an ESM import does not)
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const [outDir, id, portArg, frArg] = process.argv.slice(2);
if (!outDir || !id) { console.error('usage: node tools/engine/draftshoot.mjs <outDir> <draft id> [port] [fractions]'); process.exit(2); }
const port = Number(portArg || 5198);
const FR = (frArg || '0.1,0.35,0.6,0.9').split(',').map(Number);
fs.mkdirSync(outDir, { recursive: true });
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
let bad = 0;
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { globalThis.__GEN2_DRAFT = d; }, id);
  // (the draft readied before the game's entry: its first import)
  await ctx.route(/\/src\/main\.tsx(\?.*)?$/, async (r) => {
    const resp = await r.fetch();
    r.fulfill({ response: resp, body: `import "/tools/engine/draftBoot.ts";\n${await resp.text()}` });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.log('pageerror', e.message.slice(0, 200)));
  await page.goto(`http://127.0.0.1:${port}/?layout=1&lessons=off`, { timeout: 300000 });
  for (let t = Date.now(); Date.now() - t < 300000; ) {
    if (await page.evaluate(() => typeof window.__play === 'function')) break;
    await sleep(1000);
  }
  await sleep(3000);
  let ok = false;
  for (let tries = 0; tries < 3 && !ok; tries++) {
    await page.evaluate((s) => window.__play(s, 1), id);
    await sleep(5000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return !!(e && e.currentStage); });
  }
  if (!ok) { console.log(id, o.id, 'no engine'); bad++; continue; }
  const info = await page.evaluate((fr) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const plats = (s.platforms || []).filter((p) => p.type === 'solid' && p.width >= 120 && !p.broken);
    const sorted = [...plats].sort((a, b) => a.y - b.y || a.x - b.x);
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) { const p = this.player; p.x = pin.x; p.y = pin.y - (p.height || 40); p.vx = 0; p.vy = 0; if (this.lives < 5) this.lives = 9; }
      R.call(this);
    };
    return {
      travel: s.config?.travel, flow: s.gen2?.graph?.flow, seed: s.gen2?.seed, height: Math.round(Math.max(...plats.map((p) => p.y)) - Math.min(...plats.map((p) => p.y))),
      spots: fr.map((f) => { const p = sorted[Math.round(f * (sorted.length - 1))]; return { x: Math.round(p.x + Math.min(p.width / 2, 80)), y: p.y }; }),
    };
  }, FR);
  console.log(`${id} ${o.id}: BUILT travel ${info.travel}, flow ${info.flow}, seed ${info.seed}, ${info.height} px from top to floor`);
  if (info.flow !== 'down' && info.travel !== undefined && info.travel !== 'right') bad++;
  for (let i = 0; i < info.spots.length; i++) {
    await page.evaluate((p) => { window.__pin = p; }, info.spots[i]);
    await sleep(Number(process.env.SETTLE_MS || 2500));
    const f = path.join(outDir, `${id}-${o.id}-${Math.round(FR[i] * 100)}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, JSON.stringify(info.spots[i]));
  }
  await ctx.close();
}
await browser.close();
vite.kill();
process.exit(bad ? 1 : 0);
