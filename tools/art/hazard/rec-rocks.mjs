// A recording of a World 4 stage's falling rocks in the real game (2026-10-29, hazard-anim): Pokey stands just short of a drop point
// (out of its reach, so it never hits him) while it runs through its cycles: the warning, the fall, the shatter. Upright 390x844 and
// sideways 844x390, stepped 1/30 s at a time on Playwright's clock and shot frame by frame, so the mp4 is exactly the game at 30 fps.
// Needs the dev server on <port>.
//   node tools/art/hazard/rec-rocks.mjs <port> <out dir> <tag> [stage] [rock index] [seconds]   (writes <tag>-up.mp4 and <tag>-side.mp4)
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '5173', out = '.', tag = 'rocks', stage = '4-4', idx = '0', secs = '10.5'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [name, w, h] of [['side', 844, 390], ['up', 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate((s) => window.__play(s), stage);
  await p.waitForTimeout(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
  const info = await p.evaluate((k) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const rocks = (e.proto?.w4?.rocks ?? []).filter((r) => !r.air);
    const r = rocks[Number(k)];
    Object.assign(e.player, { x: r.x - 120, y: r.land, vx: 0, vy: 0, facing: 1 });
    e.w4.rockWarned = true;
    return { r, n: rocks.length };
  }, idx);
  console.log(name, JSON.stringify(info));
  await p.waitForTimeout(3000);
  const dir = join(out, `${tag}-${name}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  // the page's clock is taken over and moved on 1/30 s between shots, so every frame is one game step at 30 fps however slow the shot
  await p.clock.install();
  const n = Math.round(Number(secs) * 30);
  const frames = [];
  for (let i = 0; i < n; i++) {
    await p.clock.runFor(1000 / 30);
    const fn = `f${String(i).padStart(5, '0')}.png`;
    await p.screenshot({ path: join(dir, fn) });
    frames.push(fn);
  }
  await p.close();
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${tag}-${name}.mp4`)]);
  if (process.env.KEEP) console.log(dir); else rmSync(dir, { recursive: true, force: true });
  console.log(name, frames.length, 'frames');
}
await b.close();
