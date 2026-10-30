// polish-c (UI-7): a boss fight's opening, upright and sideways, frames at the given ms after it starts (the boss bar and Dot's line)
// node tools/art/shot-boss-c.mjs <port> <outPrefix> <stageId> [ms, comma list]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, id, at = '4000,7000,10000'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(3500);
  await p.evaluate((i) => window.__play(i), id);
  let last = 0;
  for (const t of at.split(',').map(Number)) {
    await p.waitForTimeout(t - last);
    last = t;
    await p.screenshot({ path: `${out}-${tag}-${t}.jpg`, type: 'jpeg', quality: 82 });
  }
  await p.close();
}
await b.close();
