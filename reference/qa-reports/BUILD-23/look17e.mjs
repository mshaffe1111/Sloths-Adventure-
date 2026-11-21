// BUILD-23e: 1-7's eagle look on the real page (a vite dev server on 5181), for the side-by-side with 2-3's heron look: 1-7 is a gen2 stage
// whose eagle is a cast member (castPlay.ts, habit 'sweep'), so its look is the member's eye out (hunt / tell / act / recover) over its
// stretch [minX, maxX]. He is walked in from 220 px before the first sweep stretch with a bush in it (a teleport into it leaves the eagle at
// 'rest': BUILD-23d), held still in the green, and the steps run until its eye is out over him; a still, upright and sideways, 2x.
//   node reference/qa-reports/BUILD-23/look17e.mjs <out dir>
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import path from 'node:path';
const [out] = process.argv.slice(2);
const b = await chromium.launch();
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
for (const [tag, w, h] of [['upright', 412, 915], ['sideways', 915, 412]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 })).newPage();
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:5181/?lessons=off');
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.__play('1-7', 1));
  await p.waitForTimeout(4000);
  await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3000);
  const r = await p.evaluate((E) => {
    const e = eval(E);
    e.isPaused = true;
    for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
    const ms = e.cast.members.filter((m) => m.def.habit === 'sweep');
    let m = null, bush = null;
    for (const q of ms) { bush = e.proto.bushes.find((k) => k.x >= q.s.minX && k.x + k.w <= q.s.maxX + 60); if (bush) { m = q; break; } }
    if (!m) return { miss: 'no sweep stretch with a bush' };
    const ground = (x) => e.platforms.filter((q) => !q.broken && !q.decorative && q.type === 'solid' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
    const at = Math.round(bush.x + bush.w / 2);
    let x = Math.max(m.s.minX - 220, 200);
    const put = () => { const g = ground(x); Object.assign(e.player, { x, y: g ? g.y : e.player.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1, invincibleTimer: 0 }); };
    put();
    for (let i = 0; i < 10; i++) e.update(1 / 30);
    for (let i = 0; i < 200 && x < at; i++) { x = Math.min(at, x + 6); put(); e.update(1 / 30); }
    const EYE = new Set(['hunt', 'tell']);
    for (let i = 0; i < 1800; i++) {
      put();
      e.update(1 / 30);
      if (EYE.has(m.s.phase) && Math.abs(m.s.eyeX - at) < 90 && m.s.t > 0.3) return { at, bush: [bush.x, bush.w], phase: m.s.phase, eyeX: Math.round(m.s.eyeX), eagle: [Math.round(m.s.x), Math.round(m.s.y)], px: Math.round(e.player.x), i };
    }
    return { at, miss: true, phase: m.s.phase };
  }, E);
  // (Dot's card tapped through, as a player does: up to 4 cards)
  for (let k = 0; k < 4; k++) {
    const card = p.getByText("Tap here when you've read it", { exact: false });
    if (!(await card.count())) break;
    await card.first().click({ timeout: 2000 }).catch(() => {});
    await p.waitForTimeout(400);
  }
  for (let i = 0; i < 2; i++) { await p.evaluate((E) => { const e = eval(E); e.player.invincibleTimer = 0; e.render(); }, E); await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); }
  const file = path.join(out, `b23e-1-7-eagle-look-${tag}.jpg`);
  await p.screenshot({ path: file, type: 'jpeg', quality: 82 });
  console.log('wrote', path.basename(file), JSON.stringify(r));
  await p.context().close();
}
await b.close();
