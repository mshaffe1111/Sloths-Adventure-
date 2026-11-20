// BUILD-24d: (VAR-19c, from BUILD-24d's stills24d.mjs, the stage an argument) a stage's stills as a PLAYER meets them, on the real page (dev server), Dot's lessons ON (the default), the setting set (DIFF).
// stills24.mjs (BUILD-24b) tapped the screen's MIDDLE to clear "cards": that clears the stage-start goal card (dataset.hudCard), never
// Dot's line, and Pokey never hopped, so the one move tip Dot says first ("Flick up to hop up or over.": a move tip stays until its move
// is done, dotGuide.ts) sat over every later spot. Here: (1) the START is walked in real time from where he stands; when Dot's hop line is
// up and he is stopped against what it is about, he HOPS (the game's own touch input, triggerTouchUp), as she asks; (2) every spot is walked
// into from 300 px short (Dot's lines there unsaid), shot, and each of Dot's cards up is shot and then TAPPED ON THE CARD (.dg-bub), as a
// thumb clears it (DotGuide.tsx onCard; dotGuide.ts tap). 2x, upright 412x915 and sideways 915x412, the whole screen.
//   PW=... node reference/qa-reports/VAR-19c/stills19c.mjs <port> <out dir> <stage> <layout> <x:name> ...   (DIFF=normal|easy, ORIENT=both|upright|sideways)
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, stage, layout, ...spots] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
const ORIENT = process.env.ORIENT ?? 'both';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const log = [];
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  if (ORIENT !== 'both' && ORIENT !== tag) continue;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const shot = async (name) => { const f = path.join(out, `${stage}-L${layout}-${DIFF}-${name}-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 85 }); console.log('wrote', f); };
  const bubble = async () => p.evaluate(() => { const el = document.querySelector('.dg-bub'); return el ? (el.querySelector('.dg-bub-body p')?.textContent ?? '') + ((el.querySelector('.dg-more') && !el.querySelector('.dg-more').hidden) ? ` [${el.querySelector('.dg-more').textContent}]` : '') : null; });
  const step = async (n, input) => {
    for (let i = 0; i < n; i++) {
      await p.evaluate(([E]) => { const e = eval(E); e.update(1 / 30); e.player.invincibleTimer = 0; e.render(); }, [E]);
      await p.waitForTimeout(33);
    }
  };
  // (each of Dot's cards up: read for 2 s, shot, then tapped on the card itself)
  const dotCards = async (name) => {
    for (let k = 0; k < 8; k++) {
      const t = await bubble();
      if (t === null) return;
      await step(45);
      const t2 = await bubble();
      if (t2 === null) return;
      await shot(`${name}-dot${k}`);
      log.push(`${tag} ${name} card${k}: ${t2}`);
      await p.locator('.dg-bub').first().tap({ timeout: 2000 }).catch(() => {});
      await step(20);
    }
  };
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate(([s, v]) => window.__play(s, v), [stage, +layout]);
  await p.waitForTimeout(4000);
  for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await shot(`start-goal${k}`); await p.touchscreen.tap(w / 2, h / 2); await p.waitForTimeout(700); }
  await p.evaluate((E) => { eval(E).isPaused = true; }, E);
  // (1) the start, walked: he hops when Dot's hop line is up and he is stopped against the boulder it is about
  await p.evaluate((E) => eval(E).input.triggerTouchMove('right'), E);
  let lastX = -1, still = 0, hopShot = false, hops = 0, hopCardGone = false;
  for (let i = 0; i < 600; i++) {
    await step(1);
    const x = await p.evaluate((E) => eval(E).player.x, E);
    const t = await bubble();
    if (t && /hop up or over/.test(t) && !hopShot) { await shot('start-hop-card'); log.push(`${tag} start x${Math.round(x)} (frame ${i}): ${t}`); hopShot = true; }
    if (hopShot && !hopCardGone && !(t && /hop up or over/.test(t))) { hopCardGone = true; log.push(`${tag} the hop card went at x${Math.round(x)} (frame ${i}, after ${hops} hop(s)); now: ${t}`); await shot('start-hop-card-gone'); }
    still = Math.abs(x - lastX) < 0.5 ? still + 1 : 0;
    lastX = x;
    // (stopped against a step or a rock: he hops, as a player does; the first hop after the card is the one it asks for)
    if (still >= 3) {
      if (hopShot && !hopCardGone) await shot(`start-at-rock-card-up`);
      await p.evaluate((E) => eval(E).input.triggerTouchUp(1, 200), E);
      hops++;
      log.push(`${tag} hop ${hops} at x${Math.round(x)} (card: ${t ?? 'none'})`);
      still = -20;
    }
    if (x > 1500 && (hopCardGone || x > 2600)) break;
  }
  await p.evaluate((E) => eval(E).input.triggerTouchMove('none'), E);
  await step(20);
  const after = await bubble();
  log.push(`${tag} after the hop x${Math.round(lastX)}: ${after}`);
  await shot('start-after-hop');
  await dotCards('start-after-hop');
  // (2) each spot, walked into from 300 px short
  for (const spot of spots) {
    const [xs, name = 'beat', from] = spot.split(':'); const x = +xs;
    await p.evaluate(([x, E, from]) => {
      const e = eval(E);
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.type !== 'drift' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
      const x0 = from ? +from : x - 300;
      const u0 = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.type !== 'drift' && x0 >= q.x && x0 <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x: x0, y: (u0 ?? under) ? (u0 ?? under).y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
      for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = Math.abs(hh.x - x) > 400;
      e.clearGuide?.();
      e.updateCamera?.(1 / 30);
    }, [x, E, from ?? '']);
    await p.evaluate((E) => eval(E).input.triggerTouchMove('right'), E);
    for (let i = 0; i < 200 && (await p.evaluate((E) => eval(E).player.x, E)) < x; i++) await step(1);
    await p.evaluate((E) => eval(E).input.triggerTouchMove('none'), E);
    await step(20);
    await shot(`x${x}-${name}`);
    log.push(`${tag} x${x} ${name}: ${await bubble()}`);
    await dotCards(`x${x}-${name}`);
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(path.join(out, `cards-${stage}-${DIFF}-L${layout}.txt`), log.join('\n') + '\n');
console.log(log.join('\n'));
