// Every boss's defeat cutscene, panel by panel, upright and sideways (old save; dev server): R-1.1/R-1.2 audit and before/after.
//   node tools/art/crocdefeat/shot-defeats.mjs <out dir> [worlds e.g. 2 or 1-10] [up,side]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { requireLiveBase, stampBase, writeBase } from '../icons/base.mjs';
const out = process.argv[2]; const BASE = requireLiveBase(); writeBase(out, BASE);
const [a, z] = (process.argv[3] || '1-10').split('-').map(Number);
const ways = (process.argv[4] || 'up,side').split(',');
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const b = await chromium.launch();
for (let w = a; w <= (z || a); w++) for (const tag of ways) {
  const [W, H] = tag === 'up' ? [412, 915] : [915, 412];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(seed);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${process.env.PORT || 4301}/?lessons=off`); await p.waitForTimeout(6000);
  await p.evaluate((id) => window.__story(id, 'boss_defeat'), `${w}-10`); await p.waitForTimeout(3500);
  for (let k = 1; k <= 8; k++) {
    await p.waitForTimeout(2600);
    await stampBase(p, BASE); await p.screenshot({ path: `${out}/w${w}-p${k}-${tag}.png` });
    const next = p.locator('button:has-text("Next")').first();
    if (!(await next.count())) break;
    await next.click(); await p.waitForTimeout(400);
    if (!(await p.locator('button:has-text("Next"), button:has-text("Continue")').count())) break;
  }
  await ctx.close();
}
await b.close();
