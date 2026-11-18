/**
 * followPlay — the little ones that follow him home and the heron that watches THEM (2-3 "Walk Them Home": follow.ts's rules, run on a
 * stage that carries a follow row, proto.follow). The engine makes one per stage, steps it once a frame after he has moved, tells it
 * when a cage bursts (free) and when he is set back (a lost heart, a soft fall, a splash-back: setBack), and draws it.
 *
 *   - his trail: walk while he stands or is in the air from his own ground jump; hold while he climbs, swings, hangs, rides or falls;
 *   - the line: follow.ts stepLine at the setting's pace; over splash-back water they paddle; a spooked one waits at its stretch's start
 *     until he walks back within `rejoin`; at the families' jetty (`home` px before the exit) each one is home and the goal counts it;
 *   - the herons: each watched stretch (proto.watch) is one heron with its own rhythm (watcher.ts stepWatch; a second heron over the same
 *     stretch starts WatchZone.lag s later), its look sweeping the stretch in world x (follow.ts zoneLookX) and reading the line (lineSeen):
 *     a seen one is spooked back to the stretch's start (WatchZone.setback, else x0). Its first look over a freeFirst stretch only warns
 *     (on Easy every heron's first look does). It never reads him and never costs a heart.
 *
 * No engine import: the engine passes what it knows (follow.test.ts drives it the same way on a toy floor).
 */
import { home, homeCount, join, unkeep, newTrail, record, regroup, rejoin, spook, stepLine, trailAt, zoneLookX, lineSeen, type Follower, type FollowKind, type FollowRow, type LineCover, type SurfaceAt, type Trail } from './follow.ts';
import { newWatch, stepWatch, WATCH, type WatchState, type WatchZone } from './watcher.ts';
import type { Platform } from './types.ts';

/** what the line needs to know of him this frame */
export interface FollowHero {
  x: number;
  y: number;
  vy: number;
  grounded: boolean;
  climbing?: boolean;
  isVineSwinging?: boolean;
  hanging?: boolean;
  facing?: number;
}

/** what the line needs to know of the stage */
export interface FollowStage {
  exitX: number;
  /** the stage's travel: +1 to the right */
  dir?: 1 | -1;
  zones: readonly WatchZone[];
  covers: readonly LineCover[];
  platforms: readonly Platform[];
  /** splash-back water: a teaching river's or pool's span and surface */
  safeWater: ReadonlyArray<{ x0: number; x1: number; y: number }>;
}

/** one heron: its stretch, its rhythm and where its look is (null: not looking) */
export interface Heron {
  z: WatchZone;
  s: WatchState;
  /** which end of its stretch it wades at (+1: past x1, looking back along it) */
  end: 1 | -1;
  /** where it stands: its middle and the ground or water under it */
  foot: { x: number; b: number };
  lookX: number | null;
}

/** a platform he rides (a ride on the stage's beat, a drifting log): the line waits on the bank */
export const rides = (pl: Platform | undefined): boolean => !!pl && (pl.type === 'drift' || (pl.type === 'moving' && !pl.pad) || !!pl.ride);

/** a heron wades this far past its stretch's end (px), clear of the reeds it watches */
export const HERON_OFF = 70;

/** how far he may move in one frame before it is a set-back (a respawn, a put-back), not a step (px) */
export const SET_BACK_JUMP = 150;

export class FollowPlay {
  trail: Trail;
  line: Follower[] = [];
  herons: Heron[];
  /** he left the ground by his own jump (the line hops where he hopped); false: he walked off or let go of something (a fall: hold) */
  private airJump = false;
  private last: { x: number; y: number };
  private pending = false;
  private wasGrounded = true;
  readonly pace: number;

  constructor(readonly row: FollowRow, readonly easy: boolean, readonly stage: FollowStage, start: { x: number; y: number }) {
    this.pace = easy ? row.pace.easy : row.pace.normal;
    this.trail = newTrail(start.x, start.y);
    this.last = { ...start };
    // (two herons over one stretch wade at its two ends; the first at the far end, looking back along it)
    const seen = new Map<string, number>();
    this.herons = stage.zones.map((z) => {
      const k = `${z.x0}:${z.x1}`;
      const i = seen.get(k) ?? 0;
      seen.set(k, i + 1);
      const s = newWatch();
      s.dur = z.calm[0] + (z.lag ?? 0);
      const end: 1 | -1 = i % 2 === 0 ? (stage.dir ?? 1) : (-(stage.dir ?? 1) as 1 | -1);
      const fx = end > 0 ? z.x1 + HERON_OFF : z.x0 - HERON_OFF;
      return { z, s, end, foot: { x: fx, b: this.groundAt(fx) ?? this.groundAt(end > 0 ? z.x1 : z.x0) ?? start.y }, lookX: null };
    });
  }

  /** the water or still ground under x (the top-most), null where there is none */
  groundAt(x: number): number | null {
    let best = Infinity;
    for (const w of this.stage.safeWater) if (x >= w.x0 && x <= w.x1) best = Math.min(best, w.y);
    for (const pl of this.stage.platforms) if (pl.type === 'solid' && !pl.pad && x >= pl.x && x <= pl.x + pl.width) best = Math.min(best, pl.y);
    return best === Infinity ? null : best;
  }

  /** a cage burst at (x, y): its little one drops to `land` (the ground or water under it) and walks to the end of the line */
  free(kind: FollowKind, at: { x: number; y: number }, land: { x: number; y: number }): Follower {
    return join(this.line, kind, at, land);
  }

  /** he was set back (a lost heart's flag, a soft fall, a splash-back): the line re-forms behind him where he comes back */
  setBack(): void {
    this.pending = true;
  }

  /** how many little ones are home (the goal's count) */
  home(): number {
    return homeCount(this.line);
  }

  /** splash-back water under a point, where no stone (a solid, still piece) stands there */
  readonly surf: SurfaceAt = (x, y) => {
    for (const w of this.stage.safeWater) {
      if (x < w.x0 || x > w.x1) continue;
      const on = this.stage.platforms.some((pl) => pl.type === 'solid' && !pl.pad && !pl.broken && x >= pl.x && x <= pl.x + pl.width && Math.abs(pl.y - y) < 8);
      if (!on && y > w.y - 160) return w.y;
    }
    return null;
  };

  /**
   * One frame, after he has moved. `on`: the platform he stands on. `roll`: [0, 1) for the herons' calms. Returns what happened, for the
   * engine's sounds and Dot: a heron's warning, little ones spooked, little ones that came home.
   */
  step(dt: number, p: FollowHero, on: Platform | undefined, roll: () => number): { warned: number; spooked: Follower[]; homed: number } {
    const dir = this.stage.dir ?? 1;
    if (this.pending || Math.abs(p.x - this.last.x) > SET_BACK_JUMP || Math.abs(p.y - this.last.y) > SET_BACK_JUMP * 2) {
      this.pending = false;
      this.trail = regroup(this.line, { x: p.x, y: p.y }, this.row.gap, dir);
      this.airJump = false;
    } else {
      if (p.grounded) this.airJump = false;
      else if (this.wasGrounded && p.vy < 0) this.airJump = true;
      const hold = !!p.climbing || !!p.isVineSwinging || !!p.hanging || (p.grounded && rides(on)) || (!p.grounded && !this.airJump);
      record(this.trail, p, hold ? 'hold' : 'walk');
    }
    this.wasGrounded = p.grounded;
    this.last = { x: p.x, y: p.y };
    const before = this.home();
    stepLine(this.trail, this.line, this.pace, this.row.gap, dt, this.surf, this.row.scamper);
    for (const f of [...this.line]) rejoin(this.line, f, p.x, this.row.rejoin);
    home(this.line, this.stage.exitX - dir * this.row.home, dir);
    // the herons
    let warned = 0;
    const spooked: Follower[] = [];
    for (const h of this.herons) {
      const z = h.z;
      const near = (x: number) => x >= z.x0 && x <= z.x1;
      const active = near(p.x) || this.line.some((f) => f.state === 'follow' && near(f.x));
      const ev = stepWatch(h.s, dt, active ? z : undefined, roll);
      if (ev.warned) warned++;
      h.lookX = h.s.phase === 'pass' ? zoneLookX(h.s, z) : null;
      if (h.lookX === null) continue;
      // (its first look over a freeFirst stretch only warns; on Easy every heron's first look does)
      if (h.s.passes === 0 && (z.freeFirst || this.easy)) continue;
      // (it reads only the little ones on its own stretch: its look runs on 160 px past each end to come and go)
      for (const f of lineSeen(h.lookX, this.line.filter((q) => near(q.x)), this.stage.covers, WATCH.sight)) {
        spook(f, z.setback ?? (dir === 1 ? z.x0 : z.x1));
        spooked.push(f);
      }
    }
    if (!this.herons.some((h) => h.lookX !== null)) unkeep(this.line);
    return { warned, spooked, homed: this.home() - before };
  }

  /** where a follower would stand on the trail at s (for the draw's debug and the tests) */
  at(s: number): { x: number; y: number } {
    return trailAt(this.trail, s);
  }
}
