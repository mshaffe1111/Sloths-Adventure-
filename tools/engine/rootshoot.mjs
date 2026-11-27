/**
 * Stills of World 3's root toy (ENG-ROOT item 2; gen2/rootHarness.ts, the row rootBots.test.ts plays): real game frames, upright 390x844 and
 * sideways 844x390 at 2x, Normal and Easy, Pokey pinned HANGING on the root (p.y = the root's y + HAND_REACH 70, rope.ts), (a) in the dark
 * before the patch and (b) in the patch's lit ring, each shot taken when the ocelot below has walked under him.
 *   node tools/engine/rootshoot.mjs <outDir> <slot id> [port]
 * The toy's id has no STAGE_PLAN entry, so the page lends it a slot: tools/engine/rootBoot.ts, imported before /src/main.tsx (draftshoot.mjs's
 * route), lists the row under <slot> (a stage no shipped row plays) and plants the toy's packed roll as its only seed. Prints what the page
 * BUILT against what the boot laid (D62: the root's ends, the ocelot's patrol). Lessons off so no card covers the art. Shoot on a frozen tree
 * (D115). No stage is named in this file: it is handed one.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const [outDir, slot, portArg] = process.argv.slice(2);
if (!outDir || !slot) { console.error('usage: node tools/engine/rootshoot.mjs <outDir> <slot id> [port]'); process.exit(2); }
const port = Number(portArg || 5199);
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
for (const setting of ['normal', 'easy']) for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript(([s, d]) => { globalThis.__ROOT_SLOT = s; try { localStorage.setItem('sloth_difficulty', d); } catch { /* none */ } }, [slot, setting]);
  await ctx.route(/\/src\/main\.tsx(\?.*)?$/, async (r) => {
    const resp = await r.fetch();
    r.fulfill({ response: resp, body: `import "/tools/engine/rootBoot.ts";\n${await resp.text()}` });
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
  for (let tries = 0; tries < 6 && !ok; tries++) {
    // (vite's first load of a new import can reload the page: every read here tolerates a page whose hooks are not up yet)
    await page.evaluate((s) => typeof window.__play === 'function' && window.__play(s, 1), slot).catch(() => {});
    await sleep(5000);
    ok = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : null; return !!(e && e.currentStage && e.ropes?.some((r) => r.look === 'root')); }).catch(() => false);
  }
  if (!ok) { console.log(slot, setting, o.id, 'no engine, or no root on the built stage'); bad++; await ctx.close(); continue; }
  const info = await page.evaluate(() => {
    const e = window.__engine();
    const r = e.ropes.find((q) => q.look === 'root');
    const oc = (e.cast?.members ?? []).find((m) => m.def.kind === 'ocelot' && Math.abs(m.s.y - r.g0) < 40);
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) {
        const p = this.player;
        p.hanging = true; this.ropeId = r.id; p.x = pin.x; p.y = r.y + 70; p.vx = 0; p.vy = 0;
        if (this.lives < 5) this.lives = 9;
      }
      R.call(this);
    };
    return { laid: globalThis.__ROOT_TOY, built: { root: { x0: r.x0, x1: r.x1, y: r.y, g0: r.g0, speed: r.speed }, ocelot: oc ? { min: Math.round(oc.s.minX), max: Math.round(oc.s.maxX) } : null }, seed: e.currentStage.gen2?.seed };
  });
  const L = info.laid, B = info.built;
  const same = L && L.root.x0 === B.root.x0 && L.root.x1 === B.root.x1 && L.root.y === B.root.y && B.ocelot;
  console.log(`${setting} ${o.id}: LAID seed ${L?.seed} root ${L?.root.x0}..${L?.root.x1} y ${L?.root.y}, ocelot patrol ${L?.ocelot.min}..${L?.ocelot.max}; BUILT seed ${info.seed} root ${B.root.x0}..${B.root.x1} y ${B.root.y} speed ${B.root.speed}, ocelot ${B.ocelot?.min}..${B.ocelot?.max} ${same ? 'SAME' : 'DIFFERS'}`);
  if (!same) { bad++; await ctx.close(); continue; }
  const mid = Math.round((B.root.x0 + B.root.x1) / 2);
  const SHOTS = [{ id: 'dark', x: mid - 300 }, { id: 'lit', x: mid }];
  for (const sh of SHOTS) {
    await page.evaluate((x) => { window.__pin = { x }; }, sh.x);
    // (the ocelot walks its patrol: the shot is taken when it is under him, within 90 px)
    let near = false;
    for (let t = Date.now(); Date.now() - t < 90000 && !near; ) {
      near = await page.evaluate((x) => { const e = window.__engine(); return (e.cast?.members ?? []).some((m) => m.def.kind === 'ocelot' && Math.abs(m.s.x - x) < 90); }, sh.x);
      if (!near) await sleep(250);
    }
    // (the borrowed slot's own stage hints (Dot's card) are no part of the toy: tapped away, as a player does, before the shot)
    for (let k = 0; k < 3; k++) {
      const card = page.getByText(/Tap here when you/);
      if (!(await card.count().catch(() => 0))) break;
      await card.first().click({ timeout: 3000 }).catch(() => {});
      await sleep(600);
    }
    await sleep(400);
    const at = await page.evaluate(() => { const e = window.__engine(); const m = (e.cast?.members ?? []).find((q) => q.def.kind === 'ocelot'); return { hanging: e.player.hanging, x: Math.round(e.player.x), lit: !!e.castHero?.lit, ocelot: m ? `${m.s.phase}@${Math.round(m.s.x)}` : 'none' }; });
    const f = path.join(outDir, `root-${setting}-${o.id}-${sh.id}.png`);
    await page.screenshot({ path: f });
    console.log('shot', f, near ? 'ocelot under' : 'OCELOT NOT UNDER (90 s)', JSON.stringify(at));
    if (!near || !at.hanging) bad++;
  }
  await ctx.close();
}
await browser.close();
vite.kill();
process.exit(bad ? 1 : 0);
