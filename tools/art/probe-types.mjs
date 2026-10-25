import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 } });
await p.goto('http://127.0.0.1:4301/');
await p.waitForTimeout(2500);
for (let w = 1; w <= 3; w++) for (let m = 1; m <= 9; m++) {
  const id = `${w}-${m}`;
  await p.evaluate((s) => window.__play(s), id);
  await p.waitForTimeout(700);
  const t = await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); const c = {}; for (const x of e.enemies) c[x.type] = (c[x.type] ?? 0) + 1; return JSON.stringify(c); });
  console.log(id, t);
}
await b.close();
