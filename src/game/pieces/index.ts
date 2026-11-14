/**
 * pieces/index — the registry of runtime stage pieces and the ONE loop the engine runs them through (stagePiece.types.ts; ENGINE-678 W0).
 * A new runtime piece (a rolling nut, a sweeper's shadow, a chase, a cover's tint, a vine snake) is a `PieceKind` added to PIECE_KINDS
 * in its own file under pieces/: the engine is not edited for it. Every kind is asked to start at every stage's start; a stage whose
 * data lays none of it gets no piece. The engine then, each fixed step, steps every piece (stepPieces) and asks each whether it hurts
 * him (piecesHurt); each frame it draws every piece on each layer it names (drawPieces); on a respawn it puts each back (respawnPieces).
 *
 * Order is the registry's order, every step and every layer, so two pieces never race.
 */
import type { GeneratedStage } from '../stageGenerator.ts';
import type { PieceHost, PieceHurt, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { RIDE_PIECE } from './ridePiece.ts';

/** every kind of runtime piece, in the order they step and draw */
export const PIECE_KINDS: PieceKind[] = [RIDE_PIECE];

/** the stage's pieces: each kind its data lays, in the registry's order */
export function startPieces(stage: GeneratedStage, host: PieceHost): StagePiece[] {
  const out: StagePiece[] = [];
  for (const k of PIECE_KINDS) {
    const piece = k.start(stage, host);
    if (piece) out.push(piece);
  }
  return out;
}

export function stepPieces(pieces: readonly StagePiece[], dt: number, host: PieceHost): void {
  for (const piece of pieces) piece.step(dt, host);
}

/** the first hurt any piece deals him this step (the engine's damagePlayer gives him his safe time after it), or null */
export function piecesHurt(pieces: readonly StagePiece[], host: PieceHost): PieceHurt | null {
  for (const piece of pieces) {
    const h = piece.hurts?.(host);
    if (h) return h;
  }
  return null;
}

/** draw every piece that draws on this layer (a piece is never asked to draw on a layer it does not name) */
export function drawPieces(pieces: readonly StagePiece[], ctx: CanvasRenderingContext2D, layer: PieceLayer, host: PieceHost): void {
  for (const piece of pieces) if (piece.draw && piece.layers.includes(layer)) piece.draw(ctx, layer, host);
}

export function respawnPieces(pieces: readonly StagePiece[], host: PieceHost): void {
  for (const piece of pieces) piece.respawn?.(host);
}
