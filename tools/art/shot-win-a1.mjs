// polish-a1: the stage-cleared card (dev hook __win), upright and sideways; frames at `at` ms after it opens
// node tools/art/shot-win-a1.mjs <port> <outPrefix> <stageId> <stars> [at ms, comma list]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, id, stars, at = '1800'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  await p.evaluate(([i, s]) => window.__win?.(i, +s), [id, stars]);
  let last = 0;
  for (const t of at.split(',').map(Number)) {
    await p.waitForTimeout(Math.max(0, t - last));
    last = t;
    await p.screenshot({ path: `${out}-${tag}${at.includes(',') ? '-' + t : ''}.jpg`, type: 'jpeg', quality: 84 });
  }
  await p.close();
}
await b.close();
