// polish-c: the result and boss cards, upright and sideways, as frames at `at` ms after each opens
// node tools/art/shot-polish-c.mjs <port> <outPrefix> <win|boss_intro|story_ending> <stageId> [stars] [at ms, comma list]
// (REDUCED=1 for reduced motion; MEDALS=id,id for the win card's medal row)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, what, id, stars = '3', at = '2600'] = process.argv.slice(2);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  if (what === 'win') await p.evaluate(([i, s, m]) => window.__win?.(i, +s, m ? m.split(',') : undefined), [id, stars, process.env.MEDALS ?? '']);
  else await p.evaluate(([i, s]) => window.__story?.(i, s), [id, what]);
  let last = 0;
  for (const t of at.split(',').map(Number)) {
    await p.waitForTimeout(Math.max(0, t - last));
    last = t;
    await p.screenshot({ path: `${out}-${tag}${at.includes(',') ? '-' + t : ''}.jpg`, type: 'jpeg', quality: 84 });
  }
  await p.close();
}
await b.close();
