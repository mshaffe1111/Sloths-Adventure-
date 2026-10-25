import { chromium } from 'playwright';
const out = (new URL('./', import.meta.url).pathname.replace(/\/$/, '') + '/pshots/');
const [id, scr, n] = [process.argv[2], process.argv[3], +(process.argv[4] ?? 8)];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1 });
p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
await p.goto('http://127.0.0.1:4301/' + (process.argv[5] ?? ''));
await p.waitForTimeout(2500);
await p.evaluate(([i, s]) => window.__story(i, s), [id, scr]);
for (let k = 0; k < n; k++) {
  await p.waitForTimeout(1800);
  await p.screenshot({ path: out + `st-${k}.png` });
  await p.mouse.click(600, 300);
}
await b.close();
