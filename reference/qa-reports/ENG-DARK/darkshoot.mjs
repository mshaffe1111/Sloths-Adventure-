// ENG-DARK-c stills: draftshoot.mjs's harness (vite + the draft readied before the game's entry), pinned at real dark rims of 3-1's draft.
// node darkshoot.mjs <worktree> <outDir> <port> [rimFractions]
// Per rim, per orientation: ASLEEP (his stillness held at 0 so nothing wakes) and LIT (the stop let run DARK_AHEAD.normal + 0.5 s of
// game time past the wake), Pokey 30 px inside the rim, facing it.
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [root, outDir, portArg, frArg] = process.argv.slice(2);
const port = Number(portArg);
const FR = (frArg || '0.2,0.6').split(',').map(Number);
fs.mkdirSync(outDir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// (the vite rule, CI #78: refuse a busy port)
try { execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`); console.log('PORT BUSY', port); process.exit(3); } catch {}
const vite = spawn('npx', ['vite', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] });
process.on('exit', () => { try { vite.kill('SIGTERM'); execSync(`fuser -k ${port}/tcp 2>/dev/null`); } catch {} });
let vout = '';
vite.stdout.on('data', (d) => (vout += d));
vite.stderr.on('data', (d) => (vout += d));
for (let i = 0; i < 120 && !/Local:|ready in/.test(vout); i++) await sleep(500);
// (the served tree is the one asked for: the dev server's dark.ts is the worktree's)
const served = await (await fetch(`http://127.0.0.1:${port}/src/game/gen2/dark.ts`)).text();
const mine = fs.readFileSync(path.join(root, 'src/game/gen2/dark.ts'), 'utf8');
const probe = 'export function darkGaps';
const lpid = execSync(`lsof -iTCP:${port} -sTCP:LISTEN -t`).toString().trim().split('\n')[0];
const lcwd = lpid ? fs.readlinkSync(`/proc/${lpid}/cwd`) : '';
if (!served.includes(probe) || !mine.includes(probe) || path.resolve(lcwd) !== path.resolve(root)) { console.log('SERVED TREE MISMATCH', lcwd); vite.kill(); process.exit(4); }
console.log('served', lcwd, 'pid', lpid);

const browser = await chromium.launch();
const ORIENTS = [
  { id: 'port', viewport: { width: 390, height: 844 } },
  { id: 'land', viewport: { width: 844, height: 390 } },
];
const id = '3-1';
for (const o of ORIENTS) {
  const ctx = await browser.newContext({ viewport: o.viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/script\.google\.com/, (r) => r.abort());
  await ctx.addInitScript((d) => { globalThis.__GEN2_DRAFT = d; }, id);
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
  if (!ok) { console.log(o.id, 'no engine'); continue; }
  const info = await page.evaluate(async (fr) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const { darkRims } = await import('/src/game/gen2/dark.ts');
    const rims = darkRims(s).filter((r) => r.land.y - r.y >= 150 && r.light).sort((a, b) => a.y - b.y || a.x - b.x);
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) {
        const p = this.player; p.x = pin.x; p.y = pin.y; p.vx = 0; p.vy = 0; p.grounded = true; p.facing = pin.facing;
        if (this.lives < 5) this.lives = 9;
        if (window.__asleep) this.glowStill = 0;
      }
      R.call(this);
    };
    return {
      seed: s.gen2?.seed, flow: s.gen2?.graph?.flow, nRims: rims.length,
      picks: fr.map((f) => { const r = rims[Math.round(f * (rims.length - 1))]; return { x: Math.round(r.x - r.dir * 30), y: r.y, facing: r.dir, rimX: r.x, land: r.land, light: { x: r.light.x, y: r.light.y, id: r.light.id } }; }),
    };
  }, FR);
  console.log(`${o.id}: seed ${info.seed} flow ${info.flow}, ${info.nRims} drop rims with a light`);
  for (let i = 0; i < info.picks.length; i++) {
    const pk = info.picks[i];
    // ASLEEP: every wake cleared, stillness held at 0
    await page.evaluate((p) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; e.glowWake.clear(); window.__asleep = true; window.__pin = p; }, pk);
    await sleep(Number(process.env.SETTLE_MS || 3000));
    const a = path.join(outDir, `${id}-${o.id}-rim${i}-asleep.png`);
    await page.screenshot({ path: a });
    const t0 = await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; window.__asleep = false; return e.gameTime; });
    // LIT: wait until the landing's light has been lit DARK_AHEAD.normal (1 s) + 0.5 s of game time
    let woke = null, now = t0;
    for (let k = 0; k < 200; k++) {
      await sleep(100);
      const st = await page.evaluate((lid) => { const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine; return { w: e.glowWake.get(lid), t: e.gameTime }; }, pk.light.id);
      now = st.t; woke = st.w ?? null;
      if (woke !== null && now - woke >= 1.5) break;
    }
    const b = path.join(outDir, `${id}-${o.id}-rim${i}-lit.png`);
    await page.screenshot({ path: b });
    console.log('rim', i, JSON.stringify(pk), 'stopped', (now - t0).toFixed(2), 's; landing light woke at +', woke === null ? 'NEVER' : (woke - t0).toFixed(2), 's');
  }
  await ctx.close();
}
await browser.close();
vite.kill('SIGTERM');
await sleep(1500);
try { execSync(`fuser -k ${port}/tcp`); } catch {}
console.log('done');
process.exit(0);
