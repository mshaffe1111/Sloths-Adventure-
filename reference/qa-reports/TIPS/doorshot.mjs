// TIPS 4b (R-165.241): the sealed door on the real page, in real time, a fresh save on the default setting. Pokey is stood 260 px short
// of the shut door on its ground with the goal unmet and walks into it (the keyboard's right arrow, held); stills 1.5 s and 4 s after
// the door first holds him: the "N more" plate and Dot's line why. Prints BUILT (D62) and Dot's bubble words as the page shows them.
//   node doorshot.mjs <port> <outdir> <stage> <up|side> [normal|easy]
import fs from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const [port, out, stage = '1-2', ori = 'side', diff = 'normal'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await ctx.route(/script\.google\.com/, (r) => r.abort());
await ctx.addInitScript((d) => { try { localStorage.clear(); if (d === 'easy') localStorage.setItem('sloth_difficulty', 'easy'); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`, { timeout: 300000 });
await p.waitForFunction(() => typeof window.__play === 'function', null, { timeout: 300000 });
await p.waitForTimeout(1500);
await p.evaluate((s) => window.__play(s, 1), stage);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player); }, E, { timeout: 120000 });
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(2500);
const built = await p.evaluate(([E, ori]) => {
  const e = eval(E); const st = e.currentStage;
  const dx = st.exitTotemX, dy = st.exitTotemY + 24, x = dx - 260;
  const pl = e.platforms.filter((q) => q.x <= x && q.x + q.width >= x).sort((a, z) => Math.abs(a.y - dy) - Math.abs(z.y - dy))[0];
  for (const h of st.proto?.hints ?? []) h.shown = true;
  Object.assign(e.player, { x, y: pl.y - e.player.height, vx: 0, vy: 0, climbing: false, facing: 1 });
  // (never held invincible: he blinks see-through, and Dot holds her lines while he is hurt-invincible; TIPS Method update)
  return { stage: st.config.id, objective: st.config.objectiveType, need: st.config.targetCount, built: st.gen2?.budget?.difficulty ?? 'hand', seed: st.gen2?.seed, ori, door: [dx, dy] };
}, [E, ori]);
console.log('BUILT', JSON.stringify(built));
await p.waitForTimeout(800);
await p.keyboard.down('ArrowRight');
const t0 = Date.now();
await p.waitForFunction((E) => { const e = eval(E); return Math.abs(e.player.x - (e.currentStage.exitTotemX - 35)) < 6; }, E, { timeout: 15000 }).catch(() => console.log('never held at the door'));
const atDoor = Date.now() - t0;
const bub = () => p.evaluate(() => [...document.querySelectorAll('.dg-bub.in')].map((d) => d.textContent.trim().slice(0, 70)).join(' | '));
await p.waitForTimeout(1500);
await p.screenshot({ path: `${out}/${stage}-${ori}-${diff}-1.5s.jpg`, type: 'jpeg', quality: 82 });
const b15 = await bub();
await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/${stage}-${ori}-${diff}-4s.jpg`, type: 'jpeg', quality: 82 });
const b4 = await bub();
await p.keyboard.up('ArrowRight');
console.log('DOOR', JSON.stringify({ heldAfterMs: atDoor, bubbleAt1_5s: b15, bubbleAt4s: b4 }));
await b.close();
