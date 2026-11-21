/**
 * pacerDraw — the pacer's look (pieces/pacerPiece.ts): its painted frames by inventory id (Pacer.art, the world's PacerRow.art: 2-7's
 * mail boat, w2-next#mailBoat and #mailBoatB, two rowing frames, w2NextArt.ts), bow first the way it runs (the art's bow points left).
 * Waiting, it holds its first frame; running, it rows. Nothing is drawn until its sheet is in: no code-drawn stand-in (the lead's rule
 * for a shipped stage).
 *
 * It passes BEHIND the banks (the lead's ruling (a), 11-21): drawn on layer 'under' (behind the ground's earth, so a bank's painted face
 * and lip cover it) and only over the race leg's water (`waters`: each river's x0..x1), its waterline on THAT river's surface. Over a
 * bank it is out of sight (its top stands ~100 px over its waterline, a bank's top only 42-120 px over the lane: behind the earth alone
 * its top would glide over the grass); it changes height only there, so it is back on the next river's water, never sunk in a higher
 * river (the leg's rivers stand up to 80 px apart: the lane, the lowest, is only where it waits and docks with no water under it).
 */
import type { Pacer } from './pacer.ts';
import { drawW2Next, w2NextFrame, W2_NEXT_SCALE } from './w2NextArt.ts';

/** s a rowing frame holds (two frames: a stroke every 0.7 s) */
export const PACER_STROKE = 0.35;
/** the share of a boat frame's height down to its waterline (measured from the cut's alpha and its water's blue, 11-21: the ripples
 *  start at 0.80, the hull meets the water at 0.85) */
export const PACER_WATERLINE = 0.85;

/** the frame it shows `clock` s after it set off (0: waiting, the first frame) */
export const pacerFrame = (p: Pacer, clock: number): string => p.art[clock > 0 ? Math.floor(clock / PACER_STROKE) % p.art.length : 0];

/** a stretch of water the pacer shows over: a river's x0..x1 on its leg, and its surface */
export interface PacerWater { x0: number; x1: number; surfaceY: number }

/** the race leg's water (the stage's rivers, RiverZone): every river across its way with its surface on the leg (at or below `yMin`,
 *  the leg's highest top less a hop; no lower than the lane, its lowest surface), in x order */
export function pacerWaters(p: Pacer, rivers: ReadonlyArray<PacerWater> | undefined): PacerWater[] {
  const lo = Math.min(p.x0, p.x1), hi = Math.max(p.x0, p.x1);
  return (rivers ?? [])
    .filter((r) => r.x1 > lo && r.x0 < hi && r.surfaceY >= p.yMin && r.surfaceY <= p.lane + 1)
    .map((r) => ({ x0: r.x0, x1: r.x1, surfaceY: r.surfaceY }))
    .sort((a, b) => a.x0 - b.x0);
}

/** its box at `x` (world px): the frame's size at the sheet's scale, its waterline on `surface` (the lane unless a river's is given) */
export function pacerBox(p: Pacer, x: number, clock: number, surface = p.lane): { x: number; y: number; w: number; h: number } | undefined {
  const f = w2NextFrame(pacerFrame(p, clock));
  if (!f) return undefined;
  const w = f.w / W2_NEXT_SCALE, h = f.h / W2_NEXT_SCALE;
  return { x: x - w / 2, y: surface - h * PACER_WATERLINE, w, h };
}

/** what of it shows at `x`: one box per river it is over, clipped to that river's water (none over a bank); a pacer with no water on its
 *  leg (none is laid so) shows whole on its lane */
export function pacerShown(p: Pacer, x: number, clock: number, waters: readonly PacerWater[]): Array<{ box: { x: number; y: number; w: number; h: number }; clip?: { x0: number; x1: number } }> {
  if (!waters.length) {
    const box = pacerBox(p, x, clock);
    return box ? [{ box }] : [];
  }
  const out: Array<{ box: { x: number; y: number; w: number; h: number }; clip: { x0: number; x1: number } }> = [];
  for (const wt of waters) {
    const box = pacerBox(p, x, clock, wt.surfaceY);
    if (!box || box.x + box.w <= wt.x0 || box.x >= wt.x1) continue;
    out.push({ box, clip: { x0: Math.max(wt.x0, box.x), x1: Math.min(wt.x1, box.x + box.w) } });
  }
  return out;
}

export function drawPacer(ctx: CanvasRenderingContext2D, p: Pacer, x: number, clock: number, view: { x: number; y: number; w: number; h: number; zoom: number }, waters: readonly PacerWater[] = []): void {
  const id = pacerFrame(p, clock);
  for (const { box: b, clip } of pacerShown(p, x, clock, waters)) {
    // (off screen by more than its own length: nothing to draw)
    if (b.x > view.x + view.w / view.zoom + b.w || b.x + b.w < view.x - b.w) continue;
    if (!clip || (clip.x0 <= b.x && clip.x1 >= b.x + b.w)) {
      drawW2Next(ctx, id, b.x, b.y, b.w, b.h, p.dir > 0);
      continue;
    }
    // (part over the water, the rest behind the bank: only the water's part, cut at the river's end, which the bank's face covers)
    ctx.save();
    ctx.beginPath();
    ctx.rect(clip.x0, b.y - 4, clip.x1 - clip.x0, b.h + 8);
    ctx.clip();
    drawW2Next(ctx, id, b.x, b.y, b.w, b.h, p.dir > 0);
    ctx.restore();
  }
}
