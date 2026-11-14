// tools/inspect/clip.mjs (R-165.240, the lead 11:30 AM 11-14: ONE copy here, no per-integrator copies; INT-7's and earlier copies under
// reference/qa-reports/*/tools/clip.mjs press jumps the bare way and must not be used). Clips of the real game, from a served build:
//   node tools/inspect/clip.mjs <port> <out dir> gate|gateover|vines|pods|fork [difficulty] [up|side] [layout]
// INT-8 (R-165.240, the lead 11:27 AM 11-14): every input now goes through the real touch pad's own calls (inputEngine.ts
// triggerTouchMove / triggerTouchClimb / triggerTouchUp / releaseTouchUp). INT-7's step set input.state.jumpPressed bare, and
// input.update() clears a bare press before the engine reads it (engine.ts:1674 runs input.update first; inputEngine.ts:524-531), so
// its 'jump' frames never jumped and its fig-gate "Jump: still under" proved nothing. Every press is now CHECKED: the frame after it
// must show lift (vy < 0, a jump spent (jumpsLeft down), or off the vine) or a vine grab that took it (logged as grabbed), or the
// clip prints JUMP-NO-LIFT and exits 3. Planted:
// PLANT_BARE_JUMP=1 presses the old bare way and must exit 3 (INT-8 REPORT has the red run). New mode 'gateover': the try-over.
// INT-7 (from FIX-14b's clip.mjs; + sideways waits for the engine (FIX-14b: it threw null sideways), + 'fork' mode, + stage arg): the clips of 1-4's built pieces (no mock), from the real game, stepped frame by frame at 30 fps, a frame kept every 2nd step
// (15 fps), at 2x. Captions are a page overlay. Prints what the game BUILT (D62): difficulty from localStorage, seed, orientation.
//   node clip.mjs <port> <out> gate|gateover|vines|pods|fork [difficulty] [up|side] [layout]
import fs from 'node:fs';
import { pressFrame, lostPress } from './clipPress.mjs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, MODE, diff = 'normal', ori = 'up', LAYOUT = '0'] = process.argv.slice(2);
// TEACH=1: every stage teach line is left live; TEACH=<words>: only the lines holding those words are left live (the clip jumps
// past the earlier teaches, so with all live the queue shows the first unshown one, not this beat's: a fresh player's eyes, D63/D50);
// by default every line is marked shown so no box covers the action
const TEACH = process.env.TEACH ?? '';
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
// (sideways the engine came up later than upright: wait until it has a built stage and a field before touching it)
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.field); }, E, { timeout: 60000 });
await p.evaluate(([E, TEACH]) => {
  const e = eval(E); e.isPaused = true;
  if (TEACH !== '1') for (const hh of e.currentStage?.proto?.hints ?? []) if (!TEACH || !String(hh.text ?? '').toLowerCase().includes(TEACH.toLowerCase())) hh.shown = true;
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: window.innerWidth > window.innerHeight ? '8px' : '20px', zIndex: 99999, font: '700 19px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.78)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', lineHeight: '1.3' });
  document.body.appendChild(d);
}, [E, TEACH]);
let frame = 0, n = 0;
const cap = (html) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, html);
const step = async (inp = {}, frames = 1, opt = {}) => {
  let r;
  for (let i = 0; i < frames; i++) {
    // (clipPress.mjs pressFrame: the ONE frame step, its own source run in the page; clip.test.ts runs the same function headless)
    r = await p.evaluate(([src, E, inp, opt, plant]) => (new Function(`return (${src})`)())(eval(E), inp, opt, plant), [pressFrame.toString(), E, inp, opt, !!process.env.PLANT_BARE_JUMP]);
    if (inp.jump) {
      console.log('PRESS', JSON.stringify({ at: [Math.round(r.x), Math.round(r.y)], ...r.lift }));
      if (lostPress(r.lift)) { console.log('JUMP-NO-LIFT: a jump frame produced no lift (vy ' + r.lift.vyAfter + ', no jump spent, still where it was): the clip would show a jump that never happened'); await b.close(); process.exit(3); }
    }
    if (opt.noShot) continue;
    if (n++ % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(frame++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 82 }); }
  }
  return r;
};
const hold = (frames, opt) => step({}, frames, opt);

const built = await p.evaluate(([E, ori]) => {
  const e = eval(E);
  return { difficulty: localStorage.getItem('sloth_difficulty'), builtDifficulty: e.currentStage?.gen2?.budget?.difficulty ?? e.currentStage?.proto?.gen2?.budget?.difficulty, stage: e.currentStage?.config?.id, seed: e.currentStage?.gen2?.seed ?? e.currentStage?.proto?.gen2?.seed, orientation: ori, view: [innerWidth, innerHeight] };
}, [E, ori]);
console.log('BUILT', JSON.stringify(built));
if (MODE === 'gate') {
  const g = await p.evaluate((E) => {
    const e = eval(E); const g = [...e.field.gates].sort((a, z) => z.clusters.length - a.clusters.length)[0]; const bough = e.platforms.find((q) => q.id === g.platform);
    const cs = g.clusters.map((id) => e.clusters.find((c) => c.id === id)); const vs = cs.map((c) => e.vines.find((v) => v.id === c.vine));
    e.field.pods = [];
    window.__m = { vs, g, bough };
    Object.assign(e.player, { x: vs[0].x, y: vs[0].bottomY - 4, vx: 0, vy: 0, climbing: false, facing: 1 });
    return { gate: g.id, figs: cs.length, bough: { y: bough.y, w: bough.width }, vines: vs.map((v) => v.x) };
  }, E);
  console.log('GATE', JSON.stringify(g));
  const head = () => p.evaluate((E) => { const e = eval(E); const s = e.field.shutBoughAt(e.player.x, e.player.y); return s ? Math.round(s.under - (e.player.y - 89)) : null; }, E);
  let worst = -1e9;
  const watch = async (inp, n) => { for (let i = 0; i < n; i++) { await step(inp, 1, { safe: true }); const h = await head(); if (h !== null) worst = Math.max(worst, h); } };
  await hold(40, { safe: true, noShot: true });
  await cap(`A gate of ${g.figs} figs. Each fig is <b>tied</b> to the leaf thatch.`); await hold(24, { safe: true });
  await cap('Push the fig up: its tie <b>strains</b>…'); await watch({ up: true }, 40);
  await cap('…and <b>SNAPS</b> when it is all the way up.'); await watch({ up: true }, 20);
  await cap('Hold up: his head stops <b>under</b> the bough.'); await watch({ up: true }, 22);
  await cap('Jump: still under. No way over while a tie holds.'); await watch({ up: true, jump: true }, 1); await watch({ up: true }, 26);
  for (let k = 1; k < g.figs; k++) {
    const last = k === g.figs - 1;
    await p.evaluate(([E, k]) => { const e = eval(E); const v = window.__m.vs[k]; e.hands = null; Object.assign(e.player, { x: v.x, y: v.bottomY - 4, vx: 0, vy: 0, climbing: false }); }, [E, k]);
    await step({ up: true }, 2, { safe: true, noShot: true }); await hold(40, { safe: true, noShot: true });
    await cap(last ? 'The last fig: its tie snaps and the thatch is <b>thrown off</b>.' : `Fig ${k + 1}: another tie strains and snaps.`); await hold(8, { safe: true }); await watch({ up: true }, last ? 60 : 40);
  }
  await cap('The way up is open.'); await step({ up: true }, 40, { safe: true });
  console.log('HEAD most over the shut underside (px, <= 0 is under):', worst);
}
if (MODE === 'gateover') {
  // R-165.240 (Matt's R-165.212: "it still goes over the top"): with a tie still holding, he tries to get OVER the shut bough with REAL
  // presses: a leap off the vine top, a leap and a second flick, and a jump and a double from the ledge at the bough's far end, then from
  // beside it. Logged per frame: his head against the drawn underside (<= 0 is under) and OVER if his feet ever rise above the bough's
  // drawn top inside its span while it is shut (that is getting over).
  const g = await p.evaluate((E) => {
    const e = eval(E); const g = [...e.field.gates].sort((a, z) => z.clusters.length - a.clusters.length)[0]; const bough = e.platforms.find((q) => q.id === g.platform);
    const cs = g.clusters.map((id) => e.clusters.find((c) => c.id === id)); const vs = cs.map((c) => e.vines.find((v) => v.id === c.vine));
    const ledge = e.platforms.filter((q) => q !== bough && !q.decorative && !q.soil && q.type === 'solid' && q.y > bough.y && q.y < bough.y + 150 && q.x < bough.x + bough.width + 60 && q.x + q.width > bough.x + bough.width - 60).sort((a, z) => a.y - z.y)[0] ?? null;
    e.field.pods = [];
    window.__m = { vs, g, bough, ledge };
    Object.assign(e.player, { x: vs[0].x, y: vs[0].bottomY - 4, vx: 0, vy: 0, climbing: false, facing: 1 });
    return { gate: g.id, figs: cs.length, bough: { x: bough.x, r: bough.x + bough.width, y: bough.y }, vines: vs.map((v) => v.x), ledge: ledge && { x: ledge.x, r: ledge.x + ledge.width, y: ledge.y } };
  }, E);
  console.log('GATE', JSON.stringify(g));
  // (head: px his drawn head is over the shut underside at x; over: his feet above the shut bough's drawn top inside its span)
  const look = () => p.evaluate((E) => {
    const e = eval(E); const P = e.player; const B = window.__m.bough; const s = e.field.shutBoughAt(P.x, P.y);
    // (THIS gate's bough only: the shut bough found from just under it, its top within its own sag of its line)
    const ours = (x, y) => { const q = e.field.shutBoughAt(x, y); return q && q.top >= B.y - 1 && q.top <= B.y + 120 ? q : null; };
    const near = ours(P.x, P.y + 250);
    // (FIX-15: which side of the shut bough's DRAWN wood his body is on, his middle over its span: over (feet at or over the drawn
    // top), under (drawn head at or under the drawn underside), or IN it; and whether he stands on its top)
    const shutNow = !!ours(B.x + B.width / 2, B.y + 200);
    const w = shutNow && P.x >= B.x && P.x <= B.x + B.width ? ours(P.x, P.y + 400) : null;
    const side = w ? (P.y <= w.top + 1 ? 'over' : P.y - 89 >= w.under - 1 ? 'under' : 'in') : null;
    return { head: s ? Math.round(s.under - (P.y - 89)) : null, over: !!near && P.y < near.top - 0.5, shut: shutNow, x: Math.round(P.x), y: Math.round(P.y), vy: Math.round(P.vy), g: !!P.grounded, c: !!P.climbing, side, onTop: shutNow && !!P.grounded && e.standingOnId === B.id };
  }, E);
  const tries = [];
  let cur = null;
  // (FIX-15, the packet's item 4: every frame's caption prints the try, the frame, his vy (the press frame's marked) and his head vs the
  // shut bough's drawn underside; the frame where he is STOPPED is named: a head stop (rising, then vy 0 under the wood), the wall at
  // its end (moving toward it, held at its end), or landing ON it; THROUGH: over then under (or in) on consecutive frames)
  let label = '', k = 0, prevSide = null, prevL = null;
  const watch = async (inp, count) => {
    let r;
    for (let i = 0; i < count; i++) {
      r = await step(inp, 1, { safe: true, noShot: true }); k++;
      const L = await look();
      if (cur) {
        if (L.head !== null) cur.head = Math.max(cur.head, L.head);
        cur.top = Math.min(cur.top, L.y);
        if (L.over && L.shut) cur.over = true;
        if (L.side === 'in' || (prevSide && L.side && prevSide !== L.side)) cur.through = cur.through ?? `step ${k}: ${L.side === 'in' ? 'IN the wood' : `${prevSide} then ${L.side}`}`;
        if (L.onTop && !cur.onTop) { cur.onTop = `step ${k}`; cur.stops.push(`step ${k}: LANDED ON the shut bough's top (x ${L.x})`); }
        if (prevL && prevL.vy < 0 && L.vy === 0 && !L.g && !L.c && L.head !== null && L.head >= -2) cur.stops.push(`step ${k}: HEAD STOP (head ${L.head} px vs underside)`);
        if (prevL && (inp.left || inp.right) && L.x === prevL.x && !L.c && L.shut && Math.abs(L.x - (inp.left ? g.bough.r + 22 : g.bough.x - 22)) < 2 && !cur.stops.some((q) => q.includes('WALL'))) cur.stops.push(`step ${k}: WALL at its end (x ${L.x})`);
        cur.end = L;
      }
      prevSide = L.side; prevL = L;
      const press = inp.jump ? ' <b>PRESS</b>' : '';
      await cap(`${label}<br>step ${k}${press} · vy ${L.vy} · head ${L.head === null ? 'clear of it' : `${L.head} px vs the underside (≤0 under)`}${L.onTop ? ' · <b>ON its top</b>' : ''}${cur?.stops.length ? `<br><b>${cur.stops[cur.stops.length - 1].replace(/^step \d+: /, '')}</b>` : ''}`);
      // (a frame kept every 2nd step, as step() keeps them: 15 fps of a 30 fps game)
      if (n++ % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(frame++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 82 }); }
    }
    return r;
  };
  const begin = (name) => { cur = { name, head: -1e9, top: 1e9, over: false, stops: [] }; tries.push(cur); prevSide = null; prevL = null; label = name; };
  /** after a press: ride it out; with `second`, flick again once past the top of the first */
  const ride = async (second, lean = 0, dirKey = null) => {
    const mv = dirKey ? { [dirKey]: true } : {};
    let r = await watch(mv, 8); await watch({ ...mv, release: true }, 1);
    let pressed = false;
    for (let i = 0; i < 60; i++) {
      const L = await look(); if (i > 3 && (L.g || L.c)) break;
      if (second && !pressed && (L.g || L.c)) { cur.second = 'not pressed: he had caught a vine or landed before the top'; pressed = true; }
      if (second && !pressed && (r?.vy ?? 0) > -40) { cur.second = 'pressed in the air'; pressed = true; r = await watch({ ...mv, jump: true, lean, holdMs: 250 }, 1); continue; }
      r = await watch({ ...mv, release: pressed && i === 10 }, 1);
    }
  };
  await hold(40, { safe: true, noShot: true });
  await cap(`A gate of ${g.figs} figs: the bough is <b>shut</b> while any tie holds.`); await hold(24, { safe: true });
  await cap('Push the first fig up: its tie <b>strains</b>…'); await watch({ up: true }, 40);
  await cap('…and <b>SNAPS</b>. Two ties still hold.'); await watch({ up: true }, 20);
  // (FIX-15: the ties left are HELD for the cheat tries, as fieldGate.test.ts holds them (topOf): a cheat try that grabs a fig's vine
  // with up held would push its fig free and open the gate mid-clip, and every try after it would run on an OPEN gate, proving nothing)
  await p.evaluate((E) => { eval(E).field.topOf = () => -Infinity; }, E);
  console.log('TIES held from here: the cheat tries all run on a SHUT gate');
  await cap('Hold up: his head stops <b>under</b> the bough.'); begin('climb up under it'); await watch({ up: true }, 22);
  await cap('Cheat 1: <b>leap</b> off the vine top (a real flick up).'); begin('leap off the vine top');
  await watch({ up: true, jump: true, lean: 0 }, 1); await ride(false);
  await hold(20, { safe: true });
  // back onto the next vine, climbed to the top, for the leap + second flick
  await p.evaluate((E) => { const e = eval(E); const v = window.__m.vs[1]; e.hands = null; Object.assign(e.player, { x: v.x, y: v.bottomY - 4, vx: 0, vy: 0, climbing: false }); }, E);
  await step({ up: true }, 2, { safe: true, noShot: true }); await step({ up: true }, 60, { safe: true, noShot: true });
  await cap('Cheat 2: leap, then a <b>second flick</b> at the top.'); begin('leap + second flick');
  await watch({ up: true, jump: true, lean: 0 }, 1); await ride(true);
  await hold(20, { safe: true });
  if (g.ledge) {
    // (each: where on the far-end ledge, the flick's lean (-1: up-left; 0: straight up, left held), and a second flick if still in the air)
    const tryList = [
      // (FIX-15: the old first try stood him INSIDE the wood under the sagged end (a teleport); the wall now stops anyone walking in, so
      // that try walks in from past the end instead: 'walk')
      ['walk in under its sagging end', Math.min(g.ledge.r - 20, g.bough.r + 22 + 60), -1, 'walk'],
      ['just past its end, flick up-left', Math.min(g.ledge.r - 20, g.bough.r + 22 + 30), -1, false],
      ['just past its end, flick straight up, left held', Math.min(g.ledge.r - 20, g.bough.r + 22 + 30), 0, false],
      ['further along, flick straight up, left held', g.ledge.r - 26, 0, false],
      ['further along, straight up + second flick', g.ledge.r - 26, 0, true],
    ];
    for (const [where, x, lean, second] of tryList) {
      await p.evaluate(([E, x]) => { const e = eval(E); const L = window.__m.ledge; e.hands = null; Object.assign(e.player, { x, y: L.y, vx: 0, vy: 0, climbing: false, grounded: true, facing: -1 }); }, [E, x]);
      await hold(12, { safe: true, noShot: true });
      await cap(`Cheat: from the far-end ledge, ${where}.`); begin(`ledge x ${x}: ${where}`);
      await hold(6, { safe: true });
      if (second === 'walk') await watch({ left: true }, 30);
      else { await watch({ left: true, jump: true, lean }, 1); await ride(second, lean, 'left'); }
      await hold(14, { safe: true });
    }
  }
  // (FIX-15: the fall onto it: dropped from 120 px over its middle, it must land him on its drawn top, never through it)
  const dropAt = await p.evaluate(([E]) => { const e = eval(E); const B = window.__m.bough; const x = B.x + B.width / 2; const s = e.field.shutBoughAt(x, B.y + 400); if (!s) return null; e.hands = null; Object.assign(e.player, { x, y: s.top - 120, vx: 0, vy: 0, climbing: false, grounded: false }); return Math.round(s.top); }, [E]);
  if (dropAt === null) console.log('DROP not tried: the gate is open (no shut bough over its middle)');
  else {
    await cap('Cheat: dropped onto the shut bough from over it.'); begin('dropped onto it from over its middle');
    await watch({}, 30);
    await hold(10, { safe: true });
  }
  for (const t of tries) console.log('TRY', JSON.stringify(t));
  for (const t of tries) for (const s of t.stops) console.log('STOP', t.name, '|', s);
  console.log('THROUGH while shut:', tries.filter((t) => t.through).map((t) => `${t.name} (${t.through})`).join('; ') || 'never');
  console.log('ON ITS TOP while shut:', tries.filter((t) => t.onTop).map((t) => t.name).join('; ') || 'never');
  console.log('OVER while shut:', tries.some((t) => t.over) ? 'YES (he got over a shut bough)' : 'never');
  console.log('HEAD most over the shut underside (px, <= 0 is under):', Math.max(...tries.map((t) => t.head)));
}
if (MODE === 'pods') {
  const pod = await p.evaluate((E) => {
    const e = eval(E); const pods = [...e.field.pods].sort((a, z) => z.land - a.land); const pod = pods[0];
    window.__m = { pod }; const x = pod.x + 70;
    const under = e.platforms.filter((q) => !q.broken && x >= q.x && x <= q.x + q.width && q.y >= pod.land - 30).sort((a, z) => a.y - z.y)[0];
    e.hands = null; Object.assign(e.player, { x, y: under ? under.y : pod.land, vx: 0, vy: 0, climbing: false, grounded: true, facing: -1 });
    return { x: pod.x, top: pod.top, land: pod.land, speed: pod.speed, clock: pod.clock };
  }, E);
  console.log('POD', JSON.stringify(pod));
  const phase = () => p.evaluate((E) => { const e = eval(E); const P = window.__m.pod; return e.fieldHost.beat(P.clock, P.shift).phase; }, E);
  await hold(30, { noShot: true });
  for (let i = 0; i < 300; i++) { if ((await phase()) === 'off' || (await phase()) === 'rest') break; await hold(1, { noShot: true }); }
  for (let i = 0; i < 300; i++) { if ((await phase()) === 'warn') break; await hold(1, { noShot: true }); }
  await hold(6, { noShot: true });
  await cap('The pod\'s <b>vine lights up and shakes</b>, dust sifts down: 1.5 s…'); await hold(40);
  await cap('…then it drops, slow (300 px/s).'); await hold(40);
  await cap('A long quiet before the next.'); await hold(30);
}
if (MODE === 'vines') {
  const pair = await p.evaluate((E) => {
    const e = eval(E); e.field.pods = [];
    const fv = e.vines.filter((v) => v.field);
    for (const c of e.collectibles) {
      if (c.type !== 'flower' || c.collected) continue;
      const a = fv.find((v) => v.x < c.x && c.x - v.x > 30 && c.x - v.x < 50 && c.y > v.topY + 60 && c.y < v.bottomY - 120);
      const b2 = a && fv.find((v) => v !== a && v.x > c.x && Math.abs((a.x + v.x) / 2 - c.x) < 2 && c.y > v.topY + 60 && c.y < v.bottomY - 120);
      if (a && b2) { const run = e.collectibles.filter((q) => q.type === 'flower' && Math.abs(q.x - c.x) < 2 && q.y > a.topY && q.y < a.bottomY); window.__m = { a, b: b2, run, keep: run.map((q) => ({ ...q })) }; return { a: a.x, b: b2.x, petals: run.length, x: c.x }; }
    }
    return null;
  }, E);
  console.log('PAIR', JSON.stringify(pair));
  for (const two of [false, true]) {
    await p.evaluate(([E, two]) => { const e = eval(E); const { a, run } = window.__m; for (const q of run) q.collected = false; e.hands = null; Object.assign(e.player, { x: a.x, y: a.bottomY - 4, vx: 0, vy: 0, climbing: false, grounded: false, facing: 1 }); }, [E, two]);
    await step({ up: true }, 2, { noShot: true }); await hold(30, { noShot: true });
    let t = 0;
    for (let i = 0; i < 70; i++) {
      const side = two && i >= 3;
      const r = await step({ up: true, right: side }, 1); t += 1 / 30;
      const got = await p.evaluate(() => window.__m.run.filter((q) => q.collected).length);
      await cap(`${two ? '<b>TWO VINES</b>: push across while climbing (1.6× up)' : '<b>ONE VINE</b>'}<br>${t.toFixed(1)} s · petals ${got}/${await p.evaluate(() => window.__m.run.length)}`);
      if (!r.climbing) break;
    }
    console.log(two ? 'TWO' : 'ONE', t.toFixed(2), 's petals', await p.evaluate(() => window.__m.run.filter((q) => q.collected).length));
    await hold(15);
  }
}

if (MODE === 'fork') {
  // the rotten fork (w1Arc14.ts ROTTEN_FORK): three creaking boughs stepping down 50 px each over the sound fork, then the sure vine up
  const fk = await p.evaluate((E) => {
    const e = eval(E); e.field.pods = [];
    const cr = e.platforms.filter((q) => q.creak).sort((a, z) => a.x - z.x);
    const next = (q) => cr.find((z) => z.x - q.x > 100 && z.x - q.x < 160 && z.y - q.y > 30 && z.y - q.y < 70);
    for (const a of cr) {
      const b2 = next(a); const c = b2 && next(b2);
      if (b2 && c) {
        window.__m = { a, b: b2, c };
        e.hands = null; Object.assign(e.player, { x: a.x - 40, y: a.y - 50 - 4, vx: 0, vy: 0, climbing: false, grounded: false, facing: 1 });
        return { boughs: [a, b2, c].map((q) => ({ x: Math.round(q.x), y: Math.round(q.y), w: Math.round(q.width) })) };
      }
    }
    return { creak: cr.map((q) => [Math.round(q.x), Math.round(q.y)]) };
  }, E);
  console.log('FORK', JSON.stringify(fk));
  if (fk.boughs) {
    await hold(30, { noShot: true, safe: true });
    await cap('The rotten fork: three <b>creaking</b> boughs step down.'); await hold(20, { safe: true });
    await cap('Step on: it <b>creaks</b>, then gives…'); await step({ right: true }, 14, { safe: true }); await hold(50, { safe: true });
    await cap('…one branch down, onto the next.'); await step({ right: true }, 12, { safe: true }); await hold(50, { safe: true });
    await step({ right: true }, 12, { safe: true }); await hold(50, { safe: true });
    await cap('Sound wood below: a drop costs nothing.'); await step({ right: true }, 40, { safe: true }); await hold(20, { safe: true });
  }
}
await ctx.close(); await b.close();
console.log('FRAMES', frame);
