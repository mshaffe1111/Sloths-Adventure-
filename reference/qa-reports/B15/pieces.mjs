// B15: stills of 1-5's new pieces in the real game, upright 412x915 and sideways 915x412, 2x: the creaky limb (whole, creaking under him,
// giving way), the falling limb at the den (riding it down, the snake gliding off), her mark. Pokey placed, the engine stepped and
// rendered frame by frame (stills-at.mjs's way).
//   node reference/qa-reports/B15/pieces.mjs <port> <out dir> [normal|easy]
import fs from 'node:fs';
import path from 'node:path';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, setting = 'normal'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const frames = async (p, n, draw = true) => {
  for (let i = 0; i < n; i++) {
    await p.evaluate(([E, draw]) => { const e = eval(E); e.update(1 / 30); e.clearGuide?.(); if (draw) e.render(); }, [E, draw]);
    if (draw) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
  }
};
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  // (the setting is the game's own stored choice, difficulty.ts DIFFICULTY_KEY, set before the page loads: the page has no URL switch)
  await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch { /* storage blocked */ } }, setting);
  await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-5', 1));
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(4000);
  const shot = async (name) => { const f = path.join(out, `${setting}-${name}-${tag}.jpg`); await p.screenshot({ path: f, type: 'jpeg', quality: 74 }); console.log('wrote', f); };
  // (place him standing on a platform at x; the engine paused, the frames stepped by hand)
  const place = (sel) => p.evaluate(([E, sel]) => {
    const e = eval(E);
    e.isPaused = true;
    const creak = e.platforms.filter((q) => q.type === 'fragile' && q.creak !== undefined).sort((a, c) => a.x - c.x);
    const trap = e.cast?.traps?.find((t) => t.post.kind === 'limb');
    const q = sel === 'limb' ? creak.find((c) => !c.creakFree && !c.trapLoad) : sel === 'den' ? e.platforms.find((c) => c.id === trap?.post.limb) : null;
    if (sel === 'mark') {
      const m = e.currentStage.collectibles.filter((c) => c.mark === 'meeca').sort((a, c) => a.x - c.x)[2];
      const g = e.platforms.filter((c) => !c.broken && m.x - 140 >= c.x && m.x - 140 <= c.x + c.width && c.y > m.y).sort((a, c) => a.y - c.y)[0];
      Object.assign(e.player, { x: m.x - 140, y: g.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
      return true;
    }
    if (!q) return false;
    Object.assign(e.player, { x: q.x + q.width / 2 - 22, y: q.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 });
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    return true;
  }, [E, sel]);
  // the creaky limb: whole from the low road, creaking under him, giving way
  if (await place('limb')) {
    await frames(p, 10); await shot('limb-1-creaking');
    await frames(p, 26); await shot('limb-2-giving-way');
    await frames(p, 8); await shot('limb-3-down');
  }
  // the falling limb at the den: on it, riding it down, the snake gliding off
  if (await place('den')) {
    await frames(p, 12); await shot('den-1-on-the-limb');
    await frames(p, 30); await shot('den-2-riding-it-down');
    await frames(p, 24); await shot('den-3-the-snake-glides-off');
  }
  if (await place('mark')) { await frames(p, 30); await shot('her-mark'); }
  await ctx.close();
}
await b.close();
