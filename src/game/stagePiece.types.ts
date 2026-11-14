/**
 * stagePiece.types — the hook every runtime stage piece plugs into (ENGINE-678 W0 HOOKS; R-165.198: every piece is a node building
 * block). A piece is what a stage's data lays and the engine runs while he plays: a ride, a rolling nut, a sweeper's shadow, a chase,
 * a cover's calm tint. Before this hook each one was a hand-wired field, start, step and draw in engine.ts; now a piece is a `PieceKind`
 * in pieces/index.ts's registry, and the engine runs every registered kind through ONE loop: start at the stage's start, step each
 * fixed step, draw on the layers it names, put back as it was when he respawns, and ask whether it hurts him.
 *
 * A piece reads the engine only through `PieceHost` (live reads, no copies), never a stage id, a world number, a seed or an x of its
 * own (tools/engine/generalitycheck.ts): what it is and where it sits come from the stage's data.
 */
import type { StageClock } from './clock.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, PlayerState } from './types.ts';

/**
 * Where in the frame a piece draws (engine.ts render, in this order):
 *   'world'  in the world, after the platforms and the cast's traps, BEHIND him (a rolling nut, a shadow on the ground)
 *   'front'  in the world, OVER him, with the bushes (cover he stands in, a sweeper's shadow passing over)
 *   'screen' after the world transform, in screen pixels, with the chase and watch edges (a calm tint, an edge warning)
 */
export type PieceLayer = 'world' | 'front' | 'screen';
export const PIECE_LAYERS: readonly PieceLayer[] = ['world', 'front', 'screen'];

/** what a piece may read of the engine: live, each read the engine's own value now */
export interface PieceHost {
  /** the game's time (s): pauses and hit-stops hold it */
  readonly t: number;
  /** Easy is on (a piece stretches its tells and beats by its own row) */
  readonly easy: boolean;
  /** Pokey: a piece may move him (a ride carries its rider) but hurts him only by returning a `PieceHurt` */
  readonly player: PlayerState;
  /** the id of the platform he stands on, -1 for none */
  readonly standingOnId: number;
  /** the stage's platforms (the same array the engine collides with) */
  readonly platforms: readonly Platform[];
  /** the stage's one clock: every piece on a beat reads it (beat.ts, clock.ts) */
  readonly clock: Pick<StageClock, 'read'>;
  /** the view: its left and top in world px and its size in screen px, and the zoom (a 'screen' piece maps world to screen by it) */
  readonly view: { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly zoom: number };
}

/** a hurt a piece deals him this step: through the engine's one damagePlayer (its safe time, its knock away from `fromX`) */
export interface PieceHurt {
  amount: number;
  fromX: number;
}

/** one piece running on this stage */
export interface StagePiece {
  /** the kind's id (pieces/index.ts), for tests and the recorder */
  readonly kind: string;
  /** the layers it draws on; it is asked to draw only on these */
  readonly layers: readonly PieceLayer[];
  /** one fixed step (dt s) */
  step(dt: number, host: PieceHost): void;
  /** draw on one of its layers (ctx is in world px for 'world' and 'front', screen px for 'screen') */
  draw?(ctx: CanvasRenderingContext2D, layer: PieceLayer, host: PieceHost): void;
  /** he has respawned at a flag: put back what his run changed (a required piece is whole again, STAGE-RULES) */
  respawn?(host: PieceHost): void;
  /** does it hurt him now; null when not. Asked once a step, after every piece has stepped */
  hurts?(host: PieceHost): PieceHurt | null;
}

/** a kind of piece: reads the stage's data and starts its piece, or none when the stage lays none of it */
export interface PieceKind {
  readonly id: string;
  start(stage: GeneratedStage, host: PieceHost): StagePiece | null;
}
