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
 * SNAP STONES (ENG-25; 2-5.md NEW 1): a beat pad whose `on` is 'bites' (gen2/rideLay.ts lays a 'snap' row). It is a floor always, and
 * while its clock reads 'on' it hurts him if he stands on it (`hurts`: a heart that HOLDS him, a straight jolt, never a knock into the
 * river). Its jaw is drawn by the count of its bar (beatBrick.ts brickCount; snapStoneArt.ts): open a notch on one, two, three, the third
 * ending in the warning's creak, and shut on four, the bite. Nothing bites without its tell: every 'on' comes out of a 'warn' (clock.ts).
 *
 * Nothing here names a stage: what a pad is, its clock and its look come from the stage's data (generalitycheck).
 */
import { beatOf, type Beat } from '../clock.ts';
import { brickCount, brickNow, type BrickNow } from '../beatBrick.ts';
import { drawSnapStone, warmSnapStone } from '../snapStoneArt.ts';
import { newPad, padNow, stepPad, type PadState } from '../ride.ts';
import { drawCrownLily, drawPad } from '../riverArt.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { PieceHost, PieceHurt, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';

/** `bar`: a snap stone's own clock made ready (its count of the bar, `n`, and the seconds into its bite, `into`, for the jaw) */
interface Run { plat: Platform; beat: Beat | null; count: PadState | null; now: BrickNow; bar: Beat | null; n: number; into: number; u: number }

/** what a pad shows now (its tell and whether it holds him), for the drawer and the bots; undefined for a platform that is no pad */
const NOW = new WeakMap<Platform, BrickNow>();
export const padShows = (plat: Platform): BrickNow | undefined => NOW.get(plat);
/** a weight pad's count now (s he has stood on it, ride.ts PadState), for the bots' read of how long it has left; null for a beat pad */
const COUNT = new WeakMap<Platform, { count: PadState; beat: Beat }>();
/** a snap stone's count of its bar now (1-4; 4 = biting), for the drawer's notch, the bots' read and the tests; undefined for none */
const COUNT_OF = new WeakMap<Platform, number>();
export const snapCount = (plat: Platform): number | undefined => COUNT_OF.get(plat);
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
      } else this.read(r, host);
      r.plat.broken = !r.now.solid;
      NOW.set(r.plat, r.now);
    }
  }

  /** a beat pad from the stage's clock: what it does on 'on' (sink, or bite), and a snap stone's count of its bar */
  read(r: Run, host: PieceHost) {
    const pad = r.plat.pad!;
    const rd = host.clock.read(pad.clock, pad.shift);
    r.now = brickNow(pad.on ?? 'gone', rd);
    if (r.bar) {
      r.n = brickCount(r.bar, rd);
      r.into = rd.phase === 'on' ? rd.into : 0;
      r.u = rd.phase === 'on' ? rd.u : 0;
      COUNT_OF.set(r.plat, r.n);
    }
  }

  /**
   * a snap stone biting under him: a heart that holds him where he stands (PieceHurt.hold), once its bite has him; null otherwise. It has
   * him when he stands on its top with his MIDDLE over it (ENG-25c; the lead's ruling 11-19): his feet stand 13 px past a floor's end, so
   * over 30 px of water he can stand across two stones, and the one his toes barely touch never bites him (the wave toy's straddle)
   */
  hurts(host: PieceHost): PieceHurt | null {
    const p = host.player;
    if (!p?.grounded) return null;
    for (const r of this.runs) {
      const q = r.plat;
      if (r.bar && r.now.hurts && Math.abs(p.y - q.y) <= 1 && p.x >= q.x && p.x <= q.x + q.width) return { amount: 1, fromX: q.x + q.width / 2, hold: true };
    }
    return null;
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
      drawCrownLily(ctx, pl.x + pl.width / 2, pl.y + 8, pl.width, host.t, c.open);
    }
    for (const r of this.runs) {
      const pl = r.plat;
      if (pl.x + pl.width < x0 || pl.x > x1) continue;
      if (r.bar) { drawSnapStone(ctx, pl.x, pl.y, pl.width, r.n, r.now.hurts, r.now.tell, r.into, r.u, host.t); continue; }
      // (the painting's top is laid on the floor exactly: riverArt pondBox, FIX-284; it was drawn 1.15x the floor, its rim over the water)
      drawPad(ctx, pl.pad!.look, pl.x + pl.width / 2, pl.y + 8, pl.width, host.t, r.now, pl.id % 2 === 1);
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
      if (pad.by === 'beat') {
        const bites = pad.on === 'bites';
        if (bites) warmSnapStone();
        return { plat, beat: null, count: null, now: { solid: true, hurts: false, tell: 0 }, bar: bites ? beatOf(def, host.easy) : null, n: 1, into: 0, u: 0 };
      }
      const beat = beatOf(def, host.easy);
      const count = newPad();
      COUNT.set(plat, { count, beat });
      return { plat, beat, count, now: padNow(count, beat), bar: null, n: 1, into: 0, u: 0 };
    });
    const piece = new PadPiece(runs, crowns);
    // (each pad as its clock has it now: a beat row may start down; the player may not be made yet, so no count is stepped here)
    for (const r of runs) {
      if (!r.count) piece.read(r, host);
      r.plat.broken = !r.now.solid;
      NOW.set(r.plat, r.now);
    }
    for (const c of crowns) OPEN.set(c.plat, false);
    return piece;
  },
};
