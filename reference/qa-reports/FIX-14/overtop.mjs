// FIX-14: Matt's "it still goes over the top" (R-165.212) on the real 1-4 page, the engine stepped frame by frame (stills-at.mjs's way).
// Case 'vine': a field vine under a SHUT gate (no fig on it): climb to its top, then jump. Case 'fig': the fig's own vine: push it to full,
// keep holding up, then jump. Logs his box (feet, top) against the bough every frame; frames every 2nd step (15 fps) for the clip.
//   node overtop.mjs <port> <out> <difficulty> <gate#> <vine|fig> [sideways]
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, diff, GI, CASE, orient] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const [w, h] = orient === 'sideways' ? [915, 412] : [412, 915];
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(() => window.__play('1-4', 0));
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
const built = await p.evaluate(([E, GI, CASE]) => {
  const e = eval(E); e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const g = e.field.gates[+GI]; const bough = e.platforms.find((q) => q.id === g.platform);
  const figVines = new Set(e.clusters.map((c) => c.vine));
  const under = e.vines.filter((v) => v.field && v.x >= bough.x - 4 && v.x <= bough.x + bough.width + 4 && Math.abs(v.topY - bough.y) < 30);
  const c = e.clusters.find((k) => k.id === g.clusters[0]);
  const v = CASE === 'fig' ? e.vines.find((q) => q.id === c.vine) : under.filter((q) => !figVines.has(q.id)).sort((a, z) => Math.abs(a.x - (bough.x + bough.width / 2)) - Math.abs(z.x - (bough.x + bough.width / 2)))[0];
  window.__ot = { gate: g, bough, v };
  Object.assign(e.player, { x: v.x, y: v.bottomY - 4, vx: 0, vy: 0, grounded: false, climbing: false, facing: 1 });
  return { difficulty: localStorage.getItem('sloth_difficulty'), seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, gate: +GI, figsOnGate: g.clusters.length, bough: { x: bough.x, y: bough.y, w: bough.width, h: bough.height }, vine: { x: v.x, top: v.topY, bot: v.bottomY, fig: CASE === 'fig' }, boxH: e.player.height };
}, [E, GI, CASE]);
console.log('BUILT', JSON.stringify(built), orient ?? 'upright');
const log = []; let n = 0;
const step = async (inp, frames) => {
  for (let i = 0; i < frames; i++) {
    const r = await p.evaluate(([E, inp]) => {
      const e = eval(E); const s = e.input.state; Object.assign(s, { up: !!inp.up, left: false, right: false, down: false, jumpHeld: !!inp.jump, jumpPressed: !!inp.jump });
      e.player.invincibleTimer = 9; e.update(1 / 30); e.player.invincibleTimer = 0; e.clearGuide?.(); e.render();
      const P = e.player; const { gate, bough } = window.__ot;
      const shut = gate.clusters.some((id) => e.clusters.some((c) => c.id === id && !c.falling && !c.gone));
      return { feet: Math.round(P.y), top: Math.round(P.y - P.height), climbing: !!P.climbing, shut, boughTop: bough.y, under: bough.y + bough.height };
    }, [E, inp]);
    log.push(r);
    if (n++ % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(log.length).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  }
};
await step({}, 6);
await step({ up: true }, 80);
await step({ up: true, jump: true }, 1);
await step({ up: true }, 30);
await step({ up: true, jump: true }, 1);
await step({ up: true }, 30);
await ctx.close(); await b.close();
const shutTops = log.filter((l) => l.shut);
const minTop = Math.min(...shutTops.map((l) => l.top));
const minFeet = Math.min(...shutTops.map((l) => l.feet));
console.log(`WHILE SHUT: highest box top ${minTop} (${log[0].under - minTop} px above the underside ${log[0].under}); highest feet ${minFeet} (bough top ${log[0].boughTop}: feet ${log[0].boughTop - minFeet >= 0 ? 'AT/ABOVE' : 'below'} its top by ${log[0].boughTop - minFeet})`);
console.log('TRACE', log.filter((_, i) => i % 3 === 0).map((l) => `${l.top}${l.climbing ? 'c' : ''}${l.shut ? '' : 'O'}`).join(' '));
