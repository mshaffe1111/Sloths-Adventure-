// polish-a1: the world map, upright and sideways (title -> Play -> map, whatever the save)
// node tools/art/shot-map-a1.mjs <port> <outPrefix> [js run before the shot]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, js = ''] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3500);
  if (js) { await p.evaluate(js); await p.waitForTimeout(1200); }
  await p.screenshot({ path: `${out}-${tag}.jpg`, type: 'jpeg', quality: 84 });
  await p.close();
}
await b.close();
