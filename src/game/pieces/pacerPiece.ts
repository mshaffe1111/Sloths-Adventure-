/**
 * pieces/pacerPiece — the PACER (pacer.ts; gen2/pacerLay.ts lays it; 2-7's mail boat, reference/design/2-7.md NEW 1) on the piece hook:
 * it waits at the race leg's start, sets off the step he is on that leg past its start, and runs to the dock at its one steady speed
 * on its own clock (the game's fixed steps: a pause holds it). It never hurts him and never locks the exit: when he reaches the dock
 * its verdict is kept (won: he got there before it), and the engine files it with the run's stats (engine.ts, StageStats.race).
 * On a respawn on the race leg it is put back level with him plus the margin's share of the way left (pacer.ts pacerReplace); a
 * respawn before that leg puts it back at the start, waiting. Drawn on layer 'under', behind the banks: over each river on its leg, on
 * that river's surface, and out of sight behind the bank's face between them (pacerDraw.ts; the lead's ruling (a), 11-21).
 */
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { pacerOff, pacerReplace, pacerX, type Pacer } from '../pacer.ts';
import { drawPacer, pacerWaters, type PacerWater } from '../pacerDraw.ts';

/** how near the dock (px, along its way) he counts as there: the exit totem's touch */
const DOCKED = 80;

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
    this.clock += dt;
    if (!this.verdict && (p.x - P.x1) * P.dir >= -DOCKED && p.y >= P.yMin) this.verdict = { won: this.clock < P.seconds, boat: P.seconds, him: Math.round(this.clock * 10) / 10 };
  }

  respawn(host: PieceHost) {
    if (this.verdict) return;
    const p = host.player;
    this.clock = this.clock !== null && pacerOff(this.pacer, p.x, p.y) ? pacerReplace(this.pacer, p.x) : null;
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
