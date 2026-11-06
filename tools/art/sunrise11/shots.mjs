// 1-1 backdrop shots (art-1-1-sunrise): the start, a low view over the creek bed (x 8932, the lowest floor) and a high view
// (x 34471, the highest ledges), upright 412x915 and sideways 915x412, deviceScaleFactor 2.
//   npx vite --port=4301 --host=127.0.0.1 --strictPort &   node tools/art/sunrise11/shots.mjs <out dir> <tag>
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const [out, tag = 'x'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
// (SPOTS=name:x,name:x... adds spots on the floor under each x, e.g. to step along and find a clearing of the middle strip)
const SPOTS = [['start', null], ['low', [8932 + 60, 1690]], ['high', [34471 + 100, 312]]];
const EXTRA = (process.env.SPOTS ?? '').split(',').filter(Boolean).map((s) => { const [n, x] = s.split(':'); return [n, [+x, null]]; });
if (process.env.ONLY_EXTRA) SPOTS.length = 0;
SPOTS.push(...EXTRA);
const b = await chromium.launch();
for (const [w, h, o] of [[412, 915, 'up'], [915, 412, 'side']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto(`http://127.0.0.1:${process.env.PORT ?? 4301}/?lessons=off`);
  await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 120000 });
  await p.evaluate(() => window.__play('1-1'));
  await p.waitForTimeout(12000); // (past the iris and the stage title card)
  for (const [name, at] of SPOTS) {
    if (at) {
      await p.evaluate(([x, y]) => {
        const e = typeof window.__engine === 'function' ? window.__engine() : window.__engine;
        if (y == null) y = e.platforms.filter((q) => x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0]?.y ?? 1260;
        Object.assign(e.player, { x, y, vx: 0, vy: 0, grounded: true, climbing: false, facing: 1 });
        e.camCut = true;
      }, at);
      await p.waitForTimeout(1800);
    }
    await p.screenshot({ path: `${out}/${tag}-${name}-${o}.png` });
    console.log(tag, name, o);
  }
  await p.close();
}
await b.close();
