// Stage Cleared, Game Over, a boss fight's HUD and a hurt HUD (empty hearts), upright and sideways, on the old save (dev server).
//   node tools/art/icons/shot-cards.mjs <out dir>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const PORT = process.env.PORT || 4301;
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const b = await chromium.launch();
const go = async (tag, w, h, fn) => {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(seed);
  const p = await ctx.newPage();
  try { await p.goto(`http://127.0.0.1:${PORT}/?lessons=off`); await p.waitForTimeout(7000); await fn(p, tag); } catch (e) { console.log('FAIL', tag, String(e).slice(0, 160)); }
  await ctx.close();
};
for (const [tag, w, h] of [['up', 412, 915], ['side', 915, 412]]) {
  await go(tag, w, h, async (p) => { await p.evaluate(() => window.__win('1-2', 2)); await p.waitForTimeout(3500); await p.screenshot({ path: `${out}/cleared-${tag}.png` }); });
  await go(tag, w, h, async (p) => { await p.evaluate(() => window.__play('1-2')); await p.waitForTimeout(5000);
    await p.evaluate(() => { const e = window.__engine(); e.damagePlayer?.(1); }); await p.waitForTimeout(400); await p.evaluate(() => { const e = window.__engine(); e.invuln = 0; e.invulnTimer = 0; e.damagePlayer?.(1); }); await p.waitForTimeout(900);
    await p.screenshot({ path: `${out}/hurt-${tag}.png` });
    for (let i = 0; i < 4; i++) { await p.evaluate(() => window.__kill()); await p.waitForTimeout(1200); } await p.waitForTimeout(2500); await p.screenshot({ path: `${out}/gameover-${tag}.png` }); });
  await go(tag, w, h, async (p) => { await p.evaluate(() => window.__play('1-10')); await p.waitForTimeout(16000); await p.screenshot({ path: `${out}/boss-${tag}.png` }); });
}
await b.close();
