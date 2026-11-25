import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 412, height: 915 } })).newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:5199/?lessons=off'); await p.waitForTimeout(4000);
await p.evaluate(() => window.__play('3-1'));
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player); }, E, { timeout: 60000 });
await p.waitForTimeout(3000);
console.log(await p.evaluate((E) => { const e = eval(E); const pl = e.player;
  return JSON.stringify({ p: [pl.x, pl.y, pl.width, pl.height], ropes: e.ropes.length, en: e.enemies.slice(0,6).map(q => [q.type, Math.round(q.x), Math.round(q.y), q.width, q.height]),
   plats: e.platforms.filter(q => q.x < pl.x + 1500 && q.x + q.width > pl.x - 200).slice(0,12).map(q => [q.type, Math.round(q.x), Math.round(q.y), Math.round(q.width), q.height]),
   cam: Object.keys(e).filter(k => /cam/i.test(k)), skills: [...e.skills], proto: !!e.proto, cast: !!e.cast });
}, E));
await p.screenshot({ path: 'probe.png' });
await b.close();
