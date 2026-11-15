// FIX-15b option A, show first (the lead 11-14): the same shut fig gate twice, from the real page. SHUT: the lay's catch bough beside it
// (wood a jump reaches its top from, tower.ts sealedNear 'onto' as the patch reads it) is HELD with the gate the way its run-ons are today
// (ClusterGate.with: broken while shut, so no footing and, by fieldPlay's own rule, not drawn); OPEN: every fig torn free by the engine's own
// tear (clusterTorn), and the held bough comes back whole with the gate (the engine's open clears `broken`; the mock gives back its paint). Nothing here is the game's: a mock on the live stage, no commit.
//   PW=/opt/node-tools/node_modules/playwright/index.mjs node reference/qa-reports/FIX-15b/mockA.mjs <port> <out dir> <normal|easy> <up|side> <layout>
import fs from 'node:fs';
import { pressFrame } from '../../../tools/inspect/clipPress.mjs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, diff = 'normal', ori = 'up', LAYOUT = '1'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate((L) => window.__play('1-4', L), +LAYOUT);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.field); }, E, { timeout: 60000 });
const step = (n) => p.evaluate(([src, E, n]) => { const f = new Function(`return (${src})`)(); let r; for (let i = 0; i < n; i++) r = f(eval(E), {}, { safe: true }, false); return r; }, [pressFrame.toString(), E, n]);
// (the gate with the nearest beside-catch: wood under its level, not under its span (GATE.lidSide 22), within a double jump of its sagged
// top (221 + 56 px) and a jump across (420 px): the patch's 'onto', read here plainly for a picture)
const pick = await p.evaluate((E) => {
  const e = eval(E); e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  e.field.pods = [];
  let best = null;
  for (const g of e.field.gates) {
    const bo = e.platforms.find((q) => q.id === g.platform);
    const room = 56 + (73 / 576) * bo.width + 89 + 12;
    const under = e.platforms.filter((q) => q !== bo && q.type === 'solid' && !q.decorative && q.y > bo.y + 30);
    // (option A keeps refusing wood under its span with too little room (LOW): a gate with any is no picture of A)
    if (under.some((q) => q.x < bo.x + bo.width + 22 && q.x + q.width > bo.x - 22 && q.y - bo.y < room)) continue;
    const beside = under.filter((q) => q.y <= bo.y + 56 + 221 && !(q.x < bo.x + bo.width + 22 && q.x + q.width > bo.x - 22) && Math.max(q.x - (bo.x + bo.width), bo.x - (q.x + q.width)) <= 420);
    if (!beside.length) continue;
    const gap = Math.min(...beside.map((q) => Math.max(q.x - (bo.x + bo.width), bo.x - (q.x + q.width))));
    if (!best || gap < best.gap) best = { g: g.id, gap, bough: { x: bo.x, r: bo.x + bo.width, y: bo.y }, q: beside.map((q) => ({ id: q.id, x: q.x, r: q.x + q.width, y: q.y })) };
  }
  if (!best) return null;
  const g = e.field.gates.find((x) => x.id === best.g), bo = e.platforms.find((q) => q.id === g.platform), qs = best.q.map((b) => e.platforms.find((x) => x.id === b.id)), q = qs[0];
  // (held with the gate: the engine's own list; broken while shut, as FieldPlay's constructor sets every `with` bough)
  g.with = [...(g.with ?? []), ...qs.map((x) => x.id)];
  // (and not painted: `broken` alone takes its footing but the ground painter still draws it (FIX-15b found this on the first shot), so
  // the mock hides it as the gate's own bough is hidden from that painter, `art: 'hidden'`, and gives it back on open. Option A needs
  // the same in the engine: a held bough is skipped by the painter while its gate is shut)
  for (const x of qs) { x.broken = true; x.__art = x.art; x.art = 'hidden'; }
  window.__qs = qs;
  // (him on the gate field's foot, at the end nearest the catch, looking at it)
  const foot = e.platforms.filter((f) => f.type === 'solid' && f.y > bo.y + 200 && f.y < bo.y + 480 && f.x <= bo.x && f.x + f.width >= bo.x + bo.width).sort((a, z) => a.y - z.y)[0];
  const left = q.x < bo.x;
  Object.assign(e.player, { x: left ? bo.x + 30 : bo.x + bo.width - 30, y: foot ? foot.y : bo.y + 380, vx: 0, vy: 0, climbing: false, grounded: true, facing: left ? -1 : 1 });
  window.__m = { g, q, bo };
  // (a mock of the gate: the story card that the stand-in placing sets off (Pokey's halfway line) is hidden, it is not what is shown)
  const st = document.createElement('style'); st.textContent = '.dg-bub{display:none!important}'; document.head.appendChild(st);
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', top: '64px', zIndex: 99999, font: '700 17px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.72)', padding: '6px 10px', borderRadius: '10px', textAlign: 'center' });
  document.body.appendChild(d);
  return { ...best, foot: foot && { x: foot.x, r: foot.x + foot.width, y: foot.y }, seed: e.currentStage?.gen2?.seed };
}, E);
console.log('PICK', JSON.stringify(pick));
if (!pick) { console.log('no gate on this layout has wood beside it in a jump of its top'); await b.close(); process.exit(2); }
const cap = (h) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, h);
await step(45);
const aim = () => p.evaluate((E) => {
  const e = eval(E), { bo, q } = window.__m, c = e.camera, z = c.zoom || 1;
  e.updateCamera = () => {};
  const vw = c.viewportWidth / z, vh = c.viewportHeight / z, x0 = Math.min(bo.x, q.x), x1 = Math.max(bo.x + bo.width, q.x + q.width);
  // (the whole of both when they fit across; else the gap between the gate's near end and the bough, a share of each either side: upright)
  const right = q.x > bo.x, mid = x1 - x0 <= vw - 40 ? (x0 + x1) / 2 : ((right ? bo.x + bo.width : bo.x) + (right ? q.x : q.x + q.width)) / 2;
  c.x = c.targetX = Math.max(0, mid - vw / 2); c.y = c.targetY = bo.y - vh * 0.3;
  // (paused, the page draws only when stepped: draw this camera now)
  e.render();
  return { vw: Math.round(vw), vh: Math.round(vh), x: Math.round(c.x), y: Math.round(c.y) };
}, E);
console.log('CAMERA', JSON.stringify(await aim()));
await p.waitForTimeout(300);
await cap('MOCK (option A) &middot; SHUT: the bough beside the gate is <b>held</b> with it: not there');
await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
await p.screenshot({ path: `${out}/a-shut.png` });
const shutState = await p.evaluate(() => ({ broken: window.__m.q.broken }));
await p.evaluate((E) => { const e = eval(E); for (const c of e.clusters) if (window.__m.g.clusters.includes(c.id)) { c.falling = true; e.clusterTorn(c); } for (const x of window.__qs) { if (x.__art === undefined) delete x.art; else x.art = x.__art; } }, E);
await step(45);
await aim(); await p.waitForTimeout(300);
await cap('MOCK (option A) &middot; OPEN: the held bough comes back <b>with</b> the gate');
await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
await p.screenshot({ path: `${out}/b-open.png` });
const openState = await p.evaluate(() => ({ broken: window.__m.q.broken }));
console.log('HELD BOUGH broken: shut', shutState.broken, 'open', openState.broken);
await b.close();
