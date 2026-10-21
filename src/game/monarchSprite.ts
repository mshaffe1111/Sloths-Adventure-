/**
 * Painted Night-Wing Monarch (world 8 boss, the giant bat of the karst caves) from the Gemini pose sheets. A switch like the other
 * painted creatures: `?monarch=sprite` / `?monarch=classic`, `localStorage.sloth_monarch = 'sprite'`, DEFAULT_SPRITE_MONARCH otherwise.
 *
 * It is a flyer, so it always beats its wings (a four-frame cycle that quickens while it travels). Poses follow the boss brain: the
 * screech for the shriek and the stalactite call, the dive wind-up, the descent and glide of a swoop, hover while open, hurt and the fall.
 * Every frame is anchored at its bottom edge, so the painted bat hangs from the same height as the boss hit box.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { MONARCH_FRAMES } from './monarchAtlasData.ts';

export const DEFAULT_SPRITE_MONARCH = true;
const FLY = ['fl_0', 'fl_1', 'fl_2', 'fl_3'];

export const monarchSprite = createPaintedBoss({
  param: 'monarch',
  defaultOn: DEFAULT_SPRITE_MONARCH,
  url: new URL('../assets/enemies/monarch-atlas.webp', import.meta.url).href,
  frames: MONARCH_FRAMES,
  k: 0.8,
  pick: ({ b, br, moving, time }) => {
    let name: string;
    const mv = br.move;
    if (br.state === 'dying') name = br.t < 0.8 ? 'deadfall' : 'deadcollapse';
    // grounded and winded after the buffet landing
    else if (br.state === 'stun') name = 'landing';
    else if (br.state === 'roar') name = 'screech';
    else if (br.state === 'tell') {
      if (mv === 'swoop' || mv === 'sonicDive') name = 'diveprep';
      else if (mv === 'wingBuffet') name = 'stall';
      else if (mv === 'batFlock') name = 'takeoff';
      else name = 'screech';
    } else if (br.state === 'act') {
      if (mv === 'swoop' || mv === 'sonicDive') name = br.t < (mv === 'swoop' ? 1.3 : 1.1) * 0.45 ? 'descent' : 'glide';
      else if (mv === 'wingBuffet') name = 'landing';
      else if (mv === 'echoRings' || mv === 'batFlock') name = 'flutter';
      else name = 'screech';
    } else if (br.state === 'rec') {
      const rec: Record<string, string> = { screech: 'screech', swoop: 'glide', sonicDive: 'stall', echoRings: 'flutter' };
      if (mv === 'wingBuffet') name = br.t < 0.2 ? 'landing' : 'takeoff';
      else name = (mv && rec[mv]) || 'hover';
    } else name = FLY[Math.floor(time * (moving ? 11 : 7)) % FLY.length];
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
