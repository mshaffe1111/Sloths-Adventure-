// INT-10: a WALKTHROUGH clip of a stage as the game built it (not play: Pokey is carried along the route, standing on the top piece
// under him, the engine stepped at 30 fps so the lianas swing, the snakes move and the petals bob), for judging how full the path reads.
// Frames at 15 fps, 2x, upright 412x915 or sideways 915x412; the setting from localStorage sloth_difficulty (DIFF), printed as BUILT.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node panclip.mjs <port> <out dir> <stage> <layout> <x0> <x1> <up|side> [px a second]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, id, layout, x0s, x1s, ori = 'up', speed = '260'] = process.argv.slice(2);
const [w, h] = ori === 'side' ? [915, 412] : [412, 915];
const diff = process.env.DIFF ?? 'normal';
const tag = `${id}-L${layout}-${diff}-${ori}-x${x0s}-${x1s}`;
const dir = path.join(out, `frames-${tag}`);
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]);
await p.waitForTimeout(4000);
console.log('BUILT', tag, await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return JSON.stringify({ stage: e?.currentStage?.config?.id, seed: g?.seed, built: g?.budget?.difficulty, stored: localStorage.getItem('sloth_difficulty') }); }, E));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(3000);
const x0 = +x0s, x1 = +x1s, v = +speed;
let x = x0, n = 0;
// (2 engine steps a kept frame: 15 fps kept, 30 fps stepped)
while (x <= x1) {
  for (let k = 0; k < 2; k++) {
    await p.evaluate(([x, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && !q.pit).sort((a, c) => a.y - c.y)[0];
      const y = under ? under.y : e.player.y;
      Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: !!under, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      e.update(1 / 30);
      e.clearGuide?.();
      e.player.invincibleTimer = 0;
      e.render();
    }, [x, E]);
    x += v / 30;
  }
  await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
  await p.screenshot({ path: path.join(dir, `f${String(n++).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 80 });
}
await b.close();
const mp4 = path.join(out, `walk-${tag}.mp4`);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '15', '-i', path.join(dir, 'f%04d.jpg'), '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', mp4]);
console.log('wrote', mp4, n, 'frames', (n / 15).toFixed(1), 's');
