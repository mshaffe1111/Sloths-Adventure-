const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const [port, orient] = process.argv.slice(2);
const [W, H] = orient === 'upright' ? [412, 915] : [915, 412];
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
await p.goto(`http://127.0.0.1:${port}/?lessons=off`); await p.waitForTimeout(3000);
await p.evaluate(() => window.__play('2-97', 1)); await p.waitForTimeout(6000);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2000);
const r = await p.evaluate(() => {
  const e = window.__engine(); e.isPaused = true;
  const x = 14800, under = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width && !q.soil).sort((a, c) => c.y - a.y)[0];
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, invincibleTimer: 9 });
  for (let i = 0; i < 3; i++) e.update(1 / 30); e.render();
  Object.assign(e.player, { x: 18990, y: 600, vx: 0, vy: 950, grounded: false, hanging: false, climbing: false, invincibleTimer: 9 });
  const z = []; for (let i = 0; i < 40; i++) { e.update(1 / 30); e.render(); z.push(+e.zoom.toFixed(4)); }
  return { first: z.slice(0, 6), last: z[z.length - 1] };
});
console.log(orient, JSON.stringify(r)); await b.close();
