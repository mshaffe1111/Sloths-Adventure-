// polish-a1 screenshots: node tools/art/shot-polish-a1.mjs <port> <outPrefix> <stage> [wait ms] [js run on the engine before the shot]
// shoots upright (390x844) and sideways (844x390) at dpr 3 / 2.6 like a phone; writes <outPrefix>-up.jpg and <outPrefix>-side.jpg
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, stage, wait = '4500', js = ''] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  if (stage !== '-') await p.evaluate((id) => window.__play(id), stage);
  await p.waitForTimeout(+wait);
  if (js) await p.evaluate(js);
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}-${tag}.jpg`, type: 'jpeg', quality: 82 });
  await p.close();
}
await b.close();
