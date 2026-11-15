/**
 * pieces/padPiece — SINKING PADS (ENG-22; 2-2.md NEW 1 and 2) on the piece hook: every platform with a `pad` (ride.ts Pad; gen2/rideLay.ts
 * layPads lays them) is stepped here each fixed step, at the point the engine steps its carriers (just before its moving-platform and
 * drifting-log loops):
 *   'weight'  its count (ride.ts newPad / stepPad) runs while he stands on it and runs back when he leaves; read through its size's clock
 *   'beat'    it reads the stage's clock itself (beatBrick.ts brickNow 'gone'), so a row in step sinks and rises together
 * While the clock reads 'on' the pad is down: `broken`, so no floor (the engine's collision), and a petal riding it is hidden with it
 * (ridePickups.ts rideHidden). The clock's warning is its shiver, drawn by the look slot (riverArt.ts drawPad), so it never sinks
 * unwarned. A respawn puts every pad back up (a required one is whole again, STAGE-RULES).
 *
 * THE CROWN LILY (2-2.md beat 11; rideLay 'crown', a platform drawn as `art: 'crownLily'`): a floor that never sinks, drawn here with its
 * flower closed until he first stands on it, then open for the rest of the stage, a respawn included (riverArt.ts drawCrownLily).
 *
 * Nothing here names a stage: what a pad is, its clock and its look come from the stage's data (generalitycheck).
 */
import { beatOf, type Beat } from '../clock.ts';
import { brickNow, type BrickNow } from '../beatBrick.ts';
import { newPad, padNow, stepPad, type PadState } from '../ride.ts';
import { drawCrownLily, drawPad } from '../riverArt.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';

interface Run { plat: Platform; beat: Beat | null; count: PadState | null; now: BrickNow }

/** what a pad shows now (its tell and whether it holds him), for the drawer and the bots; undefined for a platform that is no pad */
const NOW = new WeakMap<Platform, BrickNow>();
export const padShows = (plat: Platform): BrickNow | undefined => NOW.get(plat);
/** a weight pad's count now (s he has stood on it, ride.ts PadState), for the bots' read of how long it has left; null for a beat pad */
const COUNT = new WeakMap<Platform, { count: PadState; beat: Beat }>();
export const padCount = (plat: Platform): { stood: number; holds: number } | null => {
  const c = COUNT.get(plat);
  return c ? { stood: c.count.stood, holds: c.beat.ons[0] ?? c.beat.period } : null;
};

/** a crown lily, and whether its flower has opened (he has stood on it) */
interface Crown { plat: Platform; open: boolean }
/** whether a crown lily's flower is open (for the bots' and tests' read); undefined for a platform that is none */
const OPEN = new WeakMap<Platform, boolean>();
export const crownOpen = (plat: Platform): boolean | undefined => OPEN.get(plat);

class PadPiece implements StagePiece {
  readonly kind = 'pad';
  readonly layers: readonly PieceLayer[] = ['world'];
  constructor(private readonly runs: Run[], private readonly crowns: Crown[] = []) {}

  step(dt: number, host: PieceHost) {
    const p = host.player;
    for (const c of this.crowns) {
      if (!c.open && !!p?.grounded && host.standingOnId === c.plat.id) c.open = true;
      OPEN.set(c.plat, c.open);
    }
    for (const r of this.runs) {
      const pad = r.plat.pad!;
      if (r.count && r.beat) {
        stepPad(r.count, r.beat, !!p?.grounded && host.standingOnId === r.plat.id, dt);
        r.now = padNow(r.count, r.beat);
      } else r.now = brickNow('gone', host.clock.read(pad.clock, pad.shift));
      r.plat.broken = !r.now.solid;
      NOW.set(r.plat, r.now);
    }
  }

  respawn(host: PieceHost) {
    for (const r of this.runs) if (r.count) r.count.stood = 0;
    this.step(0, host);
  }

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: PieceHost) {
    const v = host.view;
    const x0 = v.x - 200, x1 = v.x + v.w / v.zoom + 200;
    for (const c of this.crowns) {
      const pl = c.plat;
      if (pl.x + pl.width < x0 || pl.x > x1) continue;
      drawCrownLily(ctx, pl.x + pl.width / 2, pl.y + 8, pl.width * 1.15, host.t, c.open);
    }
    for (const r of this.runs) {
      const pl = r.plat;
      if (pl.x + pl.width < x0 || pl.x > x1) continue;
      drawPad(ctx, pl.pad!.look, pl.x + pl.width / 2, pl.y + 8, pl.width * 1.15, host.t, r.now, pl.id % 2 === 1);
    }
  }
}

export const PAD_PIECE: PieceKind = {
  id: 'pad',
  start(stage: GeneratedStage, host) {
    const pads = host.platforms.filter((pl) => !!pl.pad);
    const crowns = host.platforms.filter((pl) => pl.art === 'crownLily').map((plat): Crown => ({ plat, open: false }));
    if (!pads.length && !crowns.length) return null;
    const defs = new Map((stage.clocks ?? []).map((d) => [d.id, d]));
    const runs = pads.map((plat): Run => {
      const pad = plat.pad!;
      const def = defs.get(pad.clock);
      if (!def) throw new Error(`pad ${plat.id}: no clock named ${pad.clock} in this stage`);
      if (pad.by === 'beat') return { plat, beat: null, count: null, now: { solid: true, hurts: false, tell: 0 } };
      const beat = beatOf(def, host.easy);
      const count = newPad();
      COUNT.set(plat, { count, beat });
      return { plat, beat, count, now: padNow(count, beat) };
    });
    // (each pad as its clock has it now: a beat row may start down; the player may not be made yet, so no count is stepped here)
    for (const r of runs) {
      if (!r.count) r.now = brickNow('gone', host.clock.read(r.plat.pad!.clock, r.plat.pad!.shift));
      r.plat.broken = !r.now.solid;
      NOW.set(r.plat, r.now);
    }
    for (const c of crowns) OPEN.set(c.plat, false);
    return new PadPiece(runs, crowns);
  },
};
