// Pokey's moves before and after pokey-anim (2026-10-30): one scripted run of key presses on 1-1 (stand, turn, run off, reverse at a run,
// a hard drop, a double jump), stepped one engine update of 1/30 s and one render a frame, upright 390x844 and sideways 844x390. It writes the
// video, a close-up video cropped round Pokey, and trace.json: his x, y, vx, vy and facing every frame. The same keys on the base build and
// on this one must give the same trace (the animation never touches the physics).
//   node tools/art/pokeyanim/rec.mjs <port> <out dir> <tag>
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const { chromium } = await import(process.env.PW ?? '/opt/node-tools/node_modules/playwright/index.mjs');
const [port = '4301', out = '.', tag = 'after'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });

// [frame, action]: down/up a key, or 'drop' (lift him 560 px straight up for a hard landing)
const SCRIPT = [
  [15, 'down ArrowLeft'], [17, 'up ArrowLeft'], // a turn standing still
  [35, 'down ArrowRight'], // the run start
  [58, 'up ArrowRight'], [58, 'down ArrowLeft'], // reversing at a run: the skid, then the turn
  [88, 'up ArrowLeft'],
  [125, 'drop'], // a hard landing
  [170, 'down Space'], [173, 'up Space'], [184, 'down Space'], [187, 'up Space'], // a double jump
];
const N = 235;

const b = await chromium.launch();
for (const [ori, w, h] of [['side', 844, 390], ['up', 390, 844]].filter(([o]) => !process.env.ORI || process.env.ORI === o)) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  p.on('pageerror', (er) => console.log('ERR', er.message));
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off&clips=0`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-1'));
  await p.waitForTimeout(6000);
  for (let i = 0; i < 4; i++) { const g = p.getByText('Skip tips'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(300); } else break; }
  // a flat open stretch of 1-1's first ground, Pokey stood still facing right
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); const pl = e.player;
    Object.assign(pl, { vx: 0, vy: 0, facing: 1 });
    // nothing to pick up or bump into on the stretch he runs (no sparkles or hits over the moves being judged)
    const far = (o) => Math.abs((o.x ?? 0) - pl.x) > 900;
    e.collectibles = e.collectibles.filter(far); e.enemies = e.enemies.filter(far); });
  await p.waitForTimeout(1500);
  const dir = join(out, `${tag}-${ori}-frames`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir);
  // take over the loop: from here every frame is one update(1/30) and one render, then a screenshot (as hfpokey/edgeclip.mjs)
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.isRunning = false; cancelAnimationFrame(e.animFrameId); });
  const trace = [];
  const box = [];
  for (let i = 0; i < N; i++) {
    for (const [f, a] of SCRIPT) if (f === i) {
      const [op, key] = a.split(' ');
      if (op === 'down') await p.keyboard.down(key);
      else if (op === 'up') await p.keyboard.up(key);
      else await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.player.y -= 560; e.player.grounded = false; e.player.vy = 0; });
    }
    const s = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); const pl = e.player;
      e.update(1 / 30);
      e.render();
      const c = document.querySelector('canvas'); const r = c.getBoundingClientRect(); const cam = e.camera ?? {};
      return [pl.x, pl.y, pl.vx, pl.vy, pl.facing, pl.grounded ? 1 : 0, cam.x ?? 0, cam.y ?? 0, e.zoom ?? 1, r.width]; });
    trace.push(s.slice(0, 6).map((v) => Math.round(v * 1000) / 1000));
    box.push(s);
    await p.screenshot({ path: join(dir, `f${String(i).padStart(5, '0')}.png`) });
  }
  await p.close();
  writeFileSync(join(out, `${tag}-${ori}-trace.json`), JSON.stringify(trace));
  writeFileSync(join(out, `${tag}-${ori}-cam.json`), JSON.stringify(box));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-framerate', '30', '-i', join(dir, 'f%05d.png'), '-c:v', 'libx264', '-crf', '24', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/4)*2:trunc(ih/4)*2', join(out, `${tag}-${ori}.mp4`)]);
  console.log(ori, N, 'frames');
}
await b.close();
