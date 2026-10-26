/**
 * Painted Sky Sovereign (world 4 boss, the harpy eagle matriarch of the cloud-forest cliffs) from the Gemini pose sheets. A switch like
 * the other painted creatures: `?sovereign=sprite` / `?sovereign=classic`, `localStorage.sloth_sovereign = 'sprite'`, DEFAULT_SPRITE_SOVEREIGN otherwise.
 *
 * She hovers, so most of the time she beats her wings (a down / glide / up / glide cycle). Poses follow the boss brain: the climb
 * for the dive, the plunge and the crash, the feather throw, the banking low pass, the dazed crouch after a crash, hurt and the fall.
 * Flying frames are anchored at their bottom edge so she hangs at the height of the boss hit box.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { SOVEREIGN_FRAMES, SOVEREIGN_SCREECH_BEAK } from './sovereignAtlasData.ts';

export const DEFAULT_SPRITE_SOVEREIGN = true;
const FLAP = ['down', 'glide', 'up', 'glide'];

/**
 * Her screech (4-10): the frames it uses, kept here in one place. Matt chose two poses (2026-10-25): `screechPerch` on a rock or a
 * ledge (head thrown back, beak wide) and `screechAir` hovering (wings spread wide, beak open, talons out). They go into her atlas with
 * tools/art/w4/sovscreech/pack_screech.py; until they are there she screams in the open-beak `alert` pose. The shimmering air is drawn
 * at her beak (SOVEREIGN_SCREECH_BEAK, written by the pack step), and over the stand-in also her crest rising (sovereignArt.ts).
 */
export const SCREECH_FRAMES = { perch: 'screechPerch', air: 'screechAir', fallback: 'alert' } as const;

/** the frame she screams in: perched on a rock (or hovering), the new pose once it is in the atlas, else the stand-in */
export function screechFrame(perched: boolean): string {
  const n = perched ? SCREECH_FRAMES.perch : SCREECH_FRAMES.air;
  return SOVEREIGN_FRAMES[n] ? n : SCREECH_FRAMES.fallback;
}

/** world units per atlas pixel (her 2.3 scale and the sheet's k), for placing things on her frames */
const K_WORLD = 2.3 * 0.85;

/** her open beak while she screams, from her feet in world units (forward, up): measured off the frame she is in */
export function screechBeak(perched: boolean): { fwd: number; up: number; painted: boolean } {
  const n = screechFrame(perched);
  const bk = SOVEREIGN_SCREECH_BEAK[n];
  if (bk) return { fwd: bk.dx * K_WORLD, up: bk.dy * K_WORLD, painted: true };
  // the stand-in (`alert`): head high, beak open
  return { fwd: 150, up: 150, painted: false };
}

export const sovereignSprite = createPaintedBoss({
  param: 'sovereign',
  defaultOn: DEFAULT_SPRITE_SOVEREIGN,
  url: new URL('../assets/enemies/sovereign-atlas.webp', import.meta.url).href,
  frames: SOVEREIGN_FRAMES,
  k: 0.85,
  pick: ({ b, br, m, moving, time }) => {
    let name: string;
    // beaten, not killed (bossDefs.ts `ending`): she comes down hurt, hunches, and then stands with her wings folded
    if (br.state === 'dying') name = br.t < 0.6 ? 'hurt' : br.t < 1.6 ? 'shield' : 'idle';
    else if (br.move === 'screech' && (br.state === 'tell' || br.state === 'act')) name = br.state === 'tell' && br.t < 0.3 ? 'prep' : screechFrame(!!br.d.perched);
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = 'alert';
    else if (br.state === 'tell') {
      if (br.move === 'wingGust') name = 'launch';
      else if (m?.pose === 'spit') name = 'alert';
      else if (br.move === 'diveBomb') name = 'up';
      else if (br.move === 'snatch') name = 'divestart';
      else name = 'prep';
    } else if (br.state === 'act') {
      if (br.move === 'diveBomb') name = br.air > 30 ? 'diveplunge' : 'impact';
      else if (br.move === 'featherVolley') name = 'shards';
      else if (br.move === 'snatch') name = 'talon';
      else if (br.move === 'talonRake') name = 'beak';
      else if (br.move === 'wingGust') name = FLAP[Math.floor(time * 12) % FLAP.length];
      else name = 'bank';
    } else if (br.state === 'rec') {
      if (br.move === 'diveBomb') name = 'impact';
      else if (br.move === 'featherVolley') name = 'alert';
      else if (br.move === 'skySweep') name = 'evasive';
      else if (br.move === 'snatch') name = 'snatch';
      else if (br.move === 'talonRake') name = 'beak';
      else if (br.move === 'wingGust') name = 'prep';
      // hoarse after a screech: down on the floor, head low (the opening)
      else if (br.move === 'screech') name = 'beak';
      else name = FLAP[Math.floor(time * 6) % FLAP.length];
    } else name = FLAP[Math.floor(time * (moving ? 10 : 6.5)) % FLAP.length];
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
