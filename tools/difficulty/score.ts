/**
 * The hardness meter, PROTOTYPE (DIFF-ALGO, R-165.172; the design is reference/design/DIFFICULTY.md). Read-only: it builds each stage
 * the way the game builds it on entry (realPlay.ts: setDifficulty, then the engine's own build of the layout) and reads it. Nothing in
 * src/ imports it, it changes nothing, and it never runs on a phone (PERFORMANCE-RULES §1: the meter costs nothing at play time).
 *
 *   npx tsx tools/difficulty/score.ts [--stages 1-1,1-2,1-3] [--seeds 1-4] [--settings normal,easy] [--detail] [--json path]
 *   npx tsx tools/difficulty/score.ts --check        (the planted cases: the meter's own arithmetic, before its numbers are trusted)
 *
 * The unit is the BIT (Fitts 1954; MacKenzie 1992, ID = log2(D/W + 1)): how precise an input must be. A jump that needs half of what
 * the move can reach is 1 bit, three quarters 2 bits, 90% 3.3 bits. Each challenge on the route (a jump, a climb, a creature, a timed
 * hazard) gets its bits, then three multipliers: what a miss costs (STAKES, Juul 2009's punishment kinds), other threats at the same
 * moment (OVERLAP, dual-task interference: Wickens 2002), and how new the move still is (NOVELTY, the power law of practice: Newell &
 * Rosenbloom 1981). A stage's raw load is the mean of its average bits a minute and its hardest 30 s (the peak-end rule: Kahneman et
 * al. 1993 and Fredrickson & Kahneman 1993, people judge a stretch by its peak, not its length). One constant turns raw load into the
 * 0-100 meter: SCALE, set ONCE so that 1-1 on Normal (all seeds) reads Matt's 4 (11-12 8:31 PM ET). Nothing is tuned per stage.
 */
import { setDifficulty } from '../../src/game/difficulty.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
import { modelStage, MODEL_TYPICAL } from '../../src/game/stageTime.ts';
import { PHYS, SIM_DTS, TIMED, vinePeriod, airStep, canGrabSwing, JUMP_AIRTIME, LETGO_FLIGHTS, pressWindow, chainWindow, swingReach, type AirBody } from '../../src/game/physics.ts';
import { SWING_CAM, SWING_SEEN } from '../../src/game/cameraFollow.ts';
import * as CHASE_MOD from '../../src/game/chase.ts';
import { STILLNESS } from '../../src/game/stillness.ts';
import { chainLines, doubleAllowed, gripsOf } from '../../src/game/levelCheck.ts';
import { withSetting } from '../../src/game/settingDials.ts';
import { LIANA } from '../../src/game/gen2/types.ts';
import { findRoute, type Route } from '../inspect/route.ts';
import { findBeats, sampleRoute, type Beat, type Sample } from '../inspect/beats.ts';
import { inspectJumps, routeJumps, ADULT, type JumpReport } from '../inspect/jumps.ts';
import fs from 'node:fs';
import { FIELD_FEEL, gatesOpened } from '../../src/game/vineField.ts';
import { fallSeconds, POD } from '../../src/game/podfall.ts';
import { beatOf } from '../../src/game/clock.ts';
/** the rolling nuts and fruit (rolling.ts, BUILD-18's 1-8): read from the game where the tree has it; a tree without it builds no stage
 *  with `rolling`, so nothing here asks for it */
const ROLLING: any = await import(new URL('../../src/game/rolling.ts', import.meta.url).href).catch(() => null);

type Setting = 'normal' | 'easy';

/** what one move can reach, FLOWN in the real engine at 30 fps (reference/specs/reach.md §1, the table; ±2 px singles, ±3 px doubles) */
export const REACH = {
  single: { gap: { normal: 244, easy: 246 }, climb: 123 },
  double: { gap: { normal: 396, easy: 400 }, climb: 212 }, // the flick: what a thumb does (the hold reaches 409 / 214)
  bounce: { gap: { normal: 179, easy: 183 }, climb: 223 },
  bounceAir: { gap: { normal: 340, easy: 340 }, climb: 317 },
} as const;
/** his body is 44 px wide (jumps.ts WIDTH): a landing narrower than two bodies is an aimed landing (Mourato & dos Santos 2010) */
export const BODY = 44;
/** never more than 5 bits from one share: past 97% the jump is a bot's, not a player's (the floors in STAGE-RULES §1b stop it first) */
export const SHARE_CAP = 0.97;

/** Fitts's index of difficulty with the spare reach as the target: log2(need / spare + 1) = log2(1 / (1 - share)) */
export const fittsBits = (share: number): number => Math.log2(1 / (1 - Math.max(0, Math.min(SHARE_CAP, share))));
/** an aimed landing: one bit for each halving of the landing below two bodies (0 at 88 px or wider) */
export const landBits = (landW: number): number => Math.max(0, Math.log2((2 * BODY) / Math.max(BODY / 2, landW)));
/** a timed press inside a window (temporal pointing, Lee & Oulasvirta 2016): the share of the cycle that is open is the target */
export const windowBits = (cycle: number, open: number): number => Math.log2(1 + cycle / Math.max(0.05, open));

/**
 * What a miss costs (Juul 2009, "Fear of failing": the punishment kinds), as a multiplier on the bits. A miss that only means another
 * go (he lands below and walks back, or Easy's soft set-back) is 1; a heart and a set-back 1.25; a life (a pit, the water) 1.5, and
 * more the further back his last flag is: replay seconds / 240 more, to 2.0 at most (a 2-minute replay doubles the sting).
 */
export const STAKES = { retry: 1, soft: 1, heart: 1.25, life: 1.5, replayPerSec: 1 / 240, lifeMax: 2 } as const;
/** threats at the same moment: +50% for each OTHER threat within ±1.5 s (a creature at the landing, a gust in the jump) */
export const OVERLAP = { window: 1.5, each: 0.5, max: 2.5 };
/** the first times a move is asked count more: 1 + 0.5 / sqrt(1 + n), n = earlier times in the stages scored before it, in game order */
export const NOVELTY = { on: true };
export const novelty = (n: number): number => (NOVELTY.on ? 1 + 0.5 / Math.sqrt(1 + n) : 1);
/**
 * FREE: the first bit of every input is free. A move with at least half of its reach to spare (a 1 s window, a choice with no clock)
 * is what anybody does without thinking (Matt, 11-12: "running across and just doing simple things that a 9-year-old can do"); only
 * the bits past it are CHALLENGE. One rule for every stage, never tuned to one.
 */
export let FREE_BITS = 1;
/** the peak window (s), and how the raw load mixes the stage's average with its peak */
export const PEAK_WINDOW = 30;
export const MIX = { mean: 0.5, peak: 0.5 };

/** the reference second: a press window of 1 s is 1 bit (windowBits(1, 1)); a 0.5 s tell 1.58; the Normal floor's 167 ms 2.8 */
export const REF_S = 1;
/**
 * Things that are not a jump, each a timed press with its window (windowBits), read from the game's own numbers:
 * - a creature he must get past AWAKE: he has its tell to act (predators/core.ts tellOf: Normal the def's tell, Easy x def.easy.tell);
 *   World 1's snake: 0.5 s Normal, 0.65 s Easy (predators/world1.ts) = 1.58 / 1.34 bits;
 * - a creature ASLEEP, or one a drop trap clears from out of its reach (the trap's load lands within 160 px of it): a choice, no
 *   clock: 0.5 (he must see it and choose; 1-3's design: "Pokey does not have to fight");
 * - the second press of a double: any press 2-12 frames into the first jump climbs it (reach.md §1, the double row), a 333 ms window
 *   in the first jump's 0.5 s rise: windowBits(0.5, 0.333) = 1.32 bits;
 * - a vine climb: 0.25 (straight up always climbs, STAGE-RULES §1); a liana release: a 0.4 s window in a 1.6 s swing (2.32);
 * - a puzzle or a trap's handle: 0.5.
 */
/** how far above or below a challenge's own heights crumbling wood still counts as its footing (px): a step's height */
export const CRUMBLE_DY = 40;
export const OTHER_BITS = { choice: 0.5, second: windowBits(0.5, 0.333), climb: 0.25, swing: windowBits(1.6, 0.4), puzzle: 0.5 } as const;
export const creatureBits = (tellS: number): number => Math.log2(1 + REF_S / Math.max(0.05, tellS));

/** 1 is a free retry, 2 a soft set-back, 3 a heart and set-back, 4 a life */
type Cost = 'retry' | 'soft' | 'heart' | 'life';
export interface Challenge {
  t: number;
  x: number;
  /** the heights it spans (take-off and landing, or where it stands), where known: crumbling wood counts only at its own height */
  ys?: [number, number];
  kind: string;
  bits: number;
  /** a threat that lasts (a chase front over its stretch, an eagle's eye over its watched stretch): on the route's clock, from, to. It
   *  overlaps every challenge inside it (combine), not only those within OVERLAP.window of its start */
  span?: [number, number];
  cost: Cost;
  stakes: number;
  threat: boolean;
  overlap: number;
  novelty: number;
  points: number;
  note: string;
}

const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[(s.length >> 1) - 1] + s[s.length >> 1]) / 2) : 0;
};

/** the time on the route's movement clock nearest to x */
function clockAt(samples: Sample[], x: number, y: number): number {
  let best = samples[0], bd = Infinity;
  for (const q of samples) { const d = Math.abs(q.x - x) + Math.abs(q.y - y) * 0.5; if (d < bd) { bd = d; best = q; } }
  return best?.base ?? 0;
}

/**
 * what a miss at x costs on this stage, as the engine charges it: a hurt floor (a heart, or soft on Easy: gen2 heartFalls), a fall on
 * a stage the engine plays soft (engine.ts `softOn`: 1-1's brief on both settings, Easy off gen2) a set-back, the water or a pit a life,
 * else only another go (he lands below and walks back)
 */
function costAt(st: any, softOn: boolean, x0: number, x1: number, miss: JumpReport['miss']): Cost {
  const lo = Math.min(x0, x1), hi = Math.max(x0, x1);
  const hf = (st.heartFalls ?? []).find((h: any) => h.x0 <= hi && h.x1 >= lo);
  if (hf) return hf.soft ? 'soft' : 'heart';
  if (miss === 'fall') return softOn ? 'soft' : 'life';
  return 'retry';
}
/** seconds back to the last flag before x, at a run */
function replayAt(st: any, x: number): number {
  const flags = (st.checkpoints ?? []).map((c: any) => c.x).filter((fx: number) => fx <= x);
  const from = flags.length ? Math.max(...flags) : st.spawnX ?? 0;
  return Math.max(0, x - from) / PHYS.maxRun;
}
const stakesOf = (st: any, c: Cost, x: number): number =>
  c === 'life' ? Math.min(STAKES.lifeMax, STAKES.life + replayAt(st, x) * STAKES.replayPerSec) : STAKES[c];

/**
 * The release window of ONE swing (s), as the engine's own reach check flies it (METER-1, R-165.261): of one there-and-back of liana
 * `v`, how long a press to let go lands him where the route goes next. Onto a perch: levelCheck heldLandings (physics pressWindow: the
 * engine's press, the sweet spot, a beat early or late, the let-go flights, from the holds the liana's grip dial names, so a FAR gap
 * only its foot flies is as narrow as it really is); onto the next liana of a chain: levelCheck chainLines (physics chainWindow, B at its
 * own phase). The same numbers gen2 lays every liana by (pipeline lianaRelease, chainRelease) and the level check passes it on (6 lines,
 * 200 ms, is its floor), on the setting's own swing (settingDials withSetting: Easy's slower swing and wider sweet spot). 0: the check
 * flies no press there (the route linked it by an added link): the caller says so and keeps the meter's earlier constant.
 */
export function releaseWindow(st: any, v: any, to: { x: number; plat?: any; vine?: any }, setting: Setting, dbl: boolean, held = false): Array<{ w: number; plat?: any; vine?: any }> {
  const dir: 1 | -1 = to.x >= v.x ? 1 : -1;
  // (the let-go flights: with the double's only where `dbl` (levelCheck gripFlights), from the holds the grip dial names (gripsOf))
  const flights = dbl ? LETGO_FLIGHTS : LETGO_FLIGHTS.filter((f) => f.dbl > 9);
  const grips = gripsOf(v.grip, v.bottomY - v.topY);
  return withSetting(setting, () => {
    const out: Array<{ w: number; plat?: any; vine?: any }> = [];
    if (to.vine) {
      // (the chain's catch as gen2 sizes it (pipeline chainRelease): a press counts only when B's whole swing is in the view as he presses,
      //  SWING_SEEN; B at its own phase on the stage. The other way, the level check's lines (World 1's chains all run right))
      const far = to.vine.x + swingReach(to.vine);
      const ms = dir === 1 ? chainWindow(v, to.vine, flights, grips, (px) => far <= px + SWING_SEEN) : chainLines(v, to.vine, dbl) * SIM_DTS[0] * 1000;
      if (ms > 0) out.push({ w: ms / 1000, vine: to.vine });
    }
    // (the perches the swing really throws him onto, on the route's way: the route's own landing, or any perch between the liana and it
    //  (the route's added links leap a liana to the bank past its perch, and a chain's two lianas over the perch between them: 1-6's lay
    //  throws him onto the perch, then he hops on or grabs the next) and never a pit's floor under the swing (a fall, not a landing:
    //  deeper than a step under the liana's foot and the landing): each its own window, the caller takes the easiest)
    const end = to.plat ? (dir === 1 ? to.plat.x + to.plat.width : to.plat.x) : to.x;
    const lo = Math.min(v.x, end), hi = Math.max(v.x, end);
    const floor = Math.max(v.bottomY, to.plat?.y ?? 0) + STEP_BELOW;
    const way = (st.platforms ?? []).filter((q: any) => !q.broken && (q === to.plat || (q.x < hi && q.x + q.width > lo && q.y <= floor)));
    for (const q of way) {
      // (the window as gen2 sizes it, pipeline lianaRelease: the engine's press (pressWindow) landing on the perch, and on a liana with a
      //  grip dial, or the last of a chain (`held`), only the presses that SEE the perch's far end on the narrowest phone (SWING_SEEN,
      //  SWING_CAM.perch; R-165.225): a press at a perch he cannot see is a guess, not an aim. pressWindow lets go toward +x, so a perch
      //  the other way is mirrored about the liana, as levelCheck's heldLandings does)
      const far = { x: dir === 1 ? q.x : 2 * v.x - (q.x + q.width), y: q.y, w: q.width };
      const hits = (c: AirBody, _t: number, prevY: number) => c.vy >= 0 && prevY <= far.y + 14 && c.y >= far.y && c.x > far.x + 10 && c.x < far.x + far.w;
      const seen = v.grip || held ? (px: number) => far.x + Math.min(far.w, SWING_CAM.perch) <= px + SWING_SEEN : undefined;
      const ms = pressWindow(v, hits, flights, grips, seen);
      if (ms > 0) out.push({ w: ms / 1000, plat: q });
    }
    return out;
  });
}
/** a perch on the swing's way may sit this far under the liana's foot or the route's landing (a step: World 1's root hop is 50-56 px,
 *  w1Arc16 UP/DOWN); a pit's floor lies deeper */
export const STEP_BELOW = 60;
/**
 * One release as a timed press (windowBits: one swing's period against its window), the easiest way he has: the let-go alone, or with
 * the double (its window with the double's flights, plus the second press, OTHER_BITS.second, as moveOf charges a double), where the
 * stage allows the double (levelCheck doubleAllowed). A window the check cannot fly keeps OTHER_BITS.swing, named NOT FLOWN.
 */
export function releaseBits(st: any, v: any, to: { x: number; plat?: any; vine?: any }, setting: Setting, held = false): { bits: number; note: string; plat?: any } {
  const period = withSetting(setting, () => vinePeriod(v));
  const ways: Array<{ bits: number; w: number; how: string; plat?: any }> = [];
  const take = (dbl: boolean) => {
    for (const o of releaseWindow(st, v, to, setting, dbl, held)) {
      // (crumbling wood where he lands: +1, the crumble's own rule (a crumble +1 on the jump onto it), read at the perch, not the liana)
      const crumb = o.plat?.type === 'fragile' ? 1 : 0;
      ways.push({ bits: windowBits(period, o.w) + (dbl ? OTHER_BITS.second : 0) + crumb, w: o.w, plat: o.plat,
        how: `${dbl ? ' with the double' : ''}${o.vine ? ` (the chain, to liana ${o.vine.id})` : o.plat ? ` onto ${o.plat.id}${crumb ? ' crumble' : ''}` : ''}` });
    }
  };
  take(false);
  if (doubleAllowed(st.config ?? { worldIndex: 1, miniIndex: 1 })) take(true);
  ways.sort((p, q) => p.bits - q.bits);
  // (no press the engine flies lands him on the route's way (a hand-built link the check does not model): not measured, so it keeps the
  //  meter's earlier constant, named; never the hardest the game allows (the floor) and never nothing)
  const best = ways[0] ?? { bits: OTHER_BITS.swing as number, w: 0.4, how: ', NOT FLOWN: the old constant (0.4 s of 1.6 s)' };
  return { bits: best.bits, plat: best.plat, note: `release ${(best.w * 1000).toFixed(0)} ms of ${period.toFixed(2)} s${best.how}${v.grip ? ` hold ${v.grip}` : ''}` };
}
/** the lianas of a chain from `a` to the route's next stop at `toX` (a liana there, or the perch it lands on), in order: each the nearest
 *  swinging liana past the one before (never a false one), so a route link that leaps a liana (route.ts's added chain links join A to C
 *  over B) is flown liana by liana, as he swings it */
export function chainOf(st: any, a: any, toX: number): any[] {
  const dir = toX >= a.x ? 1 : -1;
  const lianas = (st.vines ?? []).filter((v: any) => v.isSwingingVine && v.snake?.route !== 'still');
  const out = [a];
  let at = a;
  while (out.length < 40) {
    const nx = lianas.filter((v: any) => (v.x - at.x) * dir > 2 && (toX - v.x) * dir >= -2).sort((p: any, q: any) => Math.abs(p.x - at.x) - Math.abs(q.x - at.x))[0];
    if (!nx) break;
    out.push(nx);
    at = nx;
  }
  return out;
}
/**
 * The catch off a bank (METER-1): of one swing of liana `v`, how long (s) a running jump off bank `a`'s edge, the way `dir`, puts his
 * hands on it as it swings (physics canGrabSwing at the vine's clock, TIMED.grabX: the engine's own catch, engine.ts nearSwingVine). The
 * jump as levelCheck's lianaCaught flies it (a running take-off up to 90 px short of the edge, every 15 px), tapped or held, the easiest
 * way: a take-off time counts when ANY of those catches it, since he picks where to jump. A liana that hangs where every jump catches it
 * reads the whole period (1 bit: free); one that swings away from the bank asks for the moment.
 */
export function catchWindow(a: { x: number; y: number; width: number }, v: any, dir: 1 | -1, setting: Setting): number {
  return withSetting(setting, () => {
    const dt = SIM_DTS[0];
    const period = vinePeriod(v);
    const edge = dir === 1 ? a.x + a.width : a.x;
    const b: AirBody = { x: 0, y: 0, vx: 0, vy: 0 };
    let caught = 0;
    const frames = Math.max(1, Math.round(period / dt));
    for (let f = 0; f < frames; f++) {
      const t0 = f * dt;
      let ok = false;
      for (const hold of [false, true]) {
        for (let s = 0; s <= 90 && !ok; s += 15) {
          b.x = edge - dir * s; b.y = a.y; b.vx = dir * PHYS.maxRun; b.vy = -PHYS.jumpV;
          for (let i = 1; i < 90; i++) {
            airStep(b, dt, dir, hold);
            if (b.y > a.y + 400) break;
            if (canGrabSwing(b.x, b.y, v, t0 + i * dt) && Math.abs(b.vx) > 25) { ok = true; break; }
          }
        }
        if (ok) break;
      }
      if (ok) caught++;
    }
    return caught * dt;
  });
}

/** the swinging liana a route swing hangs on: the one at its start (a release, a chain's leap), or for a ledge-to-ledge swing the check
 *  linked whole, the one it passes nearest its take-off; never a false liana (it does not swing: vineSnake.ts isFalseLiana) */
export function lianaOf(st: any, s: { x0: number; x1: number; from?: any; plat?: any }): any {
  const lianas = (st.vines ?? []).filter((v: any) => v.isSwingingVine && v.snake?.route !== 'still');
  const at = lianas.find((v: any) => Math.abs(v.x - s.x0) < 2);
  if (at || !(s.from && s.plat)) return at;
  const lo = Math.min(s.x0, s.x1), hi = Math.max(s.x0, s.x1);
  return lianas.filter((v: any) => v.x >= lo - 40 && v.x <= hi + 40).sort((a: any, b: any) => Math.abs(a.x - s.x0) - Math.abs(b.x - s.x0))[0];
}

/**
 * The route's swings as challenges, ONE a liana (R-165.239, BUILD-16b 11-14): a liana is scored at its release, the press the swing asks
 * for: the let-go onto a perch, the leap to the next liana of a chain, or a ledge-to-ledge swing the level check linked whole. The grab
 * off a bank (route.ts plat -> liana) is the same liana's start, not a second challenge. Its bits are a timed press in its window
 * (windowBits: one swing's period, the liana's own, against the release window the engine flies for that landing: releaseWindow,
 * METER-1); a swing whose window the check cannot fly takes the setting's floor and says so. What a missed release costs is read as a
 * jump's is (costAt): the ground under the swing's span, by the jump inspector's own pit rule (jumps.ts inspectJumps `pit`: nothing to
 * stand on within 220 px under it, the span over 30 px), so a swing over a World 1 soft pit is a set-back, over a hurt floor a heart, over
 * a pit with no floor a life, over ground only another go. Each keeps its beat's clock and words (beats.ts: a swing move's beat starts
 * where its move does); `beats` may be empty (the planted cases). A planted route with no liana in the stage (the planted cases) takes
 * OTHER_BITS.swing.
 */
export function swingChallenges(st: any, route: Route, beats: readonly Beat[], softPits: boolean, setting: Setting = 'normal'): Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'> & { vine?: any }> {
  const out: Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'> & { vine?: any }> = [];
  const live = (st.platforms ?? []).filter((p: any) => !p.broken);
  let base = 0, prevLeap = false;
  for (const s of route.segs) {
    if (s.kind === 'swing' && s.from) {
      // (the catch off a bank: a running jump timed to the liana's swing, its own challenge where the moment matters: catchWindow; the
      //  grab move's liana, or the liana of a ledge-to-ledge swing the check linked whole)
      const v = s.plat ? lianaOf(st, s) : (st.vines ?? []).find((q: any) => q.isSwingingVine && q.snake?.route !== 'still' && Math.abs(q.x - s.x1) < 2);
      if (v) {
        const b = beats.find((q) => q.letter === 'V' && Math.abs(q.base - base) < 1e-6 && q.x === s.x0 && q.y === s.y0);
        const dir: 1 | -1 = s.x1 >= s.x0 ? 1 : -1;
        const period = withSetting(setting, () => vinePeriod(v));
        const w = catchWindow(s.from, v, dir, setting);
        const edge = dir === 1 ? s.from.x + s.from.width : s.from.x;
        const lo = Math.min(edge, v.x), hi = Math.max(edge, v.x), low = s.from.y;
        const pit = hi - lo > 30 && !live.some((q: any) => q !== s.from && q.x < hi && q.x + q.width > lo && q.y > low && q.y < low + 220);
        const cost = costAt(st, softPits, lo, hi, pit ? 'fall' : 'retry');
        // (a catch no running jump off this bank makes (the route's added link, a hand-built piece the check does not model) is NOT
        //  MEASURED: listed with no bits, never priced as the hardest)
        out.push({ t: b?.t ?? base, x: s.x0, ys: [s.y0, s.y0], kind: 'catch', bits: w > 0 ? windowBits(period, w) : 0, cost, stakes: stakesOf(st, cost, s.x0), threat: false,
          note: `catch liana ${v.id} off the bank: ${w > 0 ? `${(w * 1000).toFixed(0)} ms of ${period.toFixed(2)} s` : 'NOT MEASURED (no running jump off this bank catches it)'}` });
      }
    }
    if (s.kind === 'swing' && !(s.from && !s.plat)) {
      const b = beats.find((q) => q.letter === 'V' && Math.abs(q.base - base) < 1e-6 && q.x === s.x0 && q.y === s.y0);
      const lo = Math.min(s.x0, s.x1), hi = Math.max(s.x0, s.x1), low = Math.max(s.y0, s.y1);
      const pit = hi - lo > 30 && !live.some((q: any) => q !== s.from && q !== s.plat && q.x < hi && q.x + q.width > lo && q.y > low && q.y < low + 220);
      const cost = costAt(st, softPits, lo, hi, pit ? 'fall' : 'retry');
      const v = lianaOf(st, s);
      // (every liana he swings and lets go on this move, one release each: a chain's lianas the route's link leaps included, the last one
      //  onto the route's perch; a planted route with no liana in the stage takes OTHER_BITS.swing)
      const all = v ? chainOf(st, v, s.plat ? s.plat.x + (s.x1 >= s.x0 ? 0 : s.plat.width) : s.x1) : [undefined];
      // (a leap to a liana ends on it: its own release is the route's next move, scored there)
      const chain = v && !s.plat ? all.slice(0, -1) : all;
      chain.forEach((q: any, i: number) => {
        const nx = all[i + 1];
        // (held: he came onto this liana off another, a chain's leap (gen2 lianaRelease `held`: its band is laid by what he sees))
        const held = i > 0 || prevLeap;
        const r = q ? releaseBits(st, q, nx ? { x: nx.x, vine: nx } : { x: s.x1, plat: s.plat }, setting, held) : { bits: OTHER_BITS.swing as number, note: 'window not known (a planted route)' };
        const x = q && q !== v ? q.x : s.x0;
        out.push({ t: b?.t ?? base, x, ys: [s.y0, s.y0], kind: 'swing', bits: r.bits, cost, stakes: stakesOf(st, cost, x), threat: false, note: `${b?.what ?? 'swing on a liana'}: ${r.note}`, vine: q });
      });
    }
    prevLeap = s.kind === 'swing' && !s.from && !s.plat;
    base += s.dt;
  }
  return out;
}

/** how near (px) a false liana hangs to a liana the route hangs on for it to stand in his way: the lay hangs it past the take-off, nearer
 *  than the real liana (w1Arc16.ts lianaRun `still`); the engine catches it like any liana (vineSnake.ts isFalseLiana) */
export const FALSE_NEAR = 300;
/**
 * The vine snakes on the lianas the route hangs on (METER-1, R-165.261; vineSnake.ts, 1-6.md NEW 2), each a creature in reach by
 * DIFFICULTY.md §1's own rows:
 * - a TRAVELLING snake (down-off, down-back, up): it keeps a beat on the stage's clock (off, warn, on), and its warn is its tell (vineSnake
 *   SNAKE.tell; Easy stretches the clock, clock.ts beatOf). So it is a creature in reach: creatureBits(the warn), a threat (it overlaps
 *   the release on the same liana: OVERLAP, the snake on your vine as you time the let-go), and what it takes is his hold: it never bites,
 *   it startles him off (vineSnake.ts: the letGo hop), so a miss costs what the ground under that swing costs (the swing's own cost);
 * - a FALSE liana (route 'still': the snake is the vine, it never moves): a creature with no clock, a choice (OTHER_BITS.choice, as an
 *   asleep or trapped one), once each, where it hangs within FALSE_NEAR of a liana the route hangs on; a grab of it startles him off as
 *   the travelling one does.
 * One challenge a snake: a liana the route reaches twice (it never does today) still has one snake.
 */
export function snakeChallenges(st: any, swings: ReadonlyArray<Omit<Challenge, 'overlap' | 'novelty' | 'points'> & { vine?: any }>, setting: Setting): Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> {
  const out: Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> = [];
  const done = new Set<any>();
  for (const sw of swings) {
    const v = sw.vine, sn = v?.snake;
    if (!sn || sn.route === 'still' || done.has(v)) continue;
    done.add(v);
    const def = (st.clocks ?? []).find((c: any) => c.id === sn.clock);
    if (!def) continue;
    const b = beatOf(def, setting === 'easy');
    let tell = 0;
    b.names.forEach((n, i) => { if (n === 'warn') tell += b.seconds[i]; });
    out.push({ t: sw.t, x: v.x, ys: sw.ys, kind: 'vine-snake', bits: creatureBits(Math.max(0.05, tell)), cost: sw.cost, stakes: sw.stakes, threat: true, note: `vine snake ${sn.route} on liana ${v.id}: tell ${tell.toFixed(2)}s (${sn.clock})` });
  }
  for (const f of (st.vines ?? []).filter((v: any) => v.snake?.route === 'still')) {
    const near = swings.filter((sw) => sw.vine && Math.abs(sw.vine.x - f.x) <= FALSE_NEAR).sort((a, c) => Math.abs(a.vine.x - f.x) - Math.abs(c.vine.x - f.x))[0];
    if (!near) continue;
    out.push({ t: near.t, x: f.x, ys: near.ys, kind: 'vine-snake-choice', bits: OTHER_BITS.choice, cost: near.cost, stakes: near.stakes, threat: false, note: `a false liana ${f.id}, ${Math.round(Math.abs(near.vine.x - f.x))} px from liana ${near.vine.id}` });
  }
  return out;
}

/** the route's clock where it is nearest x (any height): a span's ends and a hazard's meeting point */
function clockAtX(samples: Sample[], x: number): number {
  let best = samples[0], bd = Infinity;
  for (const q of samples) { const d = Math.abs(q.x - x); if (d < bd) { bd = d; best = q; } }
  return best?.base ?? 0;
}
/** the cast member a beat at x is of: the one whose kit's ground (minX..maxX) holds x, else the nearest within 600 px */
export function memberAt(members: ReadonlyArray<{ e: any; def: any }>, x: number): { e: any; def: any } | undefined {
  const ground = (m: { e: any }) => [m.e.kit?.minX ?? m.e.patrolMinX ?? m.e.x, m.e.kit?.maxX ?? m.e.patrolMaxX ?? m.e.x];
  const on = members.filter((m) => { const [a, b] = ground(m); return x >= a - 200 && x <= b + 200; });
  const pool = on.length ? on : members.filter((m) => Math.abs(m.e.x - x) < 600);
  return pool.sort((p, q) => Math.abs(p.e.x - x) - Math.abs(q.e.x - x))[0];
}
/** a watcher: a creature that hunts by sight over a stretch, beaten by keeping still in cover (w1Cast's eagle: warn, beatenBy.still) */
export const isWatcher = (def: any): boolean => !!def?.beatenBy?.still && Number(def?.warn) > 0;

/**
 * The chase (METER-1, R-165.261; chase.ts, 1-8 "the branch is breaking behind you"): each stretch ONE challenge, its bits the share of his
 * run the front asks (fittsBits(front / PHYS.maxRun), the jump's own form: need over reach), the front at its base speed, and on the last
 * stretch with its final burst (chase.ts CHASE_ROWS by setting where the tree has it, else CHASE: Normal 230 px/s of his 285 is 2.4 bits,
 * the burst's 290 past his run the cap; Easy's 170, 1.3). Caught: a heart and back to his flag (chasePiece.ts), the heart's stakes. And
 * the front is a threat over the WHOLE stretch (`span`): every move inside it is done with the front coming (OVERLAP, things at once),
 * so the chase times every move (DIFFICULTY.md §5). A hand-built chase (proto.chase) is its run to `finalFrom` and its burst after, on CHASE.
 */
export function chaseChallenges(st: any, samples: Sample[], setting: Setting): Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> {
  // (a hand-built chase, proto.chase: one run, its final burst from `finalFrom` (chase.ts: faster on the last stretch), so two stretches)
  const pc = st.proto?.chase;
  const hand = pc ? (pc.finalFrom > pc.start && pc.finalFrom < pc.end ? [{ start: pc.start, end: pc.finalFrom }, { start: pc.finalFrom, end: pc.end, last: true }] : [{ start: pc.start, end: pc.end, last: true }]) : [];
  const stretches: Array<{ start: number; end: number; last?: boolean }> = st.chase?.stretches ?? hand;
  const rows: any = (CHASE_MOD as any).CHASE_ROWS;
  const row = rows?.[setting] ?? { ...CHASE_MOD.CHASE, cap: Infinity };
  return stretches.map((s) => {
    const front = Math.min(row.cap ?? Infinity, row.base + (s.last ? row.final : 0));
    const t0 = clockAtX(samples, s.start), t1 = clockAtX(samples, s.end);
    return { t: t0, x: s.start, kind: 'chase', bits: fittsBits(front / PHYS.maxRun), cost: 'heart' as Cost, stakes: STAKES.heart, threat: true, span: [t0, t1] as [number, number],
      note: `the front ${front} px/s of his ${PHYS.maxRun} over ${Math.round(s.end - s.start)} px${s.last ? ' (the last stretch)' : ''}` };
  });
}

/**
 * The rolling nuts and fruit (METER-1; rolling.ts RollSpec, 1-8 "hop the nuts that roll, run under the fruit that bounces"), each a threat
 * where it meets him (rollMeetX, the route's clock), by its own numbers on the setting (rollRow, rollTell: Easy's slower roll, longer tell):
 * - a NUT (low) is hopped: a timed press, its window the part of a running hop's airtime that still clears it as it rolls at him
 *   (JUMP_AIRTIME less the nut and his body, 2 x ROLL.lowR + BODY, over the closing speed, his run and its roll), against the reference
 *   second as a creature's tell is (log2(1 + REF_S / window));
 * - a FRUIT (high) is passed under: it phases its pace to meet him mid-arc while he keeps his (rolling.ts phasedPace), so the ask is to
 *   read which height it is in its tell and keep going: a creature's tell (creatureBits(rollTell)); the keep-going itself is restraint,
 *   which has no bits yet (DIFFICULTY.md §6);
 * Two heights are two moves: each kind keeps its own novelty. A teach (rollTeaches: before the first crack, and every Easy one) only
 * bumps him: another go; else a heart. Spacing is the overlap rule: two within OVERLAP.window of each other raise each other.
 */
export function rollingChallenges(st: any, samples: Sample[], setting: Setting, rolling: any = ROLLING): Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> {
  const ROLLING = rolling;
  if (!st.rolling?.length || !ROLLING) return [];
  const easy = setting === 'easy';
  return st.rolling.map((h: any) => {
    const row = ROLLING.rollRow(h, easy);
    const tell = ROLLING.rollTell(easy);
    const meet = ROLLING.rollMeetX(h, easy);
    const teach = ROLLING.rollTeaches(h, st.chase);
    const low = h.kind === 'low';
    const window = JUMP_AIRTIME - (2 * ROLLING.ROLL.lowR + BODY) / (PHYS.maxRun + row.speed);
    const bits = low ? Math.max(creatureBits(tell), Math.log2(1 + REF_S / Math.max(0.05, window))) : creatureBits(tell);
    return { t: clockAtX(samples, meet), x: meet, kind: low ? 'roll-low' : 'roll-high', bits, cost: (teach ? 'retry' : 'heart') as Cost, stakes: teach ? 1 : STAKES.heart, threat: true,
      note: `${low ? `a nut: hop window ${window.toFixed(2)}s` : 'a fruit: run on under'} at ${row.speed.toFixed(0)} px/s, tell ${tell.toFixed(2)}s${teach ? ' (teach: a bump)' : ''}` };
  });
}

/**
 * Being watched (METER-1; 1-7 "when the eagle screams, get into the green and keep still"; w1Cast's eagle, stillLay.ts): over each
 * watcher's stretch (its kit's ground, minX..maxX), each pass is a deadline: from its scream he has its warn to reach cover and be still
 * there (STILLNESS calmIn) before it sweeps. The jump's own form: the need is the run from the stretch's worst spot to the nearest cover
 * (cast.covers, inside by watcher.ts's 10 px, a mossy liana's sweep, or off the stretch past its sight) plus the calm-in, the reach is
 * the warn: fittsBits(need / warn). Its passes over the stretch:
 * one, and one more for every (cool + warn) it takes to cross at a run (Easy's longer cool). Seen, it dives: a heart (the kit's `kitFree`
 * first pass only warns: another go). And its eye is on him over the whole stretch (`span`): every move there is done watched (OVERLAP).
 * Keeping still is restraint and has no bits yet (DIFFICULTY.md §6): named, not faked.
 */
export function watchChallenges(members: ReadonlyArray<{ e: any; def: any }>, covers: ReadonlyArray<{ x: number; w: number }>, samples: Sample[], setting: Setting, vines: readonly any[] = []): Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> {
  const out: Array<Omit<Challenge, 'overlap' | 'novelty' | 'points'>> = [];
  const easy = setting === 'easy';
  const calm = STILLNESS[setting].calmIn;
  // (a mossy liana is cover while he holds it, wherever it swings (stillness.ts, 1-7 NEW 6): its cover is the ground under its sweep and
  //  its catch, the foot's swing either side (len x sin amp) and the catch's reach (TIMED.grabX) more; read as a cover span, `x` its left)
  const grab = withSetting(setting, () => TIMED.grabX);
  const mossy = vines.filter((v: any) => v.mossy && v.isSwingingVine).map((v: any) => {
    const reach = (v.bottomY - v.topY) * Math.sin(v.swingAmp ?? TIMED.amp) + grab;
    return { x: v.x - reach - 10, w: 2 * reach + 20 };
  });
  covers = [...covers, ...mossy];
  for (const m of members) {
    if (!isWatcher(m.def)) continue;
    const x0 = m.e.kit?.minX ?? m.e.patrolMinX ?? m.e.x, x1 = m.e.kit?.maxX ?? m.e.patrolMaxX ?? m.e.x;
    // (and out of its eye: its sight reaches only so far past the stretch it watches (def.sight, ahead or behind), so off either end
    //  of the stretch is as safe as cover: the still fork's eye runs 475 px past its one bush, and its worst spot is half that, not all)
    const sight = Math.max(Number(m.def.sight?.ahead ?? 0), Number(m.def.sight?.behind ?? 0));
    const spans = [...covers.map((c) => [c.x + 10, c.x + c.w - 10] as const), [-Infinity, x0 - sight] as const, [x1 + sight, Infinity] as const].filter(([a, b]) => b > a);
    // (the worst spot, exactly: the stretch's two ends and the middle of every open gap between two covers inside it)
    const dist = (x: number) => Math.min(Infinity, ...spans.map(([a, b]) => (x < a ? a - x : x > b ? x - b : 0)));
    const sorted = [...spans].sort((p, q) => p[0] - q[0]);
    const spots = [x0, x1, ...sorted.slice(1).map(([a], i) => (sorted[i][1] + a) / 2).filter((x) => x > x0 && x < x1)];
    const need = Math.max(0, ...spots.map(dist).filter(Number.isFinite));
    const warn = Number(m.def.warn);
    const share = (need / PHYS.maxRun + calm) / warn;
    const cool = Number(m.def.cool ?? 0) * (easy ? Number(m.def.easy?.cool ?? 1) : 1);
    const passes = Math.max(1, Math.ceil(((x1 - x0) / PHYS.maxRun) / Math.max(1, cool + warn)));
    const t0 = clockAtX(samples, x0), t1 = clockAtX(samples, x1);
    for (let k = 0; k < passes; k++) {
      const free = k === 0 && !!m.e.kitFree;
      out.push({ t: t0 + ((t1 - t0) * k) / passes, x: x0 + ((x1 - x0) * k) / passes, kind: 'watch', bits: fittsBits(share), cost: free ? 'retry' : 'heart', stakes: free ? 1 : STAKES.heart, threat: true,
        ...(k === 0 ? { span: [t0, t1] as [number, number] } : {}),
        note: `watched ${Math.round(x1 - x0)} px: cover ${Math.round(need)} px away at worst + still ${calm}s of a ${warn}s warn (share ${share.toFixed(2)}), pass ${k + 1} of ${passes}${free ? ' (first pass free)' : ''}` });
    }
  }
  return out;
}

/**
 * A timed crossing of a falling hazard's column (METER-1): its period, its quiet (the part of the period nothing falls), and how long the
 * route keeps him in its way. One crossing: the window is the quiet less that time (the entry times that keep all of it quiet). One as
 * long as the quiet: he stops out of reach and goes on in the next, so it is n crossings of inWay / n, each its own press, and he takes
 * the n that costs least (from the fewest that fit to two more), as moveOf takes a jump's easiest move.
 */
export function podCrossing(period: number, quiet: number, inWay: number): { parts: number; open: number } {
  const fewest = Math.floor(inWay / Math.max(0.05, quiet)) + 1;
  const open = (n: number) => Math.max(0.05, quiet - inWay / n);
  const cost = (n: number) => n * Math.max(0, windowBits(period, open(n)) - FREE_BITS);
  const parts = [fewest, fewest + 1, fewest + 2].sort((p, q) => cost(p) - cost(q) || p - q)[0];
  return { parts, open: open(parts) };
}

/**
 * The way a player takes a route jump: the EASIEST move he has (a thumb picks the move that leaves it the most room), and its bits.
 * Share = what the jump asks of that move's flown reach: the inspector's own share where it flew that move (jumps.ts `reach`: it knows
 * the arc and the lip; it is the double's share where it doubled), else the larger of gap / widest gap and rise / highest climb.
 */
function moveOf(j: JumpReport, setting: Setting, bouncy: boolean): { move: string; share: number; bits: number } {
  const gap = Math.max(0, j.gap), rise = Math.max(0, j.rise);
  const shareOf = (m: keyof typeof REACH) => Math.max(gap / REACH[m].gap[setting], rise / REACH[m].climb);
  const ways: Array<{ move: string; share: number; bits: number }> = [];
  const way = (move: string, share: number, extra: number) => { if (share < 1) ways.push({ move, share, bits: fittsBits(share) + extra }); };
  if (bouncy) {
    way('bounce', shareOf('bounce'), 0);
    way('bounce+air', shareOf('bounceAir'), OTHER_BITS.second);
  }
  way('single', !j.dbl && !j.unflyable ? j.reach : shareOf('single'), 0);
  way('double', j.dbl && !j.unflyable ? j.reach : shareOf('double'), OTHER_BITS.second);
  if (!ways.length) return { move: 'beyond', share: 1, bits: fittsBits(1) + OTHER_BITS.second };
  return ways.sort((a, b) => a.bits - b.bits)[0];
}

/**
 * The meter's arithmetic on a stage's challenge list, pure (planted cases in --check): each challenge's points = its bits past the free
 * one x stakes x overlap x novelty; the stage's mean points a minute and its hardest PEAK_WINDOW s, as points a minute
 */
export function combine(out: Challenge[], minutes: number, seen: Map<string, number>): { points: number; mean: number; peak: number } {
  out.sort((a, b) => a.t - b.t);
  for (const c of out) {
    const others = out.filter((o) => o !== c && o.threat && (o.span ? c.t >= o.span[0] - OVERLAP.window && c.t <= o.span[1] + OVERLAP.window : Math.abs(o.t - c.t) <= OVERLAP.window)).length;
    c.overlap = Math.min(OVERLAP.max, 1 + OVERLAP.each * others);
    const k = c.kind.replace('-choice', '');
    const n = seen.get(k) ?? 0;
    c.novelty = novelty(n);
    seen.set(k, n + 1);
    c.points = Math.max(0, c.bits - FREE_BITS) * c.stakes * c.overlap * c.novelty;
  }
  const points = out.reduce((s, c) => s + c.points, 0);
  const mean = points / Math.max(0.5, minutes);
  let peak = 0;
  for (const c of out) {
    const inWin = out.filter((o) => o.t >= c.t && o.t < c.t + PEAK_WINDOW).reduce((s, o) => s + o.points, 0);
    peak = Math.max(peak, inWin * (60 / PEAK_WINDOW));
  }
  return { points, mean, peak };
}
/** a stage's raw load: the peak-end mix of its mean and its peak */
export const rawOf = (mean: number, peak: number): number => MIX.mean * mean + MIX.peak * peak;

export interface StageScore {
  id: string; setting: Setting; seed: number; minutes: number; traced: Route['traced'];
  /** a fall on this stage is a set-back, not a life (its pits are soft: costAt's softOn), and the route it was scored on */
  soft: boolean; route: Route;
  count: Record<string, number>; bits: number; points: number; mean: number; peak: number; raw: number;
  challenges: Challenge[];
}

/** one stage, one setting, one layout: its challenges and raw load (seen: earlier exposures by move kind, carried in game order) */
export function scoreStage(id: string, setting: Setting, seed: number, seen: Map<string, number>): StageScore {
  setDifficulty(setting);
  const rp = new RealPlay(id, seed);
  // (a vine-field stage is walked with its fig gates open, as a puzzle room's stage is walked solved: each gate is a puzzle below, and
  //  the engine shuts them at the start: fieldPlay.ts. Every other stage is the same object, unchanged)
  const st = gatesOpened(rp.stage as any) as any;
  const type: string = st.config.objectiveType;
  // (the route the inspector takes: straight to the shrine; on a stage whose goal is its animals, past each of them)
  const targets = type === 'purge' || type === 'gauntlet'
    ? st.enemies.filter((m: any) => m.type !== 'eagle').map((m: any) => ({ x: m.x, y: m.y }))
    : [];
  // (the meter's route steps onto humps, down stairs and into shallow dips: route.ts `steps`, S1)
  const route = findRoute(st, targets, { steps: true });
  const samples = sampleRoute(route);
  const br = findBeats(st, route, samples);
  // (the same reference thumb on both settings, so a setting's own softening is what moves its score: ADULT, jumps.ts)
  const jumps = inspectJumps(st, route, setting === 'easy', ADULT);
  const out: Challenge[] = [];
  const add = (c: Omit<Challenge, 'overlap' | 'novelty' | 'points'>) => out.push({ ...c, overlap: 1, novelty: 1, points: 0 });
  // (inspectJumps reports routeJumps' edges one for one, in order: jumps.ts inspectJumps, so each report has its take-off and landing)
  const edges = routeJumps(route);
  // (a World 1 gen2 pit is soft: a floor under it and steps back, w1.ts manifest `pit: 'soft'`; gen2/pipeline.ts budget.pit)
  const softPits = !!rp.e.softOn || st.gen2?.budget?.pit === 'soft';
  const live = st.platforms.filter((p: any) => !p.broken);
  jumps.forEach((j, i) => {
    const e: any = edges[i];
    // (the route steps onto a hump, down a stair and into a shallow dip itself, so every edge here is a real jump: route.ts stepBetween,
    // S1 11-13; this file corrected 1-2's humps and dips on its own until then)
    // (a mushroom launches him: the take-off is bouncy, or a cap or floor mushroom sits at the take-off's edge)
    const bouncy = !!e && (e.from.type === 'bouncy' || live.some((p: any) => p.type === 'bouncy' && Math.abs((e.dir === 1 ? p.x + p.width : p.x) - e.x) < 60 && Math.abs(p.y - e.from.y) <= 40));
    const { move, share, bits: moveBits } = moveOf(j, setting, bouncy);
    const bits = moveBits + landBits(j.landW);
    const span = e ? [e.dir === 1 ? e.x : e.to.x + e.to.width, e.dir === 1 ? e.to.x : e.x] : [j.x, j.x + j.gap];
    const cost = costAt(st, softPits, span[0], span[1], j.miss);
    const landY = e ? e.to.y : j.y - j.rise;
    add({ t: clockAt(samples, j.x, j.y), x: j.x, ys: [Math.min(j.y, landY), Math.max(j.y, landY)], kind: move, bits, cost, stakes: stakesOf(st, cost, j.x), threat: false, note: `gap ${Math.round(j.gap)} rise ${Math.round(j.rise)} land ${Math.round(j.landW)} share ${share.toFixed(2)}` });
  });
  // (the stage's drop traps: a creature whose load lands within 160 px of it is cleared from out of its reach)
  const traps: Array<{ loadX: number }> = (rp.e.cast?.traps ?? []).map((tr: any) => tr.post);
  const members: Array<{ e: any; def: any }> = rp.e.cast?.members ?? [];
  for (const b of br.beats) {
    if (b.letter === 'C') {
      const asleep = /asleep/.test(b.what);
      const trapped = traps.some((tr) => Math.abs(tr.loadX - b.x) <= 160);
      // (the member the beat is of: the one whose ground holds it (its kit's stretch), else the nearest within 600 px. The old 200 px
      //  window missed 1-7's eagles, whose beat lies 202 px from where they perch, and read every one at the default 0.5 s)
      const m = memberAt(members, b.x);
      // (a watcher is scored by its watched stretch, watchChallenges: the eye over the ground, not one swoop)
      if (m && isWatcher(m.def)) continue;
      const tell = m?.def?.tell ? m.def.tell * (setting === 'easy' ? Math.max(1, m.def.easy?.tell ?? 1) : 1) : 0.5;
      const timed = !asleep && !trapped;
      add({ t: b.t, x: b.x, kind: timed ? 'creature' : 'creature-choice', bits: timed ? creatureBits(tell) : OTHER_BITS.choice, cost: 'heart', stakes: STAKES.heart, threat: timed, note: `${b.what}${trapped ? ' (trap)' : ''} tell ${tell.toFixed(2)}s` });
    } else if (b.letter === 'Z') {
      // (a chase's stretch and a bouncing fruit are scored from the stage's own lay, chaseChallenges and rollingChallenges: beats.ts reads
      //  a stretch as a pacing beat every 1.5 s, which this loop scored as ~16 two-bit hazards a stretch, the old 1-8's 28)
      if (/the branch collapses behind him|a bouncing fruit/.test(b.what) && (st.chase || st.rolling || st.proto?.chase)) continue;
      const m = /safe ([\d.]+)s of ([\d.]+)s/.exec(b.what);
      add({ t: b.t, x: b.x, kind: 'hazard', bits: m ? windowBits(Number(m[2]), Number(m[1])) : 2, cost: 'heart', stakes: STAKES.heart, threat: true, note: b.what });
    } else if (b.letter === 'V') {
      // (a swing is scored once a liana, at its release, with what a miss there costs: swingChallenges below)
      if (/swing|liana/.test(b.what)) continue;
      add({ t: b.t, x: b.x, ys: [b.y, b.y], kind: 'climb', bits: OTHER_BITS.climb, cost: 'retry', stakes: 1, threat: false, note: b.what });
    } else if (b.letter === 'P') {
      add({ t: b.t, x: b.x, ys: [b.y, b.y], kind: 'puzzle', bits: OTHER_BITS.puzzle, cost: 'retry', stakes: 1, threat: false, note: b.what });
    }
  }
  const swings = swingChallenges(st, route, br.beats, softPits, setting);
  for (const c of swings) add(c);
  for (const c of snakeChallenges(st, swings, setting)) add(c);
  for (const c of chaseChallenges(st, samples, setting)) add(c);
  for (const c of rollingChallenges(st, samples, setting)) add(c);
  for (const c of watchChallenges(members, rp.e.cast?.covers ?? [], samples, setting, st.vines ?? [])) add(c);
  // a vine field's falling pods (podfall.ts) on the route: a timed crossing of the column at the beat's own numbers (clock.ts beatOf,
  // Easy's stretch included): the window is the beat's quiet, the part of it when no pod is falling (period less its 'on'), out of the
  // period; a heart where the pod costs one, a retry where it only knocks him off (Easy). Once a column, where the route first passes it
  // (within the pod's reach of a hand either side, POD.hands, inside its column's height; up a field vine he climbs with two hands, so
  // the vine beside his, FIELD_FEEL.reach over, is his too). A column the route never passes is not in his way.
  const fieldXs: number[] = st.vines.filter((v: any) => v.field).map((v: any) => v.x);
  const reachOf = (q: Route['segs'][number]) => q.kind === 'climb' && fieldXs.some((x) => Math.abs(x - q.x1) < 2) ? FIELD_FEEL.reach + POD.hands : POD.hands;
  // (a vine that holds a gate's fruit is climbed to push it free whatever way the route takes with the gate open: a pod down it is
  //  in his way, crossed where the fruit hangs)
  const pushY = new Map<number, number>();
  for (const g of (st.gates ?? []) as any[]) for (const cid of g.clusters ?? []) {
    const c = (st.clusters ?? []).find((q: any) => q.id === cid);
    if (c && !pushY.has(c.vine)) pushY.set(c.vine, c.y);
  }
  for (const pd of (st.pods ?? []) as any[]) {
    const def = (st.clocks ?? []).find((c: any) => c.id === pd.clock);
    if (!def) continue;
    const b = beatOf(def, setting === 'easy');
    let on = 0;
    b.names.forEach((n, i) => { if (n === 'on') on += b.seconds[i]; });
    const seg = route.segs.find((q) => Math.min(q.x0, q.x1) <= pd.x + reachOf(q) && Math.max(q.x0, q.x1) >= pd.x - reachOf(q)
      && Math.max(q.y0, q.y1) >= pd.top && Math.min(q.y0, q.y1) <= pd.land);
    const push = pd.vine !== undefined ? pushY.get(pd.vine) : undefined;
    if (!seg && push === undefined) continue;
    const y = Math.max(pd.top, Math.min(pd.land, seg ? (seg.y0 + seg.y1) / 2 : push!));
    const heart = pd.cost === 'heart';
    // (METER-1: he is IN its way for as long as his route stays in its column (within its reach of his hands, between its top and where
    //  it lands): a climb up through a pod's vine takes seconds, and he is safe only if all of that falls in the quiet. So the window is
    //  the quiet LESS that time (the set of entry times that keep the whole crossing quiet), from the route's own clock (each seg's dt
    //  times the share of it inside the column), over the run of moves from the first one in its way; a push at a gate's fruit with no
    //  move in the column is a moment)
    const inside = (q: Route['segs'][number]) => {
      let n = 0;
      for (let k = 0; k <= 20; k++) {
        const px = q.x0 + ((q.x1 - q.x0) * k) / 20, py = q.y0 + ((q.y1 - q.y0) * k) / 20;
        if (Math.abs(px - pd.x) <= reachOf(q) && py >= pd.top && py <= pd.land) n++;
      }
      return n / 21;
    };
    let inWay = 0;
    if (seg) for (let k = route.segs.indexOf(seg); k < route.segs.length; k++) { const f = inside(route.segs[k]); if (f <= 0) break; inWay += route.segs[k].dt * f; }
    const quiet = b.period - on;
    // (a crossing as long as one quiet cannot be one press: he stops out of its reach and goes on in the next quiet (the field's own
    //  fairness check, vineField, refuses a column with no way through). So he takes it in n crossings, each in its way inWay / n and
    //  each its own timed press, and the n that costs him least (the easiest way he has, as moveOf picks a jump's move): from the fewest
    //  that fit, floor(inWay / quiet) + 1, to two more)
    const { parts, open } = podCrossing(b.period, quiet, inWay);
    for (let k = 0; k < parts; k++) add({ t: clockAt(samples, pd.x, y) + k * b.period, x: pd.x, kind: 'hazard', bits: windowBits(b.period, open), cost: heart ? 'heart' : 'retry', stakes: heart ? STAKES.heart : 1, threat: true,
      note: `pod ${pd.id}: safe ${quiet.toFixed(2)}s of ${b.period.toFixed(2)}s, ${inWay.toFixed(2)}s in its way${parts > 1 ? ` in ${parts} crossings` : ''}: open ${open.toFixed(2)}s (falls ${fallSeconds(pd).toFixed(2)}s)` });
  }
  // and its fig gates: the way up held shut until he pushes its fruit free, a puzzle each (OTHER_BITS.puzzle), where its bough is
  for (const g of (st.gates ?? []) as any[]) {
    const q = st.platforms.find((p: any) => p.id === g.platform);
    if (!q) continue;
    add({ t: clockAt(samples, q.x + q.width / 2, q.y), x: q.x + q.width / 2, ys: [q.y, q.y], kind: 'puzzle', bits: OTHER_BITS.puzzle, cost: 'retry', stakes: 1, threat: false, note: `fig gate ${g.id}: ${g.clusters.length} bunch${g.clusters.length > 1 ? 'es' : ''}` });
  }
  // crumbling footing on the route: the clock is the crumble (a fragile platform he stands on): +1 bit on the jump that lands on it
  for (const c of out) {
    // (a swing reads its crumble at the perch it lands on, releaseBits; a snake has no footing of its own)
    if (c.kind === 'creature' || c.kind === 'hazard' || c.kind === 'swing' || c.kind.startsWith('vine-snake')) continue;
    // (at its own height where the challenge knows it: on a tower the rotten bough 600 px over a climb is not under him, 1-4)
    const frag = st.platforms.some((p: any) => p.type === 'fragile' && c.x >= p.x - 40 && c.x <= p.x + p.width + 40
      && (!c.ys || (p.y >= c.ys[0] - CRUMBLE_DY && p.y <= c.ys[1] + CRUMBLE_DY)));
    if (frag) { c.bits += 1; c.note += ' crumble'; }
  }
  // (the typical player's time, stageTime.ts; never under the route's own clock: the model reads about 1 s on 4-3, 11-12)
  const minutes = Math.max(modelStage(st, MODEL_TYPICAL).total, br.total) / 60;
  const { points, mean, peak } = combine(out, minutes, seen);
  const count: Record<string, number> = {};
  for (const c of out) count[c.kind] = (count[c.kind] ?? 0) + 1;
  return {
    id, setting, seed, minutes: Math.round(minutes * 100) / 100, traced: route.traced, soft: softPits, route, count,
    bits: Math.round(out.reduce((s, c) => s + c.bits, 0) * 10) / 10, points: Math.round(points * 10) / 10,
    mean: Math.round(mean * 10) / 10, peak: Math.round(peak * 10) / 10, raw: rawOf(mean, peak), challenges: out,
  };
}

/** raw load to the 0-100 meter: SCALE is set once, from 1-1 on Normal reading 4 (Matt, 11-12 8:31 PM ET); --scale overrides it */
export const ANCHOR = { id: '1-1', setting: 'normal' as Setting, score: 4 };

function range(s: string): number[] {
  const out: number[] = [];
  for (const part of s.split(',')) {
    const [lo, hi] = part.split('-').map(Number);
    for (let i = lo; i <= (hi ?? lo); i++) out.push(i);
  }
  return out;
}

function check(): void {
  const eq = (a: number, b: number, what: string) => { if (Math.abs(a - b) > 1e-6) throw new Error(`check failed: ${what}: ${a} != ${b}`); };
  eq(fittsBits(0.5), 1, 'half the reach is 1 bit');
  eq(fittsBits(0.75), 2, 'three quarters is 2 bits');
  eq(fittsBits(2), Math.log2(1 / (1 - SHARE_CAP)), 'past the cap is the cap');
  eq(landBits(88), 0, 'two bodies wide is no aim');
  eq(landBits(44), 1, 'one body wide is one bit');
  eq(windowBits(3, 1), 2, 'a third of the cycle open is 2 bits');
  eq(novelty(0), 1.5, 'the first time counts half again');
  eq(novelty(3), 1.25, 'the fourth time a quarter');
  // (combine: a jump at 3 bits with an awake creature 1 s away is +50%; a creature alone 2 s later is not; the peak is the busy 30 s)
  const mk = (t: number, kind: string, bits: number, threat: boolean): Challenge => ({ t, x: t * 100, kind, bits, cost: 'retry', stakes: 1, threat, overlap: 1, novelty: 1, points: 0, note: '' });
  const keep = NOVELTY.on; NOVELTY.on = false;
  const list = [mk(10, 'single', 3, false), mk(11, 'creature', 2, true), mk(100, 'single', 2, false)];
  const r = combine(list, 2, new Map());
  NOVELTY.on = keep;
  eq(list[0].overlap, 1 + OVERLAP.each, 'a threat within 1.5 s raises the jump');
  eq(list[1].overlap, 1, 'a threat does not raise itself');
  eq(list[0].points, (3 - FREE_BITS) * (1 + OVERLAP.each), 'points are the bits past the free one, times overlap');
  eq(r.points, (3 - FREE_BITS) * (1 + OVERLAP.each) + (2 - FREE_BITS) + (2 - FREE_BITS), 'the stage sums its challenges');
  eq(r.mean, r.points / 2, 'mean is points a minute');
  eq(r.peak, ((3 - FREE_BITS) * (1 + OVERLAP.each) + (2 - FREE_BITS)) * 2, 'the peak is the busiest 30 s, a minute');
  console.log('check: 14 planted cases pass');
}

if (process.argv[1] && process.argv[1].endsWith('score.ts')) {
  const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
  if (process.argv.includes('--check')) { check(); process.exit(0); }
  // (the sensitivity runs: each of the meter's own constants moved, to show the anchors are not a knife-edge fit)
  if (arg('--free')) FREE_BITS = Number(arg('--free'));
  if (arg('--peak')) { MIX.peak = Number(arg('--peak')); MIX.mean = 1 - MIX.peak; }
  if (process.argv.includes('--no-novelty')) NOVELTY.on = false;
  if (arg('--overlap')) OVERLAP.each = Number(arg('--overlap'));
  const stages = (arg('--stages') ?? '1-1,1-2,1-3').split(',');
  const seeds = range(arg('--seeds') ?? '1-4');
  const settings = (arg('--settings') ?? 'normal,easy').split(',') as Setting[];
  const detail = process.argv.includes('--detail');
  const rows: StageScore[] = [];
  for (const setting of settings) {
    for (const seed of seeds) {
      // (novelty carries through the stages in game order, per setting and layout: a fresh player walks into 1-1 first)
      const seen = new Map<string, number>();
      for (const id of stages) {
        // (a stage the route or the build cannot do is named, not hidden: it scores nothing and says why)
        try { rows.push(scoreStage(id, setting, seed, seen)); } catch (err) { console.log(`${id} ${setting} seed ${seed}: NOT SCORED (${String(err).slice(0, 160)})`); }
      }
    }
  }
  const anchorRows = rows.filter((r) => r.id === ANCHOR.id && r.setting === ANCHOR.setting);
  const scale = Number(arg('--scale') ?? (anchorRows.length ? ANCHOR.score / median(anchorRows.map((r) => r.raw)) : NaN));
  const out = [] as Array<Record<string, unknown>>;
  for (const setting of settings) for (const id of stages) {
    const mine = rows.filter((r) => r.id === id && r.setting === setting);
    if (!mine.length) continue;
    const sc = mine.map((r) => r.raw * scale);
    const row = {
      id, setting, seeds: mine.length, score: Math.round(median(sc) * 10) / 10, min: Math.round(Math.min(...sc) * 10) / 10, max: Math.round(Math.max(...sc) * 10) / 10,
      minutes: median(mine.map((r) => r.minutes)), points: median(mine.map((r) => r.points)), mean: median(mine.map((r) => r.mean)), peak: median(mine.map((r) => r.peak)),
      count: mine[0]?.count, traced: [...new Set(mine.map((r) => r.traced))].join('/'),
    };
    out.push(row);
    console.log(`${id} ${setting.padEnd(6)} score ${String(row.score).padStart(5)} (${row.min}-${row.max} over ${row.seeds} layouts)  ${row.minutes} min  points ${row.points}  mean ${row.mean}/min  peak ${row.peak}/min  ${JSON.stringify(row.count)} route ${row.traced}`);
  }
  console.log(`SCALE ${scale.toFixed(5)} (1 meter point = ${(1 / scale).toFixed(1)} raw points a minute)`);
  if (detail) for (const r of rows.filter((x) => x.seed === seeds[0])) {
    console.log(`-- ${r.id} ${r.setting} seed ${r.seed}: the 12 heaviest challenges`);
    for (const c of [...r.challenges].sort((a, b) => b.points - a.points).slice(0, 12)) {
      console.log(`   t ${c.t.toFixed(0).padStart(4)}s x ${String(Math.round(c.x)).padStart(6)} ${c.kind.padEnd(16)} bits ${c.bits.toFixed(2)} x stakes ${c.stakes.toFixed(2)} (${c.cost}) x overlap ${c.overlap.toFixed(1)} x new ${c.novelty.toFixed(2)} = ${c.points.toFixed(2)}  ${c.note}`);
    }
  }
  const json = arg('--json');
  if (json) fs.writeFileSync(json, JSON.stringify({ scale, rows: out, runs: rows.map(({ challenges, route: _route, ...r }) => r) }, null, 1));
}
