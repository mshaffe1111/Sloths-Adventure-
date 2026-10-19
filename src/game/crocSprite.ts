/**
 * Painted Crocus Rex (world 2 boss, the river king) from the Gemini pose sheets. A switch like the other painted creatures:
 * `?croc=sprite` / `?croc=classic`, `localStorage.sloth_croc = 'sprite'`, DEFAULT_SPRITE_CROC otherwise.
 *
 * Poses follow the boss brain: idle (angrier from phase 3), a walk (a run from phase 2), a warning pose for each wind-up, the death
 * roll as two alternating spin frames, the tail whip, the mud slam, the open recovery, dizzy after a crash and the death throes.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { CROC_FRAMES } from './crocAtlasData.ts';

export const DEFAULT_SPRITE_CROC = false;
const WALK = ['w_0', 'w_1', 'w_2', 'w_3'];
const STRIDE = 64;

export const crocSprite = createPaintedBoss({
  param: 'croc',
  defaultOn: DEFAULT_SPRITE_CROC,
  url: new URL('../assets/enemies/croc-atlas.webp', import.meta.url).href,
  frames: CROC_FRAMES,
  k: 0.85,
  pick: ({ b, br, m, moving, dist, time }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.7 ? 'throes' : 'dead';
    else if (br.state === 'stun') name = 'dizzy';
    else if (br.state === 'roar') name = 'threat';
    else if (br.state === 'tell') name = m?.pose === 'slam' ? 'roar' : m?.pose === 'whip' ? 'alert' : 'threat';
    else if (br.state === 'act') {
      if (m?.pose === 'charge') name = Math.floor(time * 9) % 2 === 0 ? 'roll_0' : 'roll_1';
      else if (m?.pose === 'whip') name = 'tailwhip';
      else name = 'crush';
    } else if (br.state === 'rec') name = 'chomp';
    else if (moving) {
      if (b.phase >= 2) name = Math.floor((dist / 40) * 2) % 2 === 0 ? 'run_0' : 'run_1';
      else name = WALK[Math.floor((dist / STRIDE) * WALK.length) % WALK.length];
    } else name = b.phase >= 3 ? 'enraged' : 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
