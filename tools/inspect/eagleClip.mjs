// tools/inspect/eagleClip.mjs (ENG-WATCH, R-165.267, 11-14): clips of a cast sweeper (World 1's eagle) against a player who does NOT hide,
// from the real game on a dev server, every frame stepped through the real touch pad (clipPress.mjs pressFrame, the ONE frame step).
//   node tools/inspect/eagleClip.mjs <port> <out dir> <stage> <eagle#> walk|back|stand|sneak|glance [normal|easy] [up|side] [layout]
// caught: still in that cover until its head-cock begins with him in its reach, then he walks on through its tell and its look
// glance: he holds still in the cover nearest before its post through its passes and its glances (every head-cock, fake-out and look named)
// eagle# is its order along the stage (tools/inspect/eagleProbe.ts prints the same numbers). Every shot's caption names the frame
// (f = 1/30 s since the run began), the eagle's phase, where its eye is against him, his hearts; the frame a heart is lost, and the
// frame its look ends, are named in the caption and printed. 15 fps (every other frame), at 2x.
import fs from 'node:fs';
import { pressFrame } from './clipPress.mjs';
const PWM = await import(process.env.PW ?? 'playwright');
const chromium = PWM.chromium ?? PWM.default.chromium;
const [port, out, STAGE, WHICH, MODE, diff = 'normal', ori = 'up', LAYOUT = '1'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.mkdirSync(out, { recursive: true });
for (const f of fs.readdirSync(out)) if (/^f\d+\.jpg$/.test(f)) fs.unlinkSync(`${out}/${f}`);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off`);
await p.waitForTimeout(2500);
await p.evaluate(([s, L]) => window.__play(s, L), [STAGE, +LAYOUT]);
await p.waitForFunction(() => document.documentElement.dataset.hudCard !== '1', null, { timeout: 30000 }).catch(() => {});
await p.waitForTimeout(4000);
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { const e = eval(E); return !!(e && e.currentStage && e.player && e.cast); }, E, { timeout: 60000 });
const placed = await p.evaluate(([E, WHICH, MODE]) => {
  const e = eval(E);
  e.isPaused = true;
  // (no teach box over the action: every stage line is marked shown, as clip.mjs does by default)
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '10px', right: '10px', bottom: window.innerWidth > window.innerHeight ? '6px' : '120px', zIndex: 99999, font: '700 15px system-ui, sans-serif', color: '#fff', background: 'rgba(0,0,0,.62)', padding: '6px 9px', borderRadius: '8px', lineHeight: '1.25' });
  document.body.appendChild(d);
  const ms = e.cast.sweepers.slice().sort((a, z) => a.s.minX - z.s.minX);
  const m = ms[+WHICH];
  if (!m) return null;
  const k = m.s, x0 = k.minX, x1 = k.maxX;
  const bushes = (e.proto.bushes ?? []).filter((c) => !c.hanging && c.x + c.w > x0 && c.x < x1).sort((a, z) => a.x - z.x);
  let sx;
  if (MODE === 'walk') sx = x0 - 120;
  else if (MODE === 'back') sx = x1 + 120;
  else if (MODE === 'sneak' || MODE === 'glance' || MODE === 'caught') {
    const aim = k.perched ? k.homeX : (x0 + x1) / 2;
    const before = bushes.filter((c) => c.x + c.w / 2 < aim);
    const c = before.length ? before[before.length - 1] : bushes[0];
    // (caught: the end of that cover nearest its post, inside its glance's reach, so its look is ON him when he walks)
    sx = MODE === 'caught' && k.perched ? Math.min(c.x + c.w - 24, Math.max(c.x + 24, k.homeX - 200)) : c.x + c.w / 2;
  } else {
    const cuts = [x0, ...bushes.flatMap((c) => [c.x, c.x + c.w]), x1];
    let best = -1; sx = x0;
    for (let i = 0; i + 1 < cuts.length; i += 2) if (cuts[i + 1] - cuts[i] > best) { best = cuts[i + 1] - cuts[i]; sx = (cuts[i] + cuts[i + 1]) / 2; }
  }
  const near = k.perched ? k.homeY + 300 : k.homeY;
  let gy = null;
  for (const q of e.platforms) { if (q.type === 'hazard' || sx < q.x + 8 || sx > q.x + q.width - 8) continue; if (gy === null || Math.abs(q.y - near) < Math.abs(gy - near)) gy = q.y; }
  const P = e.player;
  Object.assign(P, { x: sx, y: gy, vx: 0, vy: 0, grounded: true, climbing: false, isVineSwinging: false, hanging: false, ducking: false, facing: MODE === 'back' ? -1 : 1, invincibleTimer: 0 });
  P.hp = P.maxHp ?? P.hp;
  e.camera.x = Math.max(0, P.x - e.camera.viewportWidth * 0.32);
  e.camera.y = Math.max(0, P.y - e.camera.viewportHeight * 0.68);
  e.camera.targetX = e.camera.x; e.camera.targetY = e.camera.y; e.camCut = true;
  window.__k = k;
  return { sx: Math.round(sx), gy, x0, x1, perched: !!k.perched, home: Math.round(k.homeX), hp: P.hp, seed: e.currentStage?.seed ?? e.currentStage?.config?.seed, easy: !!e.easy };
}, [E, WHICH, MODE]);
if (!placed) { console.log('no such eagle'); await b.close(); process.exit(2); }
console.log('PLACED', JSON.stringify({ stage: STAGE, eagle: +WHICH, mode: MODE, diff, ori, layout: +LAYOUT, ...placed }));
const look = () => p.evaluate((E) => { const e = eval(E); const k = window.__k; const P = e.player; return { ph: k.phase, t: k.t, eye: Math.round(k.eyeX), x: Math.round(P.x), g: !!P.grounded, hp: P.hp, passes: k.passes, gl: k.gl ? k.gl.phase : null, re: !!k.gl?.re }; }, E);
let shot = 0, was = null, hp = placed.hp, go = -1, hopLeft = 0, glWas = null;
const xs = [];
const named = [];
const N = +(process.env.FRAMES ?? 330);
for (let f = 0; f < N; f++) {
  // (a story note opened on the way, "Tap here when you've read it": tapped away as a player does, so it never covers the sky)
  if (f % 10 === 0) await p.evaluate(() => { for (const el of document.querySelectorAll('div,p,span,button')) if (el.childElementCount === 0 && /Tap here when you've read it/.test(el.textContent ?? '')) el.click(); });
  const L0 = await look();
  const dir = MODE === 'walk' || ((MODE === 'sneak' || MODE === 'caught') && go >= 0) ? 1 : MODE === 'back' ? -1 : 0;
  xs.push(L0.x);
  let jump = false;
  if (dir && hopLeft <= 0 && L0.g && xs.length > 4 && Math.abs(L0.x - xs[xs.length - 5]) < 3) { hopLeft = 8; jump = true; }
  if (hopLeft > 0) hopLeft--;
  await p.evaluate(([src, E, inp]) => (new Function(`return (${src})`)())(eval(E), inp, {}, false), [pressFrame.toString(), E, { right: dir > 0, left: dir < 0, jump, holdMs: 260 }]);
  const L = await look();
  if (MODE === 'caught' && go < 0 && L.ph === 'rest' && L.gl === 'cock' && glWas === 'away' && Math.abs(L.x - placed.home) <= 230) { go = f + 1; named.push(`f${f}: its head-cock begins (its tell): he walks on anyway at x ${L.x}`); }
  if (MODE === 'sneak' && go < 0 && L.ph === 'rest' && was && was !== 'rest') { go = f + 1; named.push(`f${f}: its look is over (head away): he walks out of cover at x ${L.x}`); }
  if (MODE === 'sneak' && go >= 0 && placed.perched && Math.abs(L.x - placed.home) < 4) named.push(`f${f}: under its post (x ${placed.home}), phase ${L.ph}`);
  if (L.ph === 'rest' && L.gl !== glWas && glWas !== null) named.push(`f${f}: glance ${glWas} -> ${L.gl}${L.re ? ' (re-check)' : ''} (him ${L.x})`);
  glWas = L.ph === 'rest' ? L.gl : null;
  if (L.ph !== was && was !== null) named.push(`f${f}: ${was} -> ${L.ph} (eye ${L.eye}, him ${L.x})`);
  if (L.hp < hp) named.push(`f${f}: HEART LOST at x ${L.x} (hp ${L.hp})`);
  const glWord = { away: L.re ? 'head AWAY: a RE-CHECK comes quickly' : 'head AWAY (green light)', cock: 'HEAD-COCK: its tell (freeze!)', fake: 'FAKE-OUT: a half-turn', look: 'LOOKING: moving = seen' };
  const phaseWord = { rest: L.gl ? glWord[L.gl] : 'head AWAY (rest: it looks at nothing)', hunt: L.t < 2.05 && (Math.abs(L.eye - placed.x0) < 2 || Math.abs(L.eye - placed.x1) < 2) ? 'SCREECH: its warn (eye waits)' : 'its eye sweeps', tell: 'TELL: it dives', act: 'ACT: the dive (hurts)', recover: 'pulls up', flee: 'gives up, flies off', gone: 'gone', stunned: 'stunned' }[L.ph] ?? L.ph;
  const lost = L.hp < hp ? ' <b style="color:#f87171">HEART LOST</b>' : '';
  if ((f % 2 === 0 || lost) && f >= +(process.env.SKIP ?? 0)) {
    await p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, `${STAGE} ${diff} eagle #${WHICH}${placed.perched ? ' (perched)' : ''} · ${MODE}<br>f${f} · ${phaseWord}<br>eye ${L.eye} · him ${L.x} (${L.eye - L.x >= 0 ? '+' : ''}${L.eye - L.x}) · hearts ${L.hp}${lost}`);
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    await p.screenshot({ path: `${out}/f${String(shot++).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 80 });
  }
  hp = L.hp;
  was = L.ph;
  if ((dir > 0 && L.x > placed.x1 + 420) || (dir < 0 && L.x < placed.x0 - 420)) { named.push(`f${f}: out of its stretch by 420 px`); break; }
}
for (const n of named) console.log('  ' + n);
fs.writeFileSync(`${out}/frames.txt`, [JSON.stringify(placed), ...named].join('\n') + '\n');
await b.close();
