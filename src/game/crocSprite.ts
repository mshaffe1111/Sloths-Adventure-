/**
 * Painted Crocus Rex (world 2 boss, the river king) from the Gemini pose sheets. A switch like the other painted creatures:
 * `?croc=sprite` / `?croc=classic`, `localStorage.sloth_croc = 'sprite'`, DEFAULT_SPRITE_CROC otherwise (classic = the vector croc).
 *
 * Poses follow the boss brain: idle (smouldering from phase 3), a crawl (a run from phase 2), the bellow before the death roll, the
 * arched tail for the tail whip, the reared belly slam and the rubble eruption for the mud surge, the three spinning death-roll frames,
 * the open jaws on recovery, the stagger after a crash and the knock-back, belly-up and defeated frames at the end.
 */
import { createPaintedBoss } from './paintedBoss.ts';
import { CROC_FRAMES } from './crocAtlasData.ts';

export const DEFAULT_SPRITE_CROC = true;
const WALK = ['crawl0', 'crawl1', 'crawl2', 'crawl1'];
const ROLL = ['roll1', 'roll2', 'roll3'];
const STRIDE = 70;

export const crocSprite = createPaintedBoss({
  param: 'croc',
  defaultOn: DEFAULT_SPRITE_CROC,
  url: new URL('../assets/enemies/croc-atlas.webp', import.meta.url).href,
  frames: CROC_FRAMES,
  k: 0.8,
  pick: ({ b, br, m, moving, dist, time, def }) => {
    let name: string;
    if (br.state === 'dying') name = br.t < 0.5 ? 'knockback' : br.t < 1.3 ? 'beaten' : 'defeated';
    else if (br.state === 'stun') name = def.scale || Math.floor(time * 2.2) % 2 === 0 ? 'stagger' : 'recoil'; // the giant stays in the pose its weak point was measured in
    else if (br.state === 'roar') name = 'roar';
    else if (br.state === 'tell') name = m?.pose === 'slam' ? 'bellyslam' : m?.pose === 'whip' ? 'tailbite' : 'roar';
    else if (br.state === 'act') {
      if (m?.pose === 'charge') name = ROLL[Math.floor(time * 11) % ROLL.length];
      else if (m?.pose === 'whip') name = 'tailwhip';
      else name = 'eruptslam';
    } else if (br.state === 'rec') name = 'jawbite';
    else if (moving) {
      if (b.phase >= 2) name = Math.floor((dist / 44) * 2) % 2 === 0 ? 'run0' : 'run1';
      else name = WALK[Math.floor((dist / STRIDE) * WALK.length) % WALK.length];
    } else name = b.phase >= 3 ? 'enrage1' : 'idle';
    if (b.hitFlashTimer > 0.12 && (br.state === 'idle' || br.state === 'rec')) name = 'hurt';
    return name;
  },
});
