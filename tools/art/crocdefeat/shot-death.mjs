// The fight's last seconds: Crocus Rex's death clip in the real engine (2-10), frames at 0.0/0.5/1.0/1.4/2.2 s, upright and sideways.
//   node tools/art/crocdefeat/shot-death.mjs <out dir> [world]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import { requireLiveBase, stampBase, writeBase } from '../icons/base.mjs';
const out = process.argv[2]; const BASE = requireLiveBase(); writeBase(out, BASE);
const w = process.argv[3] || '2';
const seed = fs.readFileSync(new URL('../satchel-seed.js', import.meta.url), 'utf8');
const b = await chromium.launch();
for (const [tag, W, H] of [['up', 412, 915], ['side', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(seed);
  const p = await ctx.newPage();
  try {
    await p.goto(`http://127.0.0.1:${process.env.PORT || 4301}/?lessons=off`); await p.waitForTimeout(6000);
    await p.evaluate((id) => window.__play(id), `${w}-10`); await p.waitForTimeout(16000);
    // skip any intro card still up, then let the fight start
    for (let i = 0; i < 6; i++) { const s = p.locator('button:has-text("Skip"), button:has-text("FIGHT")').first(); if (await s.count()) { await s.click().catch(() => {}); await p.waitForTimeout(1500); } }
    await p.waitForTimeout(3000);
    const ok = await p.evaluate(() => { const e = window.__engine(); const bo = e?.boss; if (!bo) return false; bo.hp = 0; e.startBossDeath(bo); return true; });
    if (!ok) { console.log('FAIL no boss', tag); continue; }
    // (screenshots take longer than the clip's steps: pause the engine, which keeps drawing, and set the death clock to each moment)
    await p.evaluate(() => { window.__engine().isPaused = true; });
    for (const at of [0.05, 0.35, 0.5, 0.7, 0.95, 1.3]) {
      await p.evaluate((t) => { const bo = window.__engine().boss; bo.ai.t = t; }, at); await p.waitForTimeout(350);
      await stampBase(p, BASE); await p.screenshot({ path: `${out}/death-${tag}-${String(at).replace('.', '_')}s.png` });
    }
    await p.evaluate(() => { window.__engine().isPaused = false; }); await p.waitForTimeout(2500);
    await stampBase(p, BASE); await p.screenshot({ path: `${out}/death-${tag}-after.png` });
  } catch (e) { console.log('FAIL', tag, String(e).split('\n')[0].slice(0, 140)); }
  await ctx.close();
}
await b.close();
