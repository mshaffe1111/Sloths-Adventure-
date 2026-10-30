// every world's name on the map header, upright and sideways (the tester's unlock): checks no name is cut
// node tools/art/shot-names-a1.mjs <port> <outPrefix>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390], ['up360', 360, 740]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.evaluate(() => localStorage.setItem('sloth_test_unlock', '1'));
  await p.reload();
  await p.waitForTimeout(3500);
  await p.evaluate(() => [...document.querySelectorAll('button')].find((x) => /World Map/i.test(x.textContent ?? ''))?.click());
  await p.waitForTimeout(1500);
  for (let world = 1; world <= 10; world++) {
    await p.evaluate((n) => document.querySelectorAll('.map-med')[n - 1]?.dispatchEvent(new MouseEvent('click', { bubbles: true })), world);
    await p.waitForTimeout(700);
    // (is the name's text wider than its box: cut off)
    const cut = await p.evaluate(() => { const s = document.querySelector('.map-title > span'); return s ? s.scrollWidth > s.clientWidth + 1 : null; });
    console.log(tag, world, cut ? 'CUT' : 'ok');
    await p.screenshot({ path: `${out}-w${world}-${tag}.jpg`, type: 'jpeg', quality: 80, clip: { x: 0, y: 0, width: w, height: Math.min(h, 170) } });
  }
  await p.close();
}
await b.close();
