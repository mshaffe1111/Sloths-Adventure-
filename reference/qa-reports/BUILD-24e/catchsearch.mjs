// BUILD-24e rule-8 probe (2-4 L1 Normal catch beat, real page): Pokey rides the first log out from the bank lip; for each ride frame k a
// flick (lean right, full hold) is pressed; a press "catches" when he is swinging on the liana within 2 s. Snapshot/restore by gameTime.
const { chromium } = (await import('/opt/node22/lib/node_modules/playwright/index.js')).default;
const [W, H] = [+(process.env.W ?? 412), +(process.env.H ?? 915)];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
await ctx.addInitScript(() => { try { localStorage.setItem('sloth_difficulty', 'normal'); } catch {} });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto('http://127.0.0.1:4417/'); await p.waitForTimeout(4000);
await p.evaluate(() => window.__play('2-4', 1)); await p.waitForTimeout(5000);
for (let k = 0; k < 6 && (await p.evaluate(() => document.documentElement.dataset.hudCard === '1')); k++) { await p.touchscreen.tap(W / 2, H / 2); await p.waitForTimeout(700); }
const r = await p.evaluate((KS) => {
  const E = typeof window.__engine === 'function' ? window.__engine() : window.__engine; window.E = E; E.isPaused = true;
  const P = E.player, V = E.vines.find(v => v.id === 4);
  const prim = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v === null || typeof v !== 'object' && typeof v !== 'function'));
  const step = (n) => { for (let i = 0; i < n; i++) { E.update(1 / 30); P.invincibleTimer = 0; } };
  const logs = () => E.platforms.filter(q => q.type === 'drift' && q.x > 9900 && q.x < 10900);
  for (const hh of E.currentStage?.proto?.hints ?? []) hh.shown = true; E.clearGuide?.();
  Object.assign(P, { x: 9985, y: 939, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1 });
  step(10);
  // wait for a log just out from under the bank, then walk on
  let w = 0; while (!logs().some(q => q.x > 10028 - 150 + 20 && q.x < 10028 - 150 + 30) && w++ < 400) step(1);
  E.input.triggerTouchMove('right'); let on = null, s = 0;
  while (s++ < 90) { step(1); on = logs().find(q => P.grounded && P.x >= q.x + 10 && P.x <= q.x + q.width - 10 && Math.abs(P.y - q.y) < 4); if (on && P.x > on.x + 40) break; }
  E.input.triggerTouchMove('none'); step(2);
  if (!on) return { err: 'never on a log', x: P.x, y: P.y };
  const snap = () => ({ gt: E.gameTime, P: prim(P), V: prim(V), cam: prim(E.camera), E: prim(E), logs: logs().map(q => prim(q)), vs: ['vines','swingVines','plainVines','drawnVines'].map(k => (E[k] ?? []).map(v => prim(v))), pp: E.platforms.map(q => prim(q)) });
  const restore = (sn) => { Object.assign(P, sn.P); Object.assign(V, sn.V); Object.assign(E.camera, sn.cam); for (const [k, v] of Object.entries(sn.E)) { try { E[k] = v; } catch {} } logs().forEach((q, i) => Object.assign(q, sn.logs[i])); E.gameTime = sn.gt; ['vines','swingVines','plainVines','drawnVines'].forEach((k, i) => (E[k] ?? []).forEach((v, j) => Object.assign(v, sn.vs[i][j]))); E.platforms.forEach((q, i) => Object.assign(q, sn.pp[i])); E.input.clearAll(); };
  const S0 = snap(); window.S0 = S0; window.restore = restore; window.step = step;
  // determinism
  step(30); const a = [P.x, P.y, V.swingAngle, logs()[0].x]; restore(S0); step(30); const bb = [P.x, P.y, V.swingAngle, logs()[0].x]; restore(S0);
  const res = [];
  for (const k of KS.split(',').flatMap(r => { const [a, b] = r.split('-').map(Number); return b === undefined ? [a] : Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => a < b ? a + i : a - i); })) {
    restore(S0); step(k);
    if (!(P.grounded)) { res.push({ k, x: Math.round(P.x), off: 'not on log' }); continue; }
    const at = { x: Math.round(P.x), y: Math.round(P.y), ang: +V.swingAngle.toFixed(2), tipX: Math.round(V.x + Math.sin(V.swingAngle) * (V.bottomY - V.topY)) };
    E.input.triggerTouchUp(1, 300);
    let caught = false; for (let i = 0; i < 60; i++) { step(1); if (P.isVineSwinging && P.swingVineId === 4) { caught = true; break; } }
    E.input.releaseTouchUp?.(); E.input.triggerTouchMove('none');
    res.push({ k, ...at, caught });
  }
  restore(S0);
  return { det: [a, bb], start: { x: P.x, y: P.y, gt: E.gameTime }, res };
}, process.env.KS ?? '0-140');
console.log(JSON.stringify({ det: r.det, start: r.start, err: r.err }));
const c = (r.res ?? []).filter(q => q.caught);
console.log('caught frames:', c.map(q => q.k).join(','));
for (const q of r.res ?? []) if (q.k % 10 === 0 || q.caught !== (r.res.find(z => z.k === q.k - 1)?.caught)) console.log(JSON.stringify(q));
await b.close();
