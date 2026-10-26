/**
 * dotRecord — the control test's recorder during Dot's netting flight (4-D). The engine's own 'p' lines are Pokey's, and in her flight
 * Pokey stands still off stage: a 4.9-minute 4-D run logged him parked at one spot, with no stretches, checkpoints or finish (QA,
 * 2026-10-26). While she flies, this turns her state and her flight's events (dotFlight.ts) into the recorder's lines instead. Pure: the
 * engine hands it her flight, what happened this step and the time, and sends what comes back to the recorder (playRecorder.ts).
 *
 *   'p' lines        her x, y, vx, vy, and her state: df flap (rising on one), dh hover, ds sink or cruise, dd drinking, dt tired (empty),
 *                    dw waiting (hanging still at the start or after coming back), dg through the gap; plus /L /R for the thumb's direction
 *   section          the stage's beat she is in ('Learn: flap', 'Twist: the downdraft', ...), with the same hysteresis as Pokey's
 *   checkpoint       a flower: `<x> f<id> drink` (she drank there first), `pass` (flew on past it), `respawn` (back at it after a life)
 *   scratch          a thorn: `<scratches so far> x<x>` ('hurt' still follows with the hearts left, from the engine)
 *   mist             down into the mist
 *   nectar           her nectar every 5 s: `<energy 0..100> flaps <in hand>`; 'empty' the moment it runs out
 *   silk             a piece of spider silk: `<found>/<all>`
 *   gap              the slow squeeze at the folded-letter gap begins
 *   finish           through the gap (the game time, s)
 *   'i' lines        flap, flap empty (asked with nothing left), hover tap, hover hold (the thumb kept down after a flap)
 */
import { DOT } from './dotFlightStage.ts';
import type { FlightEvent } from './dotFlight.ts';
import { SectionTrack } from './sectionTrack.ts';

/** what of her flight the log reads (DotFlight) */
export interface DotView {
  x: number;
  y: number;
  vx: number;
  vy: number;
  energy: number;
  flaps: number;
  sinceFlap: number;
  hoverT: number;
  hovering: boolean;
  sipping: number;
  tired: boolean;
  waiting: boolean;
  through: boolean;
  scratches: number;
  respawns: number;
  checkpoint: { x: number; y: number };
  silkGot: { size: number };
  stage: {
    beats: ReadonlyArray<readonly [number, number, string]>;
    flowers: ReadonlyArray<{ id: number; x: number; y: number; face: -1 | 1 }>;
    silk: ReadonlyArray<unknown>;
  };
}

/** a flap's rise: after a flap, while she is still going up on it */
const FLAP_SHOWN = 0.45;
export const NECTAR_EVERY = 5;

/** her state code for the 'p' line (without the thumb's direction) */
export function dotState(f: DotView): string {
  if (f.through) return 'dg';
  if (f.sipping >= 0) return 'dd';
  if (f.waiting) return 'dw';
  if (f.tired || f.energy <= 0) return 'dt';
  if (f.sinceFlap < FLAP_SHOWN && f.vy < 0) return 'df';
  if (f.hovering) return 'dh';
  return 'ds';
}

export type DotLine =
  | { k: 'p'; x: number; y: number; vx: number; vy: number; state: string; section: string }
  | { k: 'e'; what: string; detail?: string | number }
  | { k: 'i'; name: string; arg?: string };

export class DotLog {
  private track = new SectionTrack();
  private nectarAt = -1e9;
  private respawns = 0;
  private wasHold = false;

  /**
   * One step of her flight: `ev` what happened in it (DotRun.lastEvents), `held` the thumb's direction (-1, 0, 1) and whether it is down
   * (jumpHeld), `t` the game time (s). The lines to log, in order; the 'p' line last.
   */
  step(f: DotView, ev: readonly FlightEvent[], held: { dir: number; down: boolean }, t: number): DotLine[] {
    const out: DotLine[] = [];
    const flower = (id: number) => f.stage.flowers.find((q) => q.id === id);
    const drank = new Set<number>();
    for (const e of ev) if (e.k === 'sip') drank.add(e.id);
    for (const e of ev) {
      switch (e.k) {
        case 'flap':
          out.push({ k: 'i', name: 'flap' });
          break;
        case 'flapEmpty':
          out.push({ k: 'i', name: 'flap', arg: 'empty' });
          break;
        case 'buzz':
          out.push({ k: 'i', name: 'hover', arg: 'tap' });
          break;
        case 'checkpoint': {
          const q = flower(e.id);
          out.push({ k: 'e', what: 'checkpoint', detail: `${Math.round(q?.x ?? f.x)} f${e.id} ${drank.has(e.id) ? 'drink' : 'pass'}` });
          drank.delete(e.id);
          break;
        }
        case 'sip':
          // (a first drink at a flower she had already flown past: it was her checkpoint before, so it is noted as the drink)
          if (drank.has(e.id)) {
            const q = flower(e.id);
            out.push({ k: 'e', what: 'checkpoint', detail: `${Math.round(q?.x ?? f.x)} f${e.id} drink` });
            drank.delete(e.id);
          }
          break;
        case 'hurt':
          out.push({ k: 'e', what: 'scratch', detail: `${f.scratches} x${Math.round(f.x)}` });
          break;
        case 'mist':
          out.push({ k: 'e', what: 'mist', detail: `x${Math.round(f.x)}` });
          break;
        case 'tired':
          out.push({ k: 'e', what: 'empty', detail: `x${Math.round(f.x)}` });
          break;
        case 'silk':
          out.push({ k: 'e', what: 'silk', detail: `${f.silkGot.size}/${f.stage.silk.length}` });
          break;
        case 'letter':
          out.push({ k: 'e', what: 'gap', detail: `x${Math.round(f.x)}` });
          break;
        case 'through':
          out.push({ k: 'e', what: 'finish', detail: Math.round(t) });
          break;
      }
    }
    // (back at her checkpoint after a life or the mist, after what sent her there: DotFlight.respawn counts them)
    if (f.respawns !== this.respawns) {
      this.respawns = f.respawns;
      const at = f.stage.flowers.find((q) => Math.abs(q.x - f.checkpoint.x) < 60 && Math.abs(q.y - f.checkpoint.y) < 60);
      out.push({ k: 'e', what: 'checkpoint', detail: at ? `${Math.round(at.x)} f${at.id} respawn` : `${Math.round(f.checkpoint.x)} start respawn` });
    }
    // the thumb kept down after a flap holds her in a hover: noted once each time it takes over
    const hold = f.hovering && !f.waiting && f.sipping < 0 && f.hoverT <= 0 && held.down && !f.through;
    if (hold && !this.wasHold) out.push({ k: 'i', name: 'hover', arg: 'hold' });
    this.wasHold = hold;
    if (t - this.nectarAt >= NECTAR_EVERY) {
      this.nectarAt = t;
      out.push({ k: 'e', what: 'nectar', detail: `${Math.round(Math.max(0, Math.min(DOT.energy, f.energy)))} flaps ${f.flaps.toFixed(1)}` });
    }
    const dir = held.dir < 0 ? '/L' : held.dir > 0 ? '/R' : '';
    const section = this.track.update(f.stage.beats, f.x, t);
    out.push({ k: 'p', x: f.x, y: f.y, vx: f.vx, vy: f.vy, state: dotState(f) + dir, section });
    return out;
  }
}
