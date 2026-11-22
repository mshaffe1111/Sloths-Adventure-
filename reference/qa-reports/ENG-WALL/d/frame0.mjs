// ENG-WALL-d: the descent's frame 0 vs its settled re-render, upright or sideways (3rd arg), DSF 1: the two shots side by side and where they differ (rows).
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const [port, out, orient = 'upright'] = process.argv.slice(2);
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const e = window.__engine(); e.isPaused = true;
  const main = [...document.querySelectorAll('canvas')].sort((a, c) => c.width * c.height - a.width * a.height)[0];
  const g = main.getContext('2d');
  const x = 14800, under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, invincibleTimer: 9 });
  for (let i = 0; i < 3; i++) e.update(1 / 30); e.camera.x = e.camera.targetX ?? e.camera.x; e.camera.y = e.camera.targetY ?? e.camera.y; e.render();
  Object.assign(e.player, { x: 18990, y: 600, vx: 0, vy: 950, grounded: false, hanging: false, climbing: false, invincibleTimer: 9 });
  e.update(1 / 30); e.render();
  const cam = { x: e.camera.x, y: e.camera.y }, a = main.toDataURL('image/png'), da = g.getImageData(0, 0, main.width, main.height).data;
  for (let i = 0; i < 30; i++) e.render(); Object.assign(e.camera, cam); e.render();
  const s = main.toDataURL('image/png'), ds = g.getImageData(0, 0, main.width, main.height).data;
  const rows = []; for (let y = 0; y < main.height; y += 40) { let d = 0, n = 0; for (let yy = y; yy < Math.min(main.height, y + 40); yy += 2) for (let xx = 0; xx < main.width; xx += 2) { const i = (yy * main.width + xx) * 4; d += Math.abs(0.299 * (da[i] - ds[i]) + 0.587 * (da[i + 1] - ds[i + 1]) + 0.114 * (da[i + 2] - ds[i + 2])); n++; } rows.push(+(d / n).toFixed(1)); }
  return { a, s, rows, cam: [Math.round(cam.x), Math.round(cam.y)], w: main.width, h: main.height };
});
const fs = await import('node:fs');
fs.writeFileSync(`${out}/f0-${orient}.png`, Buffer.from(r.a.split(',')[1], 'base64')); fs.writeFileSync(`${out}/settled-${orient}.png`, Buffer.from(r.s.split(',')[1], 'base64'));
console.log('cam', r.cam, 'canvas', r.w, r.h, 'diff by 40-px row band:', JSON.stringify(r.rows));
await b.close();
