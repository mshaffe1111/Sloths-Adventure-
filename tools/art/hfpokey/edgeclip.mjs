// node edgeclip.mjs <url> <outdir> <level> <layout> [views up,side]: a short clip of Pokey at a ledge's end (X-14). He is put on the solid
// ledge nearest the start that ends in a drop, his middle 11 px past its end (the furthest the footing allows), facing the drop, and left
// alone for 4 s; then turned away from it for 1.5 s. The game's own loop is stopped and the script steps it one 1/30 s frame at a time
// (update, render, screenshot), so the mp4 is every real frame at the game's locked 30 fps however slow the screenshots are.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { execFileSync } from 'child_process';
const [url, out, id = '2-6', layout = '7', views = 'up,side'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const VP = { up: { width: 390, height: 844 }, side: { width: 844, height: 390 } };
const b = await chromium.launch();
for (const vn of views.split(',')) {
  const ctx = await b.newContext({ viewport: VP[vn] });
  const p = await ctx.newPage();
  await p.goto(url);
  await p.waitForTimeout(2500);
  await p.evaluate(([i, l]) => window.__play(i, Number(l)), [id, layout]);
  await p.waitForTimeout(9000); // past the stage's title card
  const where = await p.evaluate(() => {
    let e = window.__engine; if (typeof e === 'function') e = e();
    const pl = e.player;
    const plats = e.platforms.filter((q) => q.type === 'solid' && !q.broken && q.width >= 140);
    const carries = (q, x) => e.platforms.some((o) => o !== q && Math.abs(o.y - q.y) <= 3 && x >= o.x && x <= o.x + o.width);
    const ok = plats.filter((q) => q.x + q.width > pl.x && !carries(q, q.x + q.width + 4)).sort((a, c) => a.x + a.width - (c.x + c.width));
    const q = ok[0];
    if (!q) return null;
    pl.x = q.x + q.width + 11; pl.y = q.y; pl.vx = 0; pl.vy = 0; pl.facing = 1;
    return { x: pl.x, y: pl.y, plat: [q.x, q.y, q.width] };
  });
  console.log(vn, JSON.stringify(where));
  const dir = `${out}/frames-${vn}`;
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  // take over the loop: from here every frame is one update(1/30) and one render, then a screenshot
  await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); e.isRunning = false; cancelAnimationFrame(e.animFrameId); });
  const N = 165;
  for (let k = 0; k < N; k++) {
    await p.evaluate((turn) => {
      let e = window.__engine; if (typeof e === 'function') e = e();
      if (turn) e.player.facing = -1;
      e.update(1 / 30);
      e.render();
    }, k === 120);
    await p.screenshot({ path: `${dir}/${String(k).padStart(4, '0')}.png` });
  }
  await ctx.close();
  const mp4 = `${out}/x14-edge-${id}-${vn}.mp4`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${dir}/%04d.png`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', mp4]);
  console.log(mp4, N, 'frames at 30 fps');
}
await b.close();
