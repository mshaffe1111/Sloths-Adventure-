// BUILD-24: 2-4's swing-to-log clips, drawn by the REAL page. The run is the real engine at 30 fps in Node through the game's own
// InputEngine (clipRecord24.ts writes it); the page (a dev server) plays 2-4 at the same layout, natively built, so its banks, logs, lianas
// and painted river are the stage's own; each recorded frame (Pokey, the clocks, the logs) is set and drawn by the game's own renderer
// (engine.render, the camera's own follow), then shot. Upright 412x915 and sideways 915x412; ffmpeg makes the mp4 at 30 fps and at half
// speed, one per recorded river. From ENG-24's lianaClip-draft.mjs (its toy could not be built on the page; 2-4 can).
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/BUILD-24/clip24.mjs <port> <rec.json> <out dir> <name>
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port = '5199', recFile, out, name] = process.argv.slice(2);
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
  await p.evaluate((v) => window.__play('2-4', v), rec.variant);
  await run(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await run(500); } else break; }
  const built = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.isPaused = true; return { id: e.currentStage.id ?? e.currentStage.config?.id, diff: localStorage.getItem('sloth_difficulty'), logs: e.platforms.filter((q) => q.type === 'drift').length }; });
  console.log('built', JSON.stringify(built));
  for (const k of rec.rivers) {
    const fr = rec.frames.filter((f) => f.k === k);
    if (!fr.length) continue;
    const dir = join(out, `${name}-r${k}-${orient}-frames`);
    rmSync(dir, { recursive: true, force: true });
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < fr.length; i++) {
      await p.evaluate((f) => {
        let e = window.__engine; if (typeof e === 'function') e = e();
        e.gameTime = f.t; e.vineClock = f.vc;
        Object.assign(e.player, f.p);
        for (const [id, x, y] of f.logs) { const q = e.platforms.find((r) => r.id === id); if (q) { q.x = x; q.y = y; } }
        e.standingOnId = f.on;
        e.updateCamera(1 / 30);
        e.render();
      }, fr[i]);
      await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
    }
    const mp4 = join(out, `${name}-r${k}-${orient}.mp4`);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', mp4]);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', mp4, '-filter:v', 'setpts=2.0*PTS', '-r', '30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', join(out, `${name}-r${k}-${orient}-half.mp4`)]);
    console.log(orient, name, 'river', k, fr.length, 'frames ->', mp4);
  }
  await p.close();
}
await b.close();
