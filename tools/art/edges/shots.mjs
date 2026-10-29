// In-game screenshots of the backdrops for the edge fix, upright 390x844 and sideways 844x390.
//   npx vite --port=4301 --host=127.0.0.1 --strictPort &   node tools/art/edges/shots.mjs <out dir> [stage ...]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [out, ...ids] = process.argv.slice(2);
const stages = ids.length ? ids : ['1-1', '1-8', '2-1', '4-1', '5-1', '5-4', '5-7', '6-2', '7-1', '8-1'];
mkdirSync(out, { recursive: true });
const b = await chromium.launch();
for (const [w, h, tag] of [[390, 844, 'up'], [844, 390, 'side']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:4301/?lessons=off');
  await p.waitForTimeout(3000);
  for (const id of stages) {
    await p.evaluate((id) => window.__play(id), id);
    await p.waitForTimeout(5000);
    await p.screenshot({ path: `${out}/${id}-${tag}.png` });
    console.log(id, tag);
  }
  await p.close();
}
await b.close();
