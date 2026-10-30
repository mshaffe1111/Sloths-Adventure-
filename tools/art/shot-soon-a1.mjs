// the world map on Worlds 7-10 with every world open (the tester's unlock), upright and sideways: the "New look coming soon" tag
// node tools/art/shot-soon-a1.mjs <port> <outPrefix>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.evaluate(() => localStorage.setItem('sloth_test_unlock', '1'));
  await p.reload();
  await p.waitForTimeout(3500);
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /World Map/i.test(x.textContent ?? ''))?.click());
  await p.waitForTimeout(1500);
  for (const world of [7, 8, 9, 10]) {
    await p.evaluate((n) => document.querySelectorAll('.map-med')[n - 1]?.dispatchEvent(new MouseEvent('click', { bubbles: true })), world);
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}-w${world}-${tag}.jpg`, type: 'jpeg', quality: 84 });
  }
  await p.close();
}
await b.close();
