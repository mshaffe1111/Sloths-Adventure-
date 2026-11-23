// HUD-VINE: on each upright phone size, is the lower-row counter's short vine (its tiles and both curls) clear of every heart?
//   node clearHud.mjs <port> <stage>[,<stage>...] [outDir]   (prints the gap in css px; a still per size when outDir is given)
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const [port, stages, outDir] = process.argv.slice(2);
const sizes = [[360, 780], [375, 667], [390, 844], [412, 915], [430, 932], [320, 640]];
const b = await chromium.launch();
for (const stage of stages.split(',')) for (const [w, h] of sizes) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true })).newPage();
  await p.goto(`http://localhost:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(([id, v]) => window.__play(id, v), [stage, 1]);
  await p.waitForTimeout(3500);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard === '1', null, { timeout: 10000 }).catch(() => {});
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const r = await p.evaluate(() => {
    const goal = document.querySelector('.vh-goal');
    if (!goal) return { none: true };
    const g = goal.getBoundingClientRect();
    const vine = goal.firstElementChild; // the strip's wrapper span (absolute, aria-hidden)
    const parts = vine && vine.tagName === 'SPAN' && !vine.className ? [...vine.children].map((e) => e.getBoundingClientRect()) : [];
    const hearts = [...document.querySelectorAll('.vh-hearts .vh-heart')].map((e) => e.getBoundingClientRect());
    let gap = Infinity;
    for (const a of parts) for (const hh of hearts) {
      if (a.right <= hh.left || a.left >= hh.right) continue; // no overlap in x
      gap = Math.min(gap, a.top - hh.bottom);
    }
    return { goalTop: Math.round(g.top), parts: parts.length, hearts: hearts.length, gap: gap === Infinity ? 'none above' : +gap.toFixed(1),
      ends: parts.length ? [Math.round(Math.min(...parts.map((a) => a.left)) - g.left), Math.round(Math.max(...parts.map((a) => a.right)) - g.left), Math.round(g.width)] : null };
  });
  console.log(stage, `${w}x${h}`, JSON.stringify(r));
  if (outDir) await p.screenshot({ path: `${outDir}/${stage}-${w}x${h}.png`, clip: { x: 0, y: 0, width: w, height: 140 } });
  await p.context().close();
}
await b.close();
