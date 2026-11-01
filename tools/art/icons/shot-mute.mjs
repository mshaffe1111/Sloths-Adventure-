import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { requireLiveBase, stampBase, writeBase } from './base.mjs';
const out = process.argv[2];
const BASE = requireLiveBase(); writeBase(out, BASE);
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await p.goto(`http://127.0.0.1:${process.env.PORT || 4302}/?lessons=off`); await p.waitForTimeout(8000);
  const t = p.locator('.ttl-token').first();
  const box = await t.boundingBox(); const g = await p.locator('.ttl-token').nth(1).boundingBox();
  console.log(tag, 'drum', box.width, box.height, 'cog', g.width, g.height, await t.getAttribute('aria-label'));
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/corner-pulse-${tag}.png`, clip: { x: box.x - 70, y: 0, width: 160, height: 80 } });
  for (let i = 0; i < 3 && (await t.getAttribute('aria-pressed')) !== 'true'; i++) { await t.tap(); await p.waitForTimeout(500); }
  console.log(tag, 'after taps', await t.getAttribute('aria-label'));
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/corner-mute-${tag}.png`, clip: { x: box.x - 70, y: 0, width: 160, height: 80 } });
  await p.close();
}
await b.close();
