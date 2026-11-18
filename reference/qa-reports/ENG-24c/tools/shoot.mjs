// ENG-24c: draw recorded 2-4 frames with the REAL page (a dev server on the scratch tree), upright 412x915 and sideways 915x412, as
// BUILD-24's clip24.mjs does (each frame: Pokey, the clocks, the logs, and the drawn glow sweetGlow set, then engine.render).
//   node shoot.mjs <port> <rec.json> <out dir> <name> [frame tags to keep, comma] [stills: idx,idx]
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '5199', recFile, out, name, tags = '', stillsArg = ''] = process.argv.slice(2);
const rec = JSON.parse(readFileSync(recFile, 'utf8'));
const keepTags = tags ? tags.split(',') : null;
const frames = rec.frames.filter((f) => !keepTags || keepTags.includes(f.tag));
const stills = stillsArg ? stillsArg.split(',').map(Number) : [];
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [orient, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const T0 = Date.parse('2026-11-18T22:00:00Z');
  await p.clock.install({ time: T0 });
  await p.clock.pauseAt(T0 + 1000);
  await p.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, rec.setting);
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  const run = async (ms) => { for (let t = 0; t < ms; t += 500) { await p.clock.runFor(500); await p.waitForTimeout(150); } };
  await run(3500);
  await p.evaluate((v) => window.__play('2-4', v), rec.variant);
  await run(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await run(500); } else break; }
  const built = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.isPaused = true; return { id: e.currentStage.id ?? e.currentStage.config?.id, diff: localStorage.getItem('sloth_difficulty'), easy: e.easy, logs: e.platforms.filter((q) => q.type === 'drift').length, rafts: e.platforms.filter((q) => q.drift?.look === 'raft').length }; });
  console.log(orient, 'built', JSON.stringify(built));
  const dir = join(out, `${name}-${orient}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < frames.length; i++) {
    await p.evaluate((f) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      e.gameTime = f.t; e.vineClock = f.vc; e.sweetGlow = f.sg;
      Object.assign(e.player, f.p);
      for (const [id, x, y] of f.logs) { const q = e.platforms.find((r) => r.id === id); if (q) { q.x = x; q.y = y; } }
      e.standingOnId = f.on;
      for (const [id, a] of f.va ?? []) { const v = e.vines.find((q) => q.id === id); if (v) v.swingAngle = a; }
      e.updateCamera(1 / 30);
      e.render();
    }, frames[i]);
    await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
    if (stills.includes(i)) await p.screenshot({ path: join(out, `${name}-${orient}-${String(i).padStart(4, '0')}.png`) });
  }
  const mp4 = join(out, `${name}-${orient}.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', mp4]);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp4, '-filter:v', 'setpts=2.0*PTS', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${name}-${orient}-half.mp4`)]);
  console.log(orient, name, frames.length, 'frames ->', mp4);
  await p.close();
}
await b.close();
