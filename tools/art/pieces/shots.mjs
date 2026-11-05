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
    const crates = e.platforms.filter((q) => q.crate).sort((p1, p2) => p1.x - p2.x);
    const see = e.platforms.filter((q) => q.seesaw);
    const gate = e.platforms.filter((q) => q.rootgate);
    e.__st = 'wait'; e.__lives = e.lives; e.__log = []; e.__hold = 0;
    e.__ticks = 0;
    const tick = () => {
      e.__ticks++;
      const s = e.input.state;
      const pl = e.player;
      if (e.lives !== e.__lives) { e.__log.push(`life lost at x ${Math.round(pl.x)} (${e.__st})`); e.__lives = e.lives; e.__st = 'wait'; }
      if (log) e.__minGap = Math.min(e.__minGap ?? 1e9, log.x - a.x0);
      let press = false, right = false;
      if (gate.length) {
        // (root gate: walk on; hop onto the rock with the plate; walk on through the door once it is open)
        const rock = gate.find((q) => q.rootgate.role === 'knot');
        const door = gate.find((q) => q.rootgate.role === 'door');
        if (pl.x > door.x + door.width + 80 && pl.grounded) { e.__st = 'done'; e.__log.push(`through at ${Math.round(pl.x)}`); }
        else { right = true; if (pl.grounded && e.__hold === 0 && pl.x > rock.x - 60 && pl.x < rock.x && pl.y > rock.y + 10) press = true; }
      } else if (see.length) {
        // (seesaw: walk into the log and push it till it stops; hop onto it; walk on onto the raised far end; the second jump up the bank)
        const lg = e.platforms.find((q) => q.push && q.x >= a.x0 - 10);
        const R = see.find((q) => q.seesaw.side === 1);
        e.__lx ??= lg.x;
        if (e.__st === 'wait') { right = true; e.__still = Math.abs(lg.x - e.__lx) < 0.01 && pl.pushing ? (e.__still ?? 0) + 1 : 0; e.__lx = lg.x; if (e.__still > 10) e.__st = 'hop'; }
        else if (e.__st === 'hop') { right = true; if (pl.grounded && e.__hold === 0 && e.standingOnId !== R.id) press = true; if (pl.grounded && e.standingOnId === R.id) e.__st = 'walk'; }
        else if (e.__st === 'walk') { right = pl.x < R.x + R.width - 24; if (!right && pl.grounded) { press = true; e.__st = 'up'; e.__tUp = e.gameTime; e.__second = false; } }
        else if (e.__st === 'up') { right = true; if (!e.__second && e.gameTime - e.__tUp > 0.3) { press = true; e.__second = true; } if (e.gameTime - e.__tUp > 0.5 && pl.grounded && e.standingOnId === R.id) e.__st = 'walk'; if (pl.grounded && pl.y < R.y - 100) { e.__st = 'done'; e.__log.push(`up the bank at ${Math.round(pl.x)}`); right = false; } }
      } else if (crates.length) {
        // (crates: walk to the far edge of what he stands on; hop when the next crate is up and afloat; across on the far bank)
        const st = (c) => { const u = ((e.gameTime / c.period + c.phase) % 1 + 1) % 1; return u < c.afloat * 0.6 || (u > c.afloat + c.tip + c.under + 0.05); };
        const on = e.platforms.find((q) => q.id === e.standingOnId);
        const next = crates.find((q) => q.x > pl.x + 10);
        if (pl.grounded && pl.x > a.x1 + 10) { if (e.__st !== 'done') e.__log.push(`across at ${Math.round(pl.x)}`); e.__st = 'done'; }
        else if (!pl.grounded) right = true;
        else if (on && pl.x < on.x + on.width - 26 && (on.crate || pl.x < a.x0 - 26)) right = true;
        else if (e.__hold === 0 && (!next || st(next.crate))) press = true;
      } else
      // (wait on the near bank until the log's near end has swung within 70 px, jump on; on the log walk to its far end and jump when
      // that end is within 70 px of the far bank; on the far bank, stop)
      if (e.__st === 'wait' && pl.grounded && log.x - a.x0 < 70) { press = true; e.__st = 'board'; }
      else if (e.__st === 'board') { right = !pl.grounded; if (pl.grounded && e.standingOnId === log.id) e.__st = 'ride'; else if (pl.grounded && e.__hold === 0) { if (log.x - a.x0 < 70) press = true; else e.__st = 'wait'; } }
      else if (e.__st === 'ride') { right = pl.x < log.x + log.width - 26; if (!right && a.x1 - (log.x + log.width) < 70) { press = true; e.__st = 'leave'; } }
      else if (e.__st === 'leave') { right = !pl.grounded; if (pl.grounded && e.standingOnId === log.id && e.__hold === 0) e.__st = 'ride'; if (pl.grounded && pl.x > a.x1) { e.__st = 'done'; e.__log.push(`across at ${Math.round(pl.x)}`); } }
      if (press) { e.__holdTo = e.gameTime + (see.length ? 0.22 : 0.4); right = true; }
      const hold = e.gameTime < (e.__holdTo ?? 0); e.__hold = hold ? 1 : 0;
      // (real key events, as the input engine reads them in every mode: inputEngine.ts handleKeyDown)
      const key = (code, down) => { if (!!e.__keys?.[code] === down) return; (e.__keys ??= {})[code] = down; window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, key: code === 'Space' ? ' ' : code })); };
      // (a fresh press is a fresh keydown, even with the last one's key still down)
      if (press && e.__keys?.Space) key('Space', false);
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
  console.log(o, 'clip:', await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return `${e.__log.join('; ') || 'nothing happened'} (state ${e.__st}, ${e.__ticks} frames, at x ${Math.round(e.player.x)} y ${Math.round(e.player.y)} on ${e.standingOnId} grounded ${e.player.grounded} lives ${e.lives})`; }));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '10', '-i', `${frames}/%03d.jpg`, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', `${out}/${piece}-${settingArg}-${o}.mp4`]);
  fs.rmSync(frames, { recursive: true, force: true });
  await ctx.close();
}
await b.close();
console.log('shots in', out);
