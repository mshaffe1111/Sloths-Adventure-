/**
 * snapClock — 2-5's snap-jaw clock against Pokey's real tap hop (DESIGN-24-25, level.md rule 24). Pokey is engine.ts at 30 fps
 * (realPlay.ts) with the game's own InputEngine on it (the 80 ms minimum hold of a tap, as reference/specs/sims/flight.ts Rig; a bare
 * FakeInput press is a hop no thumb makes). The stones are solid platforms; whether a stone bites on a frame is the game's own
 * beatBrick.ts brickNow('bites') of clock.ts clockAt (a snap stone is not in play yet: padPiece.ts plays 'gone' only, so the bite is read
 * from the same functions the piece will call, frame by frame along his real path).
 *
 * The clock: four counts of BEAT s; counts 1-3 safe ('off', then 'warn' = the jaw creaking open over the last WARN s of count 3, the
 * tell), count 4 shut ('on': it still holds him and hurts). Easy x STRETCH on every phase (beatOf).
 * A row: the bank, N stones W px wide G px apart (edge to edge), the far bank. The hop: he holds right and taps jump on the bank's lip,
 * then again `d` frames after each landing ("hop hop hop"; d = 0..4). Each run is recorded (which stone he stands on, every frame), then
 * replayed against the clock started at every frame of one bar: a start is SAFE if he never stands on a stone while it bites. Read: the
 * share of safe starts, the longest run of safe start frames (his window to leave the bank, s), the time on the stones.
 * WAVE: stone i's shift is i x SHIFT counts. clock.ts beatAt reads t + offset + shift, so a + shift runs a stone AHEAD in its cycle: +1 =
 * each stone bites a count EARLIER than the one before (the snap runs back at him), -1 = a count LATER (it runs ahead, the way he goes). For a wave he may
 * also WAIT on a stone: the "ride the wave" bot hops onto stone i+1 the frame after its bite ends and stands until then.
 * Run (from a checkout of origin/main 6e7b85f8): npx tsx reference/specs/sims/snapClock.ts [normal|easy]
 */
import { RealPlay, DT } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
import { InputEngine } from '../../../src/game/inputEngine.ts';
import { brickNow } from '../../../src/game/beatBrick.ts';
import { clockAt } from '../../../src/game/clock.ts';
import type { ClockDef } from '../../../src/game/stageKit.types.ts';
import type { Platform } from '../../../src/game/types.ts';

const setting = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const easy = setting === 'easy';
setDifficulty(setting);
const STRETCH = 1.5;
const FLOOR = 800;
const LIP = 2000;

const r = new RealPlay('2-5', 1);
const inp = new InputEngine();
inp.source = 'pad';
r.e.input = inp;

const jaw = (beat: number, warn = 0.5): ClockDef =>
  ({ id: 'jaws', phases: [{ name: 'off', seconds: 3 * beat - warn }, { name: 'warn', seconds: warn }, { name: 'on', seconds: beat }], offset: 0, easyStretch: STRETCH }) as ClockDef;

/** the hop alone: a tap at a run off a lip onto flat ground, and from a stand with right held */
function hop(run: boolean, holdMs: number) {
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as Platform]);
  r.stand(600, FLOOR);
  inp.clearAll();
  r.e.input = inp;
  for (let i = 0; i < 5; i++) r.e.update(DT);
  inp.triggerTouchMove('right');
  if (run) for (let i = 0; i < 40; i++) r.e.update(DT);
  const x0 = r.p.x;
  let f = 0, top = r.p.y;
  inp.triggerTouchUp(0, holdMs);
  let lift = 2;
  while (f < 120) {
    if (f === lift) inp.releaseTouchUp();
    r.e.update(DT); f++;
    top = Math.min(top, r.p.y);
    if (r.p.grounded && f > 2) break;
  }
  return { frames: f, s: f * DT, along: Math.round(r.p.x - x0), up: Math.round(FLOOR - top) };
}

/** one run across a row; returns the stone he stands on each frame (-1 off a stone), from the frame he leaves the bank */
function run(n: number, w: number, g: number, d: number, waitFor?: (i: number, t: number) => boolean) {
  const pl: Platform[] = [{ id: 1, x: 0, y: FLOOR, width: LIP, height: 200, type: 'solid' } as Platform];
  for (let i = 0; i < n; i++) pl.push({ id: 10 + i, x: LIP + g + i * (w + g), y: FLOOR, width: w, height: 60, type: 'solid' } as Platform);
  const farX = LIP + g + n * (w + g);
  pl.push({ id: 2, x: farX, y: FLOOR, width: 3000, height: 200, type: 'solid' } as Platform);
  r.bare(pl);
  r.stand(LIP - 160, FLOOR);
  inp.clearAll();
  r.e.input = inp;
  inp.triggerTouchMove('right');
  const on: number[] = [];
  let left = false, f = 0, since = -1, lift = -1, steer = true, fell = false;
  for (let k = 0; k < 400; k++) {
    const p = r.p;
    const s = p.grounded ? pl.findIndex((q) => q.id === r.standingOn) : -2;
    const stone = s >= 1 && s <= n ? s - 1 : -1;
    if (!left && p.x > LIP - 30 && p.grounded) { inp.triggerTouchUp(0, 80); lift = k + 2; left = true; since = -1; }
    if (left) {
      on.push(stone);
      if (stone >= 0 && since < 0) since = 0;
      if (stone >= 0) {
        // on a stone: wait (stand still) if told, else tap d frames after landing
        const t = on.length - 1;
        if (waitFor && waitFor(stone, t)) { if (steer) { inp.triggerTouchMove('none'); steer = false; } }
        else {
          if (!steer) { inp.triggerTouchMove('right'); steer = true; }
          if (since === d) { inp.triggerTouchUp(0, 80); lift = k + 2; }
          since++;
        }
      } else since = -1;
      if (p.grounded && pl.findIndex((q) => q.id === r.standingOn) === n + 1) { f = k; break; }
    }
    if (k === lift) inp.releaseTouchUp();
    r.e.update(DT);
    if (r.p.y > FLOOR + 100) { fell = true; break; }
  }
  return { on, fell, frames: on.length };
}

/** replay a recorded run against the clock started at every frame of one bar */
function judge(on: number[], def: ClockDef, shiftCounts: number, beat: number) {
  const period = clockAt(def, 0, easy).toOn !== undefined ? 4 * beat * (easy ? STRETCH : 1) : 0;
  const m = Math.round(period / DT);
  const safe: boolean[] = [];
  for (let s0 = 0; s0 < m; s0++) {
    let ok = true;
    for (let t = 0; t < on.length && ok; t++) {
      const i = on[t];
      if (i < 0) continue;
      const now = brickNow('bites', clockAt(def, (s0 + t) * DT, easy, i * shiftCounts * beat));
      if (now.hurts) ok = false;
    }
    safe.push(ok);
  }
  // the longest run of safe starts, round the bar
  let best = 0;
  for (let a = 0; a < m; a++) { let k = 0; while (k < m && safe[(a + k) % m]) k++; best = Math.max(best, k); }
  return { share: safe.filter(Boolean).length / m, window: best * DT, m };
}

const out: string[] = [`snapClock ${setting} (Easy stretch ${STRETCH}); engine on '2-5' (realPlay + InputEngine); ${new Date().toISOString()}`];
const say = (s: string) => { console.log(s); out.push(s); };
for (const run_ of [true, false]) for (const ms of [80, 220]) {
  const h = hop(run_, ms);
  say(`hop: ${ms === 80 ? 'tap (80 ms)' : 'flick (220 ms)'} ${run_ ? 'at a run' : 'from a stand, right held'}: ${h.frames} frames (${h.s.toFixed(2)} s) in the air, ${h.along} px along, ${h.up} px up`);
}
const W = Number(process.env.STONE_W ?? 80);
for (const g of [30, 40, 60]) for (const n of [1, 3, 5]) for (const d of [0, 2, 4]) {
  const { on, fell } = run(n, W, g, d);
  if (fell) { say(`row n${n} w${W} gap ${g} d${d}: FELL (the tap hop does not clear it)`); continue; }
  const first = on.findIndex((i) => i >= 0);
  const last = on.length - 1 - [...on].reverse().findIndex((i) => i >= 0);
  const parts = [];
  for (const beat of [0.75, 0.6]) {
    const j = judge(on, jaw(beat), 0, beat);
    parts.push(`beat ${beat}: safe starts ${Math.round(j.share * 100)}%, leave-the-bank window ${j.window.toFixed(2)} s of a ${(4 * beat * (easy ? STRETCH : 1)).toFixed(2)} s bar`);
  }
  say(`row n${n} w${W} gap ${g} d${d}: bank to far bank ${(on.length * DT).toFixed(2)} s, on the stones from ${(first * DT).toFixed(2)} to ${(last * DT).toFixed(2)} s | ${parts.join(' | ')}`);
}
// the wave: n 3, 4, 5, gap 40 (a pitch of 120 px: one tap hop at a run); hop straight through, or ride it (stand on stone i until stone i+1's bite has just ended)
for (const N of [3, 4, 5]) for (const beat of [0.75, 0.6]) for (const shift of [1, -1]) {
  const def = jaw(beat);
  const B = beat * (easy ? STRETCH : 1);
  const straight = run(N, W, 40, 0);
  const js = straight.fell ? { share: 0, window: 0 } : judge(straight.on, def, shift, beat);
  // ride: for each start s0, a bot that waits on stone i while stone i+1 is biting or about to (its toOn < the hop's air + 2 frames)
  let rideSafe = 0, total = 0, rideTime = 0;
  const m = Math.round((4 * B) / DT);
  for (let s0 = 0; s0 < m; s0 += 2) {
    const wait = (i: number, t: number) => {
      if (i >= N - 1) return false;
      const c = clockAt(def, (s0 + t) * DT, easy, (i + 1) * shift * beat);
      return c.phase === 'on' || c.toOn < 0.4;
    };
    const rr = run(N, W, 40, 0, wait);
    if (rr.fell) continue;
    total++;
    let ok = true;
    for (let t = 0; t < rr.on.length && ok; t++) if (rr.on[t] >= 0 && brickNow('bites', clockAt(def, (s0 + t) * DT, easy, rr.on[t] * shift * beat)).hurts) ok = false;
    if (ok) { rideSafe++; rideTime = Math.max(rideTime, rr.on.length * DT); }
  }
  say(`wave n${N} gap 40 beat ${beat} shift ${shift > 0 ? '+1 (each stone a count EARLIER than the one before: the snap runs back at him)' : '-1 (each stone a count LATER: the snap runs ahead, the way he goes)'}: hop straight through${straight.fell ? ' FELL' : ''}: safe starts ${Math.round(js.share * 100)}%, window ${js.window.toFixed(2)} s | ride the wave (wait on a stone while the next bites or is about to): safe from ${rideSafe} of ${total} moments he leaves the bank (no wait on the bank), slowest crossing ${rideTime.toFixed(2)} s`);
}
const fs = await import('node:fs');
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`./out/snapClock-${setting}.txt`, import.meta.url), out.join('\n') + '\n');
