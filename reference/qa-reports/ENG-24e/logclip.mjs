// ENG-24h: a log drifting into 2-4's reed clump (the drawn end of a river's tail, riverArt.ts drawRiverTailEnd), beat 4 (safe) and beat 6
// (deep), upright 412x915, on the REAL page, stepped 1/30 s at a time on Playwright's clock and shot frame by frame (vineFeelClip.mjs's
// way), so each mp4 is the game at 30 fps. Pokey stands on the far bank; the view is held on the logs' end (the camera's own place for
// him there, then held), so the whole action is in frame: the log coming in, going under the reeds, the next one following. A replay's save
// (2-4's halfway line already heard), so his line does not cover the reeds.
//   node reference/qa-reports/ENG-24e/logclip.mjs <port> <out dir> [seconds]
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const pw = await import(process.env.PW ?? 'playwright');
const chromium = pw.chromium ?? pw.default.chromium;
const [port = '5174', out = 'reference/qa-reports/ENG-24e/clips', secs = '9'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// (the beats: the river's two banks, where the view is held (the camera's place for him standing at `look`), where he waits)
const BEATS = [
  { name: 'b4-safe', near: 10028, far: 11196, look: 10700, wait: 11260 },
  { name: 'b6-deep', near: 15877, far: 17013, look: 16520, wait: 17090 },
];
const b = await chromium.launch();
const log = [];
for (const beat of BEATS) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  // (a replay's save: 2-4's halfway line already heard (wayside.ts markShown 'H'), so his line does not sit over the reeds on beat 6)
  await p.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); localStorage.setItem('sloth_way_2-4', 'LH'); } catch {} });
  const T0 = Date.parse('2026-11-20T15:00:00Z');
  await p.clock.install({ time: T0 });
  await p.clock.pauseAt(T0 + 1000);
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  const run = async (ms) => { for (let t = 0; t < ms; t += 500) { await p.clock.runFor(500); await p.waitForTimeout(120); } };
  await run(3500);
  await p.evaluate(() => window.__play('2-4', 1));
  await run(6000);
  for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(206, 457); await run(700); }
  const built = await p.evaluate((bt) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const bank = (x) => e.platforms.filter((q) => q.type === 'solid' && !q.soil && !q.decorative && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    const look = bank(bt.near - 10);
    // (the camera's place for him at `look` on the river's line, then held there: he waits on the far bank, out of the way)
    Object.assign(e.player, { x: bt.look, y: look.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    e.clearGuide?.();
    for (let i = 0; i < 60; i++) e.updateCamera(1 / 30);
    const cx = e.camera.x, cy = e.camera.y;
    e.updateCamera = function () { this.camera.x = cx; this.camera.y = cy; };
    const far = bank(bt.far + 30);
    Object.assign(e.player, { x: bt.wait, y: far.y, vx: 0, vy: 0, grounded: true });
    return `${e.currentStage?.config?.id} easy=${!!e.easy} cam ${Math.round(cx)},${Math.round(cy)} view ${Math.round(e.camera.viewportWidth)}`;
  }, beat);
  const dir = join(out, `${beat.name}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const n = Math.round(+secs * 30), track = [];
  for (let i = 0; i < n; i++) {
    await p.clock.runFor(1000 / 30);
    await p.screenshot({ path: join(dir, `f${String(i).padStart(4, '0')}.png`) });
    track.push(await p.evaluate((bt) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      const logs = e.platforms.filter((q) => q.drift && q.drift.x0 >= bt.near - 5 && q.drift.x0 <= bt.far).map((q) => Math.round(q.x + q.width));
      return { px: Math.round(e.player.x), lives: e.lives, logs: logs.sort((a, c) => c - a).slice(0, 3) };
    }, beat));
  }
  const mp4 = join(out, `2-4-${beat.name}-into-reeds-upright.mp4`);
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%04d.png'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', mp4]);
  writeFileSync(join(out, `2-4-${beat.name}-track.json`), JSON.stringify(track));
  log.push(`${beat.name}: ${built}; ${n} frames -> ${mp4}; Pokey ${JSON.stringify(track[0])} .. ${JSON.stringify(track[n - 1])}`);
  await p.close();
}
await b.close();
console.log(log.join('\n'));
