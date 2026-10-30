// node count.mjs <port> <out.json> <spec...>   spec = stage@x[@y][:secs]  (x/y world px to park Pokey at; omit to stay at the start)
// counts canvas calls per engine frame, by the src file:line that made them, in headless Chromium
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
const [port, outFile, ...specs] = process.argv.slice(2);
const VIEW = process.env.VIEW === 'up' ? { width: 390, height: 844 } : { width: 844, height: 390 };
const init = () => {
  const P = CanvasRenderingContext2D.prototype;
  window.__c = {}; window.__on = false; window.__frames = 0;
  const site = () => {
    const s = new Error().stack.split('\n');
    const out = [];
    for (let i = 3; i < s.length && out.length < (window.__deep || 1); i++) {
      const m = s[i].match(/\/src\/([^?:]+)(?:\?[^:]*)?:(\d+)/);
      if (m) out.push(m[1].replace(/^game\//, '') + ':' + m[2]);
    }
    return out.join(' < ') || '?';
  };
  const bump = (k) => { window.__c[k] = (window.__c[k] || 0) + 1; };
  for (const name of ['createLinearGradient', 'createRadialGradient', 'createPattern', 'fillText', 'drawImage', 'getImageData', 'measureText']) {
    const f = P[name];
    P[name] = function (...a) {
      if (window.__on) {
        let tag = '';
        if (window.__ratio && name === 'drawImage' && this.canvas.isConnected) {
          const m = this.getTransform(); const k = Math.hypot(m.a, m.b);
          let sw, dw; if (a.length === 9) { sw = a[3]; dw = a[7]; } else if (a.length === 5) { sw = a[0].width; dw = a[3]; } else { sw = 1; dw = 1; }
          const r = (dw * k) / sw; tag = ` x${r < 0.35 ? '<0.35' : r < 0.7 ? '0.35-0.7' : r <= 1.3 ? '0.7-1.3' : '>1.3'} ${this.imageSmoothingQuality}`;
        }
        bump(name + ' ' + site() + (this.canvas.isConnected ? '' : ' [off]') + tag);
      }
      return f.apply(this, a);
    };
  }
  for (const prop of ['imageSmoothingQuality', 'shadowBlur', 'filter', 'globalCompositeOperation']) {
    const d = Object.getOwnPropertyDescriptor(P, prop);
    Object.defineProperty(P, prop, { ...d, set(v) { if (window.__on && (prop !== 'shadowBlur' || v > 0) && (prop !== 'filter' || v !== 'none') && (prop !== 'globalCompositeOperation' || v !== 'source-over')) bump(prop + '=' + v + ' ' + site()); d.set.call(this, v); } });
  }
};
const b = await chromium.launch();
const p = await b.newPage({ viewport: VIEW, deviceScaleFactor: 2 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.addInitScript(init);
const results = {};
for (const spec of specs) {
  const [head, secs = '3'] = spec.split(':');
  const [stage, xs, ys] = head.split('@');
  await p.goto(`http://127.0.0.1:${port}/?nodemo=1&lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.evaluate((s) => window.__play(s), stage);
  await p.waitForTimeout(3000);
  const park = () => p.evaluate(([x, y]) => {
    const e = (typeof window.__engine === 'function' ? window.__engine() : window.__engine);
    if (!e) return;
    if (x) { e.player.x = Number(x); e.player.vx = 0; }
    if (y) { e.player.y = Number(y); e.player.vy = 0; }
    e.player.health = 99; e.player.invulnerable = 99;
    if (!e.__wrapped) { const r = e.render.bind(e); e.render = (...a) => { window.__frames++; return r(...a); }; e.__wrapped = 1; }
  }, [xs, ys]);
  await park();
  for (let i = 0; i < 6; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click().catch(() => {}); await p.waitForTimeout(300); } else break; }
  await park();
  await p.waitForTimeout(1500);
  await park();
  await p.evaluate(([d, rt]) => { window.__c = {}; window.__frames = 0; window.__on = true; window.__deep = d; window.__ratio = rt; }, [Number(process.env.DEEP || 1), !!Number(process.env.RATIO || 0)]);
  await p.waitForTimeout(Number(secs) * 1000);
  const r = await p.evaluate(() => { window.__on = false; return { frames: window.__frames, c: window.__c, x: (typeof window.__engine === 'function' ? window.__engine() : window.__engine)?.player.x, q: (typeof window.__engine === 'function' ? window.__engine() : window.__engine)?.quality }; });
  const per = Object.entries(r.c).map(([k, v]) => [k, +(v / Math.max(1, r.frames)).toFixed(2)]).sort((a, b) => b[1] - a[1]);
  results[spec] = { frames: r.frames, x: r.x, q: r.q, per };
  console.log(`\n== ${spec}  frames ${r.frames}  x ${Math.round(r.x)}  q${r.q}`);
  for (const [k, v] of per.slice(0, Number(process.env.TOP || 40))) console.log(String(v).padStart(8), k);
  if (process.env.SHOT) await p.screenshot({ path: `${process.env.SHOT}-${spec.replace(/[^\w.-]/g, '_')}.png` });
}
fs.writeFileSync(outFile, JSON.stringify(results, null, 1));
await b.close();
