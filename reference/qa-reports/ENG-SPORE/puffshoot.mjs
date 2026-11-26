// ENG-SPORE stills: the toy's row (sporeBots.test, 3-1 draft roll 1): Pokey pinned 30 px from the dark drop rim, its shelf's puff dark,
// warning and lit (the beat set per still). node puffshoot.mjs <worktree> <outDir> <port>
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
const probe = 'clockLitAt(l.clock, t)';
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
  const pk = await page.evaluate(async (RIM) => {
    const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
    const s = e.currentStage;
    const { darkRims, DARK_ZONE, DARK_GLOW } = await import('/src/game/gen2/dark.ts');
    const { sporeZoneOn, puffLight } = await import('/src/game/gen2/spore.ts');
    const R = Object.getPrototypeOf(e).render;
    e.render = function () {
      const pin = window.__pin;
      if (pin && this.player) {
        const p = this.player; p.x = pin.x; p.y = pin.y; p.vx = 0; p.vy = 0; p.grounded = true; p.facing = pin.facing;
        if (this.lives < 5) this.lives = 9;
        this.glowStill = 0;
      }
      R.call(this);
    };
    // (the toy's row, sporeBots.test: the dark drop rim, its landing's glowworm turned into the shelf's puff by the brick's builders)
    const rim = darkRims(s).find((q) => q.x === RIM.x && Math.round(q.y) === RIM.y && q.dir === RIM.dir);
    if (!rim || !rim.light) return null;
    const puff = sporeZoneOn(rim.onto, {}, () => 0);
    s.zones.push(puff);
    const l = rim.light;
    delete l.id; delete l.sleep;
    Object.assign(l, puffLight(puff, rim.land.x, DARK_ZONE.lightUp, DARK_GLOW.light));
    window.__puff = { puff, light: l };
    return { x: Math.round(rim.x - rim.dir * 30), y: rim.y, facing: rim.dir, land: rim.land, light: { x: l.x, y: l.y }, seed: s.gen2?.seed };
  }, { x: 846, y: 927, dir: -1 });
  console.log(o.id, JSON.stringify(pk));
  if (!pk) { await ctx.close(); continue; }
  await page.evaluate((p) => { window.__pin = p; }, pk);
  await sleep(Number(process.env.SETTLE_MS || 3000));
  // (each still at a set point of the puff's beat: its zone's and its light's offsets set together, so the cloud and the light agree)
  for (const [name, at] of [['dark', 1.6], ['warn', 3.7], ['lit', 5.2]]) {
    await page.evaluate((at) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
      const { puff, light } = window.__puff;
      const off = (((at - e.gameTime) % puff.period) + puff.period) % puff.period;
      puff.offset = off; light.clock.offset = off;
    }, at);
    await sleep(350);
    await page.screenshot({ path: path.join(outDir, `${id}-${o.id}-puff-${name}.png`) });
  }
  await ctx.close();
}
await browser.close();
vite.kill('SIGTERM');
await sleep(1500);
try { execSync(`fuser -k ${port}/tcp`); } catch {}
console.log('done');
process.exit(0);
