const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2 })).newPage();
await p.goto('http://127.0.0.1:5291/?lessons=off'); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(5000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 20000 }).catch(() => {});
await p.waitForTimeout(1500);
const r = await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  const C = CanvasRenderingContext2D.prototype, o = C.getTransform; window.__t = [];
  C.getTransform = function () { const m = o.call(this); if (new Error().stack.includes('drawGroundChunks')) window.__t.push([m.a, m.b, m.c, m.d].map((v) => +v.toFixed(5))); return m; };
  const x = 19900; Object.assign(e.player, { x, y: 1450, vx: 0, vy: 0, grounded: true, invincibleTimer: 9 });
  for (let i = 0; i < 3; i++) { e.player.vx = 0; e.update(1 / 30); }
  const rows = [];
  for (let i = 0; i < 6; i++) { window.__t = []; e.render(); rows.push({ i, t: window.__t, zoom: e.camera.zoom, tz: e.camera.targetZoom, trauma: e.camera.trauma }); }
  for (let i = 0; i < 30; i++) e.render();
  window.__t = []; e.render(); rows.push({ i: 'settled', t: window.__t, zoom: e.camera.zoom, trauma: e.camera.trauma });
  return rows;
}, E);
for (const x of r) console.log(JSON.stringify(x));
await b.close();
