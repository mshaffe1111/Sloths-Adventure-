// node trace.mjs <port> <stage> <layout> <x> <wx,wy;wx,wy>  -- every draw op that changes the ground square's pixel at these world points
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const [port, id, layout, x, pts] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate((pts) => {
  const W = pts.split(';').map((s) => s.split(',').map(Number)); window.__log = W.map(() => []);
  const P = CanvasRenderingContext2D.prototype; const orig = {};
  const site = () => new Error().stack.split('\n').slice(3, 6).map((l) => (l.match(/at (\S+)/)||[])[1] + '@' + (l.match(/src\/game\/([^?:]+)/)||[])[1]).join('<');
  for (const fn of ['drawImage', 'fill', 'fillRect']) {
    orig[fn] = P[fn];
    P[fn] = function (...a) {
      const cv = this.canvas; const gl = cv.isConnected || cv.width < 100;
      let before = null; const m = gl ? null : this.getTransform();
      const px = gl ? [] : W.map(([wx, wy]) => [Math.round(m.a * wx + m.e), Math.round(m.d * wy + m.f)]);
      if (!gl) before = px.map(([u, v]) => (u >= 0 && v >= 0 && u < cv.width && v < cv.height) ? [...this.getImageData(u, v, 1, 1).data].join(',') : null);
      const r = orig[fn].apply(this, a);
      if (!gl) px.forEach(([u, v], i) => { if (before[i] === null) return; const af = [...this.getImageData(u, v, 1, 1).data].join(','); if (af !== before[i]) window.__log[i].push(`${fn} ${before[i]} -> ${af} a=${this.globalAlpha.toFixed(2)} ${String(this.fillStyle).slice(0,26)} ${fn==='drawImage'?(a[0].width+'x'+a[0].height):''} :: ${site()}`); });
      return r;
    };
  }
}, pts);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]); await p.waitForTimeout(5000);
await p.evaluate((x) => {
  const e = window.__engine(); e.isPaused = true;
  window.__log.forEach((l) => (l.length = 0));
  const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 9 });
  for (let i = 0; i < 60; i++) e.update(1 / 30);
  for (let i = 0; i < 30; i++) { e.update(1/30); e.render(); }
}, +x);
const logs = await p.evaluate(() => window.__log);
logs.forEach((l, i) => { console.log('--- point', i, l.length); for (const s of l.slice(-25)) console.log(s); });
await b.close();
