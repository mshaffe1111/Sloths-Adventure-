// BUILD-23e: 2-3's parade swim on the real page (a vite dev server on 5181): the stage's widest still, safe water (the pond), every cage
// freed by the engine's own freeing and the line formed behind him on the near bank; he steps across to the far bank (one move, his trail
// runs straight over the water) and the line paddles over it behind him, as the game draws splash-back water under a little one. A still
// when the line is mid-water, upright and sideways, 2x. (stills23.mjs's '4-parade' took the first small gap and splashed: not the pond.)
//   node reference/qa-reports/BUILD-23/parade23e.mjs <out dir> [easy]
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const [out, easy] = process.argv.slice(2);
const set = easy ? 'easy' : 'normal';
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  // (Easy is the saved setting (difficulty.ts DIFFICULTY_KEY in localStorage); the page has no URL switch for it: '&difficulty=easy' alone
  // loaded Normal, BUILD-23e found)
  if (easy) await p.addInitScript(() => localStorage.setItem('sloth_difficulty', 'easy'));
  await p.goto(`http://127.0.0.1:5181/?lessons=off${easy ? '&difficulty=easy' : ''}`);
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('2-3', 1));
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const r = await p.evaluate((E) => {
    const e = eval(E);
    e.isPaused = true;
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    const ponds = (e.currentStage.rivers ?? []).filter((q) => q.safe && q.speed === 0).sort((a, c) => (c.x1 - c.x0) - (a.x1 - a.x0));
    const pond = ponds[0];
    const ground = (x) => e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    const near = pond.x0 - 150, far = pond.x1 + 90;
    const put = (x) => { const g = ground(x); Object.assign(e.player, { x, y: g ? g.y : 580, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 9 }); };
    put(near);
    for (let i = 0; i < 10; i++) e.update(1 / 30);
    for (const c of e.collectibles.filter((q) => q.type === 'cage' && !q.collected)) { e.freeCritter(c); c.collected = true; }
    e.follow.line.forEach((q, i) => Object.assign(q, { state: 'follow', x: near - 30 - 30 * i, back: undefined }));
    for (let i = 0; i < 45; i++) { e.update(1 / 30); put(near); }
    // (across, 8 px a frame at the bank's height: his trail runs straight over the pond to the far bank and the line follows it. One
    // teleport across re-forms the whole line behind him, as a respawn does, so he walks it)
    const y0 = e.player.y;
    let x = near, k = 0, g = null;
    for (; k < 300; k++) {
      x = Math.min(far, x + 8);
      g = ground(x);
      Object.assign(e.player, { x, y: g ? g.y : y0, vx: 0, vy: 0, grounded: true, facing: 1, invincibleTimer: 9 });
      e.update(1 / 30);
      Object.assign(e.player, { x, y: g ? g.y : y0, vy: 0, grounded: true });
      const wet = e.follow.line.filter((q) => q.x > pond.x0 && q.x < pond.x1).length;
      // (the still: him stood on real footing (a stone or the far bank), three of the line in the water behind him)
      // (and two of them within 190 px behind him, so they share an upright screen with him: 412 px wide)
      const near2 = e.follow.line.filter((q) => q.x > pond.x0 && q.x < pond.x1 && x - q.x < 190).length;
      if (g && near2 >= 2 && wet >= Math.min(3, e.follow.line.length)) break;
    }
    return { on: g ? [Math.round(g.x), Math.round(g.width), g.type] : null, pond: [Math.round(pond.x0), Math.round(pond.x1)], k, px: Math.round(e.player.x), line: e.follow.line.map((q) => `${q.kind}:${q.state}@${Math.round(q.x)}${q.paddle ? '~' : ''}`) };
  }, E);
  // (no hit flicker on the still: the stand above held him invincible only so no stray touch reset him)
  for (let i = 0; i < 2; i++) { await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); }
  const file = path.join(out, `b23e-${set}-4-parade-swim-${tag}.jpg`);
  await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
  console.log('wrote', path.basename(file), JSON.stringify(r));
  await p.context().close();
}
await b.close();
