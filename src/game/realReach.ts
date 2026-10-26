/**
 * realReach — what the real engine lets Pokey get to, found by playing (realPlay.ts), not by the reach model the level check uses
 * (levelCheck.ts). It is the check behind "every collectible can be collected" and "he can never be stranded":
 *
 *   1. From the start, it tries moves the way a player would: run and jump (a plain jump, a double jump at different moments, with the
 *      leaf open or not, steering for where he is going), walk off a ledge, glide into warm air and ride it up, climb a trunk and leap or
 *      hop off it at different heights, catch a liana and let go at different moments, grab a rope and drop or jump off it. Wherever a
 *      move ends (standing on a ledge, on a trunk, a rope or a liana) is somewhere he can get to, and the moves from there are tried in
 *      turn, until nothing new turns up. A ledge is walked out both ways (to its ends, or to a wall) the first time he stands on it.
 *   2. World 4's pieces are worked the way the stage teaches them: standing still under a knot (Dot frees the vine) and on a frond's spot
 *      (the bridge unrolls) once those spots are reached; a boulder is pushed into its channel (the fall dries) only once everything that
 *      can be reached without it has been, so a pool's log is ridden before its fall is stopped.
 *   3. Every collectible still lying there is tried from the places near it: touched for a flower, a heart or a seed, punched open for a
 *      nest's netting, crouched beside for a keepsake in a fern. Only the engine saying it was picked up counts.
 *   4. From every place reached, the way on to the shrine is looked for (a move that leads somewhere already known to lead there); a
 *      place with none is a trap, or, when the only way on is a fall into the water or the mist, a place that costs a life.
 *
 * Only moves toward things a jump, a glide, a climb or a swing could plausibly reach are tried (`bound`, generous on purpose), and each
 * target has a list of moves, best guesses first: the result is what the engine allowed with those moves, never more.
 */
import { DT, RealPlay, type Pad } from './realPlay.ts';
import { PHYS, reachGlide, reachJump, inSweetSpot, swingStep } from './physics.ts';
import { HANG_DROP, ropeYAt } from './rope.ts';
import type { Collectible, Platform, Vine } from './types.ts';

export type NodeKind = 'p' | 'v' | 'r' | 'l' | 'b';
/** where a move can start: a stretch of a platform, a trunk, a rope, a liana (as caught), a mushroom (where he bounced) */
export interface Anchor {
  key: string;
  kind: NodeKind;
  id: number;
  /** a platform stretch he can walk along: [a, b] (his middle x), at height y; a rope's ends */
  a?: number;
  b?: number;
  y?: number;
  /** a liana as he caught it */
  swing?: { angle: number; omega: number; len: number };
  x?: number;
  /** a trunk or liana: its top and bottom */
  top?: number;
  bottom?: number;
}

export interface ReachReport {
  reached: Map<string, Anchor>;
  /** platform ids stood on somewhere */
  platforms: Set<number>;
  /** collectibles the engine picked up (ids) */
  collected: Set<number>;
  /** collectibles never picked up */
  missed: Collectible[];
  /** places from which the shrine could not be reached (and no fall into the water or mist sends him back to a flag either) */
  traps: Anchor[];
  /** places whose only way on is a fall that costs a life */
  dieOnly: Anchor[];
  exitReached: boolean;
  trials: number;
  frames: number;
  notes: string[];
}

export interface ReachOptions {
  /** look for traps (the slow part) */
  traps?: boolean;
  /** moves tried toward one target from one place in the first search, and how many places try before it waits for the deep pass */
  perTarget?: number;
  giveUps?: number;
  /** platform ids the level check says can be reached: any the first search misses are tried again, harder */
  claimed?: Set<number>;
  /** how hard the second tries are: places, and moves from each */
  deepPlaces?: number;
  deepMoves?: number;
  log?: (s: string) => void;
  /**
   * plain jumps only, no second jump (a first-timer who has not found it yet: 1-1 before its tip): the moves leave it out, and the
   * engine's own air jump is switched off, so nothing he gets to needs it
   */
  single?: boolean;
}

interface Target {
  key: string;
  kind: NodeKind | 'c';
  /** the x range he aims to come down in, its height (feet); for a collectible its point */
  x0: number;
  x1: number;
  y: number;
  /** a platform target: its id (the part of it not reached yet is [x0, x1]) */
  id?: number;
  top?: number;
  bottom?: number;
  c?: Collectible;
}

interface MoveSpec {
  /** stand: where he starts (anywhere along the stretch he walked) and where he jumps (null: he walks off) */
  start?: number;
  takeoff?: number | null;
  /** trunk: the height, and how he leaves it */
  h?: number;
  exit?: 'leap' | 'hop' | 'vault' | 'down' | 'drop' | 'end';
  /** liana: frames to wait before letting go; rope: where along it */
  wait?: number;
  rx?: number;
  /** frames after leaving for the second jump (undefined: none) */
  dbl?: number;
  glide: boolean;
  /** steer toward this x in the air */
  aim: number;
  dir: -1 | 0 | 1;
  /** hold up in the air (to catch a trunk or a rope) */
  up?: boolean;
  /** go by way of this warm air (4-7): glide into it, ride it up, then drift to the aim */
  via?: number;
}

const MAX_FRAMES = 150;
const MAX_FRAMES_VIA = 330;
/** a platform's top this much of whose width is under another solid block is not somewhere to stand */
const STAND_MIN = 24;

interface Updraft { x0: number; x1: number; top: number; bottom: number }

export class RealReach {
  readonly sim: RealPlay;
  readonly reached = new Map<string, Anchor>();
  readonly edges = new Map<string, Set<string>>();
  readonly deaths = new Set<string>();
  /** per platform: the stretches walked out (live ones; a boulder moving retires those near it) */
  private stretches = new Map<number, Array<{ a: number; b: number; n: number }>>();
  private stretchN = 0;
  private failed = new Map<string, Set<string>>();
  private queue: string[] = [];
  private pending: Array<{ id: number; x: number; fromId: number; fromX: number }> = [];
  private openArea = new Map<number, Array<[number, number]>>();
  private drafts: Updraft[];
  trials = 0;
  frames = 0;
  /** stop a move once it has clearly missed (off while looking for traps: a fall into the water must be seen to the end) */
  private early = true;
  /** where the moves go: the move a target was got to on, the frames spent on moves that got there and on ones that missed */
  readonly stats = { hitAt: new Array<number>(64).fill(0), hitFrames: 0, missFrames: 0, gaveUp: 0 };
  notes: string[] = [];
  readonly hasGlide: boolean;
  private opts: Required<Omit<ReachOptions, 'claimed'>> & Pick<ReachOptions, 'claimed'>;

  constructor(id: string, seed: number, opts: ReachOptions = {}) {
    this.sim = new RealPlay(id, seed);
    this.opts = { traps: true, perTarget: 8, giveUps: 3, deepPlaces: 4, deepMoves: 120, single: false, ...opts, log: opts.log ?? (() => {}) };
    this.hasGlide = this.sim.e.skills.has('glide');
    this.drafts = this.sim.w4?.w4?.updrafts ?? [];
    // a heart stays put while he is at full health (engine.ts), so he plays a heart short: every heart can then be picked up
    const frame = this.sim.frame.bind(this.sim);
    this.sim.frame = (pad?: Pad) => {
      const p = this.sim.p;
      if (p.hp >= p.maxHp) p.hp = p.maxHp - 1;
      if (this.opts.single && !p.grounded) p.jumpsLeft = 0;
      return frame(pad);
    };
    // the boulders stay where they are until they are pushed on purpose (pushBoulders)
    for (const pl of this.sim.platforms as Array<Platform & { pushSaved?: Platform['push'] }>) {
      if (pl.push) {
        pl.pushSaved = pl.push;
        pl.push = undefined;
      }
    }
  }

  // ───────────── places ─────────────

  private platformById(id: number): Platform | undefined {
    return this.sim.platforms.find((q) => q.id === id);
  }

  /** the parts of a platform's top he could stand on: not under another solid block */
  private standable(pl: Platform): Array<[number, number]> {
    const hit = this.openArea.get(pl.id);
    if (hit) return hit;
    let parts: Array<[number, number]> = [[pl.x - 11, pl.x + pl.width + 11]];
    for (const q of this.sim.platforms) {
      // (a block 50 or more tall is a wall: he is pushed out of it, his middle half his body clear of its sides)
      if (q === pl || q.type !== 'solid' || q.broken || q.height < 50) continue;
      // (a block whose body is beside him standing there: above his feet, below his head)
      if (!(q.y < pl.y - 6 && q.y + q.height > pl.y - 48)) continue;
      const c0 = q.x - 19, c1 = q.x + q.width + 19;
      parts = parts.flatMap(([a, b]) => (c1 <= a || c0 >= b ? [[a, b] as [number, number]] : ([[a, Math.min(b, c0)], [Math.max(a, c1), b]] as Array<[number, number]>).filter(([x, y]) => y - x >= STAND_MIN)));
    }
    this.openArea.set(pl.id, parts);
    return parts;
  }

  /** the stretch of platform `pl` he can walk to from x (walking both ways until a ledge's end or a wall), walked out once */
  private stretchAt(pl: Platform, x: number): { a: number; b: number; n: number } {
    const known = this.stretches.get(pl.id) ?? [];
    for (const s of known) if (x >= s.a - 6 && x <= s.b + 6) return s;
    const ends: number[] = [];
    const sim = this.sim;
    for (const dir of [-1, 1] as const) {
      sim.stand(x, pl.y);
      let last = x;
      let still = 0;
      let waited = false;
      for (let f = 0; f < 2400; f++) {
        sim.frame(dir < 0 ? { left: true } : { right: true });
        this.frames++;
        const p = sim.p;
        if (sim.died || !p.grounded || (sim.standingOn !== pl.id && sim.standingOn !== -1)) {
          // walked straight onto the next platform: it is found once this stretch is done
          if (p.grounded && !sim.died && sim.standingOn !== pl.id) this.pending.push({ id: sim.standingOn, x: p.x, fromId: pl.id, fromX: x });
          break;
        }
        if (Math.abs(p.x - last) < 0.3) {
          if (++still >= 10) {
            // stopped: a wall, or something that holds him a while (a guard, the eaglets): wait for it once, then try again
            if (waited) break;
            waited = true;
            still = 0;
            for (let w = 0; w < 300 && Math.abs(sim.p.x - last) < 0.3; w++) {
              sim.frame(dir < 0 ? { left: true } : { right: true });
              this.frames++;
            }
            if (Math.abs(sim.p.x - last) < 0.3) break;
          }
        } else still = 0;
        last = p.x;
      }
      ends.push(last);
    }
    const s = { a: Math.min(ends[0], x), b: Math.max(ends[1], x), n: this.stretchN++ };
    known.push(s);
    this.stretches.set(pl.id, known);
    return s;
  }

  private standAnchor(pl: Platform, x: number): Anchor {
    const s = this.stretchAt(pl, x);
    // (a log on a pool is as high as the water lifts it: placeAt waits for that before a move from it)
    const pool = (this.sim.w4?.w4?.pools ?? []).find((q: { platformId: number }) => q.platformId === pl.id);
    return { key: `p${pl.id}.${s.n}`, kind: 'p', id: pl.id, a: s.a, b: s.b, y: pool ? pool.fullY : pl.y };
  }

  /** the platforms walked onto while walking out a stretch: found now, joined both ways to the stretch they were walked from */
  private flushPending() {
    while (this.pending.length) {
      const q = this.pending.shift()!;
      const fp = this.platformById(q.fromId), tp = this.platformById(q.id);
      if (!fp || !tp || tp.broken) continue;
      const from = this.standAnchor(fp, q.fromX);
      const to = this.standAnchor(tp, q.x);
      this.add(to, from.key);
      this.add(from, to.key);
    }
  }

  private add(a: Anchor, from?: string) {
    if (from && from !== a.key) {
      if (!this.edges.has(from)) this.edges.set(from, new Set());
      this.edges.get(from)!.add(a.key);
    }
    if (this.reached.has(a.key)) return;
    if (a.kind === 'v' || a.kind === 'l') {
      const v = this.sim.vines.find((q) => q.id === a.id);
      if (v) Object.assign(a, { x: v.x, top: v.topY, bottom: v.bottomY });
    } else if (a.kind === 'r') {
      const r = this.sim.ropes.find((q) => q.id === a.id);
      if (r) Object.assign(a, { x: (r.x0 + r.x1) / 2, a: r.x0, b: r.x1, y: r.y + HANG_DROP });
    }
    this.reached.set(a.key, a);
    this.queue.push(a.key);
    this.opts.log(`  reached ${a.key}${a.kind === 'p' ? ` [${Math.round(a.a!)}..${Math.round(a.b!)} y${a.y}]` : ''}`);
  }

  /** put him at a place, ready to move */
  private placeAt(a: Anchor, m: MoveSpec) {
    const sim = this.sim;
    const pool = a.kind === 'p' ? (sim.w4?.w4?.pools ?? []).find((q: { platformId: number }) => q.platformId === a.id) : undefined;
    if (pool) {
      // a log on a pool rides the water: he stands on it and waits for it to lift him as high as it goes (4-3's tide pool)
      const log = this.platformById(a.id)!;
      sim.stand(Math.max(log.x + 12, Math.min(log.x + log.width - 12, m.start!)), log.y);
      // (until it is full, or has stopped rising: a plugged fall's pool stays drained, and a surge's pool fills only while it pours)
      let still = 0;
      for (let f = 0; f < 30 * 12 && log.y > pool.fullY + 1 && still < 75; f++) {
        const y0 = log.y;
        sim.frame();
        this.frames++;
        still = Math.abs(log.y - y0) > 0.01 ? 0 : still + 1;
      }
      sim.stand(Math.max(log.x + 12, Math.min(log.x + log.width - 12, m.start!)), log.y);
    } else if (a.kind === 'p') sim.stand(m.start!, a.y!);
    else if (a.kind === 'v') sim.climb(sim.vines.find((v) => v.id === a.id)!, m.h!);
    else if (a.kind === 'r') {
      const r = sim.ropes.find((q) => q.id === a.id)!;
      sim.hang(r, m.rx!, ropeYAt(r, m.rx!) + HANG_DROP);
    } else if (a.kind === 'l') sim.swing(sim.vines.find((v) => v.id === a.id)!, a.swing!);
    else {
      sim.fly(a.x!, a.y!, 0, -PHYS.bounceV, 1);
      sim.e.launched = true;
    }
  }

  // ───────────── a move ─────────────

  /** where a move ended (a place), or that he fell to his death; `hit` when it reached the target */
  private run(from: Anchor, m: MoveSpec, target: Target): { end: Anchor | null; hit: boolean; died: boolean } {
    const sim = this.sim;
    this.trials++;
    this.placeAt(from, m);
    const p = sim.p;
    const startVine = from.kind === 'v' || from.kind === 'l' ? from.id : -1;
    const startY = p.y;
    let air = -1; // frames since he left what he started on
    let pressed = false;
    let landedFor = 0;
    let end: Anchor | null = null;
    const c = target.c;
    // by way of warm air: 0 gliding to it, 1 riding it up, 2 drifting out to the aim
    const u = m.via !== undefined ? this.drafts[m.via] : undefined;
    let ride = u ? 0 : 2;
    let slow = 0;
    const limit = u ? MAX_FRAMES_VIA : MAX_FRAMES;
    for (let f = 0; f < limit; f++) {
      const pad: Pad = {};
      const steer = (aim: number) => {
        const want = Math.max(-PHYS.maxRun, Math.min(PHYS.maxRun, (aim - p.x) * 4));
        const d = want - p.vx;
        if (d > 30) pad.right = true;
        else if (d < -30) pad.left = true;
      };
      const aimNow = u && ride < 2 ? (u.x0 + u.x1) / 2 : m.aim;
      if (air < 0) {
        // the start: get going
        if (from.kind === 'p') {
          if (m.dir > 0) pad.right = true;
          else if (m.dir < 0) pad.left = true;
          else if (m.takeoff === null) steer(aimNow);
          if (m.takeoff !== null && !pressed && (m.dir === 0 || (m.dir > 0 ? p.x >= m.takeoff! - 1 : p.x <= m.takeoff! + 1))) {
            pad.press = true;
            pressed = true;
          }
        } else if (from.kind === 'v') {
          if (m.dir > 0) pad.right = true;
          else if (m.dir < 0) pad.left = true;
          if (m.exit === 'leap' && f >= 1 && !pressed) {
            pad.press = true;
            pressed = true;
          } else if (m.exit === 'vault') pad.up = true;
          else if (m.exit === 'down') {
            pad.down = true;
            pad.left = pad.right = false;
          }
        } else if (from.kind === 'r') {
          if (m.dir > 0) pad.right = true;
          else if (m.dir < 0) pad.left = true;
          if (m.exit === 'leap' && f >= 9 && !pressed) {
            pad.press = true;
            pressed = true;
          } else if (m.exit === 'down' && f >= 9) {
            pad.down = true;
            pad.left = pad.right = false;
          }
        } else if (from.kind === 'l') {
          if (m.dir > 0) pad.right = true;
          else if (m.dir < 0) pad.left = true;
          if (f >= (m.wait ?? 0) + 8 && !pressed) {
            pad.press = true;
            if (m.exit === 'drop') pad.down = true;
            pressed = true;
          }
        } else {
          steer(aimNow);
          pad.jump = true;
        }
      } else {
        // in the air: steer for where he is going, the second jump, the leaf (Jump held), up held for a trunk or a rope
        steer(aimNow);
        pad.jump = m.glide || p.vy < 0 || (m.dbl !== undefined && air < m.dbl);
        if (m.dbl !== undefined) {
          if (air === m.dbl - 1) pad.jump = false;
          if (air === m.dbl) pad.press = true;
        }
        if (m.up) pad.up = true;
      }
      sim.frame(pad);
      this.frames++;
      if (air < 0 && !p.grounded && !p.climbing && !p.hanging && !p.isVineSwinging) air = 0;
      else if (air >= 0) air++;
      if (u && ride < 2) {
        const inside = sim.w4!.inUpdraft(p.x, p.y - 32);
        if (ride === 0 && inside) ride = 1;
        if (ride === 1) {
          slow = inside && p.vy > -25 ? slow + 1 : 0;
          if (slow >= 6 || p.y - 32 < u.top + 6 || (!inside && air > 40)) ride = 2;
        }
      }
      if (c && c.collected) return { end: null, hit: true, died: false };
      if (sim.died) return { end: null, hit: false, died: true };
      // caught something
      if (p.climbing && (air >= 0 || from.kind !== 'v')) {
        const v = sim.e.nearTreeVine as Vine | null;
        if (v && v.id !== startVine) {
          end = { key: `v${v.id}`, kind: 'v', id: v.id };
          break;
        }
      }
      if (p.isVineSwinging && (air >= 0 || from.kind !== 'l')) {
        const vid = p.swingVineId!;
        if (vid !== startVine || air > 20) {
          end = { key: `l${vid}`, kind: 'l', id: vid, swing: sim.swingState() };
          break;
        }
      }
      if (p.hanging && air >= 0 && !(from.kind === 'r' && sim.e.ropeId === from.id && air < 6)) {
        const r = sim.ropes.find((q) => q.id === sim.e.ropeId);
        if (r) {
          end = { key: `r${r.id}`, kind: 'r', id: r.id };
          break;
        }
      }
      if (p.bounce && p.bounce.t < DT * 1.5 && air >= 0) {
        const mush = sim.platforms.find((q) => q.type === 'bouncy' && p.x + 12 > q.x && p.x - 12 < q.x + q.width && Math.abs(p.y - q.y) < 30);
        if (mush && !(from.kind === 'b' && from.id === mush.id)) {
          end = { key: `b${mush.id}`, kind: 'b', id: mush.id, x: p.x, y: mush.y };
          break;
        }
      }
      if (p.grounded && (air >= 0 || from.kind !== 'p')) {
        if (++landedFor >= 2 && sim.standingOn >= 0) {
          const pl = this.platformById(sim.standingOn);
          if (pl) end = this.standAnchor(pl, p.x);
          break;
        }
      } else landedFor = 0;
      if (air > limit - 40) break;
      // well below both where he started and where he is going, and still falling: this move has missed (wherever he lands is
      // found by a move aimed there)
      if (this.early && air > 0 && p.vy > 0 && !u && p.y > Math.max(target.kind === 'c' ? target.y + 54 : target.y, startY) + 90) break;
    }
    if (c && c.collected) return { end: null, hit: true, died: false };
    return { end, hit: !!end && this.hits(end, target), died: false };
  }

  /** did getting to this place reach the target? */
  private hits(end: Anchor, t: Target): boolean {
    if (t.kind === 'p') return end.kind === 'p' && end.id === t.id && end.b! >= t.x0 - 6 && end.a! <= t.x1 + 6;
    return end.key === t.key;
  }

  // ───────────── which moves to try ─────────────

  /** the best rise he could get from a place (px), with a little to spare */
  private rise(a: Anchor): number {
    // (measured in the engine: a double jump at its best lifts his feet 166 px; a leap off a trunk and a second jump about as much)
    if (a.kind === 'b') return 330;
    if (a.kind === 'l') return 420;
    if (a.kind === 'r') return 175;
    return 185;
  }

  /** where a move from this place starts, for the bound: its height, and its x range */
  private from(a: Anchor, t: Target): { fy: number; x0: number; x1: number } {
    const sim = this.sim;
    if (a.kind === 'p') return { fy: a.y!, x0: a.a!, x1: a.b! };
    if (a.kind === 'v') {
      const v = sim.vines.find((q) => q.id === a.id)!;
      return { fy: Math.max(v.topY - 12, Math.min(v.bottomY, t.y + 60)), x0: v.x, x1: v.x };
    }
    if (a.kind === 'r') {
      const r = sim.ropes.find((q) => q.id === a.id)!;
      return { fy: r.y + HANG_DROP, x0: r.x0, x1: r.x1 };
    }
    if (a.kind === 'l') {
      const v = sim.vines.find((q) => q.id === a.id)!;
      return { fy: v.topY + (a.swing?.len ?? 100), x0: v.x - 140, x1: v.x + 140 };
    }
    return { fy: a.y!, x0: a.x!, x1: a.x! };
  }

  /** the furthest a jump or a glide carries him across, for a target dy px above (the model's numbers, generously) */
  private far(dy: number): number {
    const d = Math.max(-1800, Math.min(140, dy));
    return Math.max(reachJump(d, true), this.hasGlide ? reachGlide(d, true) : -1, reachJump(d, false));
  }

  /** the highest point of a target that counts (feet height) */
  private targetTop(t: Target, fy: number): number {
    if (t.kind === 'c') return t.y + 54;
    if (t.kind === 'v' || t.kind === 'l') return Math.min(t.bottom! + 25, Math.max(t.top! - 12, fy));
    if (t.kind === 'r') return t.y + 70;
    return t.y;
  }

  /** could a plain move (no warm air) from this place plausibly get to that target? (generous: the model's furthest reach, and more) */
  private boundPlain(a: Anchor, t: Target): boolean {
    const { fy, x0, x1 } = this.from(a, t);
    const dy = fy - this.targetTop(t, fy);
    if (dy > this.rise(a)) return false;
    const gap = Math.max(0, t.x0 - x1, x0 - t.x1);
    if (gap === 0) return true;
    const r = this.far(dy);
    const extra = a.kind === 'l' ? 260 : a.kind === 'b' ? 120 : a.kind === 'v' ? 80 : 40;
    return r >= 0 ? gap <= r * 1.15 + extra : dy < 0 && gap <= 700;
  }

  /** the warm air a glide from this place could ride to the target */
  private viaDrafts(a: Anchor, t: Target): number[] {
    if (!this.hasGlide || !this.drafts.length || a.kind === 'l') return [];
    const { fy, x0, x1 } = this.from(a, t);
    const deep = this.sim.stage.deepFall;
    const out: number[] = [];
    this.drafts.forEach((u, i) => {
      // in: a glide down to its bottom; out: a glide from its top
      const gapIn = Math.max(0, u.x0 - x1, x0 - u.x1);
      // (warm air whose top is deeper under him than the stage's deep fall is reached only by falling into the mist first)
      if (deep !== undefined && u.top - fy > deep) return;
      if (u.bottom < fy - 40 || gapIn > this.far(fy - (u.bottom - 40)) * 1.15 + 60) return;
      const hover = u.top + 36;
      const dyOut = hover - this.targetTop(t, hover);
      if (dyOut > 120) return;
      const gapOut = Math.max(0, t.x0 - u.x1, u.x0 - t.x1);
      if (gapOut > this.far(dyOut) * 1.15 + 60) return;
      out.push(i);
    });
    return out;
  }

  private bound(a: Anchor, t: Target): boolean {
    // (a target deeper under him than the stage's deep fall is past a fall into the mist (w4Play deepFall: measured from the ground he
    // last stood on, and riding warm air touches no ground), never a way down: without this, 4-7's ledges a tier or two above counted
    // as near a ledge below, used up its tries, and the ledge right before it was never let try)
    const deep = this.sim.stage.deepFall;
    if (deep !== undefined) {
      const { fy } = this.from(a, t);
      if (this.targetTop(t, fy) - fy > deep) return false;
    }
    return this.boundPlain(a, t) || this.viaDrafts(a, t).length > 0;
  }

  /** the moves to try from a place toward a target, best guesses first */
  private moves(a: Anchor, t: Target): MoveSpec[] {
    const out: MoveSpec[] = [];
    const glides = this.hasGlide ? [true, false] : [false];
    const sim = this.sim;
    const point = t.kind === 'c' || t.kind === 'v' || t.kind === 'l';
    const aimFor = (fromX: number) => (point ? (t.x0 + t.x1) / 2 : Math.max(t.x0 + 26, Math.min(t.x1 - 26, fromX)));
    const up = t.kind === 'v' || t.kind === 'r';
    const plain = this.boundPlain(a, t);
    const via = this.viaDrafts(a, t);
    if (a.kind === 'p') {
      const A = a.a!, B = a.b!;
      const cx = (t.x0 + t.x1) / 2;
      const dir: -1 | 0 | 1 = t.x0 > B ? 1 : t.x1 < A ? -1 : 0;
      const higher = this.targetTop(t, a.y!) < a.y! - 60;
      const dbls = higher ? [10, 7, 13, 4, 16, 20, undefined] : [undefined, 10, 6, 14, 3, 18, 24];
      const takeoffs: Array<{ start: number; takeoff: number | null; dir: -1 | 0 | 1; aim?: number }> = [];
      const clampAB = (x: number) => Math.max(A, Math.min(B, x));
      if (dir !== 0) {
        const edge = dir > 0 ? B : A;
        // (a stretch narrower than the list, a slot between two blocks, still gets its jumps: from wherever it allows)
        const tks = [...new Set([2, 14, 34, 64, 110, 180, 260].map((k) => Math.round(clampAB(edge - dir * k))))];
        for (const tk of tks) takeoffs.push({ start: clampAB(tk - dir * 40), takeoff: tk, dir });
        takeoffs.push({ start: clampAB(edge - dir * 60), takeoff: null, dir });
      } else {
        if (t.y > a.y! + 30 && t.x0 < A - 30 && t.x1 > B + 30) {
          // below and wider than this ledge: off either end, walking or with a jump, and down past it
          takeoffs.push({ start: clampAB(A + 30), takeoff: null, dir: -1, aim: A - 60 });
          takeoffs.push({ start: clampAB(B - 30), takeoff: null, dir: 1, aim: B + 60 });
          takeoffs.push({ start: clampAB(A + 40), takeoff: clampAB(A + 2), dir: -1, aim: A - 90 });
          takeoffs.push({ start: clampAB(B - 40), takeoff: clampAB(B - 2), dir: 1, aim: B + 90 });
        } else {
          // overhead or across: jump from under it, or run in from either side
          const under = clampAB(cx);
          takeoffs.push({ start: under, takeoff: under, dir: 0 });
          for (const off of [-90, 90, -170, 170, -40, 40]) {
            const tk = clampAB(cx + off);
            const d: -1 | 1 = off < 0 ? 1 : -1;
            takeoffs.push({ start: clampAB(tk - d * 40), takeoff: tk, dir: d });
          }
          if (t.y > a.y! + 30) {
            // below: walk off the ends
            takeoffs.unshift({ start: clampAB(A + 30), takeoff: null, dir: -1 }, { start: clampAB(B - 30), takeoff: null, dir: 1 });
          }
        }
      }
      if (plain) for (const d of dbls) for (const g of glides) for (const tk of takeoffs) out.push({ start: tk.start, takeoff: tk.takeoff, dir: tk.dir, dbl: d, glide: g, aim: tk.aim ?? aimFor(tk.takeoff ?? tk.start), up });
      // by way of warm air: off the end nearer it, gliding all the way
      const viaMoves: MoveSpec[] = [];
      for (const i of via) {
        const u = this.drafts[i];
        const ux = (u.x0 + u.x1) / 2;
        const d: -1 | 1 = ux > (A + B) / 2 ? 1 : -1;
        const edge = d > 0 ? B : A;
        for (const k of [2, 30, 80]) for (const db of [undefined, 10]) viaMoves.push({ start: clampAB(edge - d * (k + 40)), takeoff: clampAB(edge - d * k), dir: d, dbl: db, glide: true, aim: aimFor(ux), via: i });
        viaMoves.push({ start: clampAB(edge - d * 60), takeoff: null, dir: d, glide: true, aim: aimFor(ux), via: i });
      }
      // (warm air first when nothing plain reaches it in the model)
      return plain ? [...out.slice(0, 8), ...viaMoves, ...out.slice(8)] : viaMoves;
    }
    if (a.kind === 'v') {
      const v = sim.vines.find((q) => q.id === a.id)!;
      const cx = (t.x0 + t.x1) / 2;
      const dir: -1 | 1 = cx >= v.x ? 1 : -1;
      const ty = t.kind === 'c' ? t.y + 20 : t.y;
      const hs = [...new Set([ty + 30, ty - 20, ty + 90, ty + 160, ty - 90, v.topY, v.bottomY, (v.topY + v.bottomY) / 2].map((h) => Math.round(Math.max(v.topY - 4, Math.min(v.bottomY + 4, h)))))];
      for (const d of [8, undefined, 4, 12, 16, 22]) for (const g of glides) for (const h of hs) for (const ex of ['leap', 'hop'] as const) out.push({ h, exit: ex, dir, dbl: d, glide: g, aim: aimFor(v.x), up });
      const ends: MoveSpec[] = [];
      for (const g of glides) for (const d of [undefined, 8]) {
        ends.push({ h: v.topY, exit: 'vault', dir, dbl: d, glide: g, aim: aimFor(v.x), up });
        ends.push({ h: v.bottomY, exit: 'down', dir, dbl: d, glide: g, aim: aimFor(v.x), up });
      }
      return [...out.slice(0, 6), ...ends, ...out.slice(6)];
    }
    if (a.kind === 'r') {
      const r = sim.ropes.find((q) => q.id === a.id)!;
      const cx = (t.x0 + t.x1) / 2;
      const xs = [...new Set([Math.max(r.x0, Math.min(r.x1, cx)), r.x0, r.x1, (r.x0 + r.x1) / 2].map(Math.round))];
      for (const d of [undefined, 8, 4, 12, 16]) for (const g of glides) for (const rx of xs) {
        const dir: -1 | 1 = cx >= rx ? 1 : -1;
        out.push({ rx, exit: 'leap', dir, dbl: d, glide: g, aim: aimFor(rx), up });
        out.push({ rx, exit: 'down', dir, dbl: d, glide: g, aim: aimFor(rx), up });
      }
      for (const g of glides) for (const dir of [-1, 1] as const) out.push({ rx: dir > 0 ? r.x1 - 2 : r.x0 + 2, exit: 'end', dir, glide: g, aim: aimFor(dir > 0 ? r.x1 : r.x0), up });
      return out;
    }
    if (a.kind === 'l') {
      const v = sim.vines.find((q) => q.id === a.id)!;
      const cx = (t.x0 + t.x1) / 2;
      const dir: -1 | 1 = cx >= v.x ? 1 : -1;
      // the moments to let go, the sweet spot first (the swing is stepped on a copy to find them)
      const waits: Array<{ w: number; sweet: boolean }> = [];
      for (let w = 0; w < 60; w += 2) {
        const s = { ...a.swing! };
        for (let i = 0; i < w + 8; i++) swingStep(s, v, DT, dir);
        waits.push({ w, sweet: inSweetSpot(s, dir) });
      }
      waits.sort((x, y) => Number(y.sweet) - Number(x.sweet));
      for (const d of [undefined, 8, 4, 12, 18]) for (const g of glides) for (const { w } of waits) out.push({ wait: w, exit: 'leap', dir, dbl: d, glide: g, aim: aimFor(v.x), up });
      for (const { w } of waits.slice(0, 12)) out.push({ wait: w, exit: 'drop', dir, glide: false, aim: aimFor(v.x), up });
      return out;
    }
    for (const d of [undefined, 8, 4, 12, 16, 20]) for (const g of glides) out.push({ dir: 0, dbl: d, glide: g, aim: aimFor(a.x!), up });
    return out;
  }

  /** every place not reached yet: each platform's parts not walked yet (and not buried under a block), trunks, lianas, ropes, mushrooms */
  private openTargets(): Target[] {
    const sim = this.sim;
    const out: Target[] = [];
    for (const pl of sim.platforms) {
      if (pl.broken) continue;
      if (pl.type === 'bouncy') {
        if (!this.reached.has(`b${pl.id}`)) out.push({ key: `b${pl.id}`, kind: 'b', x0: pl.x, x1: pl.x + pl.width, y: pl.y, id: pl.id });
        continue;
      }
      const walked = this.stretches.get(pl.id) ?? [];
      for (const [x0, x1] of this.standable(pl)) {
        let parts: Array<[number, number]> = [[x0, x1]];
        for (const s of walked) parts = parts.flatMap(([a, b]) => (s.b + 6 <= a || s.a - 6 >= b ? [[a, b] as [number, number]] : ([[a, s.a - 6], [s.b + 6, b]] as Array<[number, number]>).filter(([p, q]) => q - p >= STAND_MIN)));
        for (const [a, b] of parts) out.push({ key: `p${pl.id}@${Math.round(a)}`, kind: 'p', x0: a, x1: b, y: pl.y, id: pl.id });
      }
    }
    for (const v of sim.vines) {
      const k = v.vineType === 'swing_liana' ? 'l' : 'v';
      if (!this.reached.has(`${k}${v.id}`)) out.push({ key: `${k}${v.id}`, kind: k, x0: v.x, x1: v.x, y: v.bottomY, top: v.topY, bottom: v.bottomY });
    }
    for (const r of sim.ropes) if (!this.reached.has(`r${r.id}`)) out.push({ key: `r${r.id}`, kind: 'r', x0: r.x0, x1: r.x1, y: r.y });
    return out;
  }

  private stillOpen(t: Target): boolean {
    if (t.kind === 'p') {
      for (const s of this.stretches.get(t.id!) ?? []) if (s.b + 6 > t.x0 && s.a - 6 < t.x1) return false;
      return true;
    }
    return !this.reached.has(t.key);
  }

  /** try the moves from one place to one target; true when it got there */
  private tryTarget(a: Anchor, t: Target, limit = this.opts.perTarget): boolean {
    const tried = this.failed.get(a.key) ?? new Set<string>();
    if (tried.has(t.key)) return false;
    // (a target not reached yet also counts as got to when a move lands on it by the way, or walks onto it)
    const open = t.kind !== 'c' && this.stillOpen(t);
    let i = 0;
    for (const m of this.moves(a, t).filter((q) => !this.opts.single || q.dbl === undefined).slice(0, limit)) {
      this.prepareTime(a);
      const f0 = this.frames;
      const r = this.run(a, m, t);
      if (r.died) this.deaths.add(a.key);
      if (r.end) this.add(r.end, a.key);
      this.flushPending();
      if (r.hit || (open && !this.stillOpen(t))) {
        this.stats.hitAt[Math.min(i, 63)]++;
        this.stats.hitFrames += this.frames - f0;
        return true;
      }
      this.stats.missFrames += this.frames - f0;
      i++;
    }
    this.stats.gaveUp++;
    tried.add(t.key);
    this.failed.set(a.key, tried);
    return false;
  }

  /** the moment to move: a calm spell in any wind nearby, the eaglets asleep (a player can wait for these) */
  private prepareTime(a: Anchor) {
    const sim = this.sim;
    const x = a.kind === 'p' ? (a.a! + a.b!) / 2 : a.x ?? sim.p.x;
    const zones = (sim.stage.zones ?? []).filter((z) => z.kind === 'wind' && z.x0 < x + 1200 && z.x1 > x - 1200);
    const nests: Array<{ x: number; every: number; offset: number }> = sim.w4?.w4?.nests?.filter((n: { x: number }) => Math.abs(n.x - x) < 900) ?? [];
    const surges: Array<{ surge: { pour: number; ease: number; quiet: number; offset: number } }> = (sim.w4?.w4?.falls ?? []).filter((w: { surge?: unknown; plug?: unknown; x: number }) => w.surge && !w.plug && Math.abs(w.x - x) < 900);
    if (!zones.length && !nests.length && !surges.length) return;
    // how long it stays calm from t: until the next gust blows (its warning is still calm), until the eaglets next stir
    const calmFor = (t: number) => {
      let m = 4;
      for (const z of zones) {
        const s = (((t + z.offset) % z.period) + z.period) % z.period;
        const quiet = z.period - z.active;
        m = Math.min(m, s < quiet ? quiet - s : 0);
      }
      for (const n of nests) {
        const c = (((t + n.offset) % n.every) + n.every) % n.every;
        const sleep = n.every - 1.2 - 1.6;
        m = Math.min(m, c < sleep ? sleep - c : 0);
      }
      // a surging fall: its quiet spell, and the last of its easing (waterfalls.ts surgeFlow)
      for (const { surge: q } of surges) {
        const T = q.pour + q.ease + q.quiet;
        const c = (((t + q.offset) % T) + T) % T;
        m = Math.min(m, c >= q.pour + q.ease * 0.7 ? T - c : 0);
      }
      return m;
    };
    let best = sim.t;
    let bestFor = -1;
    for (let k = 0; k < 400; k++) {
      const t = sim.t + k * 0.1;
      const f = calmFor(t);
      if (f > bestFor + 0.05) {
        best = t;
        bestFor = f;
        if (f >= 3.5) break;
      }
    }
    sim.t = best;
  }

  // ───────────── World 4's pieces ─────────────

  private standingNear(x0: number, x1: number, y: number, reach: number): Anchor | undefined {
    for (const a of this.reached.values()) if (a.kind === 'p' && Math.abs(a.y! - y) <= reach && a.b! >= x0 && a.a! <= x1) return a;
    return undefined;
  }

  /** stand still where Dot picks a knot, and on a frond's spot, wherever those spots have been reached */
  private workPieces(): boolean {
    const sim = this.sim;
    const w4 = sim.w4?.w4;
    if (!w4) return false;
    let changed = false;
    (w4.knots ?? []).forEach((k: { x0: number; x1: number; ground: number }, i: number) => {
      if (sim.w4!.knots[i].phase === 'free') return;
      const a = this.standingNear(k.x0, k.x1, k.ground, 40);
      if (!a) return;
      sim.stand((Math.max(k.x0, a.a!) + Math.min(k.x1, a.b!)) / 2, a.y!);
      sim.wait(4.2);
      this.frames += 126;
      if (sim.w4!.knots[i].phase === 'free') {
        changed = true;
        this.notes.push(`knot ${i} freed`);
      } else this.notes.push(`knot ${i}: standing under it did not free it`);
    });
    (w4.patience ?? []).forEach((s: { kind: string; x0: number; x1: number; y: number; fill: number }, i: number) => {
      if (s.kind !== 'frond' || sim.w4!.frondDone(i)) return;
      const a = this.standingNear(s.x0, s.x1, s.y, 40);
      if (!a) return;
      sim.stand((Math.max(s.x0, a.a!) + Math.min(s.x1, a.b!)) / 2, a.y!);
      sim.wait(s.fill + 1);
      this.frames += Math.round((s.fill + 1) * 30);
      if (sim.w4!.frondDone(i)) {
        changed = true;
        this.openArea.clear();
        this.notes.push(`frond ${i} unrolled`);
      } else this.notes.push(`frond ${i}: standing on its spot did not unroll it`);
    });
    return changed;
  }

  /** push the boulders he can stand beside into their channels; true if any moved */
  private pushBoulders(): boolean {
    const sim = this.sim;
    const falls: Array<{ plug?: { platformId: number; atX: number } }> = sim.w4?.w4?.falls ?? [];
    let changed = false;
    for (const pl of sim.platforms as Array<Platform & { pushSaved?: Platform['push'] }>) {
      if (!pl.pushSaved) continue;
      const fall = falls.find((w) => w.plug?.platformId === pl.id);
      // he pushes from the side away from the slot
      const toward: -1 | 1 = fall && fall.plug!.atX < pl.x ? -1 : 1;
      const sideX = toward > 0 ? pl.x - 21 : pl.x + pl.width + 21;
      const groundY = pl.y + pl.height;
      const a = [...this.reached.values()].find((q) => q.kind === 'p' && Math.abs(q.y! - groundY) < 8 && sideX >= q.a! - 4 && sideX <= q.b! + 4);
      if (!a) continue;
      pl.push = pl.pushSaved;
      pl.pushSaved = undefined;
      const x0 = pl.x;
      sim.stand(Math.max(a.a!, Math.min(a.b!, sideX - toward * 30)), a.y!);
      const plugged = () => !!fall && (toward > 0 ? pl.x >= fall.plug!.atX - 2 : pl.x <= fall.plug!.atX + 2);
      for (let f = 0; f < 900 && !plugged(); f++) {
        sim.frame(toward > 0 ? { right: true } : { left: true });
        this.frames++;
      }
      sim.wait(2.5);
      changed = true;
      this.notes.push(`boulder ${pl.id}: pushed from ${Math.round(x0)} to ${Math.round(pl.x)}${fall ? (plugged() ? ' (plugged its fall)' : ` (NOT in its slot at ${fall.plug!.atX})`) : ''}`);
      // the stretches near where it was and where it is are walked again
      const lo = Math.min(x0, pl.x) - 400, hi = Math.max(x0, pl.x) + pl.width + 400;
      for (const [id, list] of this.stretches) {
        const q = this.platformById(id);
        if (q && q.x < hi && q.x + q.width > lo) this.stretches.set(id, list.filter((s) => s.b < lo || s.a > hi));
      }
      this.openArea.clear();
      for (const r of [...this.reached.values()]) if (r.kind === 'p' && r.b! >= lo && r.a! <= hi) this.add(this.standAnchor(this.platformById(r.id)!, (r.a! + r.b!) / 2), r.key);
      this.flushPending();
    }
    return changed;
  }

  // ───────────── the search ─────────────

  /** how many places have given up on a target: after a few it waits for the deep pass */
  private giveUps = new Map<string, number>();
  private nearestTried = new Map<string, number>();

  private explore() {
    this.flushPending();
    while (this.queue.length) {
      const a = this.reached.get(this.queue.shift()!)!;
      for (const t of this.openTargets()) {
        const g = t.key;
        // (a place nearer the target than every one that gave up on it still gets its try)
        const near = gapToTarget(a, t);
        if (((this.giveUps.get(g) ?? 0) >= this.opts.giveUps && near >= (this.nearestTried.get(g) ?? Infinity) - 10) || !this.stillOpen(t) || !this.bound(a, t)) continue;
        if (!this.tryTarget(a, t) && this.stillOpen(t)) {
          this.giveUps.set(g, (this.giveUps.get(g) ?? 0) + 1);
          this.nearestTried.set(g, Math.min(near, this.nearestTried.get(g) ?? Infinity));
        }
      }
    }
  }

  /** after something changed (a vine let down, a bridge, a boulder): every place tries again */
  private requeue() {
    this.failed.clear();
    this.giveUps.clear();
    this.nearestTried.clear();
    this.queue = [...this.reached.keys()];
  }

  private collect(): void {
    const sim = this.sim;
    for (const c of sim.collectibles) {
      if (c.collected || c.type === 'exit_totem' || c.type === 'thorn_gate') continue;
      const t: Target = { key: `c${c.id}`, kind: 'c', x0: c.x, x1: c.x, y: c.y, c };
      const places = [...this.reached.values()].filter((a) => this.bound(a, t));
      places.sort((p, q) => distTo(p, c) - distTo(q, c));
      for (const a of places.slice(0, this.opts.deepPlaces * 2)) {
        if (c.collected) break;
        if (c.type === 'cage' || (c.type === 'find' && c.hidden) || (c.type === 'relic' && c.hidden)) {
          if (a.kind === 'p') this.reachOnFoot(a, c);
          continue;
        }
        this.tryTarget(a, t, this.opts.deepMoves);
      }
    }
  }

  /** a nest's netting (punched open) or a keepsake in a fern (crouched beside): walked up to, then worked */
  private reachOnFoot(a: Anchor, c: Collectible) {
    const sim = this.sim;
    if (Math.abs(a.y! - (c.y + 26)) > 30) return;
    for (const side of [-1, 1]) {
      const x = c.x + side * (c.type === 'cage' ? 36 : 10);
      if (x < a.a! - 2 || x > a.b! + 2) continue;
      sim.stand(x, a.y!);
      sim.frame(side < 0 ? { right: true } : { left: true });
      for (let k = 0; k < 4 && !c.collected; k++) {
        if (c.type === 'cage') {
          sim.frame({ punch: true });
          for (let w = 0; w < 14; w++) sim.frame();
        } else for (let w = 0; w < 40; w++) sim.frame({ down: true });
        this.frames += 40;
      }
      if (c.collected) return;
    }
  }

  /** a stretch he can walk to the shrine along */
  private atShrine(a: Anchor): boolean {
    const pl = this.exitPlatform();
    const x = this.sim.stage.exitTotemX;
    return !!pl && a.kind === 'p' && a.id === pl.id && x >= a.a! - 40 && x <= a.b! + 40;
  }

  private exitPlatform(): Platform | undefined {
    const st = this.sim.stage;
    return this.sim.platforms.find((q) => st.exitTotemX >= q.x - 30 && st.exitTotemX <= q.x + q.width + 30 && Math.abs(q.y - st.exitTotemY) < 8);
  }

  /** can he get from each place to the shrine? */
  private findTraps(): { traps: Anchor[]; dieOnly: Anchor[] } {
    this.early = false;
    const exitPl = this.exitPlatform();
    const good = new Set<string>();
    for (const [k, a] of this.reached) if (this.atShrine(a)) good.add(k);
    // two stretches of one platform that overlap are one walk (a stretch is walked again after a boulder moves)
    const joinStretches = () => {
      const ps = [...this.reached.values()].filter((a) => a.kind === 'p');
      for (const p of ps) for (const q of ps) {
        if (p !== q && p.id === q.id && p.b! >= q.a! - 6 && p.a! <= q.b! + 6) {
          if (!this.edges.has(p.key)) this.edges.set(p.key, new Set());
          this.edges.get(p.key)!.add(q.key);
        }
      }
    };
    joinStretches();
    const spread = () => {
      for (let grew = true; grew; ) {
        grew = false;
        for (const [k, out] of this.edges) {
          if (good.has(k)) continue;
          for (const m of out) if (good.has(m)) { good.add(k); grew = true; break; }
        }
      }
    };
    spread();
    // a place with no known way on: look for a move into somewhere that has one, the nearest first (and then anywhere near: a place
    // found only as a target may never have had a move tried from it)
    const gapTo = (a: Anchor, t: Target) => {
      const ax0 = a.kind === 'p' || a.kind === 'r' ? a.a! : anchorX(a), ax1 = a.kind === 'p' || a.kind === 'r' ? a.b! : anchorX(a);
      return Math.max(0, t.x0 - ax1, ax0 - t.x1) + Math.abs((a.y ?? t.y) - t.y) * 0.3;
    };
    for (let pass = 0; pass < 4; pass++) {
      let found = false;
      for (const [k, a] of this.reached) {
        if (good.has(k)) continue;
        const near = (keys: Iterable<string>) =>
          [...keys].filter((g) => g !== k).map((g) => this.anchorTarget(this.reached.get(g)!)).filter((t): t is Target => !!t && this.bound(a, t)).sort((p, q) => gapTo(a, p) - gapTo(a, q));
        const goals = [...near(good).slice(0, 6), ...near([...this.reached.keys()].filter((g) => !good.has(g))).slice(0, 4)];
        if (process.env.TRAPDBG === k) console.log('trap goals for', k, goals.map((t) => t.key).join(' '));
        for (const t of goals) {
          this.failed.get(k)?.delete(t.key);
          const ok = this.tryTarget(a, t, 40);
          if (process.env.TRAPDBG === k) console.log('  ->', t.key, ok, [...(this.edges.get(k) ?? [])].join(' '));
          joinStretches();
          spread();
          if (good.has(k)) break;
        }
        if (good.has(k)) found = true;
      }
      if (!found) break;
    }
    const traps: Anchor[] = [];
    const dieOnly: Anchor[] = [];
    for (const [k, a] of this.reached) {
      if (good.has(k)) continue;
      if (this.deaths.has(k)) dieOnly.push(a);
      else traps.push(a);
    }
    return { traps, dieOnly };
  }

  private anchorTarget(a: Anchor): Target | null {
    if (a.kind === 'p') return { key: a.key, kind: 'p', x0: a.a! - 11, x1: a.b! + 11, y: a.y!, id: a.id };
    if (a.kind === 'v' || a.kind === 'l') return { key: a.key, kind: a.kind, x0: a.x!, x1: a.x!, y: a.bottom!, top: a.top, bottom: a.bottom };
    if (a.kind === 'r') return { key: a.key, kind: 'r', x0: a.a!, x1: a.b!, y: a.y! - HANG_DROP };
    const pl = this.platformById(a.id);
    return pl ? { key: a.key, kind: 'b', x0: pl.x, x1: pl.x + pl.width, y: pl.y, id: pl.id } : null;
  }

  /** the whole search */
  search(): ReachReport {
    const sim = this.sim;
    const st = sim.stage;
    const startPl = sim.platforms.find((q) => st.spawnX >= q.x - 4 && st.spawnX <= q.x + q.width + 4 && Math.abs(q.y - st.spawnY) < 6);
    if (!startPl) throw new Error('no platform under the start');
    this.add(this.standAnchor(startPl, st.spawnX));
    // everything reachable, working the knots and fronds as their spots are reached, then each boulder as it is reached
    for (let round = 0; round < 12; round++) {
      this.explore();
      if (this.workPieces()) {
        this.requeue();
        continue;
      }
      if (this.pushBoulders()) {
        this.requeue();
        continue;
      }
      break;
    }
    // what the level check says he can stand on and the moves above have not found: tried again, harder, from the places nearest it
    this.notes.push(`explore: ${this.trials} moves, ${this.frames} frames`);
    // (and every trunk, liana, rope and mushroom not got to yet, since a way to those ledges may go by one)
    for (let pass = 0; pass < 2; pass++) {
      let found = false;
      for (const t of this.openTargets()) {
        if (t.kind === 'p' || t.kind === 'b' ? !this.opts.claimed?.has(t.id!) : false) continue;
        // (a sliver of a platform already stood on elsewhere is left: the level check knows platforms, not the stretches walls cut)
        if (t.kind === 'p' && t.x1 - t.x0 < 150 && [...this.reached.values()].some((a) => a.kind === 'p' && a.id === t.id)) continue;
        const near = [...this.reached.values()].filter((a) => this.bound(a, t));
        near.sort((p, q) => gapToTarget(p, t) - gapToTarget(q, t));
        for (const a of near.slice(0, this.opts.deepPlaces)) {
          this.failed.get(a.key)?.delete(t.key);
          if (this.tryTarget(a, t, this.opts.deepMoves)) break;
        }
        if (!this.stillOpen(t)) found = true;
      }
      if (!found) break;
      this.giveUps.clear();
      this.explore();
    }
    this.notes.push(`deep: ${this.trials} moves, ${this.frames} frames`);
    this.collect();
    this.notes.push(`collect: ${this.trials} moves, ${this.frames} frames`);
    const { traps, dieOnly } = this.opts.traps ? this.findTraps() : { traps: [], dieOnly: [] };
    const exitPl = this.exitPlatform();
    const platforms = new Set([...this.reached.values()].filter((a) => a.kind === 'p' || a.kind === 'b').map((a) => a.id));
    return {
      reached: this.reached,
      platforms,
      collected: new Set(sim.collectibles.filter((c) => c.collected).map((c) => c.id)),
      missed: sim.collectibles.filter((c) => !c.collected && c.type !== 'exit_totem' && c.type !== 'thorn_gate'),
      traps,
      dieOnly,
      exitReached: [...this.reached.values()].some((a) => this.atShrine(a)),
      trials: this.trials,
      frames: this.frames,
      notes: this.notes,
    };
  }

  /** the platform parts the engine stood on (for comparing with the level check: a platform buried under another counts as nothing) */
  buried(id: number): boolean {
    const pl = this.platformById(id);
    return !pl || this.standable(pl).length === 0;
  }
}

/** how far a place is from a target (sideways, and a little for height) */
function gapToTarget(a: Anchor, t: Target): number {
  const ax0 = a.kind === 'p' || a.kind === 'r' ? a.a! : anchorX(a), ax1 = a.kind === 'p' || a.kind === 'r' ? a.b! : anchorX(a);
  // (a climb counts for more than the same distance across or down)
  const up = (a.y ?? t.y) - t.y;
  return Math.max(0, t.x0 - ax1, ax0 - t.x1) + (up > 0 ? up : -up * 0.3);
}

function anchorX(a: Anchor): number {
  if (a.kind === 'p') return (a.a! + a.b!) / 2;
  return a.x ?? 0;
}

function distTo(a: Anchor, c: Collectible): number {
  if (a.kind === 'p' || a.kind === 'r') return Math.max(0, a.a! - c.x, c.x - a.b!) + Math.abs(a.y! - c.y) * 0.5;
  if (a.kind === 'v' || a.kind === 'l') return Math.abs(a.x! - c.x) + Math.max(0, a.top! - c.y, c.y - a.bottom!) * 0.5;
  return Math.abs(anchorX(a) - c.x) + Math.abs((a.y ?? c.y) - c.y) * 0.5;
}
