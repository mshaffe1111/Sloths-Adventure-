/**
 * pieces/pacerPiece — the PACER (pacer.ts; gen2/pacerLay.ts lays it; 2-7's mail boat, reference/design/2-7.md NEW 1) on the piece hook:
 * it waits at the race leg's start, sets off the step he is on that leg past its start, and runs to the dock at its one steady speed
 * on its own clock (the game's fixed steps: a pause holds it). It never hurts him and never locks the exit: when he reaches the dock
 * its verdict is kept (won: he got there before it), and the engine files it with the run's stats (engine.ts, StageStats.race).
 * A fall neither costs nor pays race time (the lead's ruling, Option A, D112): on a respawn on the race leg it is put back so that he
 * keeps exactly the margin he had the frame before the life was lost, and it holds that margin to him until he stands (the respawn's
 * lost time forgiven; pacer.ts pacerKeep); a respawn before that leg puts it back at the start, waiting. Drawn on layer 'under', behind the banks: over each river on its leg, on
 * that river's surface, and out of sight behind the bank's face between them (pacerDraw.ts; the lead's ruling (a), 11-21).
 */
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { pacerKeep, pacerMargin, pacerOff, pacerX, type Pacer } from '../pacer.ts';
import { drawPacer, pacerWaters, type PacerWater } from '../pacerDraw.ts';

/** how near the dock (px, along its way) he counts as there: none. The dock is a river's far bank (gen2/pacerLay.ts, ENG-27d): he is
 *  there when he reaches the bank's edge (80 px short, the exit totem's touch it was, is ~1 s of a log's ride: the ride-only bot won by it) */
const DOCKED = 0;

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
  /** the margin it keeps to him from a respawn on the race leg until he stands (null: racing) */
  private keep: number | null = null;
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
    // (put back on a respawn: it stays level with his kept margin until he stands, the respawn's lost time forgiven)
    if (this.keep !== null) {
      this.clock = pacerKeep(P, p.x, this.keep);
      if (!p.grounded) return;
      this.keep = null;
    }
    this.margin = pacerMargin(P, p.x, this.clock);
    this.clock += dt;
    if (!this.verdict && (p.x - P.x1) * P.dir >= -DOCKED && p.y >= P.yMin) this.verdict = { won: this.clock < P.seconds, boat: P.seconds, him: Math.round(this.clock * 10) / 10 };
  }

  respawn(host: PieceHost) {
    // (a boat that has docked has won the race: no later fall rewinds it (the lead's ruling A (i), 11-21, ENG-27e: a ride-only run lost
    //  by 13 s fell in after the dock and raced again))
    if (this.verdict || (this.clock !== null && this.clock >= this.pacer.seconds)) return;
    const p = host.player;
    const on = this.clock !== null && pacerOff(this.pacer, p.x, p.y);
    this.keep = on ? (this.keep ?? this.margin) : null;
    this.clock = on ? pacerKeep(this.pacer, p.x, this.keep!) : null;
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
