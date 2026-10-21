/**
 * Painted Sky Sovereign (world 4 boss, the harpy eagle matriarch of the cloud-forest cliffs) from the Gemini pose sheets. A switch like
 * the other painted creatures: `?sovereign=sprite` / `?sovereign=classic`, `localStorage.sloth_sovereign = 'sprite'`, DEFAULT_SPRITE_SOVEREIGN otherwise.
 *
 * She hovers, so most of the time she beats her wings (a down / glide / up / glide cycle). Poses follow the boss brain: the climb
 * for the dive, the plunge and the crash, the feather throw, the banking low pass, the dazed crouch after a crash, hurt and the fall.
 * Flying frames are anchored at their bottom edge so she hangs at the height of the boss hit box.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { SOVEREIGN_FRAMES } from './sovereignAtlasData.ts';

export const DEFAULT_SPRITE_SOVEREIGN = true;
const FLAP = ['down', 'glide', 'up', 'glide'];

export const sovereignSprite = createPaintedBoss({
  param: 'sovereign',
  defaultOn: DEFAULT_SPRITE_SOVEREIGN,
  url: new URL('../assets/enemies/sovereign-atlas.webp', import.meta.url).href,
  frames: SOVEREIGN_FRAMES,
  k: 0.85,
  pick: ({ b, br, m, moving, time }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.6 ? 'hurt' : 'dead';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = 'alert';
    else if (br.state === 'tell') {
      if (m?.pose === 'spit') name = 'alert';
      else if (br.move === 'diveBomb') name = 'up';
      else if (br.move === 'snatch') name = 'divestart';
      else name = 'prep';
    } else if (br.state === 'act') {
      if (br.move === 'diveBomb') name = br.air > 30 ? 'diveplunge' : 'impact';
      else if (br.move === 'featherVolley') name = 'shards';
      else if (br.move === 'snatch') name = 'talon';
      else if (br.move === 'talonRake') name = 'beak';
      else name = 'bank';
    } else if (br.state === 'rec') {
      if (br.move === 'diveBomb') name = 'impact';
      else if (br.move === 'featherVolley') name = 'alert';
      else if (br.move === 'skySweep') name = 'evasive';
      else if (br.move === 'snatch') name = 'snatch';
      else if (br.move === 'talonRake') name = 'beak';
      else name = FLAP[Math.floor(time * 6) % FLAP.length];
    } else name = FLAP[Math.floor(time * (moving ? 10 : 6.5)) % FLAP.length];
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
