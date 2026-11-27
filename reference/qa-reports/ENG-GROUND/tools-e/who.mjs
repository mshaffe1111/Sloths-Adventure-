const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
await p.goto('http://127.0.0.1:5291/?lessons=off'); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(3000);
const out = await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  const x = 19900; const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under ? under.y : 1500, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: -1, invincibleTimer: 9 });
  for (let i = 0; i < 90; i++) { e.player.vx = 0; e.update(1 / 30); }
  const cam = { x: e.camera.x, y: e.camera.y, w: e.camera.viewportWidth, h: e.camera.viewportHeight };
  // targets in CSS px: the slab (390, 725) and the box (400, 890)
  const T = [[390, 725, 'slab'], [400, 880, 'box'], [330, 800, 'soil']];
  const hits = [];
  const P = CanvasRenderingContext2D.prototype;
  const wrap = (name) => { const o = P[name]; P[name] = function (...a) {
    const c = this.canvas; if (c && c.clientWidth > 300) {
      let r; if (name === 'drawImage') { if (a.length < 5) r = [a[1], a[2], a[0].width, a[0].height]; else r = a.length === 5 ? a.slice(1) : a.slice(5); } else if (name === 'fillRect') r = a; else r = null;
      if (r) { const m = this.getTransform(); const k = c.width / c.clientWidth;
        const xs = [r[0], r[0] + r[2]].map((u) => (m.a * u + m.e) / k), ys = [r[1], r[1] + r[3]].map((v) => (m.d * v + m.f) / k);
        for (const [tx, ty, n] of T) if (tx >= Math.min(...xs) && tx <= Math.max(...xs) && ty >= Math.min(...ys) && ty <= Math.max(...ys)) hits.push(`${n} ${name} ${new Error().stack.split('\n').slice(2, 5).map((s) => s.trim().replace(/.*\/src\//, '').replace(/\?[^:]*/, '')).join(' < ')}`); }
      else if (name === 'fill') for (const [tx, ty, n] of T) { const k = c.width / c.clientWidth; if (this.isPointInPath(tx * k, ty * k)) hits.push(`${n} fill ${new Error().stack.split('\n').slice(2, 5).map((s) => s.trim().replace(/.*\/src\//, '').replace(/\?[^:]*/, '')).join(' < ')}`); }
    } return o.apply(this, a); }; };
  ['drawImage', 'fillRect', 'fill'].forEach(wrap);
  e.render();
  return { cam, hits: [...new Set(hits)] };
}, E);
console.log(JSON.stringify(out, null, 1)); await b.close();
