import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/');
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2 });
p.on('console', m => console.log('LOG', m.text().slice(0,300)));
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4301/');
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('3-9'));
await p.waitForTimeout(2500);
for (let i = 0; i < 3; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(600); } }
const info = await p.evaluate(() => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const r = e.ring ?? e.stage?.proto?.ring;
  const keys = Object.keys(e).filter(k => /ring|proto|stage/i.test(k));
  return JSON.stringify({ keys, r: r && Object.fromEntries(Object.entries(r).filter(([k, v]) => typeof v !== 'object')) });
});
console.log(info);
await p.evaluate(() => {
  let e = window.__engine; if (typeof e === 'function') e = e();
  const r = e.proto?.ring;
  const x = r?.x0 ?? r?.left ?? r?.x;
  if (Number.isFinite(x)) e.player.x = x + 200;
  console.log(JSON.stringify(Object.fromEntries(Object.entries(r ?? {}).filter(([k, v]) => typeof v !== 'object'))));
});
await p.waitForTimeout(1000);
for (let i = 0; i < 8; i++) { const g = p.getByText('Got it!'); if (await g.count()) { await g.first().click(); await p.waitForTimeout(600); } else await p.waitForTimeout(400); }
await p.waitForTimeout(800);
await p.screenshot({ path: out + 'w3-ring.png' });
await b.close();
