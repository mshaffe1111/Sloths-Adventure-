// Before/after videos of the repeating effects swept on hazard-anim (2026-10-29): each scene plays a stage, puts Pokey where the effect
// is, then records it at a true 30 fps (the page's clock stepped 1/30 s at a time, a screenshot per step) upright 390x844 and sideways
// 844x390. Run it against a dev server of the base branch for "before" and of this branch for "after".
//   node tools/art/hazard/rec.mjs <port> <out dir> <tag> <scene,...> [seconds]   (writes <tag>-<scene>-side.mp4 and -up.mp4)
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '5173', out = '.', tag = 'after', which = '', secs = '6'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// (a ledge under x: the highest platform top at x, at or below y)
const LEDGE = `const ledge = (x, y = -1e9) => { const ps = e.platforms.filter((p) => !p.broken && p.x < x && p.x + p.width > x && p.y >= y).sort((a, b) => a.y - b.y); return ps[0]; };`;
const ZONE = (kind, dx = 0) => `const z = e.currentStage.zones.find((q) => q.kind === '${kind}'); const x = (z.x0 + z.x1) / 2 + ${dx};
  const pl = ledge(x, (z.baseY ?? z.top ?? 0) - 300); Object.assign(e.player, { x, y: pl ? pl.y : z.baseY, vx: 0, vy: 0 });`;
const HOLD = `setInterval(() => { e.player.invincibleTimer = 9; }, 100);`;
const SCENES = {
  // World 2: the river's current and the foam where the logs ride (2-1)
  river: { stage: '2-1', setup: `const r = e.currentStage.rivers[0]; const x = r.x0 - 60; const pl = ledge(x, r.surfaceY - 400) ?? ledge(r.x0 - 120);
      Object.assign(e.player, { x: pl ? Math.min(x, pl.x + pl.width - 30) : x, y: pl ? pl.y : r.surfaceY - 60, vx: 0, vy: 0 });` },
  // World 2's petals drifting (2-2)
  petals: { stage: '2-2', setup: `` },
  // World 9's embers (9-1), World 10's storm (10-1)
  embers: { stage: '9-1', setup: `` },
  storm: { stage: '10-1', setup: `` },
  // World 5: a teapot puffing its sleepy steam
  teapot: { stage: '5-9', setup: `const pot = e.proto.w5.pots[0]; const pl = ledge(pot.x - 140, pot.y - 200);
      Object.assign(e.player, { x: pot.x - 140, y: pl ? pl.y : pot.y, vx: 0, vy: 0 });` },
  // a zone, by kind, on a stage that has one: Pokey stood in its middle (spore clouds 3-1, dew on the webs 5-6, the tide 6-5, wind 4-4)
  spores: { stage: '3-1', setup: ZONE('spore') },
  dew: { stage: '5-6', setup: ZONE('web') },
  tide: { stage: '6-5', setup: ZONE('tide', -140) },
  wind: { stage: '4-4', setup: ZONE('wind') },
  // World 5: standing still, the silk creeping up him (5-2)
  silk: { stage: '5-2', setup: `` , wait: 1500 },
  // Dot's flight (4-D): the gusts, the mist, her hover
  dotflight: { stage: '4-D', setup: `` },
  // 4-6: the glow on the mist's spots, and its motes
  settle: { stage: '4-6', setup: `const s = e.proto.w4.patience.find((q) => q.kind === 'mist'); Object.assign(e.player, { x: s.x0 - 120, y: s.y, vx: 0, vy: 0 });` },
  // the Sky Sovereign's fight (4-10): her drop warnings, the stones, her shadow
  boss: { stage: '4-10', setup: ``, wait: 9000 },
  // the other bosses' attacks (round 3): lava columns (9-10), falling rocks and ground shocks (7-10), thrown clubs (10-10), the mud
  // shock and spear thrust (6-10), slash waves (8-10). Pokey kept from harm so the fight runs on
  boss9: { stage: '9-10', setup: HOLD, wait: 9000 },
  boss7: { stage: '7-10', setup: HOLD, wait: 9000 },
  boss10: { stage: '10-10', setup: HOLD, wait: 9000 },
  boss6: { stage: '6-10', setup: HOLD, wait: 9000 },
  boss8: { stage: '8-10', setup: HOLD, wait: 9000 },
};

const b = await chromium.launch();
for (const name of which.split(',').filter(Boolean)) {
  const sc = SCENES[name];
  // (ORI=side or ORI=up records one way only)
  for (const [ori, w, h] of [['side', 844, 390], ['up', 390, 844]].filter(([o]) => !process.env.ORI || process.env.ORI === o)) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    p.on('pageerror', (er) => console.log('ERR', er.message));
    await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
    await p.waitForTimeout(2500);
    await p.evaluate((s) => window.__play(s), sc.stage);
    await p.waitForTimeout(6000);
    for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
    const err = await p.evaluate(`(() => { try { let e = window.__engine; if (typeof e === 'function') e = e(); ${LEDGE} ${sc.setup} return ''; } catch (x) { return String(x); } })()`);
    if (err) console.log(name, ori, 'setup:', err);
    await p.waitForTimeout(Number(process.env.WAIT ?? sc.wait ?? 5000));
    const dir = join(out, `${tag}-${name}-${ori}-frames`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir);
    await p.clock.install();
    const n = Math.round(Number(secs) * 30);
    for (let i = 0; i < n; i++) {
      await p.clock.runFor(1000 / 30);
      await p.screenshot({ path: join(dir, `f${String(i).padStart(5, '0')}.png`) });
    }
    await p.close();
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-crf', '26', '-pix_fmt', 'yuv420p', join(out, `${tag}-${name}-${ori}.mp4`)]);
    if (!process.env.KEEP) rmSync(dir, { recursive: true, force: true });
    console.log(name, ori, n, 'frames');
  }
}
await b.close();
