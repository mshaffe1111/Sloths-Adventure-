/**
 * heroSwim — Pokey swimming (swim.ts), from Matt's swim sheets (reference/animation-sheets/pokey-swim/, packed by
 * tools/art/w6/swim/pack.py into src/assets/hero/pokey-swim.webp and heroSwimData.ts):
 *   tread   still in the water: upright, paddling, his head and shoulders out
 *   surf    swimming along the top: the crawl
 *   under   dived: the long glide, cheeks puffed
 *   first   the first time he swims (once a stage): the splash and the flail, then the grin
 * Every move is anchored at the waterline (ay) on the water's top, except the dive, anchored at the middle of his body. Drawn in the
 * reward coat he wears, and blinking while he cannot be hurt, as the standard hero is (heroSprite.ts). The water's veil in front of him
 * (calmWaterArt.ts) does the rest: what is under the waterline reads as under it.
 *
 * Its own file (heroSprite.ts only calls drawSwimHero), so the hero's other moves are untouched. False until the sheet has loaded: the
 * hero is then drawn as usual, standing in the water.
 */
import { trackAtlas } from './atlasLoader.ts';
import { heroCoatSheet, HERO_SPRITE_SCALE, HERO_UNITS } from './heroSprite.ts';
import { STD_STAND_H } from './heroStandardData.ts';
import { SWIM_MOVES, type SwimMoveName } from './heroSwimData.ts';
import { SWIM } from './swim.ts';
import type { PlayerState } from './types.ts';

export const SWIM_ATLAS_URL = new URL('../assets/hero/pokey-swim.webp', import.meta.url).href;
/** world units per sheet pixel: the sheet is at the standard hero's scale (worked out when drawn: heroSprite.ts imports this file) */
const unit = () => (HERO_UNITS * HERO_SPRITE_SCALE) / STD_STAND_H;

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    SWIM_ATLAS_URL,
    () => {
      ready = true;
    },
    () => {
      img = null;
    },
    () => {
      img = null;
      ready = false;
    },
  );
}
/** whether the swim sheet has loaded (starts the load) */
export function swimAtlasReady(): boolean {
  load();
  return ready && !!img;
}

/** which move and frame shows: the first-swim moment while it plays, the dive when he is mostly under, the crawl moving, else treading */
export function swimFrame(p: Pick<PlayerState, 'vx' | 'swim'>, time: number): { move: SwimMoveName; i: number } {
  const s = p.swim!;
  if (s.first !== undefined) {
    const m = SWIM_MOVES.first;
    return { move: 'first', i: Math.min(m.at.length - 1, Math.floor(s.first * m.fps)) };
  }
  const move: SwimMoveName = s.under > 0.5 ? 'under' : Math.abs(p.vx) > 30 ? 'surf' : 'tread';
  const m = SWIM_MOVES[move];
  return { move, i: Math.floor(time * m.fps) % m.at.length };
}

/** draws Pokey swimming; false when he is not in the water or the sheet is still loading */
export function drawSwimHero(ctx: CanvasRenderingContext2D, p: PlayerState, time: number): boolean {
  if (!p.swim || !swimAtlasReady()) return false;
  const { move, i } = swimFrame(p, time);
  const m = SWIM_MOVES[move];
  const [fx, fy] = m.at[i];
  // the waterline on the water's top, with a slow bob; the dive about the middle of his body
  // (the crawl a little lower: its waterline is drawn high on his back, and he should lie in the water, not on it)
  const y = move === 'under' ? p.y - SWIM.float + 16 : p.swim.surfaceY + (move === 'surf' ? 8 : 0) + Math.sin(time * 2.4) * 1.5;
  ctx.save();
  ctx.translate(p.x, y);
  ctx.scale(p.facing, 1);
  if (p.invincibleTimer > 0 && Math.floor(time * 24) % 2 === 0) ctx.globalAlpha *= 0.55;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  const k = unit();
  ctx.drawImage(heroCoatSheet(img!), fx, fy, m.w, m.h, -m.ax * k, -m.ay * k, m.w * k, m.h * k);
  ctx.restore();
  return true;
}

/** his head's height while swimming (for the bubbles): about a third of the way from the top of the frame drawn */
export function swimHeadY(p: PlayerState): number {
  if (!p.swim) return p.y - HERO_UNITS * HERO_SPRITE_SCALE;
  return p.swim.under > 0.5 ? p.y - SWIM.float + 10 : p.swim.surfaceY - 30;
}
