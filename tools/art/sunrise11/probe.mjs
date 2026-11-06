import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 915, height: 412 } });
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4301/?lessons=off');
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 120000 });
await p.evaluate(() => window.__play('1-1'));
await p.waitForTimeout(8000);
console.log(await p.evaluate(() => {
  const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
  const pl = e.platforms.map((q) => [Math.round(q.x), Math.round(q.y), Math.round(q.width), q.type]);
  const ys = pl.map((q) => q[1]);
  const low = pl.reduce((m, q) => (q[1] > m[1] ? q : m)), high = pl.reduce((m, q) => (q[1] < m[1] ? q : m));
  return JSON.stringify({ n: pl.length, end: Math.max(...pl.map((q) => q[0] + q[2])), spawn: [e.currentStage.spawnX, e.currentStage.spawnY], totem: [e.currentStage.exitTotemX, e.currentStage.exitTotemY], low, high, water: e.proto?.water ?? null, gen: e.currentStage.meta?.gen2 ? 'gen2' : Object.keys(e.currentStage.meta ?? {}).slice(0, 6) });
}));
await b.close();
