import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 412, height: 915 } });
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4301/?lessons=off');
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 120000 });
await p.evaluate(() => window.__play('1-1'));
await p.waitForTimeout(6000);
console.log(await p.evaluate(() => {
  const e = typeof window.__engine === "function" ? window.__engine() : window.__engine;
  const ks = Object.keys(e).filter((k) => /water|pit|proto|rise|stage/i.test(k));
  const pl = e.platforms.map((q) => [Math.round(q.x), Math.round(q.y), Math.round(q.width)]);
  const ys = pl.map((q) => q[1]);
  return JSON.stringify({ ks, n: pl.length, minY: Math.min(...ys), maxY: Math.max(...ys), end: Math.max(...pl.map((q) => q[0] + q[2])), water: e.proto?.water ?? e.currentStage?.water ?? null, waterY: e.currentStage?.waterY, rise: e.proto?.rise, spawn: [e.currentStage.spawnX, e.currentStage.spawnY] });
}));
await b.close();
