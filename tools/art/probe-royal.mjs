import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage();
await p.goto('http://127.0.0.1:4301/?nodemo=1&lessons=off'); await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('2-9')); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { let e = window.__engine; if (typeof e === 'function') e = e(); return JSON.stringify(e.enemies.map((x) => x.type + (x.royal ? '*' : '')).slice(0, 30)); }));
await b.close();
