// AF: the Venom Fang fight (1-10) run to its end in the browser, Easy and Normal, counting page errors (PROOF-1 "not proven").
// The development build's hooks (window.__play, __engine). No scripted player drives the live page (bossBot.ts plays the headless engine,
// bossFair.test.ts), so: the fight runs on its own for FIGHT_S seconds with Pokey standing in it (his hearts topped up by the harness, so
// the fight is not cut short by a Game Over), and the guardian is then taken through each phase by lowering his health a step at a time,
// the last step through the engine's own startBossDeath, so the defeat, the stage's end and the victory card run for real.
// node bossend.mjs <dev build url> <out dir>
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
const FIGHT_S = Number(process.env.FIGHT_S ?? 40);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await chromium.launch();
let bad = 0;
for (const diff of ['easy', 'normal']) {
  for (const [vid, viewport] of [['side', { width: 915, height: 412 }]]) {
    const ctx = await browser.newContext({ viewport, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e.message)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.goto(`${url}/?lessons=off`);
    await page.evaluate((d) => { localStorage.clear(); localStorage.setItem('sloth_howto_seen', '1'); localStorage.setItem('sloth_coach_done', '1'); localStorage.setItem('sloth_difficulty', d); }, diff);
    await page.goto(`${url}/?lessons=off`);
    await page.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 60000 });
    await page.evaluate(() => window.__play('1-10'));
    await page.waitForFunction(() => { const e = typeof window.__engine === 'function' ? window.__engine() : null; return !!(e && e.boss); }, null, { timeout: 60000 });
    const log = [];
    const snap = (tag) => page.evaluate((tag) => {
      const e = typeof window.__engine === 'function' ? window.__engine() : null;
      const scr = document.querySelector('.clr-card.clr-won') ? 'victory card' : document.querySelector('.clr-card.lost') ? 'game over' : document.querySelector('.boss-card') ? 'guardian card' : document.querySelector('.sp-next') ? 'story' : 'stage';
      if (!e) return `${tag}: no engine; screen ${scr}`;
      const b = e.boss;
      return `${tag}: boss hp ${b?.hp}/${b?.maxHp} phase ${b?.phase}/${b?.phaseMax} defeated ${b?.defeated}; Pokey hp ${e.player.hp}, lives ${e.lives}; game time ${e.gameTime?.toFixed?.(1)}; screen ${scr}`;
    }, tag);
    log.push(await snap('start'));
    // the fight on its own (a story card or the entrance first: tapped through by the engine's own clock)
    const t0 = Date.now();
    let hurt = 0;
    while (Date.now() - t0 < FIGHT_S * 1000) {
      // (hearts and lives topped up: the fight runs its full length; a fall still costs a life and a respawn, which is played as is)
      hurt += await page.evaluate(() => { const e = typeof window.__engine === 'function' ? window.__engine() : null; if (!e) return 0; const p = e.player; const lost = p.hp < p.maxHp ? 1 : 0; p.hp = p.maxHp; if (typeof e.lives === 'number' && e.lives < 3) e.lives = 3; return lost; });
      await sleep(500);
    }
    log.push(await snap(`after ${FIGHT_S} s of fight (Pokey hurt in ${hurt} of the half-second samples)`));
    await page.screenshot({ path: `${out}/boss-${diff}-${vid}-fight.png` });
    // through each phase, then the end
    const steps = await page.evaluate(() => window.__engine().boss.maxHp);
    for (let k = 1; k <= 3; k++) {
      await page.evaluate((k) => { const e = window.__engine(); const b = e.boss; b.hp = Math.max(1, Math.round(b.maxHp * (1 - k / 4))); e.player.hp = e.player.maxHp; }, k);
      await sleep(6000);
      log.push(await snap(`health set to ${4 - k}/4`));
    }
    await page.evaluate(() => { const e = window.__engine(); const b = e.boss; b.hp = 0; e.startBossDeath(b); });
    // (the guardian's defeat plays its story; the player taps Skip, then the card comes up)
    let won = false;
    const seen = [];
    for (let i = 0; i < 60 && !won; i++) {
      await sleep(1000);
      won = (await page.locator('.clr-card.clr-won').count()) > 0;
      if (won) break;
      const skip = page.locator('.sp-skip').first();
      if (await skip.count()) { seen.push('story: Skip'); await page.screenshot({ path: `${out}/boss-${diff}-${vid}-story.png` }); await skip.evaluate((e) => e.click()); }
    }
    log.push(`after the defeat: ${seen.join(', ') || 'no story'}`);
    await sleep(1500);
    log.push(await snap('after startBossDeath'));
    await page.screenshot({ path: `${out}/boss-${diff}-${vid}-end.png` });
    console.log(`${diff} ${vid} (max hp ${steps}): ${won ? 'VICTORY CARD' : 'NO VICTORY CARD'}; page errors ${errors.length} ${JSON.stringify(errors.slice(0, 3))}\n  ${log.join('\n  ')}`);
    if (!won || errors.length) bad++;
    await ctx.close();
  }
}
await browser.close();
process.exit(bad ? 1 : 0);
