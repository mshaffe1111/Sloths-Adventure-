// The Story player (title -> Story) on the old save, upright and sideways: its tip lantern, text arrows and hold-to-skip paws.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { requireLiveBase, stampBase, writeBase } from './base.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const BASE = requireLiveBase(); writeBase(out, BASE);
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const b = await chromium.launch();
for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(seed);
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:${process.env.PORT || 4301}/?lessons=off`); await p.waitForTimeout(7000);
  await p.locator('.ttl-leaf >> nth=1').click(); await p.waitForTimeout(3500);
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/story-${tag}.png` });
  await p.mouse.move(w / 2, h / 2); await p.mouse.down(); await p.waitForTimeout(600);
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/story-hold-${tag}.png` }); await p.mouse.up();
  await ctx.close();
}
await b.close();
