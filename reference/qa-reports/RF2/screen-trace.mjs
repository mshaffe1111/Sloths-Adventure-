// node at.mjs <port> <stage> <layout> <x> <w> <h> <px,py;px,py...>  -- which draw calls cover these css pixels in one render
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const [port, id, layout, x, w, h, pts] = process.argv.slice(2);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(2500);
await p.evaluate(([id, v]) => window.__play(id, v), [id, +layout]); await p.waitForTimeout(5000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(3000);
const res = await p.evaluate(([x, pts]) => {
  const e = window.__engine(); e.isPaused = true;
  const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
  for (let i = 0; i < 60; i++) e.update(1 / 30);
  for (let i = 0; i < 30; i++) { e.update(1/30); e.render(); }
  const main = document.querySelector('canvas'); const dpr = main.width / main.getBoundingClientRect().width;
  const targets = pts.split(';').map((s) => s.split(',').map(Number)).map(([a, c]) => [a * dpr, c * dpr]);
  const P = CanvasRenderingContext2D.prototype; const orig = {}; const hits = targets.map(() => []);
  const site = () => new Error().stack.split('\n').slice(5, 9).map((l) => l.replace(/.*\/src\//, '').replace(/\?[^:]*/, '').replace(/\)$/, '').trim()).join(' < ');
  function cover(ctx, rx, ry, rw, rh, kind, extra) {
    if (!ctx.canvas.isConnected) return;
    const m = ctx.getTransform(); const xs = [], ys = [];
    for (const [u, v] of [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]]) { xs.push(m.a * u + m.c * v + m.e); ys.push(m.b * u + m.d * v + m.f); }
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    targets.forEach(([tx, ty], i) => { if (tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1) hits[i].push(`[cv${[...document.querySelectorAll('canvas')].indexOf(ctx.canvas)}] ${kind} a=${ctx.globalAlpha.toFixed(2)} ${ctx.globalCompositeOperation} [${(x0/dpr)|0},${(y0/dpr)|0},${(x1/dpr)|0},${(y1/dpr)|0}] ${extra||''} :: ${site()}`); });
  }
  orig.drawImage = P.drawImage; P.drawImage = function (img, ...a) {
    let r; if (a.length === 2) r = [a[0], a[1], img.width, img.height]; else if (a.length === 4) r = a; else r = a.slice(4);
    cover(this, ...r, 'img', `${img.width}x${img.height} ${(img.src||'').split('/').pop()||img.tagName} src[${a.length===8?a.slice(0,4).map(n=>n|0):''}]`); return orig.drawImage.call(this, img, ...a); };
  orig.fillRect = P.fillRect; P.fillRect = function (...a) { cover(this, ...a, 'rect', String(this.fillStyle).slice(0, 30)); return orig.fillRect.call(this, ...a); };
  orig.fill = P.fill; P.fill = function (...a) { if (this.canvas === main) { const s = site(); if (!window.__fs) window.__fs = new Set(); window.__fs.add(s + ' ' + String(this.fillStyle).slice(0,24)); } return orig.fill.apply(this, a); };
  e.render();
  Object.assign(P, orig);
  return { dpr, cam: [e.camera?.x, e.camera?.y], hits, fills: [...(window.__fs||[])] };
}, [+x, pts]);
console.log('dpr', res.dpr, 'cam', res.cam);
console.log('FILLS'); for (const f of res.fills) console.log(f);
res.hits.forEach((h, i) => { console.log('--- point', i); for (const l of h) console.log(l); });
await b.close();
