/**
 * pieces/pacerPiece — the PACER (pacer.ts; gen2/pacerLay.ts lays it; 2-7's mail boat, reference/design/2-7.md NEW 1) on the piece hook:
 * it waits at the race leg's start, sets off the step he is on that leg past its start, and runs to the dock at its one steady speed
 * on its own clock (the game's fixed steps: a pause holds it). It never hurts him and never locks the exit: when he reaches the dock
 * its verdict is kept (won: he got there before it), and the engine files it with the run's stats (engine.ts, StageStats.race).
 * A fall never pays race time (the lead's ruling, ENG-27s, D112): on a respawn on the race leg it is put back so that his margin is the
 * one he had when he FIRST passed where he respawns, less the life-lost beat, and it runs on from there (the boat waits for no one;
 * pacer.ts pacerKeep); a respawn before that leg puts it back at the start, waiting. THE STRICT HOLD (the lead's ruling (a), ENG-27t): when
 * he reaches a race-leg fall's x again with a margin better than the one he had at the fall, the boat makes up the excess EASED (EASE_PEAK:
 * a raised-cosine speed-up, never a snap); once the ease ends his margin there is never better than at the fall, and if he reaches the
 * dock mid-ease the excess still owed counts in the verdict. Drawn on layer 'under', behind the banks: over each river on its leg, on
 * that river's surface, and out of sight behind the bank's face between them (pacerDraw.ts; the lead's ruling (a), 11-21).
 */
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { pacerKeep, pacerMargin, pacerOff, pacerX, type Pacer } from '../pacer.ts';
import { drawPacer, pacerWaters, type PacerWater } from '../pacerDraw.ts';
import { DOWN_SECS } from '../physics.ts';

/** how near the dock (px, along its way) he counts as there: none. The dock is a river's far bank (gen2/pacerLay.ts, ENG-27d): he is
 *  there when he reaches the bank's edge (80 px short, the exit totem's touch it was, is ~1 s of a log's ride: the ride-only bot won by it) */
const DOCKED = 0;

/** the strict hold's ease (the lead's ruling (a), ENG-27t, D116): the boat makes up an excess E by running at most EASE_PEAK of its own
 *  pace faster, on a raised cosine (it speeds up and settles back with no step in its speed, so no frame's move jumps): the ease lasts
 *  max(EASE_MIN, 2E / EASE_PEAK) s. Why 0.5: at half again its pace for a moment the boat reads as pushing on, not jumping (judged on the
 *  clip at game speed, D63); its per-frame step stays within 1.5x the step it had, which the test bounds */
export const EASE_PEAK = 0.5;
/** the shortest ease (s): about a second, the lead's first wording of the hold */
export const EASE_MIN = 1;

export interface PacerVerdict { won: boolean; boat: number; him: number }

export class PacerPiece implements StagePiece {
  readonly kind = 'pacer';
  readonly layers: readonly PieceLayer[] = ['under'];
  /** the race leg's water it shows over (pacerDraw.ts pacerWaters) */
  readonly waters: readonly PacerWater[];
  /** s since it set off (null: waiting at the start) */
  clock: number | null = null;
  /** his time on the race leg (s since it set off, re-placed with the pacer's on a respawn) */
  verdict: PacerVerdict | null = null;
  /** his margin (s, + ahead) at the start of the last step it ran: the world holds through a life-lost beat (engine.ts down), so after a
   *  fall this is the margin the frame before the life was lost */
  private margin = 0;
  /** his margin the FIRST time he reached each 16 px of the leg (index: his progress from x0 over 16): a respawn on the leg puts him back
   *  on the margin he had when he first passed where he stands, less the time from the fall to his stand (the lead's ruling, ENG-27s) */
  private first: number[] = [];
  /** his x the last step it ran (after a fall: the frame before the life was lost, the world holds through the beat) */
  private lastX = 0;
  /** the race-leg falls not yet re-crossed: the fall's x and his margin there (the strict hold) */
  private holds: Array<{ x: number; m: number }> = [];
  /** the excess (s of the boat's clock) still to be made up by the ease, and the ease under way: its total, length and time into it */
  owed = 0;
  private ease: { total: number; len: number; t: number } | null = null;
  constructor(readonly pacer: Pacer, rivers?: ReadonlyArray<PacerWater>) {
    this.waters = pacerWaters(pacer, rivers);
  }

  get x(): number {
    return this.clock === null ? this.pacer.x0 : pacerX(this.pacer, this.clock);
  }

  step(dt: number, host: PieceHost) {
    const P = this.pacer, p = host.player;
    if (this.clock === null) {
      if (pacerOff(P, p.x, p.y)) this.clock = 0;
      return;
    }
    // (his margin against the boat's clock with the excess still owed counted: the race he is really running)
    this.margin = pacerMargin(P, p.x, this.clock + this.owed);
    this.lastX = p.x;
    for (let k = Math.floor(Math.max(0, (p.x - P.x0) * P.dir) / 16); this.first.length <= k; ) this.first.push(this.margin);
    // (the strict hold: back at (or past) a fall's x, standing, with a margin better than at the fall, the excess is owed and eased off.
    //  The pieces step BEFORE he moves (engine.ts), so this reads where the last frame left him: the first frame he stands back at the
    //  fall's x, and his margin there, exactly; the boat owes it from this frame, one frame after (ENG-27t's traces: a look-ahead by his
    //  last step fired mid-jump over the x, and he landed past it 0.73 s better, so the stale read is the exact one))
    if (p.grounded && this.holds.length) {
      for (const h of this.holds.filter((h) => (p.x - h.x) * P.dir >= 0)) {
        const m = pacerMargin(P, p.x, this.clock + this.owed);
        if (m > h.m) this.owe(m - h.m);
      }
      this.holds = this.holds.filter((h) => (p.x - h.x) * P.dir < 0);
    }
    this.clock += dt + this.eased(dt);
    const t = this.clock + this.owed;
    if (!this.verdict && (p.x - P.x1) * P.dir >= -DOCKED && p.y >= P.yMin) this.verdict = { won: t < P.seconds, boat: P.seconds, him: Math.round(t * 10) / 10 };
  }

  /** start (or widen) the ease for `e` s more of the boat's clock: the rest of an ease under way is folded in and the ease restarts */
  private owe(e: number) {
    this.owed += e;
    this.ease = { total: this.owed, len: Math.max(EASE_MIN, (2 * this.owed) / EASE_PEAK), t: 0 };
  }

  /** the ease's share of this step (s of clock beyond dt): a raised cosine of its total over its length */
  private eased(dt: number): number {
    const E = this.ease;
    if (!E) return 0;
    const f = (t: number) => (1 - Math.cos(Math.PI * Math.min(1, t / E.len))) / 2;
    const d = Math.min(this.owed, E.total * (f(E.t + dt) - f(E.t)));
    E.t += dt;
    this.owed -= d;
    if (E.t >= E.len || this.owed <= 1e-9) {
      this.ease = null;
      const rest = this.owed;
      this.owed = 0;
      return d + rest;
    }
    return d;
  }

  respawn(host: PieceHost) {
    // (a boat that has docked has won the race: no later fall rewinds it (the lead's ruling A (i), 11-21, ENG-27e: a ride-only run lost
    //  by 13 s fell in after the dock and raced again))
    if (this.verdict || (this.clock !== null && this.clock + this.owed >= this.pacer.seconds)) return;
    const p = host.player;
    const on = this.clock !== null && pacerOff(this.pacer, p.x, p.y);
    // (on the race leg: his margin where he stands is the one he had when he FIRST passed here, less the life-lost beat; from here the
    //  boat runs on, so the time to his stand costs too: the boat waits for no one. A fall never pays (D112): back at the fall's x his
    //  margin is at most what it was at the fall, less the beat and the walk back. Before the leg: back at its start, waiting)
    const k = Math.floor(Math.max(0, (p.x - this.pacer.x0) * this.pacer.dir) / 16);
    const m = (this.first[Math.min(k, this.first.length - 1)] ?? this.margin) - DOWN_SECS;
    // (a fall on the leg is held: back at its x his margin may be no better than this one, the margin the frame before the life was lost
    //  with any excess still owed counted; the respawn's clock already places him, so an ease under way ends here)
    if (on && this.clock !== null) this.holds.push({ x: this.lastX, m: this.margin });
    this.owed = 0;
    this.ease = null;
    if (!on) this.holds = [];
    this.clock = on ? pacerKeep(this.pacer, p.x, m) : null;
  }

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: PieceHost) {
    drawPacer(ctx, this.pacer, this.x, this.clock === null ? 0 : this.clock, host.view, this.waters);
  }
}

export const PACER_PIECE: PieceKind = {
  id: 'pacer',
  start(stage) {
    return stage.pacer ? new PacerPiece(stage.pacer, stage.rivers) : null;
  },
};
