/**
 * Painted Marsh Reaver (world 6 boss, the spear-wielding giant otter of the blackwater swamp) from the Gemini pose sheets. A switch like
 * the other painted creatures: `?reaver=sprite` / `?reaver=classic`, `localStorage.sloth_reaver = 'sprite'`, DEFAULT_SPRITE_REAVER otherwise.
 *
 * The sheets have no walk cycle, so he advances in the three crouched spear-lunge frames. Poses follow the boss brain: spear guard
 * for the thrust wind-up, the thrust, a low crouch before the leap, the vault in the air and the overhead smash on landing, the
 * mud sling, a roar, the dazed stagger and the collapse.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { REAVER_FRAMES } from './reaverAtlasData.ts';

export const DEFAULT_SPRITE_REAVER = true;
const ADVANCE = ['adv_0', 'adv_1', 'adv_2', 'adv_1'];
/** world units travelled per full advance cycle */
const STRIDE = 64;

export const reaverSprite = createPaintedBoss({
  param: 'reaver',
  defaultOn: DEFAULT_SPRITE_REAVER,
  url: new URL('../assets/enemies/reaver-atlas.webp', import.meta.url).href,
  frames: REAVER_FRAMES,
  k: 1.2,
  pick: ({ b, br, m, moving, dist }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.6 ? 'hurt' : br.t < 1.3 ? 'deadback' : 'deadheap';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = 'roar';
    else if (br.state === 'tell') name = m?.pose === 'leap' ? 'sweep' : m?.pose === 'lunge' ? 'guard' : m?.pose === 'spit' ? 'sweep' : 'roar';
    else if (br.state === 'act') {
      if (m?.pose === 'leap') name = br.air > 14 ? 'vault' : 'smash';
      else if (m?.pose === 'lunge') name = 'thrust';
      else if (m?.pose === 'spit') name = 'mudsling';
      else name = 'roar';
    } else if (br.state === 'rec') name = m?.pose === 'leap' ? 'smash' : m?.pose === 'lunge' ? 'thrust' : 'idle';
    else if (moving) name = ADVANCE[Math.floor((dist / STRIDE) * ADVANCE.length) % ADVANCE.length];
    else name = 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
