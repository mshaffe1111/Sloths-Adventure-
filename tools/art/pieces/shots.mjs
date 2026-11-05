// The engine pieces' phone stills and clips (src/game/pieces/), on a scratch build that lays the piece in a real stage (the scratch
// hook lives only in the scratch worktree, never in the real tree): node tools/art/pieces/shots.mjs <port> <outDir> <piece> <stage> [layout]
//   - stills upright (390x844) and sideways (844x390) at dpr 3 (phone density), Pokey standing at the piece's near bank, at three moments
//     of its cycle (<piece>-<o>-t<k>.png);
//   - a 4 s clip at 10 fps each way (<piece>-<o>.mp4, ffmpeg), Pokey riding it across.
// The page's globalThis.__pieceAt = { x0, x1, y } (the gap's banks) is set by the scratch layer.
import { createRequire } from 'module';
import { execFileSync } from 'child_process';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, piece, stage, layout = '1', settingArg = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  if (settingArg === 'easy') await p.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'easy'); } catch {} });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off&piece=${piece}`);
  await p.waitForTimeout(2500);
  await p.evaluate(([i, l]) => window.__play(i, +l), [stage, layout]);
  // (the stage card clears after a few seconds)
  await p.waitForTimeout(9000);
  const at = await p.evaluate(() => globalThis.__pieceAt);
  console.log(o, 'piece at', JSON.stringify(at));
  if (!at) { console.log('no piece laid'); process.exit(1); }
  // stand him on the near bank, a step from its edge, safe (a long invincibility: these are stills, not play)
  const stand = (dx) => p.evaluate(([a, d]) => { let e = window.__engine; if (typeof e === "function") e = e(); const pl = e.player; Object.assign(pl, { x: a.x0 + d, y: a.y, vx: 0, vy: 0, grounded: true, invincibleTimer: 0 }); e.lives = 9; e.checkpoint = { x: a.x0 + d, y: a.y }; }, [at, dx]);
  await stand(-60);
  await p.waitForTimeout(1500);
  for (let k = 0; k < 3; k++) {
    await stand(-60);
    await p.waitForTimeout(400 + k * 850);
    await p.screenshot({ path: `${out}/${piece}-${settingArg}-${o}-t${k}.png` });
  }
  if (process.env.STILLS) { await ctx.close(); continue; }
  // the clip: he waits for the log, hops on, rides, hops off (a scripted thumb through the page's own input state)
  const frames = `${out}/.f-${o}`;
  fs.rmSync(frames, { recursive: true, force: true });
  fs.mkdirSync(frames);
  await stand(-30);
  // (the thumb runs inside the page, every frame, as a player's would; the screenshots are taken from outside while it plays)
  await p.evaluate(([a]) => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const log = e.platforms.find((q) => q.sling);
    e.__st = 'wait'; e.__lives = e.lives; e.__log = []; e.__hold = 0;
    e.__ticks = 0;
    const tick = () => {
      e.__ticks++;
      const s = e.input.state;
      const pl = e.player;
      if (e.lives !== e.__lives) { e.__log.push(`life lost at x ${Math.round(pl.x)} (${e.__st})`); e.__lives = e.lives; e.__st = 'wait'; }
      e.__minGap = Math.min(e.__minGap ?? 1e9, log.x - a.x0);
      let press = false, right = false;
      // (wait on the near bank until the log's near end has swung within 70 px, jump on; on the log walk to its far end and jump when
      // that end is within 70 px of the far bank; on the far bank, stop)
      if (e.__st === 'wait' && pl.grounded && log.x - a.x0 < 70) { press = true; e.__st = 'board'; }
      else if (e.__st === 'board') { right = !pl.grounded; if (pl.grounded && e.standingOnId === log.id) e.__st = 'ride'; else if (pl.grounded && e.__hold === 0) { if (log.x - a.x0 < 70) press = true; else e.__st = 'wait'; } }
      else if (e.__st === 'ride') { right = pl.x < log.x + log.width - 26; if (!right && a.x1 - (log.x + log.width) < 70) { press = true; e.__st = 'leave'; } }
      else if (e.__st === 'leave') { right = !pl.grounded; if (pl.grounded && e.standingOnId === log.id && e.__hold === 0) e.__st = 'ride'; if (pl.grounded && pl.x > a.x1) { e.__st = 'done'; e.__log.push(`across at ${Math.round(pl.x)}`); } }
      if (press) { e.__hold = 12; right = true; }
      const hold = e.__hold > 0; if (hold) e.__hold--;
      // (real key events, as the input engine reads them in every mode: inputEngine.ts handleKeyDown)
      const key = (code, down) => { if (!!e.__keys?.[code] === down) return; (e.__keys ??= {})[code] = down; window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code === 'Space' ? ' ' : code })); };
      key('Space', hold);
      key('ArrowRight', right || press);
      if (e.__st !== 'done') requestAnimationFrame(tick); else { key('Space', false); key('ArrowRight', false); }
    };
    requestAnimationFrame(tick);
  }, [at]);
  for (let i = 0; i < 60; i++) {
    await p.waitForTimeout(60);
    await p.screenshot({ path: `${frames}/${String(i).padStart(3, '0')}.jpg`, scale: 'css', type: 'jpeg', quality: 85 });
  }
  console.log(o, 'clip:', await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return `${e.__log.join('; ') || 'nothing happened'} (state ${e.__st}, ${e.__ticks} frames, minGap ${Math.round(e.__minGap)})`; }));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', `${frames}/%03d.jpg`, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', `${out}/${piece}-${settingArg}-${o}.mp4`]);
  fs.rmSync(frames, { recursive: true, force: true });
  await ctx.close();
}
await b.close();
console.log('shots in', out);
