// story-art before/after stills: one picture of a story, upright and sideways, phone pixel ratio 3, every 'WAIT' ms after it opens
// node tools/art/storyart/shots.mjs <port> <outDir> <tag> <screen> <stageId> <panel,panel,...> [extra query]
// screen: story_cutscene (the prologue), world_story, ending_story, ... ; each panel opened fresh with ?storyAt=N (dev build)
import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const [port, out, tag, scr, id, list, extra = ''] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const n of list.split(',')) {
  for (const [o, w, h] of [['up', 390, 844], ['side', 844, 390]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
    p.on('pageerror', (e) => { if (!/AudioParam/.test(e.message)) console.log('ERR', e.message); });
    await p.goto(`http://127.0.0.1:${port}/?lessons=off&storyAt=${n}${extra}`);
    await p.waitForTimeout(2500);
    await p.evaluate(([i, s]) => window.__story(i, s), [id, scr]);
    await p.waitForTimeout(+(process.env.WAIT ?? 4200));
    await p.screenshot({ path: `${out}/${tag}-${String(n).padStart(2, '0')}-${o}.jpg`, type: 'jpeg', quality: 80 });
    await p.close();
  }
}
await b.close();
