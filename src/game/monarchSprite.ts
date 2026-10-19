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
  pick: ({ b, br, m, moving, time }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.8 ? 'deadfall' : 'deadcollapse';
    else if (br.state === 'stun') name = 'hurt';
    else if (br.state === 'roar') name = 'screech';
    else if (br.state === 'tell') name = m?.pose === 'fly' ? 'diveprep' : 'screech';
    else if (br.state === 'act') {
      if (m?.pose === 'fly') name = br.t < (m.act ?? 1) * 0.45 ? 'descent' : 'glide';
      else name = 'screech';
    } else if (br.state === 'rec') name = 'hover';
    else name = FLY[Math.floor(time * (moving ? 11 : 7)) % FLY.length];
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
