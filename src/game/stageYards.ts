/**
 * Enemy yards with relief.
 *
 * A fight stage used to be flat ground with animals standing on it. A yard is now one of six places, each with its own shape: open ground under
 * two branches, a mound to climb, a sunken pit, a log bridge with an animal on every span, tiers, or a floor with ledges. Animals are placed in a
 * cluster at the set-piece moment and the shapes that lead in and out are calm, so a fight stage reads as moments and rests.
 */
import type { Gen } from './stageGenerator.ts';

export type YardVariant = 'plain' | 'mound' | 'sunken' | 'bridge' | 'tiers' | 'ledges';
export const YARD_VARIANTS: readonly YardVariant[] = ['plain', 'mound', 'sunken', 'bridge', 'tiers', 'ledges'];

/** the animals stand no closer than this to the edge of the arena's ground (a pit's take-off, a step, a flag may follow right there) */
const PAD = 150;
const SEG = 130;

/** put `count` animals along the flat [x0, x1] at height y, each with a patch of its own */
function cluster(gen: Gen, x0: number, x1: number, y: number, count: number) {
  const w = (x1 - x0) / count;
  for (let i = 0; i < count; i++) {
    const a = x0 + i * w + 8;
    const b = x0 + (i + 1) * w - 8;
    gen.ground((a + b) / 2, y, a, b);
  }
}

/** a branch over the middle of the arena with a flower on it: somewhere to be while the animals are below */
function ledge(gen: Gen, x: number, y: number, w = 140, rise = 88) {
  gen.plat({ x: x - w / 2, y: y - rise, width: w, height: 26, type: 'solid' }, 'tier');
  gen.flower(x, y - rise - 36);
}

export function buildYard(gen: Gen, variant: YardVariant, count: number): string {
  const startG = gen.g;
  // not enough room above or below: fall back to the open yard
  if (variant === 'mound' || variant === 'tiers') {
    if (gen.g - 3 * 56 < 280) variant = 'plain';
  }
  if (variant === 'sunken' && !gen.roomBelow(2 * 52)) variant = gen.g - 3 * 56 >= 280 ? 'mound' : 'plain';

  switch (variant) {
    case 'mound': {
      const n = gen.ri(1, 2);
      gen.flat(gen.rr(90, 130));
      const hs: number[] = [];
      for (let i = 0; i < n; i++) { hs.push(gen.rr(36, 52)); gen.up(hs[i]); gen.flat(gen.rr(60, 90)); }
      const len = 2 * 110 + count * SEG;
      const s = gen.flat(len, { yard: true });
      cluster(gen, s.x0 + 110, s.x1 - 110, gen.g, count);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.28, gen.g, 130, 80);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.74, gen.g, 140, 90);
      for (let i = n - 1; i >= 0; i--) { gen.down(hs[i]); gen.flat(gen.rr(60, 90)); }
      realign(gen, startG);
      break;
    }
    case 'sunken': {
      const n = gen.ri(1, 2);
      gen.flat(gen.rr(90, 130));
      const hs: number[] = [];
      for (let i = 0; i < n; i++) { hs.push(gen.rr(36, 50)); gen.down(hs[i]); gen.flat(gen.rr(60, 90)); }
      const len = 2 * 110 + count * SEG;
      const s = gen.flat(len, { yard: true });
      cluster(gen, s.x0 + 110, s.x1 - 110, gen.g, count);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.3, gen.g, 130, 84);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.72, gen.g, 130, 78);
      for (let i = n - 1; i >= 0; i--) { gen.up(hs[i]); gen.flat(gen.rr(60, 90)); }
      realign(gen, startG);
      break;
    }
    case 'bridge': {
      // a log bridge in sections, an animal on every one, a hop between
      const n = Math.min(3, Math.max(2, count - 1));
      gen.ensure(150);
      gen.closeBank();
      for (let i = 0; i < n; i++) {
        const bw = gen.rr(330, 390);
        gen.plat({ x: gen.cx, y: gen.g, width: bw, height: 26, type: 'solid' }, 'bridge');
        gen.ground(gen.cx + bw / 2, gen.g, gen.cx + 120, gen.cx + bw - 120);
        gen.spots.push({ x0: gen.cx, x1: gen.cx + bw, y: gen.g, yard: true, optional: true });
        gen.cx += bw;
        if (i < n - 1) {
          const hop = gen.hopLen(0, gen.rr(0.4, 0.55));
          gen.arc(gen.cx - 30, gen.cx + hop + 30, gen.g - 36, 70, 3);
          gen.cx += hop;
        }
      }
      gen.openBank();
      gen.flat(gen.rr(110, 160));
      break;
    }
    case 'tiers': {
      gen.flat(gen.rr(90, 130));
      const d1 = gen.rr(50, 64);
      const d2 = gen.rr(40, 54);
      gen.up(d1);
      const a = gen.flat(2 * 110 + SEG * Math.max(1, count - 1), { yard: true });
      cluster(gen, a.x0 + 110, a.x1 - 110, gen.g, Math.max(1, count - 1));
      ledge(gen, a.x0 + (a.x1 - a.x0) * 0.4, gen.g, 130, 82);
      gen.up(d2);
      const b = gen.flat(2 * 100 + SEG, { yard: true, perch: true, optional: true });
      cluster(gen, b.x0 + 100, b.x1 - 100, gen.g, 1);
      gen.row(b.x0 + 70, b.x1 - 70, gen.g - 90, 3);
      gen.down(d2); gen.flat(gen.rr(60, 90));
      gen.down(d1); gen.flat(gen.rr(80, 120));
      realign(gen, startG);
      break;
    }
    case 'ledges': {
      const len = 2 * PAD + count * SEG + 160;
      const s = gen.flat(len, { yard: true });
      cluster(gen, s.x0 + PAD, s.x1 - PAD, gen.g, count);
      ledge(gen, s.x0 + len * 0.22, gen.g, 130, 80);
      ledge(gen, s.x0 + len * 0.5, gen.g, 140, 88);
      ledge(gen, s.x0 + len * 0.78, gen.g, 130, 82);
      break;
    }
    default: {
      const len = 2 * PAD + count * SEG;
      const s = gen.flat(len, { yard: true });
      cluster(gen, s.x0 + PAD, s.x1 - PAD, gen.g, count);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.35, gen.g, 130, 80);
      ledge(gen, s.x0 + (s.x1 - s.x0) * 0.72, gen.g, 140, 90);
      // a row of flowers on the way in, the calm before the animals
      gen.row(s.x0 + 30, s.x0 + PAD - 30, gen.g - 32, 3);
      variant = 'plain';
    }
  }
  return variant;
}

/** steps put the ground back at the height the piece began at (up and down are each rolled, so they may differ by a few px: close the difference) */
function realign(gen: Gen, g0: number) {
  const d = gen.g - g0;
  if (Math.abs(d) < 1) return;
  if (d > 0) gen.up(d); else gen.down(-d);
  gen.flat(gen.rr(60, 90));
}
