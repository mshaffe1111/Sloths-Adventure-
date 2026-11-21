/**
 * pacerDraw — the pacer's look (pieces/pacerPiece.ts): its painted frames by inventory id (Pacer.art, the world's PacerRow.art: 2-7's
 * mail boat, w2-next#mailBoat and #mailBoatB, two rowing frames), on its lane. Nothing is drawn until its art is packed and loaded: no
 * code-drawn stand-in (the lead's rule for a shipped stage).
 */
import type { Pacer } from './pacer.ts';

export function drawPacer(_ctx: CanvasRenderingContext2D, _p: Pacer, _x: number, _clock: number, _view: { x: number; y: number; w: number; h: number; zoom: number }): void {}
