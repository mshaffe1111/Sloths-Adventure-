// INT-8 (from INT-7's clip.mjs): a CLIP of 1-1's first double from a fresh player's eyes (D63): the real game, the first run (layout 10 =
// seed 9652, BUILT printed from the game, D62), stepped frame by frame at 30 fps, a frame kept every 2nd step (15 fps), 2x. Pokey starts
// before the double-teach section with every EARLIER teach line marked shown and this section's own line left live (D50: on the setting's
// default Tips), walks in, Dot says the double, then: (1) a cheat try: one jump at the lip, no second press (he cannot make it: what the
// game does with him is shown as it plays), (2) the double: jump at the lip, a second press at the top, he lands on the far bank.
// Input through the real touch pad's own calls (inputEngine.ts triggerTouchMove / triggerTouchUp / releaseTouchUp): a bare
// state.jumpPressed is cleared by input.update() before the engine reads it (engine.ts:1674), so setting it never jumps.
//   node clip11.mjs <port> <out> [difficulty] [up|side] [layout]
import fs from 'node:fs';
const { chromium } = await import(process.env.PW ?? 'playwright');
const [port, out, diff = 'normal', ori = 'side', LAYOUT = '10'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate((L) => window.__play('1-1', L), +LAYOUT);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(5000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player); }, E, { timeout: 60000 });
const built = await p.evaluate(([E, ori]) => {
  const e = eval(E); const g = e.currentStage?.gen2 ?? e.currentStage?.proto?.gen2;
  return { difficulty: localStorage.getItem('sloth_difficulty'), builtDifficulty: g?.budget?.difficulty, stage: e.currentStage?.config?.id, seed: g?.seed, rerolls: g?.rerolls, orientation: ori, view: [innerWidth, innerHeight] };
}, [E, ori]);
console.log('BUILT', JSON.stringify(built));
// the section and its gap, read from the game's own build (no x typed in): the double-teach section, its first gap of 150 px or more
const m = await p.evaluate((E) => {
  const e = eval(E); const st = e.currentStage; const g = st.gen2 ?? st.proto?.gen2;
  const sec = g.sections.find((s) => /double-teach/.test(s.template));
  const solid = e.platforms.filter((q) => !q.decorative && !q.soil && q.type === 'solid' && q.x + q.width > sec.x0 - 120 && q.x < sec.x1).sort((a, c) => a.x - c.x);
  let lip = null, far = null;
  for (const a of solid) {
    const right = a.x + a.width;
    if (solid.some((c) => c !== a && c.x < right + 2 && c.x + c.width > right + 2)) continue; // something under the next step: not a gap
    const next = solid.filter((c) => c.x >= right + 2).sort((u, v) => u.x - v.x)[0];
    if (next && next.x - right >= 150) { lip = a; far = next; break; }
  }
  e.isPaused = true;
  const hints = st.hints ?? st.proto?.hints ?? [];
  for (const h of hints) h.shown = h.x < sec.x0 - 40; // earlier teaches: passed; this section's own line and later ones: live
  window.__m = { sec, lip, far };
  return { template: sec.template, x0: sec.x0, x1: sec.x1, lip: lip && { x: lip.x, r: lip.x + lip.width, y: lip.y }, far: far && { x: far.x, r: far.x + far.width, y: far.y }, live: hints.filter((h) => !h.shown).map((h) => [h.x, h.text]) };
}, E);
console.log('SECTION', JSON.stringify(m));
if (!m.lip) { console.log('NO GAP of 150 px+ in the section on this build (Easy fills it): nothing to clip'); await b.close(); process.exit(2); }
await p.evaluate((E) => {
  const e = eval(E);
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: window.innerWidth > window.innerHeight ? '8px' : '20px', zIndex: 99999, font: '700 17px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.78)', borderRadius: '12px', padding: '8px 12px', textAlign: 'center', lineHeight: '1.25' });
  document.body.appendChild(d);
}, E);
let frame = 0, n = 0;
const cap = (html) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, html);
const pos = () => p.evaluate((E) => { const e = eval(E); const P = e.player; return { x: Math.round(P.x), y: Math.round(P.y), vy: Math.round(P.vy), g: !!P.grounded, left: P.jumpsLeft, guide: document.querySelector('[data-guide], .dot-guide')?.textContent?.slice(0, 80) ?? null }; }, E);
const step = async (inp = {}, frames = 1, opt = {}) => {
  let r;
  for (let i = 0; i < frames; i++) {
    r = await p.evaluate(([E, inp]) => {
      const e = eval(E); const I = e.input;
      I.triggerTouchMove(inp.right ? 'right' : inp.left ? 'left' : 'none');
      if (inp.press) I.triggerTouchUp(1, inp.holdMs ?? 250);
      if (inp.release) I.releaseTouchUp();
      e.update(1 / 30); e.render();
      const P = e.player;
      return { x: P.x, y: P.y, vy: P.vy, g: !!P.grounded, left: P.jumpsLeft };
    }, [E, inp]);
    if (opt.noShot) continue;
    if (n++ % 2 === 0) { await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0)))); await p.screenshot({ path: `${out}/f${String(frame++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 82 }); }
  }
  return r;
};
const place = (x) => p.evaluate(([E, x]) => {
  const e = eval(E);
  const under = e.platforms.filter((q) => !q.broken && !q.soil && !q.decorative && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width).sort((a, c) => a.y - c.y)[0];
  Object.assign(e.player, { x, y: under.y, vx: 0, vy: 0, grounded: true, hanging: false, climbing: false, facing: 1 });
  e.isPaused = true; // (the page's own loop stays off: only this clip steps the engine, one 1/30 s frame at a time)
}, [E, x]);
/** run right to `takeoff` px before the lip, flick up; with `second`, flick again once he is past the top of the first jump */
const tryJump = async (takeoff, second) => {
  let r = await pos();
  for (let i = 0; i < 300 && r.x < m.lip.r - takeoff; i++) r = await step({ right: true });
  const before = { x: Math.round(r.x), g: r.g };
  r = await step({ right: true, press: true, holdMs: 300 });
  const at = Math.round(r.x); const trace = [[before.x, before.g], [at, r.g, Math.round(r.vy)]];
  for (let i = 0; i < 8; i++) { r = await step({ right: true }); trace.push([Math.round(r.x), r.g, Math.round(r.vy)]); }
  if (process.env.TRACE) console.log('TRACE', JSON.stringify(trace));
  r = await step({ right: true, release: true });
  let pressedAt = null, top = r.y;
  for (let i = 0; i < 90 && !(r.g && i > 2); i++) {
    top = Math.min(top, r.y);
    if (second && pressedAt === null && r.vy > -40) { pressedAt = Math.round(r.x); r = await step({ right: true, press: true, holdMs: 250 }); continue; }
    r = await step({ right: true, release: pressedAt !== null && i === 8 });
  }
  return { takeoff: at, second: pressedAt, top: Math.round(top), end: await pos() };
};
/** walk right to x, a hop up any step he walks into (a player taps up at a bump) */
const walkTo = async (x, stopAtWall = false) => {
  let r = await pos(), last = r.x, stuck = 0;
  for (let i = 0; i < 600 && r.x < x; i++) {
    if (stopAtWall && stuck >= 2) {
      // (the wall's rise, read from the build: a step one jump clears (under 90 px; one jump rises about 98) is hopped, as a player would)
      const rise = await p.evaluate(([E, x, y]) => { const e = eval(E); const q = e.platforms.filter((q) => !q.decorative && !q.soil && q.type === 'solid' && q.x > x && q.x < x + 60 && q.y < y).sort((a, c) => c.y - a.y)[0]; return q ? y - q.y : 0; }, [E, r.x, r.y]);
      if (rise >= 90) return { ...r, wall: true, rise: Math.round(rise) };
    }
    r = await step({ right: true, press: stuck >= 2 && r.g, holdMs: 350 });
    stuck = r.g && Math.abs(r.x - last) < 1 ? stuck + 1 : 0; last = r.x;
  }
  return r;
};
/** at a wall: flick up-forward (right held); with `second`, flick again once past the top of the first jump */
const hop = async (second) => {
  let r = await step({ right: true, press: true, holdMs: 300 });
  const y0 = r.y; let top = r.y, pressedAt = null;
  for (let i = 0; i < 8; i++) { r = await step({ right: true }); top = Math.min(top, r.y); }
  r = await step({ right: true, release: true });
  for (let i = 0; i < 90 && !r.g; i++) {
    top = Math.min(top, r.y);
    if (second && pressedAt === null && r.vy > -40) { pressedAt = Math.round(r.y); r = await step({ right: true, press: true, holdMs: 250 }); continue; }
    r = await step({ right: true, release: pressedAt !== null && i === 8 });
  }
  return { second: pressedAt, top: Math.round(top), end: await pos() };
};
await place(m.x0 - 60);
await step({}, 40, { noShot: true });
await cap(`1-1, first run: the first double. ${built.builtDifficulty}, seed ${built.seed}.`); await step({}, 16);
await cap('He walks in. Dot names the move here.');
const w = await walkTo(m.lip.x + 40, true);
console.log('WALKED', JSON.stringify(w));
if (w.wall) {
  const bank = await p.evaluate(([E, x]) => { const e = eval(E); const q = e.platforms.filter((q) => !q.decorative && !q.soil && q.type === 'solid' && q.x > x && q.x < x + 60).sort((a, c) => a.y - c.y)[0]; return q && { x: q.x, y: q.y }; }, [E, w.x]);
  console.log('BANK', JSON.stringify(bank), 'rise', bank && Math.round(w.y - bank.y));
  await step({}, 20);
  await cap(`The dip's far bank: ${bank ? Math.round(w.y - bank.y) : '?'} px up. Cheat try: ONE jump.`);
  const a = await hop(false); console.log('BANK-ONE', JSON.stringify(a));
  await cap(a.end.y <= bank.y + 4 ? 'ONE jump MADE the bank (no double needed here)' : `One jump rises ${Math.round(w.y - a.top)} px: he drops back into the dip.`);
  await step({}, 30);
  await cap('Now the double: jump, then flick up again at the top.');
  const b2 = await hop(true); console.log('BANK-TWO', JSON.stringify(b2));
  await cap(Math.abs(b2.end.y - bank.y) <= 4 ? 'Up on the bank.' : 'The double did NOT reach the bank.');
  await step({}, 20);
  await cap('On to the gap.');
  console.log('WALKED2', JSON.stringify(await walkTo(m.lip.x + 40)));
}
await step({}, 30);
await cap('Cheat try: ONE jump at the lip, no second press.');
const one = await tryJump(30, false);
console.log('ONE', JSON.stringify(one));
await cap(one.end.x >= m.far.x && one.end.y <= m.far.y + 4 ? 'ONE jump MADE it (the gap does not need the double)' : 'One jump falls short: this is what the game does with him.');
await step({}, 75);
const after = await pos();
console.log('AFTER-ONE', JSON.stringify(after));
// back to the lip's run-up, as a player would walk back
await place(Math.max(m.lip.x + 20, m.lip.r - 200));
await step({}, 20, { noShot: true });
await cap('Now the double: jump at the lip, flick up again at the top.');
const two = await tryJump(30, true);
console.log('TWO', JSON.stringify(two));
await cap(two.end.x >= m.far.x && Math.abs(two.end.y - m.far.y) <= 4 ? 'Lands on the far bank.' : 'The double did NOT land on the far bank.');
await step({ right: true }, 12); await step({}, 30);
console.log('FRAMES', frame);
await ctx.close(); await b.close();
