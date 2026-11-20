// ENG-26b step 5: a CLIP and named STILLS of the water wheel on the REAL page, from the dev fixture (src/game/wheelFixtureStage.ts:
// ?fixture=wheel travels left, ?fixture=wheel-right travels right; &wheel=<row>), no swap into another stage. Stepped frame by frame at
// 30 fps with the game paused, every input through the real touch pad's own calls (tools/inspect/clipPress.mjs pressFrame: every jump
// press is CHECKED for lift; a lost press exits 3), a frame kept every 2nd step (15 fps) at 2x. Prints what the game BUILT (D62).
// Pokey is set on the jetty 40 px from its lip (the toy's climb to it is the tower's own vine), then: a TAP HOP in (board), the ride up
// doing nothing, the step-off inside the FLOWN window (wheelFlights.data.ts: Normal 'edge' a tap hop in the tap window; Easy 'edge' a WALK
// off in the walk window, Easy's floor; 'in' the ride sets him down; 'up' a held jump in the jump window), until he stands on the street.
// Names the frame of each action (D63/D69): BOARD (first frame standing in a bucket), STEP (the press), LANDED (first frame on the street).
// Fails loudly (exit 3) if he never boards, drops into the pond, or never reaches the street.
//   node reference/qa-reports/ENG-26/wheelClip.mjs <port> <out dir> [normal|easy] [up|side] [wheel|wheel-right] [row]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { pressFrame, lostPress } from '../../../tools/inspect/clipPress.mjs';
import { createRequire } from 'node:module';
// (the container's preinstalled Playwright: require works from any directory; PW names another copy)
const { chromium } = createRequire(import.meta.url)(process.env.PW ?? 'playwright');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const [port, out, diff = 'normal', ori = 'up', FIX = 'wheel', ROW = 'edge'] = process.argv.slice(2);
const VP = ori === 'side' ? { width: 915, height: 412 } : { width: 412, height: 915 };
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const fail = async (why) => { console.log('FAIL', why); await b.close(); process.exit(3); };

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 2 });
await ctx.addInitScript((d) => { try { localStorage.setItem('sloth_difficulty', d); } catch {} }, diff);
await ctx.route(/script\.google\.com/, (r) => r.abort());
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${port}/?lessons=off&fixture=${FIX}&wheel=${ROW}`, { timeout: 300000 });
const E = "(typeof window.__engine === 'function' ? window.__engine() : window.__engine)";
await p.waitForFunction((E) => { try { const e = eval(E); return !!(e && e.currentStage && e.player && e.platforms?.some((q) => q.wheel)); } catch { return false; } }, E, { timeout: 300000, polling: 1000 });
await p.waitForTimeout(4000);

// the setup: paused, every teach line marked shown (no box over the action), a caption bar, Pokey on the jetty
const info = await p.evaluate((E) => {
  const e = eval(E);
  e.isPaused = true;
  for (const hh of e.currentStage?.proto?.hints ?? []) hh.shown = true;
  const d = document.createElement('div'); d.id = 'mockcap';
  Object.assign(d.style, { position: 'fixed', left: '12px', right: '12px', bottom: window.innerWidth > window.innerHeight ? '8px' : '20px', zIndex: 99999, font: '700 19px system-ui, sans-serif', color: '#fff', background: 'rgba(20,30,12,0.78)', borderRadius: '12px', padding: '10px 14px', textAlign: 'center', lineHeight: '1.3' });
  document.body.appendChild(d);
  const w = e.platforms.find((q) => q.wheel).wheel.w;
  const jetty = e.platforms.find((q) => q.id === w.lay.jetty);
  const lip = w.way > 0 ? jetty.x + jetty.width : jetty.x;
  Object.assign(e.player, { x: lip - w.way * 40, y: jetty.y, vx: 0, vy: 0, grounded: true, climbing: false, isVineSwinging: false, hanging: false });
  e.standingOnId = jetty.id;
  return {
    stage: e.currentStage?.config?.id, world: e.currentStage?.config?.worldIndex, seed: e.currentStage?.gen2?.seed, difficulty: localStorage.getItem('sloth_difficulty'),
    builtDifficulty: e.currentStage?.gen2?.budget?.difficulty, wheel: { R: w.R, V: w.V, N: w.N, way: w.way, row: w.lay.row, street: w.lay.street, up: w.lay.up },
    view: [innerWidth, innerHeight],
  };
}, E);
console.log('BUILT', JSON.stringify({ ...info, orientation: ori, fixture: FIX }));
if (info.wheel.row !== ROW) await fail(`the page laid row ${info.wheel.row}, not ${ROW}`);

// the flown window for this layout (wheelFlights.data.ts, the table the fairness check reads)
const W = info.wheel;
const key = `${diff} R${W.R} V${W.V} N${W.N} W120 ${W.street}${W.street === 'up' ? W.up : ''}`;
const table = fs.readFileSync(path.join(root, 'src/game/gen2/wheelFlights.data.ts'), 'utf8');
const line = table.split('\n').find((l) => l.trim().startsWith(JSON.stringify(key) + ':'));
if (!line) await fail(`no flown row ${key}`);
const flown = JSON.parse(line.trim().slice(JSON.stringify(key).length + 1).replace(/,$/, ''));
const how = W.street === 'up' ? 'jump' : W.street === 'in' ? 'ride' : diff === 'easy' ? 'walk' : 'tap';
const win = how === 'ride' ? null : flown[how];
console.log('FLOWN', key, how, JSON.stringify(win ?? flown.ride));

const toward = W.way > 0 ? { right: true } : { left: true };
let frame = 0, n = 0, k = 0;
const shots = [];
const cap = (html) => p.evaluate((h) => { document.getElementById('mockcap').innerHTML = h; }, html);
const look = () => p.evaluate((E) => {
  const e = eval(E); const P = e.player;
  const w = e.platforms.find((q) => q.wheel).wheel.w;
  const q = e.platforms.find((pp) => pp.id === e.standingOnId);
  const z = e.currentStage.rivers?.find((r) => r.wheelPond);
  // the bucket's angle past the top in the way he travels (wheelFlights.ts StepRead: negative before the top)
  let past = null;
  if (q?.wheel) { const phi = (w.V / w.R) * e.gameTime + (2 * Math.PI * q.wheel.i) / w.N + (w.phase ?? 0); past = ((((phi - Math.PI) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI; }
  const on = !P.grounded ? 'air' : q?.wheel ? 'bucket' : q?.id === w.lay.streetId || (q && Math.abs(q.y - e.platforms.find((pp) => pp.id === w.lay.streetId).y) <= 4 && (P.x - w.cx) * w.way > 0) ? 'street' : q?.id === w.lay.jetty ? 'jetty' : q ? 'other' : 'air';
  return { on, past, x: Math.round(P.x), y: Math.round(P.y), t: +e.gameTime.toFixed(2), pond: !!z && P.x > z.x0 && P.x < z.x1 && P.y > z.surfaceY - 8 };
}, E);
const step = async (inp = {}) => {
  const r = await p.evaluate(([src, E, inp]) => (new Function(`return (${src})`)())(eval(E), inp, { safe: true }, false), [pressFrame.toString(), E, inp]);
  k++;
  if (inp.jump) {
    console.log('PRESS', k, JSON.stringify({ at: [Math.round(r.x), Math.round(r.y)], ...r.lift }));
    if (lostPress(r.lift)) await fail(`JUMP-NO-LIFT at step ${k}`);
  }
  if (n++ % 2 === 0) {
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r(0))));
    const f = `${out}/f${String(frame++).padStart(4, '0')}.jpg`;
    await p.screenshot({ path: f, type: 'jpeg', quality: 82 });
    return { r, f };
  }
  return { r, f: null };
};
// a named still: this frame as a PNG (the frame's own picture, never re-rendered later)
const still = async (name) => { const f = `${out}/${String(shots.length).padStart(2, '0')}-${name}.png`; await p.screenshot({ path: f }); shots.push({ name, f, step: k, frame }); console.log('STILL', name, 'step', k, 'clip frame', frame); };

await cap(`${ROW} wheel, ${diff}: Pokey on the jetty`);
for (let i = 0; i < 20; i++) await step({});
await still('jetty-whole-screen');
// BOARD: a tap hop toward the wheel, the way held until he lands
await cap('a tap hop into a bucket');
await step({ ...toward, jump: true, holdMs: 80 });
await step({ ...toward });
await step({ ...toward, release: true });
let L = await look(), boardStep = -1;
for (let i = 0; i < 90 && boardStep < 0; i++) {
  await step({ ...toward });
  L = await look();
  if (L.on === 'bucket') boardStep = k;
  if (L.pond) await fail(`fell into the pond boarding (step ${k})`);
}
if (boardStep < 0) await fail(`never boarded (on ${L.on})`);
console.log('BOARD step', boardStep, JSON.stringify(L));
await still('board');
// RIDE: doing nothing, until the flown window (an 'in' street: until he is set down on it)
await cap('riding up: doing nothing');
const mid = win ? (win.from + win.to) / 2 : null;
let rideStill = false, stepStep = -1;
for (let i = 0; i < 30 * 30 && stepStep < 0; i++) {
  await step({});
  L = await look();
  if (L.pond) await fail(`dropped into the pond riding (step ${k})`);
  if (L.on === 'street') { stepStep = k; break; }
  if (L.on === 'bucket' && L.past !== null && !rideStill && Math.abs(L.past + Math.PI / 2) < 0.08) { await still('mid-ride'); rideStill = true; }
  if (L.on === 'bucket' && mid !== null && L.past !== null && L.past >= mid - 0.05 && L.past <= win.to - 0.1) {
    await cap(how === 'walk' ? 'step off: a walk onto the street' : how === 'jump' ? 'jump off the top' : 'step off: a tap hop onto the street');
    await still('step-off-moment');
    stepStep = k;
    if (how === 'tap') { await step({ ...toward, jump: true, holdMs: 80 }); await step({ ...toward }); await step({ ...toward, release: true }); }
    else if (how === 'jump') { await step({ ...toward, jump: true, holdMs: 500 }); for (let j = 0; j < 14; j++) await step({ ...toward }); await step({ ...toward, release: true }); }
  }
}
if (stepStep < 0) await fail('never reached the step-off window');
console.log('STEP step', stepStep, JSON.stringify(L));
let landStep = L.on === 'street' ? k : -1, airStill = false;
for (let i = 0; i < 90 && landStep < 0; i++) {
  await step(how === 'ride' ? {} : { ...toward });
  L = await look();
  if (L.on === 'air' && !airStill) { await still('stepping-off'); airStill = true; }
  if (L.pond) await fail(`fell into the pond stepping off (step ${k})`);
  if (L.on === 'street') landStep = k;
}
if (landStep < 0) await fail(`never reached the street (on ${L.on})`);
console.log('LANDED step', landStep, JSON.stringify(L));
await cap('on the street');
await still('landed');
for (let i = 0; i < 24; i++) await step({});
await still('after');
await b.close();
const mp4 = `${out}/clip.mp4`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '15', '-i', `${out}/f%04d.jpg`, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-pix_fmt', 'yuv420p', mp4]);
for (const f of fs.readdirSync(out)) if (/^f\d{4}\.jpg$/.test(f)) fs.rmSync(path.join(out, f));
console.log('CLIP', mp4, `${frame} frames at 15 fps; board at clip frame ~${Math.floor((boardStep - 1) / 2)}, step-off at ~${Math.floor((stepStep - 1) / 2)}, landed at ~${Math.floor((landStep - 1) / 2)}`);
console.log('OK');
