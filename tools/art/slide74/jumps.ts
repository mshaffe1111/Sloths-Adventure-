/**
 * npx tsx tools/art/slide74/jumps.ts [seed]  ->  every jump (and duck) on 7-4's slide, measured against a real thumb (Matt, 2026-10-29:
 * "May need to evaluate the jumps in the slide level. Couldn't make it thru. Should be very tough, let's make sure it's possible.").
 *
 * For each thing across the flume (a plank barrier, a gap, a beam) and each crate pile in his lane:
 *   - the takeoff window: every frame (30 fps, the engine's step) a jump pressed then clears it, found by running the real SlideSim with
 *     that one obstacle, pressing on each frame in turn (a duck: the frames a held down from then on gets under);
 *   - read: how long before the last good press it has been readable on screen (it fades in at SLIDE.far, readable from far - fade,
 *     the camera CAM_BACK behind him), against the house rule's 0.8 s to react + 0.6 s to act;
 *   - after: the window left once he is down from the thing before (pressing up to SLIDE.buffer before landing still jumps);
 *   - the thumbs (tools/inspect/firsttimer.ts): the adult on Normal presses N(+30 ms, 30 ms) after the moment it aims at, the kid on Easy
 *     N(+90 ms, 65 ms); each aims at the middle of the window left; the share of 4000 tries that clear it, against the house hotspot
 *     bar (adult 70%, kid 85%).
 */
import { AIRTIME, KINDS, SLIDE, SlideSim, buildCourse, type Obstacle, type SlideCourse } from '../../../src/game/w7Slide.ts';

const DT = 1 / 30;
/** the camera sits this far behind him (w7SlideArt.ts CAM_BACK) */
const CAM_BACK = 4.2;
/** the house thumbs, plus judgement: on a slide nothing but the picture says when to jump, and a player misjudges the moment by about
 * 70 ms either way (sd) on top of the thumb's own lateness. With the house thumbs alone the adult cleared everything on paper, and Matt
 * still couldn't get through. */
export const THUMB = { normal: { mu: 0.03, sd: Math.hypot(0.03, 0.07), bar: 0.7 }, easy: { mu: 0.09, sd: Math.hypot(0.065, 0.07), bar: 0.85 } };
const REACT = 0.8, ACT = 0.6;

/** the frames (s before he reaches o.z) on which a press clears o, alone on the flume, from his lane */
export function windowOf(c: SlideCourse, o: Obstacle, lane: number): number[] {
  const ok: number[] = [];
  const v = c.speed;
  const lead = 1.6;
  for (let k = 0; k <= Math.round(lead / DT); k++) {
    const solo: SlideCourse = { ...c, obstacles: [{ ...o, taught: false }], petals: [], lines: [], flags: [] };
    const s = new SlideSim(solo);
    s.z = o.z - v * lead;
    s.x = (lane - 1) * SLIDE.lane;
    let bad = false;
    for (let f = 0; f < Math.round((lead + 1.4) / DT); f++) {
      const press = f === k;
      const duck = KINDS[o.kind].beat === 'duck' && f >= k;
      s.step(DT, { left: false, right: false, jumpPressed: press && KINDS[o.kind].beat !== 'duck', down: duck });
      if (s.events.some((e) => e.k === 'hit' || e.k === 'fall')) bad = true;
      if (s.z > o.z + o.len + 1) break;
    }
    // (the time before he reaches it that this frame's press happens: the press acts on frame k's step)
    if (!bad) ok.push(lead - k * DT);
  }
  return ok;
}

function gauss(r: () => number) {
  let u = 0, w = 0;
  while (u === 0) u = r();
  while (w === 0) w = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
}

export interface JumpRow {
  i: number; z: number; kind: string; t: number;
  /** window (s before reaching it): latest .. earliest good press */
  late: number; early: number; width: number;
  /** readable before the latest good press (s) */
  read: number;
  /** the window left after the thing before (s), and what the thing before was */
  left: number; prev: string;
  /** the thumb's share */
  thumb: number;
  fails: string[];
}

export function measure(c: SlideCourse): JumpRow[] {
  const v = c.speed;
  const obs = [...c.obstacles].sort((a, b) => a.z - b.z);
  const th = c.easy ? THUMB.easy : THUMB.normal;
  let seed = 12345;
  const r = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296);
  const rows: JumpRow[] = [];
  // when he is free again after each thing (absolute s): after a jump, down; after a duck, past it; after a steer, past it
  let freeAt = -9, prevKind = 'start', lane = 1;
  for (let i = 0; i < obs.length; i++) {
    const o = obs[i];
    const at = o.z / v;
    if (o.kind === 'head') {
      lane = [0, 1, 2].find((l) => !o.lanes.includes(l)) ?? 1;
      freeAt = Math.max(freeAt, at + o.len / v);
      prevKind = 'steer';
      continue;
    }
    if (o.kind === 'column' && !o.lanes.includes(lane)) {
      prevKind = 'steer';
      continue;
    }
    const win = windowOf(c, o, lane);
    const late = win.length ? Math.min(...win) : NaN, early = win.length ? Math.max(...win) : NaN;
    const duck = KINDS[o.kind].beat === 'duck';
    // the window left: presses that come after he is free (a jump may be pressed SLIDE.buffer before landing)
    const freeBy = at - (freeAt - (prevKind === 'jump' ? SLIDE.buffer : 0)); // s before reaching it that he is free
    const leftWin = win.filter((w) => w <= freeBy + 1e-9);
    const lLate = leftWin.length ? Math.min(...leftWin) : NaN, lEarly = leftWin.length ? Math.max(...leftWin) : NaN;
    // readable: dz from the camera under far - fade
    const readFrom = (SLIDE.far - SLIDE.fade - CAM_BACK) / v; // s before reaching it
    const read = readFrom - late;
    // the thumb aims at the middle of the window left (a contiguous run of frames), presses late by its noise
    let hit = 0;
    const N = 4000;
    if (leftWin.length) {
      const aim = (lLate + lEarly) / 2;
      const set = new Set(leftWin.map((w) => Math.round(w / DT)));
      for (let n = 0; n < N; n++) {
        const tPress = aim - (th.mu + th.sd * gauss(r)); // later press = less time before reaching it
        // the press acts on the next frame after it lands
        const k = Math.floor(tPress / DT + 1e-9);
        if (set.has(k)) hit++;
      }
    }
    const thumb = hit / N;
    const fails: string[] = [];
    if (!win.length) fails.push('no window');
    if (read < REACT + ACT) fails.push(`read ${read.toFixed(2)} s < ${REACT + ACT}`);
    if (thumb < th.bar) fails.push(`thumb ${(thumb * 100).toFixed(0)}% < ${th.bar * 100}%`);
    rows.push({ i, z: o.z, kind: o.kind, t: at, late, early, width: early - late + DT, read, left: leftWin.length ? lEarly - lLate + DT : 0, prev: prevKind, thumb, fails });
    // he is free again: a jump lands AIRTIME after a press in the middle of the window; a duck once past it
    const pressT = at - (leftWin.length ? (lLate + lEarly) / 2 : late);
    freeAt = duck ? at + o.len / v + 0.1 : pressT + AIRTIME;
    prevKind = duck ? 'duck' : 'jump';
  }
  return rows;
}

if (process.argv[1]?.endsWith('jumps.ts')) {
  const seed = Number(process.argv[2] ?? 1);
  for (const easy of [false, true]) {
    const c = buildCourse(seed, easy);
    const rows = measure(c);
    const th = easy ? THUMB.easy : THUMB.normal;
    console.log(`\n${easy ? 'EASY' : 'NORMAL'} seed ${seed}: ${c.speed} m/s, ${rows.length} jumps/ducks, thumb N(+${th.mu * 1000}, ${th.sd * 1000} ms), bar ${th.bar * 100}%`);
    console.log('  #   t(s)  kind    window(s before)  width  left   read   prev   thumb  fails');
    for (const w of rows) {
      console.log(`${String(w.i).padStart(3)} ${w.t.toFixed(1).padStart(6)}  ${w.kind.padEnd(7)} ${w.late.toFixed(2)}..${w.early.toFixed(2)}      ${w.width.toFixed(2)}   ${w.left.toFixed(2)}   ${w.read.toFixed(2)}   ${w.prev.padEnd(6)} ${(w.thumb * 100).toFixed(0).padStart(3)}%  ${w.fails.join('; ')}`);
    }
    const p = rows.reduce((a, w) => a * w.thumb, 1);
    const exp = rows.reduce((a, w) => a + (1 - w.thumb), 0);
    console.log(`  failing: ${rows.filter((w) => w.fails.length).length}; expected misses a run ${exp.toFixed(1)}; a clean run ${(p * 100).toFixed(1)}%`);
  }
}
