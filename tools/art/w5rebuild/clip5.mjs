// node tools/art/w5rebuild/clip5.mjs <port> <outDir> <stage@layout> <seconds> [up|side]
// A fly-through clip (not a play-through): Pokey is moved smoothly along the stage (left to right on the ground, or up a climb ledge
// to ledge) at a quick walk, the camera following, so the stage's look and its moving effects can be judged in motion. WebM.
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, spec, secs = '24', o = 'side'] = process.argv.slice(2);
const [id, layout] = spec.split('@');
const [w, h] = o === 'up' ? [390, 844] : [844, 390];
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--disable-dev-shm-usage'] });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1.5, hasTouch: true, isMobile: true, serviceWorkers: 'block', recordVideo: { dir: out, size: { width: w, height: h } } });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(([i, l]) => window.__play(i, +l), [id, layout ?? '1']);
await p.waitForTimeout(5000);
await p.evaluate((secs) => new Promise((done) => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const pl = e.player;
  const up = e.currentStage.config.objectiveType === 'ascent';
  // (a climb: the ledges half a view apart, bottom to top, as walk5.mjs picks them)
  const all = e.platforms.filter((q) => q.width >= 90).sort((a, b) => b.y - a.y);
  const ledges = [];
  for (const q of all) if (!ledges.length || ledges[ledges.length - 1].y - q.y >= e.camera.viewportHeight * 0.35) ledges.push(q);
  const t0 = performance.now();
  let x = pl.x, y = pl.y + pl.height, k = 0;
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    if (t > secs) return done();
    if (up) {
      // up the ledges in order, 1.3 s each
      const per = secs / ledges.length;
      const c = ledges[Math.min(ledges.length - 1, Math.floor(t / per))];
      x = c.x + c.width / 2;
      y = c.y;
    } else {
      x += 260 / 30;
      const tops = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x + pl.width && q.height >= 40).map((q) => q.y);
      if (tops.length) y = tops.sort((m, n) => Math.abs(m - y) - Math.abs(n - y))[0];
    }
    pl.x = x - (up ? pl.width / 2 : 0); pl.y = y - pl.height; pl.vx = up ? 0 : 1; pl.vy = 0; pl.invincibleTimer = 0;
    k++;
    setTimeout(tick, 33);
  };
  tick();
}), +secs);
const v = p.video();
await ctx.close();
const path = await v.path();
const dest = `${out}/clip-${id}-${o}.webm`;
fs.renameSync(path, dest);
console.log(dest);
await b.close();
