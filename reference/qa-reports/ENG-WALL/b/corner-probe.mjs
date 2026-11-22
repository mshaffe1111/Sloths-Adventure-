// ENG-WALL-b scratch: the x 20006 corner band, sampled and bisected by draw source (scratch merge on 5291).
//   node corner.mjs <out> [upright|sideways]
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const fs = await import('node:fs');
const [out, orient = 'upright'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:5291/?lessons=off'); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const setup = await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  const x = 19900; const under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under ? under.y : 1500, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: -1, invincibleTimer: 9 });
  for (let i = 0; i < 90; i++) { e.player.vx = 0; e.update(1 / 30); }
  e.player.invincibleTimer = 0;
  // (the draw census: every canvas call on the screen's canvas, keyed by its first src/ frame)
  const C = CanvasRenderingContext2D.prototype;
  window.__skip = null; window.__census = null;
  for (const m of ['drawImage', 'fill', 'fillRect', 'stroke', 'fillText']) {
    C['__o_' + m] = C['__o_' + m] ?? C[m];
    C[m] = function (...a) {
      if (window.__census || window.__skip) {
        const st = new Error().stack.split('\n').slice(2).map((l) => (l.match(/\/src\/([^?:]+)[^:]*:(\d+)/) || [])).filter((x) => x[1]);
        const key = st.length ? `${st[0][1]}:${st[0][2]}` : '?';
        const key2 = st.length ? st[0][1] : '?';
        if (window.__census && this.canvas === window.__main) window.__census[key] = (window.__census[key] || 0) + 1;
        if (window.__skip && this.canvas === window.__main && (window.__skip === key || window.__skip === key2)) return;
      }
      return C['__o_' + m].apply(this, a);
    };
  }
  const cvs = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height);
  window.__main = cvs[0];
  return { cam: { x: e.camera.x, y: e.camera.y }, ckeys: Object.keys(e.camera), main: [cvs[0].width, cvs[0].height, cvs[0].getBoundingClientRect().width, cvs[0].getBoundingClientRect().height], px: e.player.x, py: e.player.y };
}, E);
console.log('setup', JSON.stringify(setup));
fs.writeFileSync(`${out}/setup-${orient}.json`, JSON.stringify(setup));
await p.screenshot({ path: `${out}/corner20006-${orient}-full.png` });
// census
const census = await p.evaluate((E) => { const e = eval(E); window.__census = {}; e.render(); const c = window.__census; window.__census = null; return c; }, E);
fs.writeFileSync(`${out}/census-${orient}.json`, JSON.stringify(census, null, 1));
console.log('census keys', Object.keys(census).length);
await p.screenshot({ path: `${out}/corner20006-${orient}-full2.png` });
const res = await p.evaluate(([E, keys]) => {
  const e = eval(E); const z = e.camera.zoom * window.__main.getBoundingClientRect().width / e.camera.viewportWidth, cx = e.camera.x, cy = e.camera.y;
  const g = window.__main.getContext('2d');
  const lum = (wx0, wx1, wy0, wy1) => { let s = 0, n = 0; for (let wy = wy0; wy < wy1; wy += 6) for (let wx = wx0; wx < wx1; wx += 2) { const d = g.getImageData(Math.round((wx - cx) * z * 2), Math.round((wy - cy) * z * 2), 1, 1).data; s += 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2]; n++; } return s / n; };
  const meas = () => { e.render(); const band = lum(20010, 20030, 1460, 1740), left = lum(19982, 20002, 1460, 1740), lip = lum(20010, 20030, 1440, 1458), lipL = lum(19982, 20002, 1440, 1458); return { band: +band.toFixed(1), left: +left.toFixed(1), step: +(left - band).toFixed(1), lipStep: +(lipL - lip).toFixed(1) }; };
  const out = { zoom: z, none: meas() }; for (let i = 0; i < 30; i++) e.render(); out.after30 = meas(); window.__census = {}; e.render(); out.census30 = window.__census; window.__census = null;
  out.none2 = meas(); for (const k of keys) { window.__skip = k; out[k] = meas(); }
  window.__skip = null; out.noneEnd = meas();
  return out;
}, [E, Object.keys(census)]);
fs.writeFileSync(`${out}/bisect-${orient}.json`, JSON.stringify(res, null, 1));
await p.evaluate((E) => { window.__skip = null; eval(E).render(); }, E);
await p.screenshot({ path: `${out}/corner20006-${orient}-settled.png` });
for (const [k, v] of Object.entries(res)) if (!/census/.test(k)) console.log(k, JSON.stringify(v));
await b.close();
