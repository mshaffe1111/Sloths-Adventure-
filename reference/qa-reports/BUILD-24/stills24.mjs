// BUILD-24b: 2-4's stills on the real page (dev server), the setting set (DIFF=normal|easy), Dot's cards ON and tapped through: tools/engine/
// runs/stills-at-setting.mjs's way (the engine paused, Pokey placed, 60 frames stepped, then 30 stepped AND rendered), 2x, upright 412x915
// and sideways 915x412, the WHOLE screen (HUD, Dot, cards). Each card that comes up is shot, then tapped away, as a player does. A spot
// `x:name:dot` keeps Dot's tips there unsaid until he stands at it (her line on screen); any other spot marks them said.
//   PW=... node reference/qa-reports/BUILD-24/stills24.mjs <port> <out dir> <layout> <x:name[:dot]> ...
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, layout, ...spots] = process.argv.slice(2);
const DIFF = process.env.DIFF ?? 'normal';
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, DIFF);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  const shot = async (name) => { const f = path.join(out, `s24b-2-4-L${layout}-${DIFF}-${name}-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 80 }); console.log('wrote', f); };
  // (each card up now: shot, then tapped away at the screen's middle, as a thumb does)
  const cards = async (name) => {
    for (let k = 0; k < 6; k++) {
      const up = await p.evaluate(() => document.documentElement.dataset.hudCard === '1');
      if (!up) return;
      await p.waitForTimeout(900);
      await shot(`${name}-card${k}`);
      await p.mouse.click(w / 2, h / 2);
      await p.waitForTimeout(700);
    }
  };
  await p.goto(`http://127.0.0.1:${port}/`);
  await p.waitForTimeout(2500);
  await p.evaluate(([v]) => window.__play('2-4', v), [+layout]);
  await p.waitForTimeout(4000);
  console.log('BUILT', tag, await p.evaluate((E) => { const e = eval(E); const g = e?.currentStage?.gen2; return JSON.stringify({ stage: e?.currentStage?.config?.id, seed: g?.seed, built: g?.budget?.difficulty, stored: localStorage.getItem('sloth_difficulty') }); }, E));
  await shot('start');
  await cards('start');
  for (const spot of spots) {
    const [xs, name = 'beat', dot] = spot.split(':'); const x = +xs;
    await p.evaluate(([x, dot, E]) => {
      const e = eval(E);
      e.isPaused = true;
      const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && q.type !== 'drift' && x >= q.x && x <= q.x + q.width).sort((a, c) => c.y - a.y)[0];
      Object.assign(e.player, { x, y: under ? under.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 });
      for (const hh of e.currentStage?.proto?.hints ?? []) if (!dot || Math.abs(hh.x - x) > 400) hh.shown = true;
      for (let i = 0; i < 60; i++) e.update(1 / 30);
    }, [x, dot ?? '', E]);
    for (let i = 0; i < 30; i++) {
      await p.evaluate((E) => { const e = eval(E); e.update(1 / 30); e.player.invincibleTimer = 0; e.render(); }, E);
      await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    }
    await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E);
    await shot(`x${x}-${name}`);
    await cards(`x${x}-${name}`);
  }
  await ctx.close();
}
await b.close();
