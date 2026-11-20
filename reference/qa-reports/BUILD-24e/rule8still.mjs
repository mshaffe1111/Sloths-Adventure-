// BUILD-24e item 2 (level.md rule 8): 2-4 L1 Normal, the catch beat, UPRIGHT 412x915, the whole screen, real page (dev server, port arg).
// Pokey stands at the bank lip (x9985), walks onto the first log out, rides it; frames k after he is settled (S0). A flick (lean right,
// full hold) at ride frame 69 catches the liana (catch2 search: 69 is the only frame that does). Shots: the bank, k=60 (the liana
// swinging back toward him), k=66, k=69 (the press). Prints Pokey's head and the liana (pivot, tip, nearest rope point) in CSS px.
//   node rule8still.mjs <port> <out dir>     (Dot's lines are marked shown and cleared so the board is clear; say so with the stills)
const { chromium } = (await import(process.env.PW ?? '/opt/node22/lib/node_modules/playwright/index.js')).default;
import fs from 'node:fs';
const [port, out] = process.argv.slice(2);
const [W, H] = [412, 915];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForTimeout(4000);
await p.evaluate(() => window.__play('2-4', 1)); await p.waitForTimeout(5000);
for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(W / 2, H / 2); await p.waitForTimeout(700); }
const measure = () => p.evaluate(([W]) => {
  const E = window.E, P = E.player, V = E.vines.find(v => v.id === 4), c = E.camera;
  const s = W / c.viewportWidth; const sx = (x) => (x - c.x) * s, sy = (y) => (y - c.y) * s;
  const L = V.bottomY - V.topY, a = V.swingAngle;
  const tip = [V.x + Math.sin(a) * L, V.topY + Math.cos(a) * L];
  const pw = P.width ?? 48, head = [P.x + pw / 2, P.y - 89.1];
  // nearest point on the rope (pivot -> tip) to his head
  const t = Math.max(0, Math.min(1, ((head[0] - V.x) * (tip[0] - V.x) + (head[1] - V.topY) * (tip[1] - V.topY)) / (L * L)));
  const near = [V.x + (tip[0] - V.x) * t, V.topY + (tip[1] - V.topY) * t];
  const r = (q) => [Math.round(sx(q[0])), Math.round(sy(q[1]))];
  const H = c.viewportHeight * s;
  return { built: { diff: localStorage.getItem('sloth_difficulty'), stage: E.currentStage?.id, orient: `${W}x${Math.round(H)}` }, worldX: Math.round(P.x), onGround: P.grounded, swinging: !!P.isVineSwinging,
    headCss: r(head), pivotCss: r([V.x, V.topY]), tipCss: r(tip), nearestCss: r(near), headToNearestPx: Math.round(Math.hypot(near[0] - head[0], near[1] - head[1]) * s),
    headToTipPx: Math.round(Math.hypot(tip[0] - head[0], tip[1] - head[1]) * s), headToRightEdgePx: Math.round(W - sx(head[0])),
    lianaOnScreen: { pivot: sx(V.x) >= 0 && sx(V.x) <= W && sy(V.topY) >= 0, tip: sx(tip[0]) >= 0 && sx(tip[0]) <= W && sy(tip[1]) >= 0 && sy(tip[1]) <= H } };
}, [W]);
const shoot = async (name) => { await p.evaluate(() => window.E.render()); const f = `${out}/2-4-L1-normal-catch-${name}-upright.jpg`; await p.screenshot({ path: f, type: 'jpeg', quality: 85 }); const m = await measure(); console.log(name, f, JSON.stringify(m)); return m; };
await p.evaluate(() => {
  const E = typeof window.__engine === 'function' ? window.__engine() : window.__engine; window.E = E; E.isPaused = true;
  const P = E.player, V = E.vines.find(v => v.id === 4);
  const prim = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v === null || typeof v !== 'object' && typeof v !== 'function'));
  window.step = (n) => { for (let i = 0; i < n; i++) { E.update(1 / 30); P.invincibleTimer = 0; } };
  window.logs = () => E.platforms.filter(q => q.type === 'drift' && q.x > 9900 && q.x < 10900);
  for (const hh of E.currentStage?.proto?.hints ?? []) hh.shown = true; E.clearGuide?.();
  Object.assign(P, { x: 9985, y: 939, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1 });
  window.step(10);
  let w = 0; while (!window.logs().some(q => q.x > 10028 - 150 + 20 && q.x < 10028 - 150 + 30) && w++ < 400) window.step(1);
  window.snapBank = { gt: E.gameTime };
  window.prim = prim;
});
await p.evaluate(() => window.step(1));
const bank = await shoot('bank');
await p.evaluate(() => {
  const E = window.E, P = E.player, V = E.vines.find(v => v.id === 4); const prim = window.prim;
  E.input.triggerTouchMove('right'); let on = null, s = 0;
  while (s++ < 90) { window.step(1); on = window.logs().find(q => P.grounded && P.x >= q.x + 10 && P.x <= q.x + q.width - 10 && Math.abs(P.y - q.y) < 4); if (on && P.x > on.x + 40) break; }
  E.input.triggerTouchMove('none'); window.step(2);
  window.S0 = { gt: E.gameTime, P: prim(P), V: prim(V), cam: prim(E.camera), E: prim(E), logs: window.logs().map(q => prim(q)) };
  window.restore = (sn) => { Object.assign(P, sn.P); Object.assign(V, sn.V); Object.assign(E.camera, sn.cam); for (const [k, v] of Object.entries(sn.E)) { try { E[k] = v; } catch {} } window.logs().forEach((q, i) => Object.assign(q, sn.logs[i])); E.gameTime = sn.gt; };
});
const ms = { bank };
for (const k of [60, 66, 69]) { await p.evaluate((k) => { window.restore(window.S0); window.step(k); }, k); ms['k' + k] = await shoot(`log-k${k}${k === 69 ? '-press' : ''}`); }
// without a press: does he take the liana anyway?
ms.noPress = await p.evaluate(() => { window.restore(window.S0); window.step(69); const r = []; for (let i = 0; i < 8; i++) { window.step(1); r.push([Math.round(window.E.player.x), window.E.player.grounded, !!window.E.player.isVineSwinging]); } return r; });
console.log('noPress k70-77 [x, grounded, swinging]:', JSON.stringify(ms.noPress));
fs.writeFileSync(`${out}/rule8-measures.json`, JSON.stringify(ms, null, 1));
await b.close();
