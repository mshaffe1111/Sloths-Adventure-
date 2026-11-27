/**
 * gen2/spore — World 3's spore puff as one gen2 zone brick (ENG-SPORE, R-165.449): a section's SectionZone 'spore' on a piece lays
 * zones.ts's spore cloud over it, on zones.ts SPORE's beat (the recipe is data there; 3-1: 6.4 s, warn 1.0, active 2.2), its mushroom
 * at the piece's middle. In a glowworms' dark (gen2/dark.ts glowZone) the puff is the light of the shelf it stands on: a clocked light
 * (ADR-004) that glows over the puff's warning and its cloud, so a drop onto the shelf is made on its light.
 * No stage, seed or x lives here: every fact is the laid piece's.
 */
import type { Platform } from '../types.ts';
import { SPORE, SPORE_BOX, sporeClock, type Zone } from '../zones.ts';
import type { SectionZone } from './types.ts';

type Light = NonNullable<Zone['lights']>[number];

/** the spore cloud over `shelf` (its beat's offset from `roll`, 0..1, to a tenth of a second); the warn is laid as asked, so levelCheck's
 *  'warning too short' judges it (no clamp hides a bad one) */
export function sporeZoneOn(shelf: Pick<Platform, 'x' | 'y' | 'width'>, z: Omit<Extract<SectionZone, { kind: 'spore' }>, 'on' | 'kind'>, roll: () => number): Zone {
  const period = z.period ?? SPORE.period, warn = z.warn ?? SPORE.warn, active = z.active ?? SPORE.active;
  // (a patch on part of its piece: `span`, a share of it; none, the whole piece)
  const [a, b] = z.span ?? [0, 1];
  const x0 = Math.round(shelf.x + shelf.width * a), x1 = Math.round(shelf.x + shelf.width * b);
  return {
    kind: 'spore', x0: z.span ? x0 : shelf.x, x1: z.span ? x1 : shelf.x + shelf.width, top: shelf.y - SPORE_BOX.up, bottom: shelf.y + SPORE_BOX.down, baseY: shelf.y, dir: 1,
    period, warn, active, offset: Math.round(roll() * period * 10) / 10, force: 0, emit: [Math.round(z.span ? (x0 + x1) / 2 : shelf.x + shelf.width / 2)],
  };
}

/** the puff's light over its mushroom nearest `landX` (`up` px over its ground, radius `r`), on the puff's clock */
export function puffLight(puff: Zone, landX: number, up: number, r: number): Light {
  const ex = (puff.emit ?? [landX]).reduce((a, b) => (Math.abs(b - landX) < Math.abs(a - landX) ? b : a));
  return { x: ex, y: puff.baseY - up, r, clock: sporeClock(puff) };
}

/** the spore puff that stands on the ground at (x, y), if any */
export const puffAt = (zones: readonly Zone[], x: number, y: number): Zone | undefined =>
  zones.find((q) => q.kind === 'spore' && !!q.emit?.length && x >= q.x0 - 1 && x <= q.x1 + 1 && Math.abs(q.baseY - y) <= 4);
