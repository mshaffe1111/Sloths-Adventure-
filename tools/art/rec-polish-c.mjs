// polish-c: a short clip of a card opening (the stage-cleared count-up and entrance, the boss cards), upright and sideways
// node tools/art/rec-polish-c.mjs <port> <outDir> <win|boss_card|story_ending> <stageId> [stars] [ms]   (MEDALS=id,id; REDUCED=1)
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, outDir, what, id, stars = '3', ms = '4000'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference', recordVideo: { dir: outDir, size: { width: w, height: h } } });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(3000);
  if (what === 'win') await p.evaluate(([i, s, m]) => window.__win?.(i, +s, m ? m.split(',') : undefined), [id, stars, process.env.MEDALS ?? '']);
  else await p.evaluate(([i, s]) => window.__story?.(i, s), [id, what]);
  await p.waitForTimeout(+ms);
  const v = p.video();
  await ctx.close();
  fs.renameSync(await v.path(), path.join(outDir, `${what}-${id}-${tag}.webm`));
}
await b.close();
