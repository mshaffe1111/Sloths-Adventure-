/**
 * Painted Venom Fang (world 1 boss, the crowned emerald boa) from the Gemini pose sheets. A switch like the other painted
 * creatures: `?venom=sprite` / `?venom=classic`, `localStorage.sloth_venom = 'sprite'`, DEFAULT_SPRITE_VENOM otherwise.
 *
 * Poses follow the boss brain: coiled idle (angrier from phase 2), a slither while it travels, a warning pose for each wind-up
 * (spit: rears up, lunge: coils tight, tail slam: coils tight), one pose per attack, the open recovery, stun and death.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { VENOM_FRAMES } from './venomAtlasData.ts';

export const DEFAULT_SPRITE_VENOM = true;
const SLITHER = ['sl_0', 'sl_1', 'sl_2', 'sr_0', 'sr_1', 'sr_2'];
/** world units travelled per full slither cycle */
const STRIDE = 150;

export const venomSprite = createPaintedBoss({
  param: 'venom',
  defaultOn: DEFAULT_SPRITE_VENOM,
  url: new URL('../assets/enemies/venom-atlas.webp', import.meta.url).href,
  frames: VENOM_FRAMES,
  k: 0.95,
  pick: ({ b, br, m, moving, dist }) => {
    // n_* frames are from the redrawn sheets (set 1), the rest from the first sheets; the dark ones are the angrier second phase
    const p1 = b.phase < 2;
    const half = m ? br.t < (br.state === 'act' ? m.act : m.tell) * 0.4 : false;
    let name: string;
    if (br.state === 'dying') name = br.t < 0.6 ? 'deathroar' : 'dead';
    else if (br.state === 'stun') name = 'stunned';
    else if (br.state === 'roar') name = br.roarReason === 'enter' ? 'n_roar' : 'enrage';
    else if (br.state === 'tell') name = m?.pose === 'spit' ? 'n_rear' : m?.pose === 'lunge' ? 'n_coil' : 'n_tail';
    else if (br.state === 'act') {
      if (m?.pose === 'spit') name = half ? 'n_hiss' : 'spit';
      else if (m?.pose === 'lunge') name = half ? 'n_lunge2' : 'lunge';
      else name = 'tailslam';
    } else if (br.state === 'rec') name = p1 ? 'n_ring' : 'block';
    else if (moving) name = SLITHER[Math.floor((dist / STRIDE) * SLITHER.length) % SLITHER.length];
    else name = p1 ? 'n_idle' : 'enrageidle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
