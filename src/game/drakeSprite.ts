/**
 * Painted Magma Drake (world 9 boss, the armoured primeval lizard of the volcanic slopes) from the Gemini pose sheets. A switch like the
 * other painted creatures: `?drake=sprite` / `?drake=classic`, `localStorage.sloth_drake = 'sprite'`, DEFAULT_SPRITE_DRAKE otherwise.
 *
 * The sheets have no walk cycle, so it advances by alternating its ready stance and its stomp. Poses follow the boss brain: the open jaw
 * for the fire breath, the glowing spines (from phase 2) for the roar and the eruption wind-up, the stomp for the eruption itself, the
 * raised tail and the tail spin for the sweep, the crouch, glide and slam of the big leap, the dazed stagger, and a petrified collapse.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { DRAKE_FRAMES } from './drakeAtlasData.ts';

export const DEFAULT_SPRITE_DRAKE = true;
/** world units travelled per full step cycle */
const STRIDE = 56;

export const drakeSprite = createPaintedBoss({
  param: 'drake',
  defaultOn: DEFAULT_SPRITE_DRAKE,
  url: new URL('../assets/enemies/drake-atlas.webp', import.meta.url).href,
  frames: DRAKE_FRAMES,
  k: 0.8,
  pick: ({ b, br, m, moving, dist }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.5 ? 'knockback' : br.t < 1.4 ? 'deathspasm' : 'petrified';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = 'enrage';
    else if (br.state === 'tell') name = m?.pose === 'spit' ? 'jawbite' : m?.pose === 'whip' ? 'tailcrush' : m?.pose === 'leap' ? 'leapprep' : 'enrage';
    else if (br.state === 'act') {
      if (m?.pose === 'spit') name = 'jawbite';
      else if (m?.pose === 'whip') name = 'tailspin';
      else if (m?.pose === 'leap') name = br.air > 14 ? 'airglide' : 'jumpslam';
      else name = 'stomp';
    } else if (br.state === 'rec') name = m?.pose === 'leap' ? 'jumpslam' : 'idle';
    else if (moving) name = Math.floor((dist / STRIDE) * 2) % 2 === 0 ? 'idle' : 'stomp';
    else name = b.phase >= 2 ? 'enrage' : 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'recoil';
    return name;
  },
});
