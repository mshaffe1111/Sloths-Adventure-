// Satchel > Trophies > "Rewards for Pokey": the locked rewards' corner padlocks at real size, old save, upright and sideways.
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
  await p.locator('.ttl-leaf-satchel').click(); await p.waitForTimeout(1500);
  await p.locator('[aria-label="Trophies"], button:has-text("Trophies")').first().click(); await p.waitForTimeout(800);
  const m = p.locator('.tr-lockmark').first(); await m.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  const sizes = await p.evaluate(() => [...document.querySelectorAll('.tr-lockmark')].map((e) => { const r = (e.querySelector('img,svg') || e).getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)}`; }));
  console.log(tag, sizes.join(' '));
  const row = await m.evaluate((e) => { const g = e.closest('.tr-grid, .tr-rewards') || e.parentElement.parentElement; const r = g.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: Math.min(r.height, 200) }; });
  await stampBase(p, BASE); await p.screenshot({ path: `${out}/rewards-old-${tag}.png`, clip: { x: Math.max(0, row.x - 6), y: Math.max(0, row.y - 30), width: Math.min(w, row.width + 12), height: row.height + 40 } });
  await ctx.close();
}
await b.close();
