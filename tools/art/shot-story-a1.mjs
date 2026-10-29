// polish-a1 ST-1: a world story's first pictures, upright and sideways at phone pixel ratio 3
// node tools/art/shot-story-a1.mjs <port> <outPrefix> <stageId> [pictures]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, id, n = '3'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate((i) => window.__story(i, 'world_story'), id);
  for (let k = 0; k < +n; k++) {
    await p.waitForTimeout(3200);
    await p.screenshot({ path: `${out}-${tag}-${k}.jpg`, type: 'jpeg', quality: 82 });
    // (twice: the first tap finishes the words, the second turns the page)
    await p.mouse.click(w / 2, h * 0.5);
    await p.waitForTimeout(250);
    await p.mouse.click(w / 2, h * 0.5);
  }
  await p.close();
}
await b.close();
