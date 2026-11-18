// DRAFT, NOT A GATE OR A TOOL YET (ENG-24 REPORT "Unresolved"): it draws the recorded run with the page renderer, but the page keeps the
// terrain it baked for the stage it started (2-1), so the toy's banks are not drawn; the fix is a dev fixture the page builds natively
// (chaseFixtureStage.ts's ?fixture= pattern), then this replay. Moved out of tools/inspect so nobody uses it as a working clip.
// tools/inspect/lianaClip.mjs (ENG-24): a liana toy's bot run, drawn by the REAL page. The run is the real engine at 30 fps in Node, the
// press through the game's own InputEngine (reference/qa-reports/ENG-24/clipRecord.ts writes it: Pokey, the clocks and the logs every
// frame at the liana's river, and the stage's pieces); the page (a dev server) is put on World 2 (2-1, its painted river and logs), given
// the toy's pieces, and each recorded frame is set and drawn by the game's own renderer (engine.render, the camera's own follow), then shot.
// Upright 412x915 and sideways 915x412; ffmpeg makes the mp4 at 30 fps and at half speed.
//   node tools/inspect/lianaClip.mjs <port> <record.json> <out dir> <name>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '3105', recFile, out, name] = process.argv.slice(2);
const rec = JSON.parse(readFileSync(recFile, 'utf8'));
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [orient, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const T0 = Date.parse('2026-11-18T17:00:00Z');
  await p.clock.install({ time: T0 });
  await p.clock.pauseAt(T0 + 1000);
  await p.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, rec.setting);
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  const run = async (ms) => { for (let t = 0; t < ms; t += 500) { await p.clock.runFor(500); await p.waitForTimeout(150); } };
  await run(3500);
  await p.evaluate(() => window.__play('2-1', 1));
  await run(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await run(500); } else break; }
  // (the toy's pieces in place of 2-1's: its banks, logs, liana and river; nothing to pick up, no foes, no Dot)
  await p.evaluate((st) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    e.isPaused = true;
    Object.assign(e, { platforms: st.platforms.map((q) => ({ ...q })), vines: st.vines.map((v) => ({ ...v })), ropes: [], collectibles: [], enemies: [] });
    Object.assign(e.currentStage, { rivers: st.rivers, zones: [], checkpoints: [], hints: [] });
    if (e.currentStage.proto) e.currentStage.proto.hints = [];
  }, rec.stage);
  const dir = join(out, `${name}-${orient}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  for (let i = 0; i < rec.frames.length; i++) {
    await p.evaluate((f) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      e.gameTime = f.t; e.vineClock = f.vc;
      Object.assign(e.player, f.p);
      for (const [id, x, y] of f.logs) { const q = e.platforms.find((r) => r.id === id); if (q) { q.x = x; q.y = y; } }
      e.standingOnId = f.on;
      e.updateCamera(1 / 30);
      e.render();
    }, rec.frames[i]);
    await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
  }
  await p.close();
  const mp4 = join(out, `${name}-${orient}.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', mp4]);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp4, '-filter:v', 'setpts=2.0*PTS', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${name}-${orient}-half.mp4`)]);
  console.log(orient, name, rec.frames.length, 'frames ->', mp4);
}
await b.close();
