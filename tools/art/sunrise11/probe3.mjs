import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
await p.goto('http://127.0.0.1:4301/?lessons=off');
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 120000 });
await p.evaluate(() => window.__play('1-1'));
await p.waitForTimeout(5000);
console.log(await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  const sp = e.currentStage.proto ?? {};
  const pl = e.platforms.map((q) => [Math.round(q.x), Math.round(q.y), Math.round(q.width), q.type ?? q.kind ?? '']);
  const low = pl.filter((q) => q[1] > 1400), high = pl.filter((q) => q[1] < 700);
  return JSON.stringify(e.currentStage.meta.pieces.map((q) => [q.k, q.x0, q.x1, ...e.platforms.filter((r) => r.x > q.x0 && r.x < q.x1).reduce((m, r) => [Math.min(m[0], r.y), Math.max(m[1], r.y)], [9e9, 0])]));
}));
await b.close();
